export interface LevelConfig {
  id: string;
  cityId: string;
  title: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  timeLimit: number; // in seconds
  goldTime: number; // in seconds for 3 stars
  maxCollisionsForTwoStars: number;
  maxCollisionsForThreeStars: number;
}

export const LEVELS_DATA: Record<string, LevelConfig[]> = {
  aceh: [
    {
      id: 'aceh-1',
      cityId: 'aceh',
      title: 'Level 1: Rute Sekolah Pasar',
      difficulty: 'Mudah',
      timeLimit: 60,
      goldTime: 40,
      maxCollisionsForTwoStars: 3,
      maxCollisionsForThreeStars: 1
    },
    {
      id: 'aceh-2',
      cityId: 'aceh',
      title: 'Level 2: Antar Paket Masjid Raya',
      difficulty: 'Sedang',
      timeLimit: 55,
      goldTime: 35,
      maxCollisionsForTwoStars: 3,
      maxCollisionsForThreeStars: 1
    },
    {
      id: 'aceh-3',
      cityId: 'aceh',
      title: 'Level 3: Rush Hour Ulee Lheue',
      difficulty: 'Sulit',
      timeLimit: 50,
      goldTime: 30,
      maxCollisionsForTwoStars: 2,
      maxCollisionsForThreeStars: 0
    }
  ]
};
