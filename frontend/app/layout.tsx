import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowFund - Smart Charity & Donation Platform',
  description: 'Transparent blockchain-based charity donations with automatic fund allocation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const resolvedTheme = theme === 'system' || !theme ? systemTheme : theme;
                document.documentElement.classList.add(resolvedTheme);
              } catch (e) {}

              // Suppress ENS errors on localhost
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args[0]?.toString() || '';
                if (message.includes('ENS') || message.includes('getEnsAddress') || message.includes('UNSUPPORTED_OPERATION')) {
                  // Silently ignore ENS errors
                  return;
                }
                originalConsoleError.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-foreground`}>
        <ThemeProvider>
          <WalletProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
