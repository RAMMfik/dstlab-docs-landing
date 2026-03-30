import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

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
      <body className={`${exo2.variable} antialiased`}>{children}</body>
    </html>
  );
}