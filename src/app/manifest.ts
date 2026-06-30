import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "サブスクリスト",
    short_name: "SubscList",
    description: "サブスクリプションの更新日、支払い、見直しを管理するアプリ",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#eef9fb",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
