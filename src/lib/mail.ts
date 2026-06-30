import nodemailer from "nodemailer";
import { assertMailEnv, env } from "@/lib/env";

const MAX_SEND_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1200;

function createTransporter() {
  assertMailEnv();
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = new URL("/api/auth/verify-email", env.appUrl);
  verifyUrl.searchParams.set("token", token);

  const mail = {
    from: env.mailFrom,
    to: email,
    subject: "サブスクリスト メール認証",
    text: [
      "サブスクリストへの登録ありがとうございます。",
      "以下のURLを開いてメール認証を完了してください。",
      "",
      verifyUrl.toString(),
      "",
      "このURLの有効期限は24時間です。",
    ].join("\n"),
    html: `
      <p>サブスクリストへの登録ありがとうございます。</p>
      <p>以下のリンクを開いてメール認証を完了してください。</p>
      <p><a href="${verifyUrl.toString()}">メール認証を完了する</a></p>
      <p>このURLの有効期限は24時間です。</p>
    `,
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
    try {
      const transporter = createTransporter();
      await transporter.verify();
      await transporter.sendMail(mail);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Verification email failed on attempt ${attempt}.`, error);
      if (attempt < MAX_SEND_ATTEMPTS) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("認証メールを送信できませんでした。");
}

export async function sendSubscriptionReminderEmail({
  email,
  title,
  lines,
}: {
  email: string;
  title: string;
  lines: string[];
}) {
  const text = lines.join("\n");
  const html = lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  await sendMailWithRetry({
    from: env.mailFrom,
    to: email,
    subject: `サブスクリスト ${title}`,
    text,
    html,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendMailWithRetry(mail: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
    try {
      const transporter = createTransporter();
      await transporter.verify();
      await transporter.sendMail(mail);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Email send failed on attempt ${attempt}.`, error);
      if (attempt < MAX_SEND_ATTEMPTS) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("メールを送信できませんでした。");
}
