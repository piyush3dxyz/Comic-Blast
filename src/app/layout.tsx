import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Bangers, Comic_Neue } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Comic Ebook Creator',
  description: 'AI-powered comic book generation',
};

const fontBangers = Bangers({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bangers',
});

const fontComicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-comic-neue',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={`${fontBangers.variable} ${fontComicNeue.variable} font-body antialiased`} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
