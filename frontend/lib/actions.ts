'use server';

import { generateItineraryPlan, refreshDashboardData, regenerateSafetyBrief } from '@/lib/api';
import { createCheckInRule, evaluateCheckInRule } from '@/lib/api';

export async function refreshDashboardAction(tripId: string) {
  return refreshDashboardData(tripId);
}

export async function generateSafetyBriefAction(tripId: string) {
  return regenerateSafetyBrief(tripId);
}

export async function generateItineraryAction(input: {
  tripId?: string;
  destination?: string;
  numberOfDays: number;
  travelersCount?: number;
}) {
  return generateItineraryPlan(input);
}

export async function createCheckInRuleAction(input: {
  tripId: string;
  title: string;
  expectedEventType: string;
  expectedAt: string;
  graceMinutes: number;
}) {
  return createCheckInRule(input);
}

export async function evaluateCheckInRuleAction(ruleId: string) {
  return evaluateCheckInRule(ruleId);
}
