import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Suspense } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Educated",
  description: "I am free",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("Hello world");
  console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log(process.env.CLERK_SECRET_KEY);

  // return (
  //   <html lang="en">
  //     <body>
  //       Hello world
  //       {/* {children} */}
  //     </body>
  //   </html>
  // );
  return (
    // <>
    //   Hello world
    // </>
    <ClerkProvider>
      <html lang="en">
        <body className={`${dmSans.className}`}>
          <Providers>
            <Suspense fallback={null}>
              <div className="root-layout">{children}</div>
            </Suspense>
            <Toaster richColors closeButton />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}