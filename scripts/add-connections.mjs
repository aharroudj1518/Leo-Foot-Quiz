import fs from 'node:fs';
const root=new URL('../src/content/',import.meta.url);
const uefa='https://www.uefa.com/uefachampionsleague/news/0257-0e9a0f70e31c-e6f6d51eef60-1000--most-uefa-club-appearances/';
const city='https://www.mancity.com/news/mens/erling-haaland-10-year-manchester-city-contract-63872694';
// Historical memberships extracted from the cited primary sources, checked 2026-09-09.
// These are selected clubs, not complete careers or claims about current registration.
const facts=[
  ['ronaldo','Cristiano Ronaldo',['Sporting CP','Real Madrid','Juventus'],'Portugal',uefa],
  ['modric','Luka Modrić',['Dinamo Zagreb','Tottenham Hotspur','Real Madrid'],'Croatia',uefa],
  ['lewandowski','Robert Lewandowski',['Lech Poznań','Borussia Dortmund','Bayern Munich'],'Poland',uefa],
  ['reina','Pepe Reina',['Villarreal','Liverpool','Napoli'],'Spain',uefa],
  ['messi','Lionel Messi',['Barcelona','Paris Saint-Germain'],'Argentina',uefa],
  ['haaland','Erling Haaland',['Molde','Red Bull Salzburg','Manchester City'],'Norway',city]
];
const additions=facts.map(([key,answer,clubConnections,country,source],i)=>({
  id:`connections-${key}`,prompt:'Which player connects these clubs?',answer,
  options:[answer,...[1,2,3].map(offset=>facts[(i+offset)%facts.length][1])],
  explanation:`${answer} played for all the clubs shown. This selection is not a complete career history.`,
  hint:`This player represented ${country}.`,category:'connections',difficulty:'fan',
  source,era:'Club connections · historical memberships',premium:false,clubConnections
}));
fs.writeFileSync(new URL('connection-questions.json',root),JSON.stringify(additions,null,2)+'\n');
const bank=JSON.parse(fs.readFileSync(new URL('questions.json',root),'utf8')).filter(q=>!q.id.startsWith('connections-'));
bank.push(...additions);
fs.writeFileSync(new URL('questions.json',root),JSON.stringify(bank,null,2)+'\n');
const editorial=JSON.parse(fs.readFileSync(new URL('editorial-status.json',root),'utf8'));
editorial.questions=bank.length;editorial.independentEditorialApproval=false;
fs.writeFileSync(new URL('editorial-status.json',root),JSON.stringify(editorial,null,2)+'\n');
console.log(`${additions.length} club-connection questions; ${bank.length} total.`);
