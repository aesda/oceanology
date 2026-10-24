import { NEPAL_AND_GLOBAL_CITIES } from '../engines/locationAtlas';

export type AyanamshaMode =
  | 'LAHIRI'
  | 'KP_NEW'
  | 'KP_OLD'
  | 'RAMAN'
  | 'KHULLAR'
  | 'TROPICAL';

export type HouseSystem =
  | 'PLACIDUS'
  | 'WHOLE_SIGN'
  | 'EQUAL'
  | 'KOCH'
  | 'SRIPATI';

export type ChartVisualStyle =
  | 'WESTERN_WHEEL'
  | 'NORTH_INDIAN'
  | 'SOUTH_INDIAN'
  | 'BI_WHEEL';

export type NumerologySystem = 'PYTHAGOREAN' | 'CHALDEAN';

export type UxDepthMode = 'SURFACE' | 'DEEP_OCEAN';

export interface CityLocation {
  id: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  timezoneOffsetHours: number;
  ianaTimezone: string;
}

export interface BirthProfile {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  currentFirstName: string;
  currentLastName: string;
  gender: 'F' | 'M' | 'N' | 'EVENT';
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  hour: number;  // 0-23
  minute: number;// 0-59
  second: number;// 0-59
  unknownTime: boolean;
  location: CityLocation;
  startAgeOverride?: number;
  kpHoraryNumber: number;
}

export interface GlobalSettings {
  ayanamsha: AyanamshaMode;
  houseSystem: HouseSystem;
  chartStyle: ChartVisualStyle;
  numerologySystem: NumerologySystem;
  uxDepth: UxDepthMode;
  darkMode: boolean;
}

export const WORLD_CITIES: CityLocation[] = NEPAL_AND_GLOBAL_CITIES;

export const DEFAULT_PROFILE: BirthProfile = {
  id: 'default-ocean-1',
  firstName: 'Aarav',
  middleName: 'Raj',
  lastName: 'Shrestha',
  currentFirstName: 'Aarav',
  currentLastName: 'Shrestha',
  gender: 'M',
  year: 1996,
  month: 4,
  day: 14,
  hour: 10,
  minute: 30,
  second: 0,
  unknownTime: false,
  location: NEPAL_AND_GLOBAL_CITIES[0], // Kathmandu, Nepal (UTC+5:45, 1400m)
  kpHoraryNumber: 108,
};

export const PARTNER_DEFAULT_PROFILE: BirthProfile = {
  id: 'partner-ocean-2',
  firstName: 'Aarya',
  middleName: 'Devi',
  lastName: 'Koirala',
  currentFirstName: 'Aarya',
  currentLastName: 'Koirala',
  gender: 'F',
  year: 1998,
  month: 10,
  day: 22,
  hour: 16,
  minute: 45,
  second: 0,
  unknownTime: false,
  location: NEPAL_AND_GLOBAL_CITIES[1], // Pokhara, Nepal
  kpHoraryNumber: 42,
};
