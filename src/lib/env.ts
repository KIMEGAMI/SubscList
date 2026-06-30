function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} が設定されていません。`);
  }
  return value;
}

export const env = {
  appUrl: process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "",
  databaseUrl: required("DATABASE_URL"),
  mailFrom: process.env.MAIL_FROM ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? "587"),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "",
  notificationJobSecret: process.env.NOTIFICATION_JOB_SECRET ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-5.5",
};

export function assertAuthSecret() {
  if (env.authSecret.length < 32) {
    throw new Error("AUTH_SECRET または NEXTAUTH_SECRET は32文字以上で設定してください。");
  }
}

export function assertMailEnv() {
  for (const name of ["MAIL_FROM", "SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const) {
    if (!process.env[name]) {
      throw new Error(`${name} が設定されていません。`);
    }
  }
}
