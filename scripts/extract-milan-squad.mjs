import fs from 'node:fs';
import {createHash} from 'node:crypto';
const [input,output]=process.argv.slice(2);
if(!input||!output)throw Error('Usage: node scripts/extract-milan-squad.mjs input.html output.json');
const raw=fs.readFileSync(input),html=raw.toString('utf8');
const source='https://www.acmilan.com/en/teams/men-first-team';
if(!html.includes('2026/27')||!html.includes('Men\'s First Team'))throw Error('Unexpected squad season or page');
// Read the data the public page ships to render its player cards. Never evaluate scripts.
const chunks=[...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)].map(m=>JSON.parse(m[1])).filter(c=>c[0]===1&&typeof c[1]==='string').map(c=>c[1]).join('');
const marker='"sortedPlayers":',offset=chunks.indexOf(marker);
if(offset<0)throw Error('No displayed player groups');
const start=chunks.indexOf('[',offset+marker.length);
let depth=0,quoted=false,escaped=false,end=-1;
for(let i=start;i<chunks.length;i++){
 const c=chunks[i];
 if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
 if(c==='"')quoted=true;else if(c==='[')depth++;else if(c===']'&&--depth===0){end=i+1;break;}
}
if(end<0)throw Error('Incomplete player groups');
const groups=JSON.parse(chunks.slice(start,end));
if(groups.length!==4)throw Error('Expected four position groups');
const positions={goalkeeper:'Goalkeeper',defender:'Defender',midfielder:'Midfielder',forward:'Forward'};
const players=groups.flatMap(g=>g.players).map(p=>({id:p.id,name:[p.firstName,p.lastName].filter(Boolean).join(' ').trim(),number:p.number,position:positions[p.position]}));
if(players.length<18||players.length>40||players.some(p=>!p.id||!p.name||!p.position||!Number.isInteger(p.number)||p.number<1||p.number>99)||new Set(players.map(p=>p.id)).size!==players.length||new Set(players.map(p=>p.number)).size!==players.length)throw Error('Invalid or duplicate player cards');
const snapshot={season:'2026/27',retrievedAt:new Date().toISOString().slice(0,10),scope:'Selected official club-page player snapshots; not complete Serie A registration lists.',independentReview:false,clubs:[{club:'AC Milan',season:'2026/27',source,rawSha256:createHash('sha256').update(raw).digest('hex'),players}]};
fs.writeFileSync(output,JSON.stringify(snapshot,null,2)+'\n');
console.log(`${players.length} AC Milan player cards extracted`);
