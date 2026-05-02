import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import { ForHerBookingSafetyService } from '../forher-booking-safety/forher-booking-safety.service';
import type { ForHerListingSafetyRepository } from './forher-listing-safety.repository';
import type { ListingSafetyResponse } from './forher-listing-safety.types';

export class ForHerListingSafetyService {
  constructor(
    private readonly repository: ForHerListingSafetyRepository,
    private readonly bookingSafetyService: ForHerBookingSafetyService
  ) {}

  async getListingSafetyScore(listingId: string): Promise<ListingSafetyResponse> {
    const listing = await this.repository.findListingById(listingId);

    if (!listing) {
      throw new AppError('Listing not found', StatusCodes.NOT_FOUND, 'LISTING_NOT_FOUND');
    }

    const ranked = this.bookingSafetyService.rankSingleHotelOption({
      id: listing.id,
      name: listing.name,
      neighborhood: listing.neighborhood,
      womenReviewScore: listing.womenReviewScore,
      verified: listing.verified,
      transportAvailability: listing.transportAvailability,
      nearPharmacy: listing.nearPharmacy,
      nearHospital: listing.nearHospital,
      nearPoliceStation: listing.nearPoliceStation,
      convenience24x7: listing.convenience24x7
    });

    const nearbyEssentials = [
      listing.nearPharmacy ? 'Pharmacy nearby' : null,
      listing.nearHospital ? 'Hospital nearby' : null,
      listing.nearPoliceStation ? 'Police support nearby' : null,
      listing.convenience24x7 ? '24x7 convenience nearby' : null
    ].filter((item): item is string => Boolean(item));

    return {
      listingId: listing.id,
      name: listing.name,
      neighborhood: listing.neighborhood,
      city: listing.city,
      score: ranked.safetyScore,
      status:
        ranked.safetyScore >= 80
          ? 'Safe'
          : ranked.safetyScore >= 60
            ? 'Moderate'
            : 'Risky',
      recommendation: ranked.recommendation,
      reasons: ranked.reasons,
      womenReviewHighlights: listing.womenReviewHighlights,
      nearbyEssentials,
      transferGuidance: listing.transferGuidance
    };
  }
}
