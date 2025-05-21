import { Inter } from "next/font/google";
import { AuthProvider } from "@/app/context/AuthContext";
import "./globals.css";
import { PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Next.js App with SentinelAuth",
  description: "A Next.js application using SentinelAuth for authentication",
};

const RootLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
