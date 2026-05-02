export interface NotificationRecipient {
  guardianId: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface TripEventNotificationPayload {
  headline?: string;
  eventType: string;
  tripTitle: string;
  timestamp: string;
  lastEventSummary?: string | null;
}

export interface SendTripEventNotificationInput {
  recipients: NotificationRecipient[];
  payload: TripEventNotificationPayload;
}
