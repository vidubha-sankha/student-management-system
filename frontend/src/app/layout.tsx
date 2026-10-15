
import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "./components/ConditionalNavbar";

export const metadata: Metadata = {
  title: "CampusFlow | Student Management System",
  description:
    "Comprehensive portal for managing students and academic courses.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}

