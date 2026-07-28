import TrustDocument from '@/components/trust/TrustDocument';
import { TRUST_DOCUMENTS, TRUST_LAST_UPDATED } from '@/lib/trustDocuments';

const document = TRUST_DOCUMENTS.ownership;
export const metadata = { title: document.title, description: document.summary, alternates: { canonical: '/ownership-and-funding' } };

export default function Page() {
  return <TrustDocument path="/ownership-and-funding" {...document} lastUpdated={TRUST_LAST_UPDATED} />;
}
