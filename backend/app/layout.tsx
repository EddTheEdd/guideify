import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledComponentsRegistry from "../lib/AntdRegistry";
const inter = Inter({ subsets: ["latin"] });
import { GlobalProvider } from "@/contexts/GlobalContext";
export const metadata: Metadata = {
  title: "EMAG - Employee Management And Growth",
  description: "Employee Management And Growth Web Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvider>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </GlobalProvider>
      </body>
    </html>
  );
}
