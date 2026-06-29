// Verified directory of civic complaint authorities, keyed by city.
// `whatsapp` MUST be a WhatsApp-enabled mobile in E.164 digits WITHOUT '+' (e.g. India: 91XXXXXXXXXX).
// Short codes like 1913 / 1533 / 1916 are NOT WhatsApp numbers — put those in `helpline` (call only).
export interface AuthorityContact {
  name: string;
  whatsapp: string | null;
  helpline: string | null;
  categories: string[]; // issue categories handled; use '*' for the city's default body
  source: string;
}

export interface CityAuthorities {
  city: string;        // lowercase match key (matched against geocoded city OR district)
  aliases?: string[];  // other names the geocoder might return
  state?: string;
  authorities: AuthorityContact[];
}

export const AUTHORITY_DIRECTORY: CityAuthorities[] = [
  {
    city: 'chennai',
    aliases: ['greater chennai', 'chennai district'],
    state: 'Tamil Nadu',
    authorities: [
      {
        name: 'Chennai Metro Water (CMWSSB)',
        whatsapp: '918144930308',
        helpline: '1916',
        categories: ['water_leakage'],
        source: 'CMWSSB public complaint channels — verify periodically',
      },
      {
        name: 'Greater Chennai Corporation (GCC)',
        whatsapp: '919445551913',
        helpline: '1913',
        categories: ['*'], // roads, garbage, streetlights, storm-water drains, trees, encroachment, noise…
        source: 'GCC official: helpline 1913 / WhatsApp 9445551913',
      },
    ],
  },
  {
    city: 'bengaluru',
    aliases: ['bangalore', 'bengaluru urban'],
    state: 'Karnataka',
    authorities: [
      {
        name: 'Bangalore Water Supply & Sewerage Board (BWSSB)',
        whatsapp: null,
        helpline: '1916',
        categories: ['water_leakage'],
        source: 'BWSSB helpline — verify',
      },
      {
        name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
        whatsapp: '919480685700',
        helpline: '1533',
        categories: ['*'],
        source: 'BBMP Sahaaya: helpline 1533 / WhatsApp 9480685700 — verify',
      },
    ],
  },
  // Add more cities here over time. Pattern: one entry per city, category-specific bodies first,
  // and one body with categories ['*'] as the default for everything else.
];

export interface GeoLike {
  locality?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  formatted?: string | null;
}

function cityMatches(entry: CityAuthorities, ...keys: (string | null | undefined)[]): boolean {
  const names = [entry.city, ...(entry.aliases || [])].map((n) => n.toLowerCase());
  return keys.some((k) => k && names.includes(String(k).toLowerCase()));
}

export function lookupAuthority(geo: GeoLike | null, category: string): AuthorityContact | null {
  if (!geo) return null;
  const entry = AUTHORITY_DIRECTORY.find((c) => cityMatches(c, geo.city, geo.district, geo.locality));
  if (!entry) return null;
  const specific = entry.authorities.find((a) => a.categories.includes(category));
  if (specific) return specific;
  return entry.authorities.find((a) => a.categories.includes('*')) || entry.authorities[0] || null;
}
