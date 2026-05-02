import { Mail, Phone, ShieldCheck, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Guardian } from '@/lib/types';

export function GuardiansCard({ guardians }: { guardians: Guardian[] }) {
  return (
    <Card className="card-surface">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Users className="h-5 w-5 text-primary" />
          Guardians
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {guardians.length ? (
          guardians.map((guardian) => (
            <div
              key={guardian.id}
              className="rounded-[1.35rem] border border-border/80 bg-white/90 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-plumInk">{guardian.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{guardian.relationship}</p>
                </div>
                <Badge variant="success" className="rounded-full">
                  Active
                </Badge>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-cocoa">
                {guardian.phoneNumber ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    {guardian.phoneNumber}
                  </div>
                ) : null}
                {guardian.email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    {guardian.email}
                  </div>
                ) : null}
                {!guardian.phoneNumber && !guardian.email ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    No direct contact details available
                  </div>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.35rem] border border-dashed border-border bg-secondary/35 px-5 py-6 text-sm text-muted-foreground">
            No guardians are currently linked to this trip.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
