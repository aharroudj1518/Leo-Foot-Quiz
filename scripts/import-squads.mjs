import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {shuffled,validateBank,normalize} from '../src/core/quiz.ts';
const dir=new URL('../src/content/',import.meta.url);
const path=new URL('sources/worldcup-2026-squads.json',dir);
const bytes=fs.readFileSync(path),teams=JSON.parse(bytes);
const revision='516d3825c3bd23fdc298c4014e84bde78f2d4965';
const source=`https://github.com/openfootball/worldcup.json/blob/${revision}/2026/worldcup.squads.json`;
const allClubs=[...new Set(teams.flatMap(t=>t.players.map(p=>p.club.name)))];
const questions=[],chapters=[];
for(const team of teams){
  if(!/^[A-Z]{3}$/.test(team.fifa_code)||!team.name||team.players.length!==26)throw new Error('Invalid team');
  if(new Set(team.players.map(p=>p.number)).size!==26||new Set(team.players.map(p=>normalize(p.name))).size!==26)throw new Error(`Duplicate player or shirt: ${team.name}`);
  const ids=[];
  for(const [index,p] of team.players.entries()){
    if(!p.name||!p.club?.name||!Number.isInteger(p.number)||p.number<1||p.number>26)throw new Error(`Invalid player: ${team.name}`);
    const id=`squad26-${team.fifa_code.toLowerCase()}-${createHash('sha256').update(normalize(p.name)).digest('hex').slice(0,12)}`;
    const identify=index%2===0;
    const answer=identify?p.name:p.club.name;
    const others=identify?team.players.map(x=>x.name):allClubs;
    const options=[answer,...shuffled(others.filter(x=>normalize(x)!==normalize(answer)),id).slice(0,3)];
    const q={id,prompt:identify?'Who wore this shirt?':`Which club was ${p.name} listed with at the 2026 World Cup?`,answer,options,
      explanation:`The archived squad list records ${p.name} for ${team.name}, wearing number ${p.number}, with ${p.club.name}. Club information refers to this tournament, not today.`,
      hint:identify?`The listed club was ${p.club.name}.`:`The listed club country code is ${p.club.country}.`,
      category:'squads',difficulty:'fan',source,era:'2026 World Cup · squad archive',premium:false,
      squadCode:team.fifa_code,...(identify?{squadClue:{country:team.name,number:p.number,club:p.club.name}}:{})};
    questions.push(q);ids.push(id);
  }
  chapters.push({code:team.fifa_code,name:team.name,group:team.group,questionIds:ids});
}
const issues=validateBank(questions);if(issues.length)throw new Error(issues.join('\n'));
const bank=JSON.parse(fs.readFileSync(new URL('questions.json',dir),'utf8')).filter(q=>q.category!=='squads');
bank.push(...questions);
const write=(name,value)=>fs.writeFileSync(new URL(name,dir),JSON.stringify(value,null,2)+'\n');
write('squad-questions.json',questions);write('squad-chapters.json',chapters);write('questions.json',bank);
write('sources/squad-import.json',{source,revision,sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:'2026-09-11',license:'CC0-1.0',teams:chapters.length,players:questions.length,independentReview:false,excludedFields:['position','date_of_birth'],note:'Historical snapshot. Automated structural checks are not factual sign-off.'});
const editorial=JSON.parse(fs.readFileSync(new URL('editorial-status.json',dir),'utf8'));editorial.questions=bank.length;editorial.independentEditorialApproval=false;write('editorial-status.json',editorial);
console.log(`Imported ${questions.length} questions in ${chapters.length} chapters; ${bank.length} total.`);
