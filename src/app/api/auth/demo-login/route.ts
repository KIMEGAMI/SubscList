import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function POST() {
  if (!env.demoUserEmail) {
    return NextResponse.json({ message: "デモユーザーが設定されていません。" }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { email: env.demoUserEmail } });
  if (!user) {
    return NextResponse.json({ message: "デモユーザーがDBに登録されていません。" }, { status: 404 });
  }
  if (!user.emailVerified) {
    return NextResponse.json({ message: "デモユーザーのメール認証が完了していません。" }, { status: 409 });
  }

  await setSession(user.id, true);
  return NextResponse.json({ ok: true });
}
