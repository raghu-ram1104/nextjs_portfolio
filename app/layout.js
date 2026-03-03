import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Raghuram | Portfolio",
  description: "Raghuram - Computer Science & Engineering Student at SRM IST. Full-Stack Developer, Embedded Systems Enthusiast, and AI/IoT Explorer.",
  keywords: ["Raghuram", "Portfolio", "Full-Stack Developer", "SRM IST", "React", "Next.js", "IoT", "Embedded Systems"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
