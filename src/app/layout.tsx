import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "SKT Marketplace | ตลาดนัดออนไลน์ สกธ.",
  description: "แพลตฟอร์มซื้อขายสินค้าสำหรับนักเรียนโรงเรียนสวนกุหลาบวิทยาลัย ธนบุรี",
  keywords: ["สกธ", "ตลาดนัด", "ซื้อขาย", "นักเรียน", "สวนกุหลาบธนบุรี"],
  authors: [{ name: "SK Thonburi Marketplace" }],
  openGraph: {
    title: "SKT Marketplace | ตลาดนัดออนไลน์ สกธ.",
    description: "แพลตฟอร์มซื้อขายสินค้าสำหรับนักเรียนโรงเรียนสวนกุหลาบวิทยาลัย ธนบุรี",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
