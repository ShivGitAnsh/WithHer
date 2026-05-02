import type { ForHerListingSafetyRepository } from './forher-listing-safety.repository';
import type { ListingSafetyCatalogRecord } from './forher-listing-safety.types';

const listingCatalog: ListingSafetyCatalogRecord[] = [
  {
    id: 'htl-panaji',
    name: 'Harbour House Panaji',
    neighborhood: 'Fontainhas',
    city: 'Goa',
    womenReviewScore: 4.7,
    verified: true,
    transportAvailability: 'HIGH',
    nearPharmacy: true,
    nearHospital: true,
    nearPoliceStation: true,
    convenience24x7: true,
    womenReviewHighlights: [
      'Guests mention that the lane stays active into the evening without feeling chaotic.',
      'Solo travellers found hotel staff responsive when arranging cabs and airport pickup.',
      'The stay is repeatedly described as comfortable for short walking-distance plans.'
    ],
    transferGuidance:
      'Use a pre-booked airport pickup or verified app cab and keep the first evening movement inside Fontainhas or Panaji centre.'
  },
  {
    id: 'htl-calangute',
    name: 'Calangute Palm Stay',
    neighborhood: 'Calangute',
    city: 'Goa',
    womenReviewScore: 4.1,
    verified: true,
    transportAvailability: 'MEDIUM',
    nearPharmacy: true,
    nearHospital: false,
    nearPoliceStation: false,
    convenience24x7: true,
    womenReviewHighlights: [
      'Travellers found the property convenient when plans were kept around the main beach road.',
      'The area stays busy, which helps for early evening returns but can feel noisy later at night.'
    ],
    transferGuidance:
      'Prefer direct pickup and return before the late-night bar traffic window when possible.'
  },
  {
    id: 'htl-outskirts',
    name: 'Cliffline Quiet Retreat',
    neighborhood: 'North Goa outskirts',
    city: 'Goa',
    womenReviewScore: 3.6,
    verified: false,
    transportAvailability: 'LOW',
    nearPharmacy: false,
    nearHospital: false,
    nearPoliceStation: false,
    convenience24x7: false,
    womenReviewHighlights: [
      'Guests liked the quiet setting, but several noted that the area becomes isolated after sunset.',
      'Transport usually needs to be planned in advance because street availability is limited.'
    ],
    transferGuidance:
      'Avoid relying on ad-hoc transport here. Only choose this stay if every arrival and return leg is pre-arranged.'
  }
];

export class StaticForHerListingSafetyRepository implements ForHerListingSafetyRepository {
  async findListingById(listingId: string): Promise<ListingSafetyCatalogRecord | null> {
    return listingCatalog.find((listing) => listing.id === listingId) ?? null;
  }
}
