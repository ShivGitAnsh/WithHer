import { z } from 'zod';

export const flightOptionSchema = z.object({
  id: z.string().min(1, 'Flight option id is required'),
  airline: z.string().min(1, 'Airline is required'),
  departureAt: z.coerce.date(),
  arrivalAt: z.coerce.date(),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  stops: z.number().int().min(0).default(0),
  price: z.number().nonnegative().optional()
});

export const rankFlightOptionsSchema = z.object({
  options: z.array(flightOptionSchema).min(1, 'At least one flight option is required')
});

export const hotelOptionSchema = z.object({
  id: z.string().min(1, 'Hotel option id is required'),
  name: z.string().min(1, 'Hotel name is required'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  womenReviewScore: z.number().min(0).max(5).optional(),
  verified: z.boolean().optional(),
  transportAvailability: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  nearPharmacy: z.boolean().optional(),
  nearHospital: z.boolean().optional(),
  nearPoliceStation: z.boolean().optional(),
  convenience24x7: z.boolean().optional()
});

export const rankHotelOptionsSchema = z.object({
  options: z.array(hotelOptionSchema).min(1, 'At least one hotel option is required')
});

export type RankFlightOptionsInput = z.infer<typeof rankFlightOptionsSchema>;
export type RankHotelOptionsInput = z.infer<typeof rankHotelOptionsSchema>;
export type FlightOptionInput = z.infer<typeof flightOptionSchema>;
export type HotelOptionInput = z.infer<typeof hotelOptionSchema>;

export interface RankedFlightOption extends FlightOptionInput {
  safetyScore: number;
  recommendation: 'Recommended' | 'Late arrival, use caution' | 'Not recommended for solo arrival';
  reasons: string[];
  saferTransferHint: string;
}

export interface RankedHotelOption extends HotelOptionInput {
  safetyScore: number;
  recommendation: 'Recommended' | 'Use caution' | 'Not recommended';
  reasons: string[];
}
