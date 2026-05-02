import { Skeleton } from '@/components/ui/skeleton';

export default function TripDetailLoading() {
  return (
    <div className="space-y-6 pb-8">
      <Skeleton className="h-56 rounded-[2rem]" />
      <Skeleton className="h-20 rounded-[1.6rem]" />
      <Skeleton className="h-14 rounded-[1.4rem]" />
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Skeleton className="h-[420px] rounded-[2rem]" />
        <Skeleton className="h-[420px] rounded-[2rem]" />
      </div>
      <Skeleton className="h-[420px] rounded-[2rem]" />
    </div>
  );
}
