import chapters from './content/squad-chapters.json';
export const competitions=[
 {id:'champions-league',name:'Champions League',short:'UCL',subtitle:'History & players',color:'#79E6D1',accent:'#16546A'},
 {id:'premier-league',name:'Premier League',short:'EN',subtitle:'Players & grounds',color:'#C6BAFF',accent:'#334979'},
 {id:'la-liga',name:'La Liga',short:'ES',subtitle:'Clubs & grounds',color:'#FFE089',accent:'#3A5166'},
 {id:'serie-a',name:'Serie A',short:'IT',subtitle:'Clubs & grounds',color:'#79E6D1',accent:'#16546A'},
 {id:'bundesliga',name:'Bundesliga',short:'DE',subtitle:'Players & grounds',color:'#C6BAFF',accent:'#334979'},
] as const;
export type CompetitionId=typeof competitions[number]['id'];
export const competitionChapters=(id:CompetitionId)=>chapters.filter(c=>c.competition===id);
export const competitionCount=(id:CompetitionId)=>competitionChapters(id).reduce((n,c)=>n+c.questionIds.length,0);
