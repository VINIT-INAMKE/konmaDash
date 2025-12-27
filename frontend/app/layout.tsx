import type { Metadata } from "next";
import { Architects_Daughter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const architectsDaughter = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "QSR Inventory Management",
  description: "Event inventory and sales management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${architectsDaughter.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
