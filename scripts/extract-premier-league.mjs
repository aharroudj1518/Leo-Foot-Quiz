import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {normalize} from '../src/core/quiz.ts';
// Public factual data only; no photos, prices, performance data or article prose.
const input=process.argv[2];
if(!input)throw new Error('Usage: node scripts/extract-premier-league.mjs path/to/bootstrap-static.json');
const raw=fs.readFileSync(input,'utf8'),data=JSON.parse(raw);
const dir=new URL('../src/content/sources/',import.meta.url);
const leagues=JSON.parse(fs.readFileSync(new URL('domestic-clubs-2026-27.json',dir),'utf8'));
const aliases={Brighton:'Brighton & Hove Albion',Leeds:'Leeds United','Man City':'Manchester City','Man Utd':'Manchester United',Newcastle:'Newcastle United',"Nott'm Forest":'Nottingham Forest',Spurs:'Tottenham Hotspur'};
const expected=leagues.find(l=>l.id==='premier-league').clubs.map(c=>c.name).sort();
if(!data.events[0].deadline_time.startsWith('2026-'))throw new Error('Wrong season');
const clubs=data.teams.map(team=>{
 const club=aliases[team.name]??team.name;
 const players=data.elements.filter(p=>p.team===team.id&&p.status!=='u').map(p=>{
  const fullName=`${p.first_name} ${p.second_name}`.trim();
  const name=fullName.length<=30?fullName:p.web_name;
  const position=data.element_types.find(t=>t.id===p.element_type)?.singular_name;
  if(!name||!position||!p.code)throw new Error('Invalid player record');
  return {id:p.code,name,fullName,position};
 });
 if(players.length<18||new Set(players.map(p=>normalize(p.name))).size!==players.length)throw new Error(`Invalid selected roster: ${club}`);
 return {club,players};
});
if(JSON.stringify(clubs.map(c=>c.club).sort())!==JSON.stringify(expected))throw new Error('Club membership mismatch');
const output={competition:'premier-league',season:'2026/27',source:'https://fantasy.premierleague.com/api/bootstrap-static/',retrievedAt:'2026-09-11',sourceSha256:createHash('sha256').update(raw).digest('hex'),scope:'Selected players from the official Fantasy Premier League catalogue; unavailable entries excluded. Includes eligible young players. Not the complete registration list.',independentReview:false,clubs};
fs.writeFileSync(new URL('premier-league-players-2026-27.json',dir),JSON.stringify(output,null,2)+'\n');
console.log(`${clubs.length} clubs, ${clubs.reduce((n,c)=>n+c.players.length,0)} selected players.`);
