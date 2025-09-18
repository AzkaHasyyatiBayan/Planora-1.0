export type Urgensi = 'Penting' | 'Kurang Penting';
export type Prioritas = 'Tinggi' | 'Sedang' | 'Rendah';

export interface Task {
  title: string;
  urgensi: Urgensi;
  prioritas: Prioritas;
  status: string;
  number?: number;
}

export interface TrainingSample {
  urgensi: Urgensi;
  prioritas: Prioritas;
  quadrant: keyof typeof quadrantConfig;
}

export interface QuadrantConfigItem {
  title: string;
  subtitle: string;
  color: string;
  headerColor: string;
  icon?: React.ComponentType<{ size?: number }>;
  description: string;
}

export const quadrantConfig: Record<string, QuadrantConfigItem> = {
  importantUrgent: {
    title: 'Penting & Mendesak',
    subtitle: 'DO - Kerjakan Segera',
    color: 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700',
    headerColor: 'bg-red-500 text-white',
    description: 'Krisis dan deadline mendesak',
  },
  importantNotUrgent: {
    title: 'Penting & Tidak Mendesak',
    subtitle: 'PLAN - Rencanakan',
    color: 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
    headerColor: 'bg-blue-500 text-white',
    description: 'Tujuan dan pengembangan',
  },
  notImportantUrgent: {
    title: 'Tidak Penting & Mendesak',
    subtitle: 'DELEGATE - Delegasikan',
    color: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700',
    headerColor: 'bg-yellow-500 text-white',
    description: 'Gangguan dan interupsi',
  },
  notImportantNotUrgent: {
    title: 'Tidak Penting & Tidak Mendesak',
    subtitle: 'DELETE - Eliminasi',
    color: 'bg-gray-100 border-gray-300 dark:bg-gray-900/20 dark:border-gray-700',
    headerColor: 'bg-gray-500 text-white',
    description: 'Aktivitas membuang waktu',
  },
};

const trainingData: TrainingSample[] = [
  { urgensi: 'Penting', prioritas: 'Tinggi', quadrant: 'importantUrgent' },
  { urgensi: 'Kurang Penting', prioritas: 'Tinggi', quadrant: 'importantNotUrgent' },
  { urgensi: 'Penting', prioritas: 'Rendah', quadrant: 'notImportantUrgent' },
  { urgensi: 'Kurang Penting', prioritas: 'Rendah', quadrant: 'notImportantNotUrgent' },
  { urgensi: 'Penting', prioritas: 'Sedang', quadrant: 'importantUrgent' },
  { urgensi: 'Kurang Penting', prioritas: 'Sedang', quadrant: 'notImportantNotUrgent' },
];

// Menghitung jarak Euclidean antara task dan training sample
const calculateDistance = (task: Task, training: TrainingSample): number => {
  const urgensiScore = task.urgensi === 'Penting' ? 1 : 0;
  const prioritasScore =
    task.prioritas === 'Tinggi' ? 1 : task.prioritas === 'Sedang' ? 0.5 : 0;

  const trainingUrgensiScore = training.urgensi === 'Penting' ? 1 : 0;
  const trainingPrioritasScore =
    training.prioritas === 'Tinggi' ? 1 : training.prioritas === 'Sedang' ? 0.5 : 0;

  return Math.sqrt(
    Math.pow(urgensiScore - trainingUrgensiScore, 2) +
    Math.pow(prioritasScore - trainingPrioritasScore, 2)
  );
};

// Fungsi utama KNN classifier
export const classifyTask = (
  task: Task,
  k: number = 3
): keyof typeof quadrantConfig => {
  const distances = trainingData.map((training) => ({
    quadrant: training.quadrant,
    distance: calculateDistance(task, training),
  }));

  distances.sort((a, b) => a.distance - b.distance);
  const nearestNeighbors = distances.slice(0, k);

  const votes: Record<string, number> = {};
  nearestNeighbors.forEach((neighbor) => {
    votes[neighbor.quadrant] = (votes[neighbor.quadrant] || 0) + 1;
  });

  return Object.keys(votes).reduce((a, b) =>
    votes[a] > votes[b] ? a : b
  ) as keyof typeof quadrantConfig;
};