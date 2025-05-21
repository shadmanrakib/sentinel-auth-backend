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
  console.log({
    apiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_API_URL!,
    uiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_UI_URL!,
    clientId: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID!,
    redirectUri: process.env.NEXT_PUBLIC_SENTINEL_REDIRECT_URI,
  });
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
