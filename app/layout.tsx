import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NETSO OS — CEO Command Center',
  description: 'Netso Energy operational command center',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
