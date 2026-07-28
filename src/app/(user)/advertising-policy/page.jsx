import TrustDocument from '@/components/trust/TrustDocument';
import { TRUST_DOCUMENTS, TRUST_LAST_UPDATED } from '@/lib/trustDocuments';

const document = TRUST_DOCUMENTS.advertising;
export const metadata = { title: document.title, description: document.summary, alternates: { canonical: '/advertising-policy' } };

export default function Page() {
  return <TrustDocument path="/advertising-policy" {...document} lastUpdated={TRUST_LAST_UPDATED} />;
}
