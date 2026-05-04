import type { WomenTravellerReviewSet } from './forher-safety-score.types';

const reviewCatalog: WomenTravellerReviewSet[] = [
  {
    destinationLabel: 'Goa',
    destinationKeywords: ['goa', 'panaji', 'calangute'],
    reviews: [
      {
        reviewerLabel: 'Aditi, solo traveller',
        travelContext: 'Solo',
        sentiment: 'Positive',
        rating: 5,
        review:
          'Daytime movement around central Panaji felt comfortable and app cabs were easy to get. Hotel staff also helped confirm return transport before evening.',
        tags: ['transport', 'staff support', 'daytime movement']
      },
      {
        reviewerLabel: 'Neha, solo traveller',
        travelContext: 'Solo',
        sentiment: 'Mixed',
        rating: 4,
        review:
          'The area stayed active into the evening, which helped, but I avoided very late-night beach transfers unless they were pre-booked.',
        tags: ['evening activity', 'late-night caution']
      },
      {
        reviewerLabel: 'Rhea, friends trip',
        travelContext: 'Friends',
        sentiment: 'Positive',
        rating: 4,
        review:
          'Verified stays in busier parts of Goa felt easier because essentials and cab pickup points were nearby.',
        tags: ['verified stays', 'nearby essentials']
      }
    ]
  },
  {
    destinationLabel: 'Tamil Nadu',
    destinationKeywords: ['tamil', 'tamil nadu', 'chennai', 'madurai', 'coimbatore'],
    reviews: [
      {
        reviewerLabel: 'Harini, solo traveller',
        travelContext: 'Solo',
        sentiment: 'Positive',
        rating: 4,
        review:
          'I felt more comfortable when my hotel was on a main road with reliable auto and cab access. Day plans were smooth and predictable.',
        tags: ['main road stay', 'transport access', 'predictable movement']
      },
      {
        reviewerLabel: 'Sanjana, solo traveller',
        travelContext: 'Solo',
        sentiment: 'Mixed',
        rating: 3,
        review:
          'The destination felt manageable, but I preferred returning before late night because quieter stretches became less comfortable after dark.',
        tags: ['mixed after dark', 'early return']
      },
      {
        reviewerLabel: 'Keerthana, duo trip',
        travelContext: 'Duo',
        sentiment: 'Positive',
        rating: 4,
        review:
          'Hotel staff responsiveness made a difference. Quick support with check-in and local transport planning improved confidence.',
        tags: ['staff support', 'check-in confidence']
      }
    ]
  },
  {
    destinationLabel: 'Jaipur',
    destinationKeywords: ['jaipur'],
    reviews: [
      {
        reviewerLabel: 'Tanvi, solo traveller',
        travelContext: 'Solo',
        sentiment: 'Positive',
        rating: 4,
        review:
          'Central areas felt straightforward during the day and it was easier to plan around known pickup points.',
        tags: ['central area', 'predictable pickup']
      },
      {
        reviewerLabel: 'Manya, solo traveller',
        travelContext: 'Solo',
        sentiment: 'Cautious',
        rating: 3,
        review:
          'I avoided isolated movement late at night and relied on hotel-arranged transport for unfamiliar stretches.',
        tags: ['late-night caution', 'hotel-arranged transport']
      }
    ]
  },
  {
    destinationLabel: 'General',
    destinationKeywords: [],
    reviews: [
      {
        reviewerLabel: 'Verified women traveller review',
        travelContext: 'Solo',
        sentiment: 'Mixed',
        rating: 4,
        review:
          'Trips felt safer when the stay was verified, transport was easy to arrange, and evening movement stayed limited and predictable.',
        tags: ['verified stay', 'transport access', 'predictable evening plan']
      },
      {
        reviewerLabel: 'Verified women traveller review',
        travelContext: 'Solo',
        sentiment: 'Cautious',
        rating: 3,
        review:
          'Confidence dropped when the area became isolated after dark or when return transport needed to be improvised.',
        tags: ['isolated after dark', 'improvised transport']
      }
    ]
  }
];

export function resolveWomenTravellerReviewSet(
  destination: string
): WomenTravellerReviewSet {
  const normalizedDestination = destination.trim().toLowerCase();

  return (
    reviewCatalog.find((entry) =>
      entry.destinationKeywords.some((keyword) => normalizedDestination.includes(keyword))
    ) ?? reviewCatalog[reviewCatalog.length - 1]
  );
}
