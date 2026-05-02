import type { SosCaseDetails } from './forher-sos.types';

type SosSupportProfile = Pick<SosCaseDetails, 'localSupport'>['localSupport'];

const defaultSupportProfile: SosSupportProfile = {
  destinationLabel: 'India',
  helplines: [
    {
      label: 'Police',
      phoneNumber: '112',
      category: 'Police',
      availability: '24x7'
    },
    {
      label: 'Women Helpline',
      phoneNumber: '181',
      category: 'Women Helpline',
      availability: '24x7'
    },
    {
      label: 'Medical Emergency',
      phoneNumber: '108',
      category: 'Medical',
      availability: '24x7'
    },
    {
      label: 'Tourist Helpline',
      phoneNumber: '1363',
      category: 'Tourist Support',
      availability: '24x7'
    }
  ],
  staySupport: {
    propertyName: 'Verified Stay Support',
    frontDeskPhone: '+91 832 400 1200',
    supportDeskLabel: 'Travel desk',
    supportDeskPhone: '+91 832 400 1288',
    addressHint: 'Main reception desk at the booked property',
    transferNote: 'Use the property travel desk or a verified cab operator for onward transfer.'
  }
};

const destinationProfiles: Record<string, SosSupportProfile> = {
  goa: {
    destinationLabel: 'Goa',
    helplines: [
      {
        label: 'Police',
        phoneNumber: '112',
        category: 'Police',
        availability: '24x7'
      },
      {
        label: 'Women Helpline',
        phoneNumber: '1091',
        category: 'Women Helpline',
        availability: '24x7'
      },
      {
        label: 'Medical Emergency',
        phoneNumber: '108',
        category: 'Medical',
        availability: '24x7'
      },
      {
        label: 'Goa Tourist Helpline',
        phoneNumber: '1364',
        category: 'Tourist Support',
        availability: '24x7'
      }
    ],
    staySupport: {
      propertyName: 'Harbour House Panaji',
      frontDeskPhone: '+91 832 710 2233',
      supportDeskLabel: 'Airport transfer desk',
      supportDeskPhone: '+91 832 710 2299',
      addressHint: 'Central Panaji stay near the main boulevard and reception lobby',
      transferNote:
        'Ask the hotel desk for verified airport or city transfer support and avoid unplanned late-night movement.'
    }
  },
  udaipur: {
    destinationLabel: 'Udaipur',
    helplines: [
      {
        label: 'Police',
        phoneNumber: '112',
        category: 'Police',
        availability: '24x7'
      },
      {
        label: 'Women Helpline',
        phoneNumber: '1091',
        category: 'Women Helpline',
        availability: '24x7'
      },
      {
        label: 'Medical Emergency',
        phoneNumber: '108',
        category: 'Medical',
        availability: '24x7'
      },
      {
        label: 'Rajasthan Tourist Helpline',
        phoneNumber: '1363',
        category: 'Tourist Support',
        availability: '24x7'
      }
    ],
    staySupport: {
      propertyName: 'Lake Court Residency',
      frontDeskPhone: '+91 294 288 4200',
      supportDeskLabel: 'Guest relations desk',
      supportDeskPhone: '+91 294 288 4208',
      addressHint: 'Lakeside heritage district reception and concierge lobby',
      transferNote:
        'Use the guest-relations desk to arrange car pickup or confirmed local taxi support for late movement.'
    }
  },
  kasol: {
    destinationLabel: 'Kasol',
    helplines: [
      {
        label: 'Police',
        phoneNumber: '112',
        category: 'Police',
        availability: '24x7'
      },
      {
        label: 'Women Helpline',
        phoneNumber: '1091',
        category: 'Women Helpline',
        availability: '24x7'
      },
      {
        label: 'Medical Emergency',
        phoneNumber: '108',
        category: 'Medical',
        availability: '24x7'
      },
      {
        label: 'Himachal Tourist Helpline',
        phoneNumber: '1364',
        category: 'Tourist Support',
        availability: '24x7'
      }
    ],
    staySupport: {
      propertyName: 'Pine Ridge Retreat',
      frontDeskPhone: '+91 1902 244 118',
      supportDeskLabel: 'Camp transfer desk',
      supportDeskPhone: '+91 1902 244 125',
      addressHint: 'Main retreat reception on the valley road',
      transferNote:
        'Avoid unplanned road movement after dark and request hotel-arranged transport for departure or hospital support.'
    }
  }
};

export const getSosSupportProfile = (destination: string): SosSupportProfile =>
  destinationProfiles[destination.trim().toLowerCase()] ?? defaultSupportProfile;
