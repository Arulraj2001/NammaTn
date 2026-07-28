import TrustDocument from '@/components/trust/TrustDocument';
import { TRUST_DOCUMENTS, TRUST_LAST_UPDATED } from '@/lib/trustDocuments';

const document = TRUST_DOCUMENTS.community;
export const metadata = { title: document.title, description: document.summary, alternates: { canonical: '/community-guidelines' } };

export default function Page() {
  return <TrustDocument path="/community-guidelines" {...document} lastUpdated={TRUST_LAST_UPDATED} />;
}
