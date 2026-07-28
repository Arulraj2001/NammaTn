import TrustDocument from '@/components/trust/TrustDocument';
import { TRUST_DOCUMENTS, TRUST_LAST_UPDATED } from '@/lib/trustDocuments';

const document = TRUST_DOCUMENTS.sources;
export const metadata = { title: document.title, description: document.summary, alternates: { canonical: '/sources' } };

export default function Page() {
  return <TrustDocument path="/sources" {...document} lastUpdated={TRUST_LAST_UPDATED} />;
}
