import { GuardianInviteClient } from '@/components/sara/guardian-invite-client';

export default async function GuardianInvitePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <GuardianInviteClient token={token} />;
}
