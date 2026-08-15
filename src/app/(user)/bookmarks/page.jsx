import Bookmarks from '@/views/Bookmarks';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Saved Posts | VizhiTN',
  description: 'Track the posts, updates, and discussions you have saved for later on VizhiTN.',
  alternates: { canonical: '/bookmarks' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Saved Posts', href: '/bookmarks' }]} />
      <Bookmarks />
    </>
  );
}
