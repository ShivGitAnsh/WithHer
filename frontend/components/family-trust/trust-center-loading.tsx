import { Skeleton } from '@/components/ui/skeleton';
import { TrustCenterShell } from '@/components/family-trust/trust-center-shell';

export function TrustCenterLoading() {
  return (
    <TrustCenterShell>
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-[2rem]" />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-[360px] rounded-[2rem]" />
          <div className="space-y-6">
            <Skeleton className="h-[170px] rounded-[2rem]" />
            <Skeleton className="h-[170px] rounded-[2rem]" />
          </div>
        </div>
        <Skeleton className="h-[320px] rounded-[2rem]" />
      </div>
    </TrustCenterShell>
  );
}
