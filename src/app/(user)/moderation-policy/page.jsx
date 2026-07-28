import TrustDocument from '@/components/trust/TrustDocument';
import { TRUST_DOCUMENTS, TRUST_LAST_UPDATED } from '@/lib/trustDocuments';

const document = TRUST_DOCUMENTS.moderation;
export const metadata = { title: document.title, description: document.summary, alternates: { canonical: '/moderation-policy' } };

export default function Page() {
  return <TrustDocument path="/moderation-policy" {...document} lastUpdated={TRUST_LAST_UPDATED} />;
}
