import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSTLab Docs AI — аудит и анализ документов",
  description:
    "Платформа DSTLab для проверки документов, извлечения данных и анализа договоров, коммерческих предложений, регламентов и тендерных файлов.",
  keywords: [
    "аудит документов",
    "анализ документов",
    "проверка договоров",
    "проверка коммерческих предложений",
    "извлечение данных из документов",
    "проверка тендерных документов",
    "DSTLab",
  ],
  authors: [{ name: "DSTLab" }],
  creator: "DSTLab",
  publisher: "DSTLab",
  metadataBase: new URL("https://dstlab.ru"),
  openGraph: {
    title: "DSTLab Docs AI — аудит и анализ документов",
    description:
      "Платформа для проверки документов, извлечения данных и работы с файлами с помощью ИИ.",
    url: "https://dstlab.ru",
    siteName: "DSTLab Docs AI",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}