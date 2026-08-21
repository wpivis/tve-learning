export type CurveMode = 'off' | 'normal' | 't';
export type ConfidenceIntervalMode = 'off' | '.10' | '.05' | '.01';
export type PowerMode = 'tails' | 'power';
export type VertLinesAttachment = 'cutoffs' | 'b';

export interface BlueMark{
  id: number;
  value: number;
}

export interface ConfidenceAppState {
  beta: number | null;
  se: number;
  b: number | null;

  simulateN: number;

  secondDist: boolean;
  thirdDist: boolean;
  powerMode: PowerMode;

  scale: number;
  bins: number;
  curve: CurveMode;
  df: number;
  ci: ConfidenceIntervalMode;

  histogram: boolean;
  vertLines: boolean;
  pValue: boolean;

  shiftUnits: number;
  shiftUnits2: number;
  shiftUnits3: number;

  currentN: number;
  isLockedToBeta: boolean;

  domainOffset: number;
  fixedDomain: [number, number] | null;

  data: number[];
  data2: number[];
  data3: number[];

  blueMarks: BlueMark[];

  vertLinesAttachment: VertLinesAttachment;

  vertLineDistFromB: {
    left: number;
    right: number;
  };

  linkedMarks: {
    left: number | null;
    right: number | null;
  };

  previousSE: number;
}

export interface ProvenanceStateModel{
  appState: ConfidenceAppState | null;
}

export interface TutorialAction {
  action: string;
  params: Record<string, unknown>;
  timestamp: number;
}

export interface TutorialAPI {
  getState(): ConfidenceAppState;
  setState(state: ConfidenceAppState): void;
  isAttached(): boolean;
  offAction(callback: (event: TutorialAction) => void): void;
  onAction(callback: (event: TutorialAction) => void,): void;
}

declare global {
  interface Window {
    tutorialAPI?: TutorialAPI;
  }
}