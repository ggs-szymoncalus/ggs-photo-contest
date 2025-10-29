import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/config/authConfig";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
// import { Roboto } from "next/font/google";

// const roboto = Roboto({
//     subsets: ["latin"],
//     weight: ["100", "300", "400", "500", "700", "900"],
//     variable: "--font-roboto",
// });

export const metadata: Metadata = {
  title: "GGS Photo Contest",
  description: "A photo contest application built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster richColors />
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
