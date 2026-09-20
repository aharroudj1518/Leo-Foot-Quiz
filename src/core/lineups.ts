import squads from '../content/sources/champions-league-2026-27.json';
import {normalize} from './quiz';

export const lineups = squads.flatMap(club => {
  const rows = [['Forward',3],['Midfielder',3],['Defender',4],['Goalkeeper',1]] as const;
  const players = rows.map(([position,count]) => club.players.filter(p => p.position === position).slice(0,count));
  if (players.some((row,i) => row.length !== rows[i][1])) return [];
  return [{...club, rows:players, id:`${club.code}-xi-v1`, aliases:[club.name.replace(/\b(FC|CF|AFC|FK|SK)\b/g,'').trim(), ...({ 'FC Bayern München':['Bayern Munich','Bayern'], 'Manchester City':['Man City'], 'Manchester United':['Man United','Man Utd'], 'Paris Saint-Germain':['PSG'], 'FC Internazionale Milano':['Inter','Inter Milan'], 'Sporting Clube de Portugal':['Sporting','Sporting CP'], 'Real Madrid C.F.':['Real Madrid'], 'Atlético de Madrid':['Atletico Madrid','Atletico'], 'AEK Athens FC':['AEK Athens','AEK'], 'FC Barcelona':['Barcelona','Barca'], 'FK Bodø/Glimt':['Bodo Glimt'], 'Galatasaray A.Ş.':['Galatasaray'], 'Club Brugge KV':['Club Brugge'], 'SSC Napoli':['Napoli'], 'AS Roma':['Roma']}[club.name] ?? [])]}];
});
export function matchesClub(club:typeof lineups[number],value:string) {
  return [club.name,...club.aliases].some(name => normalize(name) === normalize(value) && normalize(value).length > 0);
}
export {validLineupProgress,type LineupProgress} from './lineup-progress';
