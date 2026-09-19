import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {normalize,shuffled,validateBank} from '../src/core/quiz.ts';
const dir=new URL('../src/content/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,dir),'utf8'));
const write=(name,value)=>fs.writeFileSync(new URL(name,dir),JSON.stringify(value,null,2)+'\n');
const teams=read('sources/champions-league-2026-27.json');
const leagues=read('sources/domestic-clubs-2026-27.json');
const premier=read('sources/premier-league-players-2026-27.json');
const bundesliga=read('sources/bundesliga-players-2026-27.json');
const laliga=read('sources/la-liga-players-2026-27.json');
const seriea=read('sources/serie-a-players-2026-27.json');
if(teams.length!==36||new Set(teams.map(t=>t.code)).size!==36)throw new Error('Expected 36 Champions League clubs');
const questions=[],chapters=[];
const stories=read('club-history.json');
const allPlayers=[...new Set(teams.flatMap(t=>t.players.map(p=>p.name)))];
const choices=(answer,pool,seed)=>[answer,...shuffled([...new Set(pool)].filter(x=>normalize(x)!==normalize(answer)),seed).slice(0,3)];
for(const team of teams){
 if(!team.name||!team.source||team.players.length<18||new Set(team.players.map(p=>p.number)).size!==team.players.length)throw new Error(`Invalid roster ${team.name}`);
 const ids=[],names=new Set(team.players.map(p=>normalize(p.name)));
 for(const [i,p] of team.players.entries()){
  // Current-player clues are a small supporting part of each club round.
  // Nationality lineups remain available in Lineup Detective.
  if(p.position==='Goalkeeper'||i%3!==0||ids.length>=3)continue;
  if(!p.name||!p.position||!Number.isInteger(p.number)||p.number<1||p.number>99)throw new Error(`Invalid player ${team.name}`);
  const id=team.code+'-'+createHash('sha256').update(normalize(p.name)).digest('hex').slice(0,12);
  const kind=0;
  const answer=kind===1?String(p.number):p.name;
  const prompt=kind===0?'Who wears this shirt?':kind===1?`Which shirt number is ${p.name} listed with for ${team.name}?`:`Which of these players is listed for ${team.name}?`;
  const pool=kind===0?team.players.map(x=>x.name):kind===1?team.players.map(x=>String(x.number)):allPlayers.filter(n=>!names.has(normalize(n)));
  questions.push({id,prompt,answer,options:choices(answer,pool,id),explanation:`The 2026/27 Champions League squad snapshot lists ${p.name} for ${team.name}: number ${p.number}, ${p.position.toLowerCase()}.`,hint:`Position: ${p.position}. Nationality code: ${p.nationality}.`,category:'squads',difficulty:'fan',source:team.source,era:'Champions League · 2026/27',premium:false,squadCode:team.code,...(kind===0?{squadClue:{country:team.name,number:p.number,club:p.position,competition:'CHAMPIONS LEAGUE · 2026/27'}}:{})});
  ids.push(id);
 }
 const history=stories.filter(q=>q.squadCode===team.code);
 if(history.length<3)throw new Error('Missing club history: '+team.name);
 questions.push(...history);ids.push(...history.map(q=>q.id));
 chapters.push({code:team.code,name:team.name,competition:'champions-league',kind:'History & players',questionIds:ids});
}
// Domestic club chapters begin with grounds and location trivia; do not imply
// that a Champions League registration list is a complete domestic roster.
for(const league of leagues){
 if(league.clubs.length!==(league.id==='bundesliga'?18:20))throw new Error('Incomplete domestic league');
 for(const club of league.clubs){
  const code='club27-'+league.id+'-'+normalize(club.name).replace(/[^a-z0-9]+/g,'-'),ids=[];
  for(const field of ['stadium','location']){
   const prompt=field==='stadium'?`Which ground is listed for ${club.name} in 2026/27?`:`In which city or town is ${club.stadium} located?`;
   if(normalize(prompt).includes(normalize(club[field])))continue;
   const id=code+'-'+field;
   const sameGround=['San Siro','Stadio Giuseppe Meazza'];
   const aliases=field==='stadium'&&sameGround.includes(club.stadium)?sameGround.filter(n=>n!==club.stadium):[];
   questions.push({id,prompt,answer:club[field],aliases,options:choices(club[field],league.clubs.map(c=>c[field]).filter(value=>!aliases.includes(value)),id),explanation:`The season's club-and-ground table lists ${club.name} at ${club.stadium}, in ${club.location}.`,hint:field==='stadium'?`Location: ${club.location}.`:`This is the ground listed for ${club.name}.`,category:'squads',difficulty:'fan',source:club.source,era:league.name+' · 2026/27',premium:false,squadCode:code});ids.push(id);
  }
  if(!ids.length)throw new Error('Empty domestic chapter');
  const roster=league.id==='premier-league'?premier.clubs.find(c=>c.club===club.name):undefined;
  if(league.id==='premier-league'&&!roster)throw new Error(`Missing player roster: ${club.name}`);
  if(roster){
   const names=new Set(roster.players.map(p=>normalize(p.name)));
   for(const p of roster.players){
    const id=code+'-player-'+p.id;
    const pool=premier.clubs.filter(c=>c.club!==club.name).flatMap(c=>c.players).filter(other=>other.position===p.position&&!names.has(normalize(other.name))).map(other=>other.name);
    questions.push({id,prompt:`Which of these ${p.position.toLowerCase()}s is listed for ${club.name}?`,answer:p.name,options:choices(p.name,pool,id),explanation:`The 2026/27 Premier League player snapshot lists ${p.fullName} with ${club.name}. Position group: ${p.position.toLowerCase()}.`,hint:`Choose the player from ${club.name}'s ${p.position.toLowerCase()} group.`,category:'squads',difficulty:'fan',source:premier.source,era:'Premier League · 2026/27',premium:false,squadCode:code});
    ids.push(id);
   }
  }
  const squad=(league.id==='bundesliga'?bundesliga:league.id==='la-liga'?laliga:league.id==='serie-a'?seriea:undefined)?.clubs.find(c=>c.club===club.name);
  if(league.id==='bundesliga'&&!squad)throw new Error(`Missing Bundesliga roster: ${club.name}`);
  if(squad){
   if(!squad||squad.season!=='2026/27'||new Set(squad.players.map(p=>p.number)).size!==squad.players.length)throw new Error(`Invalid shirt roster: ${club.name}`);
   for(const p of squad.players){
    const id=code+'-player-'+p.id;
    questions.push({id,prompt:'Who wears this shirt?',answer:p.name,options:choices(p.name,squad.players.map(other=>other.name),id),explanation:`The 2026/27 ${league.name} club-page snapshot lists ${p.name} with ${club.name}: number ${p.number}, ${p.position.toLowerCase()}.`,hint:`Position: ${p.position}.`,category:'squads',difficulty:'fan',source:squad.source,era:league.name+' · 2026/27',premium:false,squadCode:code,squadClue:{country:club.name,number:p.number,club:p.position,competition:league.name.toUpperCase()+' · 2026/27'}});
    ids.push(id);
   }
  }
  const history=stories.filter(q=>q.squadCode===code);questions.push(...history);ids.push(...history.map(q=>q.id));
  chapters.push({code,name:club.name,competition:league.id,kind:history.length?'History & players':roster||squad?'Players & grounds':'Clubs & grounds',questionIds:ids});
 }
}
// Keep old payloads immutable: saved sessions refer to these IDs directly.
const archived=read('sources/club-legacy-questions.json');
const definitions=new Map([...questions,...archived].map(q=>[q.id,{...q}]));
const factFiles=fs.readdirSync(dir).filter(file=>/^club-facts-.*\.json$/.test(file)).sort();
const packs=factFiles.flatMap(read);
const slug=name=>normalize(name).replace(/[^a-z0-9]+/g,'-');
// A stadium name and its short form describe the same fact, even when a
// historical story asks it in a different competition. Use the source aliases
// rather than assuming that every equal answer (e.g. Liverpool) means one fact.
const groundName=value=>normalize(value).split(' ').filter(word=>!['stadio','stadium'].includes(word)).join(' ');
const grounds=new Map();
for(const chapter of chapters){
 const pack=packs.find(p=>[p.name,...(p.aliases??[])].includes(chapter.name));
 const q=archived.find(q=>q.squadCode===chapter.code&&q.id.endsWith('-stadium'));
 if(pack&&q)grounds.set(pack.name,{factId:`club:${slug(pack.name)}:ground:${slug(groundName(q.answer))}`,names:new Set([q.answer,...(q.aliases??[])].map(groundName))});
}
for(const chapter of chapters){
 const matches=packs.filter(p=>[p.name,...(p.aliases??[])].includes(chapter.name));
 if(matches.length!==1)throw new Error(`Expected one fact pack for ${chapter.name}; found ${matches.length}`);
 const pack=matches[0],canonical=slug(pack.name);
 let playerCount=0;
 for(const q of definitions.values())if(q.squadCode===chapter.code){
  const player=q.id.includes('-player-')||(!q.id.includes('-story-')&&!!q.squadClue);
  q.clubTopic??=player?'players':q.id.endsWith('-stadium')?'grounds':q.id.endsWith('-location')?'identity':'history';
  q.factId=player?`club:${canonical}:player:${slug(q.answer)}`:`club:${canonical}:legacy:${createHash('sha256').update(normalize(q.prompt)).digest('hex').slice(0,16)}`;
  if(player&&++playerCount>2)q.retired=true;
 }
 if(new Set(pack.facts.map(f=>f.key)).size!==pack.facts.length)throw new Error(`Duplicate fact keys: ${pack.name}`);
 for(const fact of pack.facts){
  if(!fact.key||!fact.topic||!fact.source||fact.wrong.length!==3)throw new Error(`Invalid fact ${chapter.name}: ${fact.key}`);
  const id=`${chapter.code}-fact-${fact.key}`;
  definitions.set(id,{id,prompt:fact.prompt,answer:fact.answer,options:[fact.answer,...fact.wrong],hint:fact.hint,explanation:fact.explanation,source:fact.source,category:'squads',difficulty:'fan',era:'Club stories',premium:false,squadCode:chapter.code,clubTopic:fact.topic,factId:`club:${canonical}:${fact.key}`});
 }
 const ground=grounds.get(pack.name);
 if(ground)for(const q of definitions.values())if(q.squadCode===chapter.code&&ground.names.has(groundName(q.answer))&&/\b(ground|stadium|home)\b/i.test(q.prompt))q.factId=ground.factId;
 // Keep the richer original story when it overlaps a plain stadium question.
 // Retired definitions still resolve both saved question IDs and seen fact IDs.
 const selected=new Set();
 const candidates=[...definitions.values()].filter(q=>q.squadCode===chapter.code&&!q.retired).sort((a,b)=>Number(!a.id.includes('-story-'))-Number(!b.id.includes('-story-')));
 for(const q of candidates){if(selected.has(q.factId))q.retired=true;else selected.add(q.factId);}
 chapter.questionIds=[...definitions.values()].filter(q=>q.squadCode===chapter.code&&!q.retired).map(q=>q.id);
 const active=chapter.questionIds.map(id=>definitions.get(id));
 if(new Set(active.map(q=>q.factId)).size<10||active.filter(q=>q.clubTopic!=='players').length<8||new Set(active.map(q=>q.clubTopic)).size<3)throw new Error(`Insufficient fact variety: ${chapter.name}`);
 chapter.kind='Club stories';
}
questions.splice(0,questions.length,...definitions.values());
const bank=[...read('questions.json').filter(q=>q.category!=='squads'),...questions];
const issues=validateBank(bank);if(issues.length)throw new Error(issues.join('\n'));
write('squad-questions.json',questions);write('squad-chapters.json',chapters);write('questions.json',bank);
const editorial=read('editorial-status.json');editorial.questions=bank.length;editorial.independentEditorialApproval=false;write('editorial-status.json',editorial);
write('sources/club-season-import.json',{season:'2026/27',retrievedAt:'2026-09-17',championsLeagueClubs:36,domesticClubs:78,questions:questions.length,activeQuestions:questions.filter(q=>!q.retired).length,retiredQuestions:questions.filter(q=>q.retired).length,independentReview:false,commercialClearance:false,scope:'Source-backed club identity, grounds, honours, history, managers and records with at most two active roster clues per chapter. Original season snapshots are preserved for saved sessions; repetitive roster clues are retired from new rounds. Not complete domestic registration lists.',sources:['club-history.json','sources/club-legacy-questions.json',...factFiles,'sources/champions-league-2026-27.json','sources/domestic-clubs-2026-27.json','sources/premier-league-players-2026-27.json','sources/bundesliga-players-2026-27.json','sources/la-liga-players-2026-27.json','sources/serie-a-players-2026-27.json'].map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(new URL(file,dir))).digest('hex')}))});
console.log(`${questions.length} season questions (${questions.filter(q=>!q.retired).length} active); ${chapters.length} club chapters; ${bank.length} total questions.`);
