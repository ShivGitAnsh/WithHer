import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 pb-8">
      <Skeleton className="h-[360px] rounded-[2rem]" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-[320px] rounded-[1.8rem]" />
        <Skeleton className="h-[320px] rounded-[1.8rem]" />
        <Skeleton className="h-[320px] rounded-[1.8rem]" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Skeleton className="h-[340px] rounded-[2rem]" />
        <Skeleton className="h-[340px] rounded-[2rem]" />
      </div>
    </div>
  );
}
