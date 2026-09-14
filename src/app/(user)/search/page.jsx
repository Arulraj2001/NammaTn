import React from 'react';
import SearchClient from './SearchClient';

export const metadata = {
  title: 'Search',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SearchClient />;
}
