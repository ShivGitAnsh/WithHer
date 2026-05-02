import { CheckInRuleStatus, type TripEvent } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/app-error';
import { NotificationService } from '../notification/notification.service';
import type { ForHerCheckInRepository } from './forher-check-in.repository';
import {
  toCheckInNotificationRecipients,
  type CheckInSchedulerRunSummary,
  type CheckInEvaluationResponse,
  type CheckInRuleListItem,
  type CheckInRuleRecord,
  type CreateCheckInRuleInput
} from './forher-check-in.types';

export class ForHerCheckInService {
  constructor(
    private readonly repository: ForHerCheckInRepository,
    private readonly notificationService: NotificationService
  ) {}

  async createCheckInRule(
    tripId: string,
    input: CreateCheckInRuleInput
  ): Promise<CheckInRuleRecord> {
    const tripExists = await this.repository.tripExists(tripId);

    if (!tripExists) {
      throw new AppError('Trip not found', StatusCodes.NOT_FOUND, 'TRIP_NOT_FOUND');
    }

    if (input.expectedAt <= new Date()) {
      throw new AppError(
        'Expected check-in time must be in the future',
        StatusCodes.BAD_REQUEST,
        'INVALID_EXPECTED_AT'
      );
    }

    return this.repository.createCheckInRule({
      tripId,
      title: input.title,
      expectedEventType: input.expectedEventType,
      expectedAt: input.expectedAt,
      graceMinutes: input.graceMinutes
    });
  }

  async getCheckInRules(tripId: string): Promise<CheckInRuleListItem[]> {
    return this.repository.findCheckInRulesByTripId(tripId);
  }

  async evaluateRule(ruleId: string): Promise<CheckInEvaluationResponse> {
    const context = await this.repository.findCheckInRuleContextById(ruleId, new Date());

    if (!context) {
      throw new AppError('Check-in rule not found', StatusCodes.NOT_FOUND, 'CHECK_IN_RULE_NOT_FOUND');
    }

    if (context.rule.status === CheckInRuleStatus.COMPLETED) {
      return {
        rule: context.rule,
        completed: true,
        escalated: false,
        matchedEvent: context.matchingEvent
      };
    }

    if (context.rule.status === CheckInRuleStatus.ESCALATED) {
      return {
        rule: context.rule,
        completed: false,
        escalated: true,
        matchedEvent: context.matchingEvent
      };
    }

    if (context.matchingEvent) {
      const completedRule = await this.repository.updateRuleCompleted(
        context.rule.id,
        context.matchingEvent.occurredAt,
        context.matchingEvent.id
      );

      return {
        rule: completedRule,
        completed: true,
        escalated: false,
        matchedEvent: context.matchingEvent
      };
    }

    const cutoff = new Date(context.rule.expectedAt.getTime() + context.rule.graceMinutes * 60 * 1000);

    if (new Date() <= cutoff) {
      return {
        rule: context.rule,
        completed: false,
        escalated: false,
        matchedEvent: null
      };
    }

    const escalatedRule = await this.repository.updateRuleEscalated(context.rule.id, new Date());
    await this.sendMissedCheckInAlert({
      rule: escalatedRule,
      tripTitle: context.trip.title,
      latestEventSummary: context.latestEvent
        ? `${context.latestEvent.eventType} - ${context.latestEvent.title}`
        : 'No recent trip event recorded',
      guardians: context.guardians
    });

    return {
      rule: escalatedRule,
      completed: false,
      escalated: true,
      matchedEvent: null
    };
  }

  async evaluateDueRules(limit: number): Promise<CheckInSchedulerRunSummary> {
    const dueRuleIds = await this.repository.findPendingRuleIdsDueForEvaluation(new Date(), limit);

    const summary: CheckInSchedulerRunSummary = {
      scanned: dueRuleIds.length,
      completed: 0,
      escalated: 0,
      pending: 0,
      errors: 0
    };

    for (const ruleId of dueRuleIds) {
      try {
        const result = await this.evaluateRule(ruleId);

        if (result.completed) {
          summary.completed += 1;
          continue;
        }

        if (result.escalated) {
          summary.escalated += 1;
          continue;
        }

        summary.pending += 1;
      } catch (error) {
        summary.errors += 1;
        logger.error({ err: error, ruleId }, 'Background check-in evaluation failed');
      }
    }

    return summary;
  }

  async completeMatchingRulesForEvent(event: TripEvent): Promise<void> {
    const pendingRules = await this.repository.findPendingRulesForEvent(
      event.tripId,
      event.eventType,
      event.occurredAt
    );

    if (pendingRules.length === 0) {
      return;
    }

    await Promise.all(
      pendingRules.map((rule) =>
        this.repository.updateRuleCompleted(rule.id, event.occurredAt, event.id)
      )
    );
  }

  private async sendMissedCheckInAlert(input: {
    rule: CheckInRuleRecord;
    tripTitle: string;
    latestEventSummary: string;
    guardians: Array<{
      id: string;
      fullName: string;
      email: string | null;
      phoneNumber: string | null;
      relationship: string;
    }>;
  }): Promise<void> {
    const recipients = toCheckInNotificationRecipients(input.guardians);

    if (recipients.length === 0) {
      logger.warn(
        { ruleId: input.rule.id, tripId: input.rule.tripId },
        'Missed check-in escalation skipped: no active guardians available'
      );
      return;
    }

    try {
      await this.notificationService.sendTripEventNotification({
        recipients,
        payload: {
          headline: '⚠️ Check-in missed',
          eventType: input.rule.expectedEventType,
          tripTitle: input.tripTitle,
          timestamp: new Date().toISOString(),
          lastEventSummary: input.latestEventSummary
        }
      });
    } catch (error) {
      logger.error({ err: error, ruleId: input.rule.id }, 'Failed to send missed check-in alert');
    }
  }
}
