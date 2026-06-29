export interface GeoInfo {
  locality: string | null;
  ward: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  formatted: string | null;
}

// Reverse-geocodes coordinates using the Google Maps Geocoding web service.
// NOTE: the key used here must have the Geocoding API enabled and must NOT be
// HTTP-referrer-restricted (web-service calls come from the server). Prefer a
// dedicated GOOGLE_MAPS_API_KEY; falls back to VITE_GOOGLE_MAPS_API_KEY if unrestricted.
export async function reverseGeocode(lat: number, lng: number): Promise<GeoInfo | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || isNaN(lat) || isNaN(lng)) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
    const res = await fetch(url);
    const json: any = await res.json();
    if (json.status !== 'OK' || !json.results?.length) return null;
    const comp = json.results[0].address_components as any[];
    const get = (type: string) => comp.find((c) => c.types.includes(type))?.long_name || null;
    return {
      locality: get('sublocality') || get('sublocality_level_1') || get('neighborhood'),
      ward: get('sublocality_level_2'),
      city: get('locality') || get('administrative_area_level_3'),
      district: get('administrative_area_level_2'),
      state: get('administrative_area_level_1'),
      formatted: json.results[0].formatted_address || null,
    };
  } catch {
    return null;
  }
}
