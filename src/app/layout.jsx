import React from 'react';
import Providers from './providers';
import '@/index.css';

export const metadata = {
  title: 'TN Voice',
  description: 'Civic Complaint and Resolution Platform for Tamil Nadu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

