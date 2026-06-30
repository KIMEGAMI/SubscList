import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "ログインしてください。" }, { status: 401 });
  if (!user.emailVerified) return NextResponse.json({ message: "メール認証が必要です。" }, { status: 403 });

  const { id } = await params;
  const history = await prisma.paymentHistory.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!history) return NextResponse.json({ message: "支払い履歴が見つかりません。" }, { status: 404 });

  await prisma.paymentHistory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
