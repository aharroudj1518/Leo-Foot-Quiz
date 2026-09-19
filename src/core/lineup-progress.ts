export type LineupProgress = Record<string,{revealed:number;teamHint:boolean;solved:boolean}>;
export function validLineupProgress(value:unknown):value is LineupProgress {
  return typeof value==='object' && value!==null && !Array.isArray(value) && Object.values(value).every(p=>p && typeof p==='object' && Number.isInteger(p.revealed) && p.revealed>=0 && p.revealed<=11 && typeof p.teamHint==='boolean' && typeof p.solved==='boolean');
}
