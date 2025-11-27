export type Timer = {
  id: number;
  label: string;
  isRunning: boolean;
  elapsedMs: number;
  lastUpdateTime?: number;
};
