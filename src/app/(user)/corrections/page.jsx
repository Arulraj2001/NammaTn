import TrustDocument from '@/components/trust/TrustDocument';
import { TRUST_DOCUMENTS, TRUST_LAST_UPDATED } from '@/lib/trustDocuments';

const document = TRUST_DOCUMENTS.corrections;
export const metadata = { title: document.title, description: document.summary, alternates: { canonical: '/corrections' } };

export default function Page() {
  return <TrustDocument path="/corrections" {...document} lastUpdated={TRUST_LAST_UPDATED} />;
}
