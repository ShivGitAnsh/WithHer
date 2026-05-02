import { Clock3, Dot, Route } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardPageData } from '@/lib/types';

export function TimelineCard({ data }: { data: DashboardPageData }) {
  return (
    <Card className="card-surface">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Clock3 className="h-5 w-5 text-primary" />
            Live Timeline
          </CardTitle>
          <Badge variant="outline" className="rounded-full">
            {data.timeline.length} updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.timeline.length ? (
          data.timeline.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/12 p-1 text-primary">
                  <Dot className="h-4 w-4" />
                </div>
                {index < data.timeline.length - 1 ? (
                  <div className="mt-2 h-full w-px bg-border" />
                ) : null}
              </div>
              <div className="flex-1 rounded-[1.5rem] border border-border/80 bg-secondary/45 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-plumInk">{event.eventType}</p>
                    <p className="mt-1 text-sm text-cocoa">{event.title}</p>
                    {event.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant="outline" className="rounded-full bg-white/80">
                    {new Date(event.occurredAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-dashed border-border bg-secondary/30 px-5 py-6 text-sm text-muted-foreground">
            <Route className="h-5 w-5 text-primary" />
            No timeline events yet. Travel milestones will appear here once tracking begins.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
