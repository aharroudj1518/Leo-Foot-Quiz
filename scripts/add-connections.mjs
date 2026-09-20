import fs from 'node:fs';
const root=new URL('../src/content/',import.meta.url);
const uefa='https://www.uefa.com/uefachampionsleague/news/0257-0e9a0f70e31c-e6f6d51eef60-1000--most-uefa-club-appearances/';
const city='https://www.mancity.com/news/mens/erling-haaland-10-year-manchester-city-contract-63872694';
// Historical memberships extracted from the cited primary sources, checked 2026-09-11.
// These are selected clubs, not complete careers or claims about current registration.
const facts=[
  ['ronaldo','Cristiano Ronaldo',['Sporting CP','Real Madrid','Juventus'],'Portugal',uefa],
  ['modric','Luka Modrić',['Dinamo Zagreb','Tottenham Hotspur','Real Madrid'],'Croatia',uefa],
  ['lewandowski','Robert Lewandowski',['Lech Poznań','Borussia Dortmund','Bayern Munich'],'Poland',uefa],
  ['reina','Pepe Reina',['Villarreal','Liverpool','Napoli'],'Spain',uefa],
  ['messi','Lionel Messi',['Barcelona','Paris Saint-Germain'],'Argentina',uefa],
  ['haaland','Erling Haaland',['Molde','Red Bull Salzburg','Manchester City'],'Norway',city],
  ['buffon','Gianluigi Buffon',['Parma','Juventus','Paris Saint-Germain'],'Italy',uefa],
  ['seedorf','Clarence Seedorf',['Ajax','Real Madrid','AC Milan'],'Netherlands',uefa],
  ['moutinho','João Moutinho',['Sporting CP','Monaco','Wolverhampton Wanderers'],'Portugal',uefa],
  ['mkhitaryan','Henrikh Mkhitaryan',['Shakhtar Donetsk','Arsenal','Roma'],'Armenia',uefa],
  ['dzeko','Edin Džeko',['Wolfsburg','Manchester City','Fenerbahçe'],'Bosnia and Herzegovina',uefa],
  ['alves','Dani Alves',['Sevilla','Barcelona','Juventus'],'Brazil',uefa],
  ['di-maria','Ángel Di María',['Benfica','Real Madrid','Manchester United'],'Argentina',uefa],
  ['ramos','Sergio Ramos',['Sevilla','Real Madrid','Paris Saint-Germain'],'Spain',uefa],
  ['rakitic','Ivan Rakitić',['Basel','Schalke 04','Barcelona'],'Croatia',uefa],
  ['ibrahimovic','Zlatan Ibrahimović',['Ajax','Juventus','Inter Milan'],'Sweden',uefa]
];
// Additional overlapping memberships matter when selecting wrong answers, even
// when those clubs are not among that player's three displayed clues.
const otherMemberships={ibrahimovic:['Barcelona','Paris Saint-Germain','AC Milan','Manchester United'],alves:['Paris Saint-Germain']};
const additions=facts.map(([key,answer,clubConnections,country,source],i)=>({
  id:`connections-${key}`,prompt:'Which of these players connects these clubs?',answer,
  options:[answer,...Array.from({length:facts.length-1},(_,offset)=>facts[(i+offset+1)%facts.length])
    .filter(([candidate,,clubs])=>!clubConnections.every(club=>[...clubs,...(otherMemberships[candidate]??[])].includes(club)))
    .slice(0,3).map(([,name])=>name)],
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
