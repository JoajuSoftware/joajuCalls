export interface CallInfo {
  number: string;
  startTime: Date;
  duration: string;
  caller?: string;
  status: 'active' | 'hold' | 'ended';
}
