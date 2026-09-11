import chapters from './content/squad-chapters.json';
export const competitions=[
 {id:'champions-league',name:'Champions League',short:'UCL',subtitle:'Player squads',color:'#152553',accent:'#DDE6FF'},
 {id:'premier-league',name:'Premier League',short:'EN',subtitle:'Players & grounds',color:'#462252',accent:'#F0DDF5'},
 {id:'la-liga',name:'La Liga',short:'ES',subtitle:'Clubs & grounds',color:'#973F32',accent:'#FFE6DA'},
 {id:'serie-a',name:'Serie A',short:'IT',subtitle:'Clubs & grounds',color:'#205D8A',accent:'#DCEFFC'},
 {id:'bundesliga',name:'Bundesliga',short:'DE',subtitle:'Players & grounds',color:'#883137',accent:'#FFE2E4'},
] as const;
export type CompetitionId=typeof competitions[number]['id'];
export const competitionChapters=(id:CompetitionId)=>chapters.filter(c=>c.competition===id);
export const competitionCount=(id:CompetitionId)=>competitionChapters(id).reduce((n,c)=>n+c.questionIds.length,0);
