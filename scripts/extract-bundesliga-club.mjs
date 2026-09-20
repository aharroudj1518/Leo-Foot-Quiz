import fs from 'node:fs';
import {createHash} from 'node:crypto';

const [input,club,source,output]=process.argv.slice(2);
if(!input||!club||!source||!output)throw new Error('Usage: node scripts/extract-bundesliga-club.mjs input.html club source-url output.json');
const url=new URL(source);
if(url.origin!=='https://www.bundesliga.com'||!url.pathname.startsWith('/en/bundesliga/clubs/'))throw new Error('Expected official club source');
const raw=fs.readFileSync(input,'utf8');
if(!raw.includes('2026-2027'))throw new Error('Expected 2026-2027 season marker');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
const headings=[...raw.matchAll(/class="position text-center">(Goalkeepers|Defenders|Midfielders|Strikers)</g)];
if(headings.length!==4)throw new Error('Expected all four squad position groups');
const positions={Goalkeepers:'Goalkeeper',Defenders:'Defender',Midfielders:'Midfielder',Strikers:'Forward'};
const players=[];
for(const [i,heading] of headings.entries()){
 const section=raw.slice(heading.index,headings[i+1]?.index??raw.indexOf('Head coach',heading.index));
 for(const match of section.matchAll(/<a\b[^>]*class="player-link"[^>]*aria-label="([^"]+)"[^>]*href="(\/en\/player\/[^"?]+)"/g)){
  const label=decode(match[1]),parts=/^(.+), #(\d+)$/.exec(label);
  if(!parts)throw new Error(`Unrecognized player label: ${label}`);
  players.push({id:match[2].split('/').at(-1),name:parts[1],number:Number(parts[2]),position:positions[heading[1]],source:new URL(match[2],url).href});
 }
}
if(players.length<18||players.length>45||new Set(players.map(p=>p.id)).size!==players.length)throw new Error('Incomplete or duplicate squad');
if(players.some(p=>p.number<1||p.number>99))throw new Error('Invalid shirt number');
fs.writeFileSync(output,JSON.stringify({club,season:'2026/27',source,sourceSha256:createHash('sha256').update(raw).digest('hex'),retrievedAt:new Date().toISOString().slice(0,10),scope:'Players listed on the official Bundesliga club squad page; snapshot, not a complete registration guarantee.',independentReview:false,players},null,2)+'\n');
console.log(`${club}: ${players.length} sourced players extracted.`);
