import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const origin='https://www.bundesliga.com';
const names={'fc-bayern-muenchen':'Bayern Munich','borussia-dortmund':'Borussia Dortmund','rb-leipzig':'RB Leipzig','vfb-stuttgart':'VfB Stuttgart','tsg-hoffenheim':'TSG Hoffenheim','bayer-04-leverkusen':'Bayer Leverkusen','sport-club-freiburg':'SC Freiburg','eintracht-frankfurt':'Eintracht Frankfurt','fc-augsburg':'FC Augsburg','1-fsv-mainz-05':'Mainz 05','1-fc-union-berlin':'Union Berlin','borussia-moenchengladbach':'Borussia Mönchengladbach','hamburger-sv':'Hamburger SV','1-fc-koeln':'1. FC Köln','sv-werder-bremen':'Werder Bremen','fc-schalke-04':'Schalke 04','sv-elversberg':'SV Elversberg','sc-paderborn-07':'SC Paderborn'};
async function fetchHtml(url){const r=await fetch(url,{headers:{'User-Agent':'LeoFootQuizContent/0.3 (https://github.com/aharroudj1518/Leo-Foot-Quiz)'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`HTTP ${r.status}: ${url}`);return r.text();}
const directory=await fetchHtml(origin+'/en/bundesliga/clubs');
if(!directory.includes('2026-2027'))throw new Error('Wrong directory season');
const paths=[...new Set([...directory.matchAll(/href="(\/en\/bundesliga\/clubs\/[^"?#]+)"/g)].map(m=>m[1]))];
const expected=JSON.parse(fs.readFileSync('src/content/sources/domestic-clubs-2026-27.json','utf8')).find(l=>l.id==='bundesliga').clubs.map(c=>c.name).sort();
const actual=paths.map(p=>names[p.split('/').at(-1)]).sort();
if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('Season club membership mismatch');
const cache='.expo/bundesliga-import';fs.mkdirSync(cache,{recursive:true});
fs.writeFileSync(`${cache}/clubs.html`,directory);
const clubs=[];
for(const path of paths){
 const slug=path.split('/').at(-1),url=origin+path,html=await fetchHtml(url);
 const input=`${cache}/${slug}.html`,output=`${cache}/${slug}.json`;
 fs.writeFileSync(input,html);
 execFileSync(process.execPath,['scripts/extract-bundesliga-club.mjs',input,names[slug],url,output],{stdio:'inherit'});
 clubs.push(JSON.parse(fs.readFileSync(output,'utf8')));
 await new Promise(resolve=>setTimeout(resolve,350));
}
const snapshot={competition:'bundesliga',season:'2026/27',source:origin+'/en/bundesliga/clubs',directorySha256:createHash('sha256').update(directory).digest('hex'),retrievedAt:new Date().toISOString().slice(0,10),independentReview:false,clubs};
// Publish the snapshot only after every expected club passed extraction.
fs.writeFileSync('src/content/sources/bundesliga-players-2026-27.json',JSON.stringify(snapshot,null,2)+'\n');
console.log(`Complete snapshot: ${clubs.length} clubs, ${clubs.reduce((n,c)=>n+c.players.length,0)} players.`);
