export type Station = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  power?: string;
  network?: string;
  lat?: number;
  lng?: number;
  distance?: number; // km, computed client-side
  distanceKm?: number; // alias (some components may use this)
};

export type ApiStationsResponse = {
  stations: Station[];
};

export type ApiErrorResponse = {
  error: { message: string };
};
