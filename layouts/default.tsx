
import { Head } from "./head";

import Footer from "@/components/Footer";
import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
  fullWidth = false,
  hideNavbar = false,
  hideFooter = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="relative flex h-screen flex-col">
      <Head />
      {!hideNavbar ? <Navbar /> : null}
      <main
        className={
          fullWidth
            ? `w-full flex-grow px-0 ${hideNavbar ? "pt-0" : "pt-5"}`
            : `container mx-auto max-w-7xl flex-grow px-6 ${hideNavbar ? "pt-0" : "pt-16"}`
        }
      >
        {children}
      </main>
      {!hideFooter ? <Footer /> : null}
    </div>
  );
}
