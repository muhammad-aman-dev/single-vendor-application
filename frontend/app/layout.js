import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import AuthInitializer from "@/components/AuthInitializer";
import CartInitializer from "@/components/cartInitializer";
import "./globals.css";

// Primary Display Serif for Headings & Titles
const cinzel = Cinzel({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

// Clean Modern Sans-Serif for Body Text & Specs
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: {
    default: "Rebel Watches | Curated Luxury Watches",
  },
  description:
    "Discover curated luxury watches from top brands like Omega, Breitling, TAG Heuer, and IWC. Certified authentic with 2 years warranty and worldwide shipping.",
  keywords: [
    "luxury watches",
    "pre-owned watches",
    "chronograph",
    "Omega",
    "Breitling",
    "TAG Heuer",
    "IWC",
  ],
  openGraph: {
    title: "Rebel Watches | Curated Luxury Timepieces",
    description:
      "Curated luxury timepieces from world-renowned manufacturers.",
    url: process.env.NEXT_PUBLIC_SITE_URL ,
    siteName: "Rebel Watches",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en"  
      className={`${cinzel.variable} ${plusJakarta.variable} dark selection:bg-amber-500 selection:text-black`}
    >
      <body className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased">
        <Providers>
          <AuthInitializer /> 
          <CartInitializer /> 
          
          <Header />
          <main className="grow">{children}</main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Providers>
      </body>
    </html>
  );
}