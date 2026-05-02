import { SosCaseClient } from '@/components/sara/sos-case-client';
import { getSosCase } from '@/lib/api';

export default async function SosCasePage({
  params
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const data = await getSosCase(caseId);

  return <SosCaseClient data={data} />;
}
