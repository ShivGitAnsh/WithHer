import type {
  FlightOptionInput,
  HotelOptionInput,
  RankedFlightOption,
  RankedHotelOption
} from './forher-booking-safety.types';

const NIGHT_HOURS = new Set([22, 23, 0, 1, 2, 3, 4, 5]);

export class ForHerBookingSafetyService {
  rankFlightOptions(options: FlightOptionInput[]): RankedFlightOption[] {
    return [...options]
      .map((option) => this.rankFlightOption(option))
      .sort((left, right) => right.safetyScore - left.safetyScore);
  }

  rankHotelOptions(options: HotelOptionInput[]): RankedHotelOption[] {
    return [...options]
      .map((option) => this.rankSingleHotelOption(option))
      .sort((left, right) => right.safetyScore - left.safetyScore);
  }

  rankSingleHotelOption(option: HotelOptionInput): RankedHotelOption {
    return this.rankHotelOption(option);
  }

  private rankFlightOption(option: FlightOptionInput): RankedFlightOption {
    const reasons: string[] = [];
    let safetyScore = 100;
    const arrivalHour = option.arrivalAt.getHours();

    if (NIGHT_HOURS.has(arrivalHour)) {
      safetyScore -= 35;
      reasons.push('Arrival happens during late-night hours.');
    } else {
      reasons.push('Arrival happens in a safer daytime or early-evening window.');
    }

    if (option.stops >= 2) {
      safetyScore -= 15;
      reasons.push('Multiple stops can increase travel fatigue and transfer risk.');
    } else if (option.stops === 1) {
      safetyScore -= 6;
      reasons.push('One stop adds some transfer complexity.');
    } else {
      reasons.push('Direct routing keeps the journey simpler.');
    }

    const recommendation =
      safetyScore >= 80
        ? 'Recommended'
        : safetyScore >= 60
          ? 'Late arrival, use caution'
          : 'Not recommended for solo arrival';

    const saferTransferHint =
      NIGHT_HOURS.has(arrivalHour)
        ? 'Pre-book an airport pickup or hotel transfer before arrival.'
        : 'Use verified cab pickup or hotel-arranged transfer for a smoother arrival.';

    return {
      ...option,
      safetyScore: Math.max(0, Math.min(100, safetyScore)),
      recommendation,
      reasons,
      saferTransferHint
    };
  }

  private rankHotelOption(option: HotelOptionInput): RankedHotelOption {
    const reasons: string[] = [];
    let safetyScore = 55;

    if (typeof option.womenReviewScore === 'number') {
      safetyScore += Math.round(option.womenReviewScore * 7);
      reasons.push(`Women traveller review score is ${option.womenReviewScore.toFixed(1)} / 5.`);
    }

    if (option.verified) {
      safetyScore += 12;
      reasons.push('Property is verified.');
    }

    if (option.transportAvailability === 'HIGH') {
      safetyScore += 10;
      reasons.push('Reliable transport availability nearby.');
    } else if (option.transportAvailability === 'LOW') {
      safetyScore -= 10;
      reasons.push('Transport availability nearby is limited.');
    }

    const nearbyEssentials = [
      option.nearPharmacy,
      option.nearHospital,
      option.nearPoliceStation,
      option.convenience24x7
    ].filter(Boolean).length;

    safetyScore += nearbyEssentials * 4;

    if (nearbyEssentials > 0) {
      reasons.push(`Nearby essentials coverage is available for ${nearbyEssentials} key support points.`);
    } else {
      reasons.push('Nearby essentials coverage is limited.');
    }

    const recommendation =
      safetyScore >= 80 ? 'Recommended' : safetyScore >= 60 ? 'Use caution' : 'Not recommended';

    return {
      ...option,
      safetyScore: Math.max(0, Math.min(100, safetyScore)),
      recommendation,
      reasons
    };
  }
}
