import fs from 'node:fs';
import {createHash} from 'node:crypto';
const [input,output]=process.argv.slice(2);
if(!input||!output)throw Error('Usage: node scripts/extract-barcelona-squad.mjs input.html output.json');
const raw=fs.readFileSync(input),html=raw.toString('utf8');
const source='https://www.fcbarcelona.com/en/football/first-team/players';
if(!html.includes('FC Barcelona First Team'))throw Error('Unexpected source page');
const clean=text=>text.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const players=[];
for(const match of html.matchAll(/<a href="(https:\/\/www\.fcbarcelona\.com\/en\/football\/first-team\/players\/(\d+)\/[^"?]+)"[\s\S]*?<\/a>/g)){
 const field=name=>clean(match[0].match(new RegExp(`<[^>]+class="[^"]*team-person__${name}[^\"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`))?.[1]??'');
 const number=Number(field('number')),name=[field('first-name'),field('last-name')].filter(Boolean).join(' '),position=field('position-meta');
 if(!name||!Number.isInteger(number)||number<1||number>99||!['Goalkeeper','Defender','Midfielder','Forward'].includes(position))throw Error(`Invalid player card ${match[2]}`);
 players.push({id:match[2],name,number,position,source:match[1]});
}
if(players.length<18||players.length>40||new Set(players.map(p=>p.number)).size!==players.length||new Set(players.map(p=>p.id)).size!==players.length)throw Error('Incomplete or duplicate squad cards');
const snapshot={season:'2026/27',retrievedAt:new Date().toISOString().slice(0,10),scope:'Selected official club first-team page snapshots; not complete La Liga registration lists.',independentReview:false,clubs:[{club:'Barcelona',season:'2026/27',source,rawSha256:createHash('sha256').update(raw).digest('hex'),players}]};
fs.writeFileSync(output,JSON.stringify(snapshot,null,2)+'\n');
console.log(`${players.length} Barcelona player cards extracted`);
