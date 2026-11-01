export type BasketballPosition = 'Base' | 'Escolta' | 'Alero' | 'Ala-Pivot' | 'Pivot';

export type SessionType = 'Entrenamiento Táctico' | 'Partido Liga' | 'Físico / Potencia' | 'Tiro / Regenerativo' | '5v5 Competitivo';
export type SessionTypeSelection = SessionType | SessionType[];

export interface PlayerSessionRecord {
  playerId: string;
  playerName: string;
  position: BasketballPosition;
  jerseyNumber?: number;
  minutesPlayed: number;
  totDistM: number;       // Tot Dist (m)
  totPL: number;          // Tot PL (Player Load)
  totJumps: number;       // Tot Jump #
  bmpBasketballLoad: number; // BMP Tot Basketball Load
  // Derived or optional internal load
  rpe?: number;           // Borg RPE 1-10
  notes?: string;
}

export interface Session {
  id: string;
  sessionNumber: number;
  date: string;           // YYYY-MM-DD or DD/MM/YYYY
  title: string;          // e.g. "SESIÓN 39"
  type: SessionTypeSelection;
  typeDurations?: Partial<Record<SessionType, number>>;
  durationMinutes: number;
  records: PlayerSessionRecord[];
  notes?: string;
  googleSheetTab?: string;
}

export interface PlayerSummary {
  id: string;
  name: string;
  position: BasketballPosition;
  jerseyNumber: number;
  heightCm: number;
  weightKg: number;
  age: number;
  avatarColor: string;
  injuryHistory?: string;
  observations?: string;
}

export interface FatigueAlert {
  id: string;
  playerId: string;
  playerName: string;
  level: 'green' | 'yellow' | 'red';
  title: string;
  description: string;
  metric: string;
  recommendation: string;
}

export interface CalculatedPlayerMetrics {
  player: PlayerSummary;
  record: PlayerSessionRecord;
  plPerMin: number;
  distPerMin: number;
  jumpsPerMin: number;
  bmpRatio: number; // bmpBasketballLoad / totPL
  acuteLoad7d: number;
  chronicLoad28d: number;
  acwr: number;
  fatigueScore: number; // 0-100
  riskLevel: 'green' | 'yellow' | 'red';
  zScorePL: number;
  zScoreJumps: number;
  alerts: string[];
  recommendation: string;
}
