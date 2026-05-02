import { ShieldAlert, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DashboardPageData } from '@/lib/types';

export function SafetyScoreCard({ data }: { data: DashboardPageData }) {
  const score = data.safetyScore.score;
  const variant =
    data.safetyScore.status === 'Safe'
      ? 'safe'
      : data.safetyScore.status === 'Moderate'
        ? 'caution'
        : 'danger';
  const badgeVariant =
    data.safetyScore.status === 'Safe'
      ? 'success'
      : data.safetyScore.status === 'Moderate'
        ? 'caution'
        : 'danger';

  return (
    <Card className="card-surface">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Safety Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1.5rem] border border-border/80 bg-white/92 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="pill-label">Current score</p>
              <p className="mt-2 text-4xl font-semibold text-plumInk">
                {score}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
            </div>
            <Badge variant={badgeVariant} className="rounded-full">
              {data.safetyScore.status}
            </Badge>
          </div>
          <Progress className="mt-4 h-2.5" value={score} variant={variant} />
        </div>

        <div className="space-y-3">
          {data.safetyScore.reasons.map((reason) => (
            <div
              key={reason}
              className="flex items-start gap-3 rounded-[1.2rem] bg-secondary/55 px-4 py-3"
            >
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-sm text-cocoa">{reason}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
