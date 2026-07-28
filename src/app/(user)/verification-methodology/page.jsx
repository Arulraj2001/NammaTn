import TrustDocument from '@/components/trust/TrustDocument';
import { TRUST_DOCUMENTS, TRUST_LAST_UPDATED } from '@/lib/trustDocuments';

const document = TRUST_DOCUMENTS.verification;
export const metadata = { title: document.title, description: document.summary, alternates: { canonical: '/verification-methodology' } };

export default function Page() {
  return <TrustDocument path="/verification-methodology" {...document} lastUpdated={TRUST_LAST_UPDATED} />;
}
