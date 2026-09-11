import fs from 'node:fs';
const dir = new URL('../src/content/', import.meta.url);
const portraits = JSON.parse(fs.readFileSync(new URL('../assets/players/manifest.json', import.meta.url), 'utf8'));
const credits = [...JSON.parse(fs.readFileSync(new URL('../assets/visual/credits.json', import.meta.url), 'utf8').replace(/^\uFEFF/, '')), ...portraits];
const additions = [];
function add(key, kind, category, answer, others, description, hint, explanation, source) {
  additions.push({id:`visual-${key}`,prompt:kind==='portrait'?'Who is this player?':kind==='badge'?'Which club does this badge puzzle represent?':'Which stadium is this?',answer,options:[answer,...others],explanation,hint,category,difficulty:'fan',source,era:kind==='portrait'?'Player gallery · archive portraits':kind==='badge'?'Club colours · reimagined badges':'Stadium tour · visual edition',premium:false,visual:{kind,key,description},assetIds:[key]});
}
const players = [
  ['messi','Lionel Messi','Argentina','Short-haired, bearded player wearing Argentina’s light blue and white stripes.'],
  ['ronaldo','Cristiano Ronaldo','Portugal','Short dark-haired player wearing Portugal’s red shirt.'],
  ['mbappe','Kylian Mbappé','France','Young player with close-cropped hair wearing France’s dark blue shirt.'],
  ['salah','Mohamed Salah','Egypt','Curly-haired, bearded player wearing a dark Egypt training top.'],
  ['haaland','Erling Haaland','Norway','Fair-haired player with long hair pulled back.'],
];
for (const p of portraits) {
  if (!p.visualReview || !p.description) throw new Error(`Portrait needs visual review: ${p.id}`);
  players.push([p.id,p.name,p.country,p.description]);
}
const collectionOf = key => portraits.find(p=>p.id===key)?.collection??'stars';
for(const [index,[key,name,country,description]] of players.entries()) {
  const candidates=players.filter(p=>p[1]!==name&&collectionOf(p[0])===collectionOf(key));
  const alternatives=Array.from({length:3},(_,i)=>candidates[(index+i)%candidates.length][1]);
  add(key,'portrait','portraits',name,alternatives,description,`International team: ${country}.`,`${name} has represented ${country}. This archive portrait is a visual identity question, not a current-club claim.`,credits.find(c=>c.id===key).source);
}

const clubs = [
  ['arsenal','Arsenal','Red shield with a gold cannon and two wheels.','North London · The Gunners','The cannon and red colours point to Arsenal, known as the Gunners.','https://www.arsenal.com/history'],
  ['madrid','Real Madrid','White shield with a gold crown and diagonal blue band.','Spanish capital · Los Blancos','White, a crown and the Spanish capital point to Real Madrid.','https://www.realmadrid.com/en-US/the-club/history'],
  ['city','Manchester City','Sky-blue round badge with a gold sailing ship.','Manchester · The sky-blue side','The ship and sky-blue colours point to Manchester City.','https://www.mancity.com/club/manchester-city-history'],
  ['milan','AC Milan','Oval shield with alternating red and black stripes.','Milan · The Rossoneri','Red and black are the colours behind AC Milan’s Rossoneri nickname.','https://www.acmilan.com/en/club/history'],
  ['juventus','Juventus','Black and white striped shield with a gold star.','Turin · The Bianconeri','Black and white and the city of Turin point to Juventus.','https://www.juventus.com/en/club/history/'],
  ['barcelona','FC Barcelona','Blue and garnet shield with a gold football.','Catalonia · The Blaugrana','Blue and garnet are the colours behind Barcelona’s Blaugrana nickname.','https://www.fcbarcelona.com/en/club/history'],
];
for(const [key,name,description,hint,explanation,source] of clubs) add(key,'badge','badges',name,clubs.filter(c=>c[1]!==name).slice(0,3).map(c=>c[1]),description,hint,`${explanation} This is an original puzzle illustration, not the official crest.`,source);
const stadiums = [
  ['wembley','Wembley Stadium','A large stadium with a single illuminated arch above the roof.','London · Look at the great arch.','The arch is the defining feature of Wembley Stadium in London. This image is an illustrative interpretation.','https://www.wembleystadium.com/'],
  ['allianz','Allianz Arena','A rounded stadium exterior made of illuminated inflatable-looking panels.','Munich · A luminous outer shell.','The Allianz Arena in Munich is known for its illuminated exterior panels.',credits.find(c=>c.id==='allianz').source],
  ['maracana','Maracanã','A huge oval stadium viewed from above, with a continuous ring of roof and seating.','Rio de Janeiro · A Brazilian landmark.','The Maracanã is a landmark football stadium in Rio de Janeiro.',credits.find(c=>c.id==='maracana').source],
];
for(const [key,name,description,hint,explanation,source] of stadiums) add(key,'stadium','stadiums',name,['Wembley Stadium','Allianz Arena','Maracanã','San Siro'].filter(n=>n!==name),description,hint,explanation,source);
fs.writeFileSync(new URL('visual-questions.json',dir),JSON.stringify(additions,null,2)+'\n');
const bank=JSON.parse(fs.readFileSync(new URL('questions.json',dir),'utf8')).filter(q=>!q.id.startsWith('visual-'));
bank.push(...additions);
fs.writeFileSync(new URL('questions.json',dir),JSON.stringify(bank,null,2)+'\n');
const editorial=JSON.parse(fs.readFileSync(new URL('editorial-status.json',dir),'utf8'));
editorial.questions=bank.length;editorial.independentEditorialApproval=false;
fs.writeFileSync(new URL('editorial-status.json',dir),JSON.stringify(editorial,null,2)+'\n');
const register=JSON.parse(fs.readFileSync(new URL('asset-register.json',dir),'utf8'));
register.assets=register.assets.filter(a=>!additions.some(q=>q.assetIds.includes(a.id)));
for(const q of additions){const credit=credits.find(c=>c.id===q.visual.key);register.assets.push({id:q.visual.key,status:'review-required',creator:credit?.creator??'Original Leoqo preview artwork',licenseEvidence:credit?`${credit.license}: ${credit.source}`:'Original generated stadium art or code-drawn badge puzzle; see docs/VISUAL-REDESIGN.md',platforms:['ios','android'],commercialUse:false,likenessAndMarksAssessment:'Public-release assessment pending.',referenceImageAssessment:credit?'Commons licence recorded; unchanged source file or Commons thumbnail.':'No reference image supplied.'});}
fs.writeFileSync(new URL('asset-register.json',dir),JSON.stringify(register,null,2)+'\n');
console.log(`Added ${additions.length} visual questions; ${bank.length} total.`);
