function categoryLabel(value = '') {
  return value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const label = categoryLabel(category) || 'News';
  return {
    title: `${label} News`,
    description: `Read the latest ${label.toLowerCase()} updates and public-interest reporting from across Tamil Nadu.`,
    alternates: { canonical: `/tn-today/category/${category}` },
  };
}

export default function TnTodayCategoryLayout({ children }) {
  return children;
}
