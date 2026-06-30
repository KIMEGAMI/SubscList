import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

type Row = Record<string, string>;

const knownServices = [
  "Adobe", "Amazon Prime", "Amazon Music", "Apple", "Audible", "Canva", "ChatGPT", "Claude", "DAZN", "DeepL",
  "Disney", "Dropbox", "Figma", "GitHub", "Google", "Hulu", "iCloud", "Kindle", "LINE MUSIC", "Microsoft",
  "Netflix", "Nintendo", "Notion", "Perplexity", "PlayStation", "Slack", "Spotify", "U-NEXT", "Udemy",
  "Xbox", "YouTube", "Zoom",
];

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function findValue(row: Row, keys: string[]) {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().replace(/\s/g, ""), value]));
  for (const key of keys) {
    const value = normalized[key.toLowerCase().replace(/\s/g, "")];
    if (value) return value;
  }
  return "";
}

function normalizeMerchant(value: string) {
  return value
    .replace(/[0-9０-９]+/g, "")
    .replace(/[＊*#\-_/\\()[\]【】（）]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function amountValue(value: string) {
  const normalized = value.replace(/[円￥¥,\s]/g, "").replace(/^−/, "-");
  const number = Math.abs(Number(normalized));
  return Number.isFinite(number) ? number : 0;
}

function dateValue(value: string) {
  const date = new Date(value.replaceAll("/", "-"));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "ログインしてください。" }, { status: 401 });
  if (!user.emailVerified) return NextResponse.json({ message: "メール認証が必要です。" }, { status: 403 });
  if (user.plan !== "PREMIUM") return NextResponse.json({ message: "CSV明細候補検出はPremium限定です。" }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "CSVファイルを選択してください。" }, { status: 400 });

  const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
  const [headers, ...body] = rows;
  if (!headers || body.length === 0) return NextResponse.json({ message: "CSVに解析する行がありません。" }, { status: 400 });

  const transactions = body.map((cells) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const rawName = findValue(row, ["摘要", "利用店名", "加盟店名", "内容", "明細", "description", "merchant", "name"]);
    const amount = amountValue(findValue(row, ["金額", "利用金額", "支払金額", "amount", "price"]));
    const date = dateValue(findValue(row, ["日付", "利用日", "取引日", "date"]));
    const merchant = normalizeMerchant(rawName);
    return { rawName, merchant, amount, date };
  }).filter((item) => item.merchant && item.amount > 0);

  const groups = new Map<string, typeof transactions>();
  for (const transaction of transactions) {
    const key = `${transaction.merchant.toLowerCase()}-${transaction.amount}`;
    groups.set(key, [...(groups.get(key) ?? []), transaction]);
  }

  const candidates = [...groups.values()]
    .map((items) => {
      const first = items[0];
      const known = knownServices.find((service) => first.merchant.toLowerCase().includes(service.toLowerCase()));
      const recurring = items.length >= 2;
      const confidence = known && recurring ? 95 : known ? 82 : recurring ? 76 : 0;
      return {
        name: known ?? first.merchant,
        merchant: first.merchant,
        amount: first.amount,
        occurrences: items.length,
        firstDate: items.map((item) => item.date).filter(Boolean).sort((a, b) => a!.getTime() - b!.getTime())[0]?.toISOString().slice(0, 10) ?? "",
        lastDate: items.map((item) => item.date).filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0]?.toISOString().slice(0, 10) ?? "",
        confidence,
        reason: known && recurring ? "有名サービス名が含まれ、同額請求が複数回あります。" : known ? "有名サブスク名が明細に含まれています。" : "同じ請求元・同額の明細が複数回あります。",
        billingCycle: "MONTHLY",
      };
    })
    .filter((item) => item.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence || b.occurrences - a.occurrences)
    .slice(0, 30);

  return NextResponse.json({ candidates, totalRows: body.length, detected: candidates.length });
}
