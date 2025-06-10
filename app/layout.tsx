"use client";

import "@/styles/globals.css";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { Providers } from "./providers";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname ? pathname.startsWith("/admin") : false;
  const hideLayoutFor = ["/user/roomplanner"];
  const shouldHideLayout = hideLayoutFor.includes(pathname);

  useEffect(() => {
    const pageTitles: { [key: string]: string } = {
      "/admin": "Admin Dashboard",
      "/properties": "Browse Properties",
      "/about-us": "About Us",
      "/contact-us": "Contact Us",
      "/": "Home",
    };

    // Match longest route prefix
    const matchedTitle = Object.entries(pageTitles).find(
      ([path]) => pathname === path || pathname.startsWith(path + "/"),
    )?.[1];

    document.title = matchedTitle
      ? `${matchedTitle} | After Shift`
      : "After Shift";
  }, [pathname]);

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body
        className={clsx("min-h-screen bg-background font-sans antialiased")}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            {!isAdminPage && !shouldHideLayout && (
              <>
                <Toaster position="top-right" />
              </>
            )}

            <main className="flex-grow">{children}</main>

            {!isAdminPage && !shouldHideLayout && <Footer />}
          </div>
        </Providers>
      </body>
    </html>
  );
}
