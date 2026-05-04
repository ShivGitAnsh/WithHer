'use client';

import { useState, useTransition } from 'react';
import { Plane, Building2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { rankFlightOptions, rankHotelOptions } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import type {
  HotelRankingOption,
  RankedFlightOption,
  RankedHotelOption
} from '@/lib/types';

type EditableFlightOption = {
  id: string;
  airline: string;
  departureAt: string;
  arrivalAt: string;
  origin: string;
  destination: string;
  stops: string;
  price: string;
};

type EditableHotelOption = {
  id: string;
  name: string;
  neighborhood: string;
  womenReviewScore: string;
  verified: boolean;
  transportAvailability: 'LOW' | 'MEDIUM' | 'HIGH';
  nearPharmacy: boolean;
  nearHospital: boolean;
  nearPoliceStation: boolean;
  convenience24x7: boolean;
};

const initialFlightOptions: EditableFlightOption[] = [
  {
    id: 'flight-safe-1',
    airline: 'IndiGo',
    departureAt: '2026-05-10T07:10',
    arrivalAt: '2026-05-10T09:20',
    origin: 'BLR',
    destination: 'GOI',
    stops: '0',
    price: '6200'
  },
  {
    id: 'flight-risk-1',
    airline: 'SpiceJet',
    departureAt: '2026-05-10T20:30',
    arrivalAt: '2026-05-10T23:55',
    origin: 'BLR',
    destination: 'GOI',
    stops: '1',
    price: '5400'
  }
];

const initialHotelOptions: EditableHotelOption[] = [
  {
    id: 'hotel-safe-1',
    name: 'Central Stay Panaji',
    neighborhood: 'Panaji',
    womenReviewScore: '4.6',
    verified: true,
    transportAvailability: 'HIGH',
    nearPharmacy: true,
    nearHospital: true,
    nearPoliceStation: true,
    convenience24x7: true
  },
  {
    id: 'hotel-risk-1',
    name: 'Outskirts Budget Inn',
    neighborhood: 'Peripheral belt',
    womenReviewScore: '3.4',
    verified: false,
    transportAvailability: 'LOW',
    nearPharmacy: false,
    nearHospital: false,
    nearPoliceStation: false,
    convenience24x7: false
  }
];

export function BookingSafetyTools() {
  const [flightOptions, setFlightOptions] = useState(initialFlightOptions);
  const [hotelOptions, setHotelOptions] = useState(initialHotelOptions);
  const [rankedFlights, setRankedFlights] = useState<RankedFlightOption[]>([]);
  const [rankedHotels, setRankedHotels] = useState<RankedHotelOption[]>([]);
  const [isRankingFlights, startRankingFlights] = useTransition();
  const [isRankingHotels, startRankingHotels] = useTransition();
  const { toast } = useToast();

  const handleRankFlights = () => {
    startRankingFlights(async () => {
      try {
        const ranked = await rankFlightOptions(
          flightOptions.map((option) => ({
            id: option.id,
            airline: option.airline,
            departureAt: new Date(option.departureAt).toISOString(),
            arrivalAt: new Date(option.arrivalAt).toISOString(),
            origin: option.origin,
            destination: option.destination,
            stops: Number(option.stops),
            price: option.price ? Number(option.price) : undefined
          }))
        );

        setRankedFlights(ranked);
        toast({
          title: 'Flight options ranked',
          description: 'The safer arrival ranking has been generated from the backend.'
        });
      } catch (error) {
        toast({
          title: 'Unable to rank flights',
          description: getApiErrorMessage(error, 'Check the option details and try again.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleRankHotels = () => {
    startRankingHotels(async () => {
      try {
        const ranked = await rankHotelOptions(
          hotelOptions.map((option): HotelRankingOption => ({
            id: option.id,
            name: option.name,
            neighborhood: option.neighborhood,
            womenReviewScore: option.womenReviewScore
              ? Number(option.womenReviewScore)
              : undefined,
            verified: option.verified,
            transportAvailability: option.transportAvailability,
            nearPharmacy: option.nearPharmacy,
            nearHospital: option.nearHospital,
            nearPoliceStation: option.nearPoliceStation,
            convenience24x7: option.convenience24x7
          }))
        );

        setRankedHotels(ranked);
        toast({
          title: 'Hotel options ranked',
          description: 'The stay safety ranking has been generated from the backend.'
        });
      } catch (error) {
        toast({
          title: 'Unable to rank hotels',
          description: getApiErrorMessage(error, 'Check the stay details and try again.'),
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Plane className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">Flight safety ranking</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Compare safer arrival windows
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          {flightOptions.map((option, index) => (
            <div
              key={option.id}
              className="rounded-[1.45rem] border border-border/70 bg-slate-50/90 px-5 py-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-950">Option {index + 1}</p>
                <Badge variant="outline">{option.airline || 'Flight'}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Airline"
                  value={option.airline}
                  onChange={(value) =>
                    setFlightOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, airline: value } : item
                      )
                    )
                  }
                />
                <InputField
                  label="Stops"
                  type="number"
                  value={option.stops}
                  onChange={(value) =>
                    setFlightOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, stops: value } : item
                      )
                    )
                  }
                />
                <InputField
                  label="Departure"
                  type="datetime-local"
                  value={option.departureAt}
                  onChange={(value) =>
                    setFlightOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, departureAt: value } : item
                      )
                    )
                  }
                />
                <InputField
                  label="Arrival"
                  type="datetime-local"
                  value={option.arrivalAt}
                  onChange={(value) =>
                    setFlightOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, arrivalAt: value } : item
                      )
                    )
                  }
                />
                <InputField
                  label="Origin"
                  value={option.origin}
                  onChange={(value) =>
                    setFlightOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, origin: value } : item
                      )
                    )
                  }
                />
                <InputField
                  label="Destination"
                  value={option.destination}
                  onChange={(value) =>
                    setFlightOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, destination: value } : item
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="destructive"
          className="mt-6"
          onClick={handleRankFlights}
          disabled={isRankingFlights}
        >
          {isRankingFlights ? 'Ranking flights...' : 'Rank flight options'}
        </Button>

        <div className="mt-6 space-y-4">
          {rankedFlights.map((option) => (
            <div
              key={option.id}
              className="rounded-[1.35rem] border border-border/70 bg-white px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{option.airline}</p>
                  <p className="mt-1 text-sm text-slate-500">{option.recommendation}</p>
                </div>
                <Badge variant={option.safetyScore >= 80 ? 'success' : option.safetyScore >= 60 ? 'caution' : 'danger'}>
                  {option.safetyScore}/100
                </Badge>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {option.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {reason}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Transfer hint: {option.saferTransferHint}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-border/70 bg-white/92 p-7 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">Hotel safety ranking</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Compare stay safety signals
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          {hotelOptions.map((option, index) => (
            <div
              key={option.id}
              className="rounded-[1.45rem] border border-border/70 bg-slate-50/90 px-5 py-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-950">Option {index + 1}</p>
                <Badge variant="outline">{option.name || 'Stay'}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Hotel name"
                  value={option.name}
                  onChange={(value) =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, name: value } : item
                      )
                    )
                  }
                />
                <InputField
                  label="Neighborhood"
                  value={option.neighborhood}
                  onChange={(value) =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, neighborhood: value } : item
                      )
                    )
                  }
                />
                <InputField
                  label="Women review score"
                  type="number"
                  value={option.womenReviewScore}
                  onChange={(value) =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, womenReviewScore: value } : item
                      )
                    )
                  }
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Transport</span>
                  <select
                    value={option.transportAvailability}
                    onChange={(event) =>
                      setHotelOptions((current) =>
                        current.map((item) =>
                          item.id === option.id
                            ? {
                                ...item,
                                transportAvailability: event.target.value as
                                  | 'LOW'
                                  | 'MEDIUM'
                                  | 'HIGH'
                              }
                            : item
                        )
                      )
                    }
                    className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <ToggleTag
                  label="Verified"
                  checked={option.verified}
                  onToggle={() =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id ? { ...item, verified: !item.verified } : item
                      )
                    )
                  }
                />
                <ToggleTag
                  label="Pharmacy"
                  checked={option.nearPharmacy}
                  onToggle={() =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id
                          ? { ...item, nearPharmacy: !item.nearPharmacy }
                          : item
                      )
                    )
                  }
                />
                <ToggleTag
                  label="Hospital"
                  checked={option.nearHospital}
                  onToggle={() =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id
                          ? { ...item, nearHospital: !item.nearHospital }
                          : item
                      )
                    )
                  }
                />
                <ToggleTag
                  label="Police"
                  checked={option.nearPoliceStation}
                  onToggle={() =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id
                          ? { ...item, nearPoliceStation: !item.nearPoliceStation }
                          : item
                      )
                    )
                  }
                />
                <ToggleTag
                  label="24x7 convenience"
                  checked={option.convenience24x7}
                  onToggle={() =>
                    setHotelOptions((current) =>
                      current.map((item) =>
                        item.id === option.id
                          ? { ...item, convenience24x7: !item.convenience24x7 }
                          : item
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="destructive"
          className="mt-6"
          onClick={handleRankHotels}
          disabled={isRankingHotels}
        >
          {isRankingHotels ? 'Ranking hotels...' : 'Rank hotel options'}
        </Button>

        <div className="mt-6 space-y-4">
          {rankedHotels.map((option) => (
            <div
              key={option.id}
              className="rounded-[1.35rem] border border-border/70 bg-white px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{option.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{option.recommendation}</p>
                </div>
                <Badge variant={option.safetyScore >= 80 ? 'success' : option.safetyScore >= 60 ? 'caution' : 'danger'}>
                  {option.safetyScore}/100
                </Badge>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {option.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'datetime-local';
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function ToggleTag({
  label,
  checked,
  onToggle
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        checked
          ? 'border-transparent bg-primary text-white'
          : 'border-border bg-white text-slate-600'
      }`}
    >
      {label}
    </button>
  );
}
