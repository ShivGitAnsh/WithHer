export interface NotificationRecipient {
  guardianId: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface TripEventNotificationPayload {
  eventType: string;
  tripTitle: string;
  timestamp: string;
}

export interface SendTripEventNotificationInput {
  recipients: NotificationRecipient[];
  payload: TripEventNotificationPayload;
}
