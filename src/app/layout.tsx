import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "नेपाल निर्वाचन २०८२ | मतदाताको नक्सा",
  description:
    "नेपालको ७७ जिल्ला र १६५ निर्वाचन क्षेत्रको अन्तरक्रियात्मक नक्सा। २०८२ फागुन २१ गतेको आम निर्वाचनका लागि उम्मेदवार, दल र प्रमुख प्रतिस्पर्धाहरू हेर्नुहोस्।",
  keywords: [
    "नेपाल निर्वाचन २०८२",
    "Nepal election 2026",
    "Nepal general election",
    "Nepal constituency map",
    "नेपाल निर्वाचन क्षेत्र",
    "निर्वाचन आयोग नेपाल",
    "FPTP seats Nepal",
  ],
  authors: [{ name: "नेपाल निर्वाचन परियोजना" }],
  openGraph: {
    title: "नेपाल निर्वाचन २०८२ | मतदाताको नक्सा",
    description:
      "नेपालको ७७ जिल्ला र १६५ निर्वाचन क्षेत्रको अन्तरक्रियात्मक नक्सा। २०८२ फागुन २१ गतेको आम निर्वाचन।",
    type: "website",
    locale: "ne_NP",
    siteName: "नेपाल निर्वाचन २०८२",
  },
  twitter: {
    card: "summary_large_image",
    title: "नेपाल निर्वाचन २०८२ | मतदाताको नक्सा",
    description:
      "नेपालको ७७ जिल्ला र १६५ निर्वाचन क्षेत्रको अन्तरक्रियात्मक नक्सा। २०८२ फागुन २१ गतेको आम निर्वाचन।",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ne">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FWWBZQQ5P4"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-FWWBZQQ5P4');
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
