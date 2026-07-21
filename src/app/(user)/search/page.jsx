import React from 'react';
import SearchClient from './SearchClient';

// Search is an interactive UI with no crawlable content — noindex it
export const metadata = {
  title: 'Search | VizhiTN',
  robots: { index: false, follow: true },
};

export default function Page() {
  return <SearchClient />;
}
