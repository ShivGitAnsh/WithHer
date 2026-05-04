'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Map,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UserRound,
  WandSparkles
} from 'lucide-react';

import { FloatingSosButton } from '@/components/dashboard/floating-sos-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  connectMatch,
  createTripEvent,
  optInToMatching,
  triggerSosAlert
} from '@/lib/api';
import {
  createCheckInRuleAction,
  evaluateCheckInRuleAction,
  generateItineraryAction,
  generateSafetyBriefAction,
  refreshDashboardAction
} from '@/lib/actions';
import type {
  CheckInRuleData,
  DashboardPageData,
  EmergencyContact,
  MatchingCandidateData,
  MatchingProfileData,
  TripEventType
} from '@/lib/types';
import { cn } from '@/lib/utils';

type DetailTab =
  | 'overview'
  | 'itinerary'
  | 'matching'
  | 'check-ins'
  | 'timeline'
  | 'safety'
  | 'guardians';

const tripTabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'matching', label: 'Matching' },
  { id: 'check-ins', label: 'Check-ins' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'safety', label: 'Safety' },
  { id: 'guardians', label: 'Guardians' }
];

const tripEventTypes: TripEventType[] = [
  'BOOKED',
  'DEPARTED',
  'ARRIVED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'TRANSIT',
  'DELAYED',
  'RETURN_STARTED',
  'HOME_REACHED',
  'CUSTOM'
];

export function TripDetailClient({
  initialData,
  emergencyContacts,
  initialCheckInRules,
  initialMatchingProfile,
  initialMatchingCandidates
}: {
  initialData: DashboardPageData;
  emergencyContacts: EmergencyContact[];
  initialCheckInRules: CheckInRuleData[];
  initialMatchingProfile: MatchingProfileData | null;
  initialMatchingCandidates: MatchingCandidateData[];
}) {
  const [data, setData] = useState(initialData);
  const [checkInRules, setCheckInRules] = useState(initialCheckInRules);
  const [matchingProfile, setMatchingProfile] = useState(initialMatchingProfile);
  const [matchingCandidates, setMatchingCandidates] = useState(initialMatchingCandidates);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isRefreshing, startRefresh] = useTransition();
  const [isOptingIntoMatching, startMatchingOptIn] = useTransition();
  const [connectingMatchId, setConnectingMatchId] = useState<string | null>(null);
  const [isCreatingCheckInRule, startCheckInRuleCreation] = useTransition();
  const [evaluatingRuleId, setEvaluatingRuleId] = useState<string | null>(null);
  const [isGeneratingItinerary, startItineraryGeneration] = useTransition();
  const [isGeneratingBrief, startBriefGeneration] = useTransition();
  const [isTriggeringSos, startSosTrigger] = useTransition();
  const [isCreatingEvent, startEventCreation] = useTransition();
  const [checkInForm, setCheckInForm] = useState({
    title: 'Hotel arrival confirmation',
    expectedEventType: 'CHECKED_IN',
    expectedAt: defaultCheckInExpectedAt(),
    graceMinutes: 45
  });
  const [eventForm, setEventForm] = useState<{
    eventType: TripEventType;
    title: string;
    description: string;
    occurredAt: string;
  }>({
    eventType: 'ARRIVED',
    title: '',
    description: '',
    occurredAt: defaultEventOccurredAt()
  });
  const [matchingForm, setMatchingForm] = useState({
    displayName: 'Sana Rao',
    city: 'Bengaluru',
    travelStyle: 'Slow travel',
    hotelPreference: data.trip.destination === 'Goa' ? 'Panaji centre' : '',
    interests: 'cafes, heritage walks'
  });
  const { toast } = useToast();
  const router = useRouter();

  const sortedTimeline = useMemo(
    () =>
      [...data.timeline].sort(
        (left, right) =>
          new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime()
      ),
    [data.timeline]
  );

  const formattedDates = `${formatDate(data.trip.startDate)} - ${formatDate(
    data.trip.endDate
  )}`;
  const derivedTripDays = Math.max(
    1,
    Math.ceil(
      (new Date(data.trip.endDate ?? Date.now()).getTime() -
        new Date(data.trip.startDate ?? Date.now()).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  const handleRefresh = () => {
    startRefresh(async () => {
      const nextData = await refreshDashboardAction(data.tripId);
      setData(nextData);
      toast({
        title: 'Trip refreshed',
        description: 'Latest trip updates are now visible.'
      });
    });
  };

  const handleGenerateBrief = () => {
    startBriefGeneration(async () => {
      try {
        const safetyBrief = await generateSafetyBriefAction(data.tripId);
        setData((current) => ({ ...current, safetyBrief }));
        setActiveTab('safety');
        toast({
          title: 'mySaathi brief updated',
          description: 'Safety brief generated successfully.'
        });
      } catch (error) {
        toast({
          title: 'Unable to generate safety brief',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleGenerateItinerary = () => {
    startItineraryGeneration(async () => {
      try {
        const itineraryPlan = await generateItineraryAction({
          tripId: data.tripId,
          destination: data.trip.destination,
          numberOfDays: derivedTripDays,
          travelersCount: 1
        });

        setData((current) => ({ ...current, itineraryPlan }));
        setActiveTab('itinerary');
        toast({
          title: 'Itinerary generated',
          description: 'mySaathi created a safer day-by-day route for this trip.'
        });
      } catch (error) {
        toast({
          title: 'Unable to generate itinerary',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleMatchingOptIn = () => {
    startMatchingOptIn(async () => {
      try {
        const profile = await optInToMatching({
          tripId: data.tripId,
          displayName: matchingForm.displayName,
          city: matchingForm.city || undefined,
          travelStyle: matchingForm.travelStyle || undefined,
          hotelPreference: matchingForm.hotelPreference || undefined,
          interests: matchingForm.interests
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        });

        setMatchingProfile(profile);
        setActiveTab('matching');
        toast({
          title: 'Matching enabled',
          description: 'mySaathi can now show compatible women traveller suggestions for this trip.'
        });
      } catch (error) {
        toast({
          title: 'Unable to opt into matching',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleConnectMatch = (matchId: string) => {
    setConnectingMatchId(matchId);

    void connectMatch({
      tripId: data.tripId,
      matchId
    })
      .then(() => {
        setMatchingCandidates((current) =>
          current.map((candidate) =>
            candidate.matchId === matchId
              ? { ...candidate, connectionStatus: 'CONNECTED' }
              : candidate
          )
        );
        toast({
          title: 'Connection sent',
          description: 'The match has been marked connected in this MVP flow.'
        });
      })
      .catch((error) => {
        toast({
          title: 'Unable to connect',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      })
      .finally(() => {
        setConnectingMatchId(null);
      });
  };

  const handleCreateCheckInRule = () => {
    startCheckInRuleCreation(async () => {
      try {
        const rule = await createCheckInRuleAction({
          tripId: data.tripId,
          title: checkInForm.title,
          expectedEventType: checkInForm.expectedEventType,
          expectedAt: new Date(checkInForm.expectedAt).toISOString(),
          graceMinutes: checkInForm.graceMinutes
        });

        setCheckInRules((current) => [rule, ...current]);
        setActiveTab('check-ins');
        toast({
          title: 'Expected check-in created',
          description: 'mySaathi will now track this milestone against the trip timeline.'
        });
      } catch (error) {
        toast({
          title: 'Unable to create check-in rule',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleEvaluateCheckInRule = (ruleId: string) => {
    setEvaluatingRuleId(ruleId);

    void evaluateCheckInRuleAction(ruleId)
      .then((result) => {
        setCheckInRules((current) =>
          current.map((rule) => (rule.id === ruleId ? result.rule : rule))
        );
        toast({
          title: result.completed
            ? 'Check-in completed'
            : result.escalated
              ? 'Missed check-in escalated'
              : 'Check-in still pending',
          description: result.completed
            ? 'A matching trip event satisfied this expected check-in.'
            : result.escalated
              ? 'Guardians have been alerted because the expected update was missed.'
              : 'The grace window is still active for this milestone.'
        });
      })
      .catch((error) => {
        toast({
          title: 'Unable to evaluate check-in',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      })
      .finally(() => {
        setEvaluatingRuleId(null);
      });
  };

  const handleCreateEvent = () => {
    startEventCreation(async () => {
      try {
        const event = await createTripEvent(data.tripId, {
          eventType: eventForm.eventType,
          title: eventForm.title.trim(),
          description: eventForm.description.trim() || undefined,
          occurredAt: eventForm.occurredAt
            ? new Date(eventForm.occurredAt).toISOString()
            : undefined
        });

        setData((current) => {
          const nextTimeline = [
            ...current.timeline,
            {
              id: event.id,
              tripId: event.tripId,
              eventType: event.eventType,
              title: event.title,
              description: event.description,
              occurredAt: event.occurredAt
            }
          ];

          return {
            ...current,
            timeline: nextTimeline,
            latestEvent: resolveLatestEvent(nextTimeline)
          };
        });
        setEventForm({
          eventType: 'ARRIVED',
          title: '',
          description: '',
          occurredAt: defaultEventOccurredAt()
        });
        setActiveTab('timeline');
        toast({
          title: 'Trip event added',
          description: 'The timeline and latest status have been updated.'
        });
      } catch (error) {
        toast({
          title: 'Unable to add event',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleSos = async () => {
    return new Promise<void>((resolve) => {
      startSosTrigger(async () => {
        try {
          const result = await triggerSosAlert(data.tripId);

          if (!result.duplicateSuppressed) {
            setData((current) => ({
              ...current,
              latestEvent: {
                id: result.event.id,
                tripId: result.event.tripId,
                eventType: result.event.eventType,
                title: result.event.title,
                description: result.event.description,
                occurredAt: result.event.occurredAt
              },
              timeline: [
                ...current.timeline,
                {
                  id: result.event.id,
                  tripId: result.event.tripId,
                  eventType: result.event.eventType,
                  title: result.event.title,
                  description: result.event.description,
                  occurredAt: result.event.occurredAt
                }
              ]
            }));
          }

          toast({
            title: result.duplicateSuppressed ? 'SOS already active' : 'SOS alert sent',
            description: result.duplicateSuppressed
              ? 'A recent SOS alert already exists for this trip, so a duplicate was avoided.'
              : 'Guardians have been notified immediately.',
            variant: 'destructive'
          });
          router.push(`/sos/${result.event.id}`);
        } catch (error) {
          toast({
            title: 'SOS alert failed',
            description: getApiErrorMessage(error, 'Unable to trigger the SOS alert right now.'),
            variant: 'destructive'
          });
        } finally {
          resolve();
        }
      });
    });
  };

  return (
    <>
      <div className="space-y-7 pb-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 shadow-panel">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b border-border/70 px-6 py-7 lg:border-b-0 lg:border-r lg:px-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={statusBadgeVariant(data.trip.status)}>{data.trip.status}</Badge>
                <Badge variant="secondary">Generated by mySaathi</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {data.trip.destination}
              </h1>
              <p className="mt-2 text-lg text-slate-600">{data.trip.title}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <HeaderMeta icon={CalendarDays} label="Travel window" value={formattedDates} />
                <HeaderMeta icon={ShieldCheck} label="Safety score" value={`${data.safetyScore.score} / 100`} />
                <HeaderMeta icon={UserRound} label="Guardians linked" value={`${data.guardians.length}`} />
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(241,245,249,0.96))] px-6 py-7 lg:px-8">
              <p className="eyebrow">Latest update</p>
              {data.latestEvent ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {data.latestEvent.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatTime(data.latestEvent.occurredAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">
                    {data.latestEvent.description ??
                      'Latest journey update captured in the trip timeline.'}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-[1.4rem] border border-dashed border-border/70 bg-white/60 px-5 py-5 text-sm text-slate-500">
                  No trip event has been recorded yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-border/70 bg-white/92 p-3 shadow-panel">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <ActionButton
                label="Add Event"
                onClick={() => {
                  setActiveTab('timeline');
                }}
              />
              <ActionButton
                label="Share Trip"
                onClick={() => router.push(`/family-trust?tripId=${data.tripId}`)}
              />
              <ActionButton
                label={isCreatingCheckInRule ? 'Saving...' : 'Create Check-in'}
                onClick={() => {
                  setActiveTab('check-ins');
                }}
                disabled={isCreatingCheckInRule}
              />
              <ActionButton
                label={isGeneratingItinerary ? 'Planning...' : 'Generate Itinerary'}
                onClick={handleGenerateItinerary}
                disabled={isGeneratingItinerary}
              />
              <ActionButton
                label="Open Matching"
                onClick={() => {
                  setActiveTab('matching');
                }}
              />
              <ActionButton
                label={isGeneratingBrief ? 'Generating...' : 'Generate Safety Brief'}
                onClick={handleGenerateBrief}
                primary
                disabled={isGeneratingBrief}
              />
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : 'Refresh trip'}
            </Button>
          </div>
        </section>

        <section className="overflow-x-auto">
          <div className="inline-flex min-w-full gap-2 rounded-full border border-border/70 bg-white/85 p-2 shadow-panel">
            {tripTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-full px-5 py-2.5 text-sm font-medium transition',
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-slate-950'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'overview' ? (
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/92 shadow-panel">
              <div className="border-b border-border/70 px-7 py-6">
                <p className="eyebrow">Route overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Trip map</h2>
              </div>
              <div className="px-7 py-7">
                <div className="rounded-[1.7rem] border border-border/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(240,249,255,0.9),rgba(255,255,255,0.95))] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{data.trip.destination}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Map placeholder for route context, hotel zone, and local movement.
                      </p>
                    </div>
                    <Map className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    {['Start', 'Transit', 'Stay'].map((step, index) => (
                      <div key={step} className="flex flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{step}</p>
                        </div>
                        {index < 2 ? <div className="h-px flex-1 bg-slate-300" /> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
                <p className="eyebrow">Safety score</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-semibold text-slate-950">
                      {data.safetyScore.score}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{data.safetyScore.status}</p>
                  </div>
                  <Badge variant={scoreBadgeVariant(data.safetyScore.status)}>
                    {data.safetyScore.status}
                  </Badge>
                </div>
                <Progress value={data.safetyScore.score} className="mt-5 h-2.5" />
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  {data.safetyScore.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="eyebrow">mySaathi Safety Brief</p>
                    <p className="mt-1 text-sm text-slate-500">Generated by mySaathi</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-600">{data.safetyBrief.brief}</p>
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === 'itinerary' ? (
          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Safe itinerary builder</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                A calmer route for {data.trip.destination}
              </h2>
              {data.itineraryPlan ? (
                <>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {data.itineraryPlan.overview}
                  </p>
                  <div className="mt-5 rounded-[1.35rem] border border-border/70 bg-slate-50/90 px-5 py-5">
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="secondary">
                        {data.itineraryPlan.numberOfDays} days
                      </Badge>
                      <Badge variant="secondary">
                        {data.itineraryPlan.travelersCount} traveller
                        {data.itineraryPlan.travelersCount > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                      {data.itineraryPlan.rationale.map((reason) => (
                        <li key={reason} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-slate-50/90 px-6 py-8 text-sm text-slate-500">
                  No safe itinerary has been generated yet. Create one to get a
                  daylight-first plan with shorter transfers and calmer return windows.
                </div>
              )}
              <Button
                variant="destructive"
                className="mt-6"
                onClick={handleGenerateItinerary}
                disabled={isGeneratingItinerary}
              >
                {isGeneratingItinerary ? 'Generating itinerary...' : 'Generate itinerary'}
              </Button>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Day-by-day plan</p>
              {data.itineraryPlan ? (
                <div className="mt-6 space-y-6">
                  {data.itineraryPlan.days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="rounded-[1.45rem] border border-border/70 bg-slate-50/90 px-5 py-5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline">Day {day.dayNumber}</Badge>
                        <h3 className="text-lg font-semibold text-slate-950">{day.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{day.focus}</p>
                      <div className="mt-5 space-y-4">
                        {day.items.map((item) => (
                          <div
                            key={`${day.dayNumber}-${item.timeOfDay}-${item.title}`}
                            className="rounded-[1.2rem] border border-border/70 bg-white px-4 py-4"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="secondary">{item.timeOfDay}</Badge>
                              <span className="text-sm text-slate-500">
                                {item.startTime} - {item.endTime}
                              </span>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-950">
                              {item.title}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {item.description}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              Safety note: {item.safetyNote}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-slate-50/90 px-6 py-8 text-sm text-slate-500">
                  Once generated, the itinerary will appear here as a clean day-by-day flow.
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === 'matching' ? (
          <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Women traveller matching</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Opt in for calm, limited-intent travel connections
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Matching stays private by default. mySaathi only shows structured candidates
                with overlapping trip windows and compatible travel context.
              </p>
              {matchingProfile ? (
                <div className="mt-6 rounded-[1.4rem] border border-border/70 bg-slate-50/90 px-5 py-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="success">Matching active</Badge>
                    <p className="text-sm font-semibold text-slate-950">
                      {matchingProfile.displayName}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Travel style: {matchingProfile.travelStyle ?? 'Not set'} · Hotel
                    preference: {matchingProfile.hotelPreference ?? 'Not set'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {matchingProfile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <FormField
                    label="Display name"
                    value={matchingForm.displayName}
                    onChange={(value) =>
                      setMatchingForm((current) => ({ ...current, displayName: value }))
                    }
                  />
                  <FormField
                    label="City"
                    value={matchingForm.city}
                    onChange={(value) =>
                      setMatchingForm((current) => ({ ...current, city: value }))
                    }
                  />
                  <FormField
                    label="Travel style"
                    value={matchingForm.travelStyle}
                    onChange={(value) =>
                      setMatchingForm((current) => ({ ...current, travelStyle: value }))
                    }
                  />
                  <FormField
                    label="Hotel preference"
                    value={matchingForm.hotelPreference}
                    onChange={(value) =>
                      setMatchingForm((current) => ({ ...current, hotelPreference: value }))
                    }
                  />
                  <FormField
                    label="Interests (comma separated)"
                    value={matchingForm.interests}
                    onChange={(value) =>
                      setMatchingForm((current) => ({ ...current, interests: value }))
                    }
                  />
                  <Button
                    variant="destructive"
                    className="mt-2"
                    onClick={handleMatchingOptIn}
                    disabled={isOptingIntoMatching}
                  >
                    {isOptingIntoMatching ? 'Enabling matching...' : 'Enable matching'}
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <HeartHandshake className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">Candidate suggestions</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    Limited profile cards only
                  </h2>
                </div>
              </div>
              {matchingCandidates.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/70 bg-slate-50/90 px-6 py-8 text-sm text-slate-500">
                  {matchingProfile
                    ? 'No compatible candidates are visible yet for this trip window.'
                    : 'Opt in first to unlock match suggestions.'}
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {matchingCandidates.map((candidate) => (
                    <div
                      key={candidate.matchId}
                      className="rounded-[1.4rem] border border-border/70 bg-slate-50/90 px-5 py-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-lg font-semibold text-slate-950">
                              {candidate.displayName}
                            </p>
                            <Badge variant={candidate.connectionStatus === 'CONNECTED' ? 'success' : 'secondary'}>
                              {candidate.connectionStatus}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {candidate.tripTitle} · {candidate.overlapDays} day overlap
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {candidate.compatibilityScore}/100
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {candidate.interests.map((interest) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                        {candidate.reasons.map((reason) => (
                          <li key={reason} className="flex items-start gap-3">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        className="mt-4"
                        disabled={
                          connectingMatchId === candidate.matchId ||
                          candidate.connectionStatus === 'CONNECTED' ||
                          !matchingProfile
                        }
                        onClick={() => handleConnectMatch(candidate.matchId)}
                      >
                        {connectingMatchId === candidate.matchId
                          ? 'Connecting...'
                          : candidate.connectionStatus === 'CONNECTED'
                            ? 'Connected'
                            : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === 'check-ins' ? (
          <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Expected check-ins</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Track milestone updates before they are missed
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Create a time-bound check-in expectation for hotel arrival, landing, or
                any other milestone. If the matching trip event does not appear in time,
                mySaathi can escalate to guardians.
              </p>
              <div className="mt-6 space-y-4">
                <FormField
                  label="Check-in title"
                  value={checkInForm.title}
                  onChange={(value) =>
                    setCheckInForm((current) => ({ ...current, title: value }))
                  }
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Expected event</span>
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    value={checkInForm.expectedEventType}
                    onChange={(event) =>
                      setCheckInForm((current) => ({
                        ...current,
                        expectedEventType: event.target.value
                      }))
                    }
                  >
                    {['ARRIVED', 'CHECKED_IN', 'DEPARTED', 'HOME_REACHED'].map((eventType) => (
                      <option key={eventType} value={eventType}>
                        {eventType}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Expected by</span>
                  <input
                    type="datetime-local"
                    className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    value={checkInForm.expectedAt}
                    onChange={(event) =>
                      setCheckInForm((current) => ({
                        ...current,
                        expectedAt: event.target.value
                      }))
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Grace window (minutes)</span>
                  <input
                    type="number"
                    min={5}
                    max={720}
                    className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    value={checkInForm.graceMinutes}
                    onChange={(event) =>
                      setCheckInForm((current) => ({
                        ...current,
                        graceMinutes: Number(event.target.value)
                      }))
                    }
                  />
                </label>
              </div>
              <Button
                variant="destructive"
                className="mt-6"
                onClick={handleCreateCheckInRule}
                disabled={isCreatingCheckInRule}
              >
                {isCreatingCheckInRule ? 'Creating check-in...' : 'Save expected check-in'}
              </Button>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Rule status</p>
              {checkInRules.length === 0 ? (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-slate-50/90 px-6 py-8 text-sm text-slate-500">
                  No expected check-ins yet. Create one to start milestone tracking.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {checkInRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="rounded-[1.4rem] border border-border/70 bg-slate-50/90 px-5 py-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-sm font-semibold text-slate-950">{rule.title}</p>
                            <Badge variant={checkInRuleBadgeVariant(rule.status)}>
                              {rule.status}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            Expecting {rule.expectedEventType} by{' '}
                            {formatDateTime(rule.expectedAt)}
                          </p>
                        </div>
                        <Clock3 className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Grace window: {rule.graceMinutes} minutes
                      </p>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          disabled={
                            evaluatingRuleId === rule.id ||
                            rule.status === 'COMPLETED' ||
                            rule.status === 'ESCALATED'
                          }
                          onClick={() => handleEvaluateCheckInRule(rule.id)}
                        >
                          {evaluatingRuleId === rule.id ? 'Evaluating...' : 'Evaluate now'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === 'timeline' ? (
          <section className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Every movement, in order
                </h2>
              </div>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-slate-50/90 px-5 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">Add timeline event</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Record a new trip update
                  </h3>
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Event type</span>
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    value={eventForm.eventType}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        eventType: event.target.value as TripEventType
                      }))
                    }
                  >
                    {tripEventTypes.map((eventType) => (
                      <option key={eventType} value={eventType}>
                        {eventType}
                      </option>
                    ))}
                  </select>
                </label>
                <FormField
                  label="Title"
                  value={eventForm.title}
                  onChange={(value) =>
                    setEventForm((current) => ({ ...current, title: value }))
                  }
                />
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <textarea
                    value={eventForm.description}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        description: event.target.value
                      }))
                    }
                    className="min-h-[108px] w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Occurred at</span>
                  <input
                    type="datetime-local"
                    value={eventForm.occurredAt}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        occurredAt: event.target.value
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
              <Button
                variant="destructive"
                className="mt-6"
                onClick={handleCreateEvent}
                disabled={isCreatingEvent || !eventForm.title.trim()}
              >
                {isCreatingEvent ? 'Saving event...' : 'Save event'}
              </Button>
            </div>
            {sortedTimeline.length === 0 ? (
              <div className="mt-6 rounded-[1.6rem] border border-dashed border-border/70 bg-slate-50/90 px-6 py-8 text-sm text-slate-500">
                No trip events yet. Once events are added, they will appear here in a clear
                vertical journey flow.
              </div>
            ) : (
              <div className="mt-8 space-y-0">
                {sortedTimeline.map((event, index) => (
                  <div key={event.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-4">
                    <div className="flex flex-col items-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      {index < sortedTimeline.length - 1 ? (
                        <span className="mt-2 h-full w-px bg-slate-200" />
                      ) : null}
                    </div>
                    <div className="pb-8">
                      <div className="rounded-[1.45rem] border border-border/70 bg-slate-50/90 px-5 py-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="secondary">{event.eventType}</Badge>
                          <span className="text-sm text-slate-500">
                            {formatDateTime(event.occurredAt)}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-slate-950">
                          {event.title}
                        </h3>
                        {event.description ? (
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            {event.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'safety' ? (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Safety score</p>
              <div className="mt-4 flex items-center justify-between">
                <h2 className="text-4xl font-semibold text-slate-950">
                  {data.safetyScore.score}
                </h2>
                <Badge variant={scoreBadgeVariant(data.safetyScore.status)}>
                  {data.safetyScore.status}
                </Badge>
              </div>
              <Progress value={data.safetyScore.score} className="mt-5 h-2.5" />
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                {data.safetyScore.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">mySaathi Safety Brief</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Calm, readable trip context
                  </h2>
                </div>
                <WandSparkles className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">{data.safetyBrief.brief}</p>
              <Button
                variant="destructive"
                className="mt-6"
                onClick={handleGenerateBrief}
                disabled={isGeneratingBrief}
              >
                {isGeneratingBrief ? 'Generating...' : 'Regenerate brief'}
              </Button>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Emergency contacts</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Ready if support is needed
              </h2>
              <div className="mt-5 grid gap-4">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-[1.35rem] border border-border/70 bg-slate-50/90 px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-slate-950">{contact.fullName}</p>
                      <Badge variant={contact.isPrimary ? 'danger' : 'secondary'}>
                        {contact.relationship}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{contact.phoneNumber}</p>
                    {contact.notes ? (
                      <p className="mt-2 text-sm leading-6 text-slate-500">{contact.notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === 'guardians' ? (
          <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Guardians</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Trusted visibility for this trip
                  </h2>
                </div>
                <Button variant="outline" onClick={() => router.push('/guardians')}>
                  Manage guardians
                </Button>
              </div>
              <div className="mt-6 grid gap-4">
                {data.guardians.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-slate-50/90 px-6 py-8 text-sm text-slate-500">
                    No guardians have been linked yet.
                  </div>
                ) : (
                  data.guardians.map((guardian) => (
                    <div
                      key={guardian.id}
                      className="rounded-[1.35rem] border border-border/70 bg-slate-50/90 px-5 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {guardian.fullName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{guardian.relationship}</p>
                        </div>
                        <Badge variant="success">Active visibility</Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                        {guardian.phoneNumber ? <span>{guardian.phoneNumber}</span> : null}
                        {guardian.email ? <span>{guardian.email}</span> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
              <p className="eyebrow">Sharing</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Family Trust Center
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Use the Family Trust Center when you want guardians to see the full trip
                context, latest status, and reassurance timeline in one place.
              </p>
              <Button
                variant="destructive"
                className="mt-6"
                onClick={() => router.push(`/family-trust?tripId=${data.tripId}`)}
              >
                Open Family Trust Center
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        ) : null}
      </div>

      <FloatingSosButton onTrigger={handleSos} isLoading={isTriggeringSos} />
    </>
  );
}

function FormField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function ActionButton({
  label,
  onClick,
  primary = false,
  disabled = false
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      variant={primary ? 'destructive' : 'outline'}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}

function HeaderMeta({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border/70 bg-slate-50/85 px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return 'Dates pending';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short'
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(value));
}

function statusBadgeVariant(status: string): 'secondary' | 'success' | 'caution' | 'outline' {
  if (status === 'ACTIVE') {
    return 'success';
  }

  if (status === 'PLANNED') {
    return 'secondary';
  }

  if (status === 'COMPLETED') {
    return 'outline';
  }

  return 'caution';
}

function scoreBadgeVariant(status: string): 'success' | 'caution' | 'danger' {
  if (status === 'Safe') {
    return 'success';
  }

  if (status === 'Moderate') {
    return 'caution';
  }

  return 'danger';
}

function checkInRuleBadgeVariant(
  status: string
): 'secondary' | 'success' | 'caution' | 'danger' | 'outline' {
  if (status === 'PENDING') {
    return 'secondary';
  }

  if (status === 'COMPLETED') {
    return 'success';
  }

  if (status === 'ESCALATED') {
    return 'danger';
  }

  if (status === 'CANCELLED') {
    return 'outline';
  }

  return 'caution';
}

function defaultCheckInExpectedAt() {
  const target = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const timezoneOffset = target.getTimezoneOffset() * 60 * 1000;
  return new Date(target.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function defaultEventOccurredAt() {
  const target = new Date();
  const timezoneOffset = target.getTimezoneOffset() * 60 * 1000;
  return new Date(target.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function resolveLatestEvent(events: DashboardPageData['timeline']) {
  return (
    [...events].sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    )[0] ?? null
  );
}
