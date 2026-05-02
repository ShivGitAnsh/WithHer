'use client';

import { BrainCircuit, WandSparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardPageData } from '@/lib/types';

export function AiSafetyBriefCard({
  data,
  isGenerating,
  onGenerateBrief
}: {
  data: DashboardPageData;
  isGenerating: boolean;
  onGenerateBrief: () => void;
}) {
  return (
    <Card className="card-surface">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Safety Brief
        </CardTitle>
        <Badge
          variant={data.safetyBrief.fallbackUsed ? 'caution' : 'secondary'}
          className="rounded-full"
        >
          {data.safetyBrief.fallbackUsed ? 'Fallback' : 'AI generated'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[1.7rem] border border-border/80 bg-white/92 p-5">
          <p className="text-sm leading-8 text-cocoa">{data.safetyBrief.brief}</p>
        </div>

        <div className="rounded-[1.45rem] bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          This summary uses only the trip data currently available in the system.
        </div>

        <Button className="rounded-2xl" disabled={isGenerating} onClick={onGenerateBrief}>
          <WandSparkles className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating brief...' : 'Regenerate Brief'}
        </Button>
      </CardContent>
    </Card>
  );
}
