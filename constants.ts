
import { Apartment, ApartmentStatus, ApartmentType, Branch, MarketingVideo } from './types';

// Default monthly rents for vacant apartments
const defaultRents = {
    [ApartmentType.STUDIO]: 2200,
    [ApartmentType.ONE_BEDROOM]: 2800,
    [ApartmentType.TWO_BEDROOM]: 3500,
};

const mathwaa33Apartments: Apartment[] = [
    { id: '33-001', number: '33-001', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 5800, contractDurationMonths: 1, cashCollected: 5800, howHeard: 'Word of Mouth', lifetimeValue: 5800 },
    { id: '33-002', number: '33-002', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6280, contractDurationMonths: 12, cashCollected: 6280, howHeard: 'Word of Mouth', lifetimeValue: 75360 },
    { id: '33-003', number: '33-003', type: ApartmentType.TWO_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6800, contractDurationMonths: 12, cashCollected: 6800, howHeard: 'Word of Mouth', lifetimeValue: 81600 },
    { id: '33-004', number: '33-004', type: ApartmentType.TWO_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 7000, contractDurationMonths: 12, cashCollected: 7000, howHeard: 'Word of Mouth', lifetimeValue: 84000 },
    { id: '33-005 (AirBnB)', number: '33-005 (AirBnB)', type: ApartmentType.STUDIO, status: ApartmentStatus.RESERVED, monthlyRent: 7675, contractDurationMonths: 0, cashCollected: 0, howHeard: 'AirBnB', lifetimeValue: 0 },
    { id: '33-006', number: '33-006', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6820, contractDurationMonths: 12, cashCollected: 6820, howHeard: 'Paid Social Advertising', lifetimeValue: 81840 },
    { id: '33-007', number: '33-007', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6990, contractDurationMonths: 12, cashCollected: 6990, howHeard: 'Paid Social Advertising', lifetimeValue: 83880 },
    { id: '33-008', number: '33-008', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6210, contractDurationMonths: 1, cashCollected: 6210, howHeard: 'Paid Social Advertising', lifetimeValue: 6210 },
    { id: '33-009', number: '33-009', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 4583.33, contractDurationMonths: 12, cashCollected: 27500, howHeard: 'Uknown', lifetimeValue: 55000 },
    { id: '33-010', number: '33-010', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 5940, contractDurationMonths: 3, cashCollected: 5940, howHeard: 'Uknown', lifetimeValue: 17820 },
    { id: '33-011', number: '33-011', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6250, contractDurationMonths: 12, cashCollected: 6250, howHeard: 'Word of Mouth', lifetimeValue: 75000 },
    { id: '33-012', number: '33-012', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 5330, contractDurationMonths: 12, cashCollected: 5330, howHeard: 'Walk in', lifetimeValue: 63960 },
    { id: '33-013', number: '33-013', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 5640, contractDurationMonths: 12, cashCollected: 5640, howHeard: 'Bayut listing', lifetimeValue: 67680 },
    { id: '33-014', number: '33-014', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6490, contractDurationMonths: 12, cashCollected: 6490, howHeard: 'Paid Social Advertising', lifetimeValue: 77880 },
    { id: '33-015', number: '33-015', type: ApartmentType.STUDIO, status: ApartmentStatus.RENTED, monthlyRent: 5470, contractDurationMonths: 12, cashCollected: 5470, howHeard: 'Word of Mouth', lifetimeValue: 65640 },
    { id: '33-016', number: '33-016', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6090, contractDurationMonths: 12, cashCollected: 6090, howHeard: 'Word of Mouth', lifetimeValue: 73080 },
    { id: '33-017', number: '33-017', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6270, contractDurationMonths: 12, cashCollected: 6270, howHeard: 'Bayut listing', lifetimeValue: 75240 },
    { id: '33-018', number: '33-018', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 5600, contractDurationMonths: 12, cashCollected: 5600, howHeard: 'Walk in', lifetimeValue: 67200 },
    { id: '33-019', number: '33-019', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 5506, contractDurationMonths: 12, cashCollected: 5506, howHeard: 'Aqiq Building Board', lifetimeValue: 66072 },
    { id: '33-020', number: '33-020', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 6480, contractDurationMonths: 12, cashCollected: 6480, howHeard: 'Paid Social Advertising', lifetimeValue: 77760 },
    { id: '33-021 (AirBnB)', number: '33-021 (AirBnB)', type: ApartmentType.STUDIO, status: ApartmentStatus.RESERVED, monthlyRent: 7400, contractDurationMonths: 1, cashCollected: 3111, howHeard: 'AirBnB', lifetimeValue: 3111 },
    { id: '33-022 (AirBnB)', number: '33-022 (AirBnB)', type: ApartmentType.STUDIO, status: ApartmentStatus.RESERVED, monthlyRent: 7238, contractDurationMonths: 0, cashCollected: 0, howHeard: 'AirBnB', lifetimeValue: 0 },
    { id: '33-023', number: '33-023', type: ApartmentType.STUDIO, status: ApartmentStatus.RENTED, monthlyRent: 5350, contractDurationMonths: 3, cashCollected: 5350, howHeard: 'Walk in', lifetimeValue: 16050 },
    { id: '33-024', number: '33-024', type: ApartmentType.STUDIO, status: ApartmentStatus.RENTED, monthlyRent: 5620, contractDurationMonths: 9, cashCollected: 5620, howHeard: 'Bayut listing', lifetimeValue: 50580 },
    { id: '33-025', number: '33-025', type: ApartmentType.STUDIO, status: ApartmentStatus.RENTED, monthlyRent: 5100, contractDurationMonths: 12, cashCollected: 5100, howHeard: 'Bayut listing', lifetimeValue: 61200 },
    { id: '33-026', number: '33-026', type: ApartmentType.ONE_BEDROOM, status: ApartmentStatus.RENTED, monthlyRent: 5880, contractDurationMonths: 12, cashCollected: 5880, howHeard: 'Paid Social Advertising', lifetimeValue: 70560 },
];


export const BRANCHES: Branch[] = [
  {
    id: 'mathwaa-33',
    name: 'Mathwaa 33 - Al Olaya',
    apartments: mathwaa33Apartments,
    targetYearlyRevenue: {
      min: 1625832,
      max: 1954920,
    },
  },
];

// --- Marketing Videos (unchanged) ---
export const SOCIAL_MEDIA_VIDEOS: MarketingVideo[] = [
    {
        id: 'sm1',
        title: 'Elevated Living at Mathwaa',
        thumbnailUrl: 'https://placehold.co/600x400/A99484/F1ECE6/png?text=Social+Media+Advertisement+1',
        videoUrl: 'https://drive.google.com/file/d/1rEfuhnGX6qs6PYKU6RBI9DzFYEaF_N3E/view?usp=sharing',
    },
    {
        id: 'sm2',
        title: 'Premium Apartments in Olaya',
        thumbnailUrl: 'https://placehold.co/600x400/A99484/F1ECE6/png?text=Social+Media+Advertisement+2',
        videoUrl: 'https://drive.google.com/file/d/13_mYRaBbtPp_6WkZPihFssQQ4IEfeG7m/view?usp=sharing',
    },
    {
        id: 'sm3',
        title: 'Uncompromising Quality, Exceptional Value',
        thumbnailUrl: 'https://placehold.co/600x400/A99484/F1ECE6/png?text=Social+Media+Advertisement+3',
        videoUrl: 'https://drive.google.com/file/d/1BFrrao-OAFoRuNHzL2fIjw8YcN4xlJdB/view?usp=sharing',
    },
];
