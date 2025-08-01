import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter=Inter({subsets:["latin"]});


export const metadata = {
  title: "wealth",
  description: "one stop finance platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className}`}
      >

        {/*Header*/ }
        <Header/>
        <main className="min-h-screen">
        {children}
        
        </main>
        <Toaster richColors />
        {/*Footer:*/}
        <footer className="bg-blue-50 py-12" >
          <div className="container mx-autopx-4 text-center text-gray-700">
            <p className="text-1xl uppercase underline">Made by hemant vaidya </p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
