export const CATEGORIES = [
  { id: 'casa', label: 'At Home', icon: '🏠' },
  { id: 'salir', label: 'Go Out', icon: '🌆' },
  { id: 'peliculas', label: 'Movies', icon: '🎬' },
  { id: 'comidas', label: 'Food', icon: '🍔' },
  { id: 'hot', label: 'Intimate', icon: '🔥', restricted: true },
];

export const MOCK_DELAY_MS = 600;

// Ensuring casing consistency
export const NORMALIZE_CATEGORY = (cat: string) => cat.toLowerCase();