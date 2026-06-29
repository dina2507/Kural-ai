export const APP_CONFIG = {
  name: 'KURAL',
  tagline: 'Every voice builds a better city.',
  url: (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_APP_URL : undefined) ?? 'http://localhost:3000',

  maps: {
    defaultCenter: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
    defaultZoom: 13,
    darkMapId: 'YOUR_DARK_MAP_ID',
    clusterRadius: 50,
    duplicateCheckRadius: 50, // meters
  },

  ai: {
    model: 'gemini-2.5-flash',
    maxRetries: 3,
    timeoutMs: 30000,
  },

  issues: {
    categories: [
      'pothole', 'water_leakage', 'streetlight',
      'garbage', 'drainage', 'road_damage',
      'tree_hazard', 'encroachment', 'noise', 'other'
    ],
    communityThreshold: 5,    // confirmations before auto-upgrade
    criticalSeverity: 9,
    highSeverity: 7,
    mediumSeverity: 4,
  },

  karma: {
    reportSubmit: 10,
    reportVerified: 20,
    confirmIssue: 5,
    resolutionVerified: 30,
  },

  departments: {
    pothole:        'Public Works Department (PWD)',
    water_leakage:  'Bangalore Water Supply & Sewerage Board (BWSSB)',
    streetlight:    'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    garbage:        'Solid Waste Management (SWM)',
    drainage:       'BWSSB',
    road_damage:    'PWD',
    tree_hazard:    'BBMP Horticulture',
    encroachment:   'BBMP Revenue',
    noise:          'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    other:          'BBMP',
  },

  digest: {
    defaultWard: '',
  },
} as const;
