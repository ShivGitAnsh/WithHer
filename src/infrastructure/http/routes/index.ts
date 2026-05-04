import { Router } from 'express';

import { buildEmergencyContactRouter } from '../../../modules/emergency-contact/emergency-contact.routes';
import { buildForHerBookingSafetyRouter } from '../../../modules/forher-booking-safety/forher-booking-safety.routes';
import { buildForHerCheckInRouter } from '../../../modules/forher-check-in/forher-check-in.routes';
import { buildForHerItineraryRouter } from '../../../modules/forher-itinerary/forher-itinerary.routes';
import { buildForHerListingSafetyRouter } from '../../../modules/forher-listing-safety/forher-listing-safety.routes';
import { buildForHerMatchingRouter } from '../../../modules/forher-matching/forher-matching.routes';
import { buildForHerSafetyScoreRouter } from '../../../modules/forher-safety-score/forher-safety-score.routes';
import { buildForHerSosRouter } from '../../../modules/forher-sos/forher-sos.routes';
import { buildForHerPreferenceRouter } from '../../../modules/forher-preference/forher-preference.routes';
import { buildGuardianInviteRouter } from '../../../modules/guardian-invite/guardian-invite.routes';
import { buildGuardianRouter } from '../../../modules/guardian/guardian.routes';
import { buildHealthRouter } from '../../../modules/health/health.routes';
import { buildTripRouter } from '../../../modules/trip/trip.routes';
import { buildForHerConsentRouter } from '../../../modules/trip-sharing/forher-consent.routes';
import { buildTripSharingRouter } from '../../../modules/trip-sharing/trip-sharing.routes';
import { buildUserRouter } from '../../../modules/user/user.routes';

export const buildApiRouter = (): Router => {
  const router = Router();

  router.use('/forher', buildForHerPreferenceRouter());
  router.use('/forher', buildForHerBookingSafetyRouter());
  router.use('/forher', buildForHerCheckInRouter());
  router.use('/forher', buildGuardianInviteRouter());
  router.use('/forher', buildForHerItineraryRouter());
  router.use('/forher', buildForHerListingSafetyRouter());
  router.use('/forher', buildForHerMatchingRouter());
  router.use('/forher', buildForHerConsentRouter());
  router.use('/forher/emergency-contacts', buildEmergencyContactRouter());
  router.use('/forher/guardians', buildGuardianRouter());
  router.use('/forher/trips', buildTripRouter());
  router.use('/forher/trips', buildTripSharingRouter());
  router.use('/forher', buildForHerSafetyScoreRouter());
  router.use('/forher', buildForHerSosRouter());
  router.use('/guardians', buildGuardianRouter());
  router.use('/health', buildHealthRouter());
  router.use('/trips', buildTripRouter());
  router.use('/trips', buildTripSharingRouter());
  router.use('/users', buildUserRouter());

  return router;
};
