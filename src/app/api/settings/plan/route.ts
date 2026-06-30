import { NextResponse } from "next/server";
import { z } from "zod";
import { requireVerifiedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  plan: z.enum(["FREE", "PREMIUM"]),
});

export async function PUT(request: Request) {
  const user = await requireVerifiedUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "プランを選択してください。" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { plan: parsed.data.plan },
  });

  return NextResponse.json({ ok: true });
}
