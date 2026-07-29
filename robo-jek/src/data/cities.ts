export interface CityData {
  id: string;
  name: string;
  province: string;
  landmark: string;
  unlocked: boolean;
  position: { x: number; y: number };
  levelsCount: number;
}

export const CITIES_DATA: CityData[] = [
  {
    id: 'aceh',
    name: 'Banda Aceh',
    province: 'Aceh',
    landmark: 'Masjid Raya Baiturrahman',
    unlocked: true,
    position: { x: 120, y: 180 },
    levelsCount: 3
  },
  {
    id: 'medan',
    name: 'Medan',
    province: 'Sumatera Utara',
    landmark: 'Istana Maimun',
    unlocked: false,
    position: { x: 220, y: 260 },
    levelsCount: 3
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    province: 'DKI Jakarta',
    landmark: 'Monumen Nasional (Monas)',
    unlocked: false,
    position: { x: 420, y: 520 },
    levelsCount: 3
  }
];
