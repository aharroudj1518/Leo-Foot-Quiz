import fs from 'node:fs';
import {createHash} from 'node:crypto';
const target=new URL('../assets/players/',import.meta.url);
fs.mkdirSync(target,{recursive:true});
const manifestUrl=new URL('manifest.json',target);
const records=fs.existsSync(manifestUrl)?JSON.parse(fs.readFileSync(manifestUrl,'utf8')):[];
// Existing reviewed bytes are immutable. Re-running only imports missing roster entries.
for(const record of records){
 const path=new URL(`${record.id}.jpg`,target);
 if(!fs.existsSync(path)||createHash('sha256').update(fs.readFileSync(path)).digest('hex')!==record.sha256)throw new Error(`Existing portrait failed integrity check: ${record.id}`);
}
const players=[
 ['kane','Harry Kane','England','stars'],['de-bruyne','Kevin De Bruyne','Belgium','stars'],
 ['modric','Luka Modrić','Croatia','stars'],['lewandowski','Robert Lewandowski','Poland','stars'],
 ['vinicius','Vinícius Júnior','Brazil','stars'],['bellingham','Jude Bellingham','England','stars'],
 ['bonmati','Aitana Bonmatí','Spain','women'],['putellas','Alexia Putellas','Spain','women'],
 ['kerr','Sam Kerr','Australia','women'],['hegerberg','Ada Hegerberg','Norway','women'],
 ['renard','Wendie Renard','France','women'],['bronze','Lucy Bronze','England','women'],
 ['marta','Marta (footballer)','Brazil','women'],['ronaldinho','Ronaldinho','Brazil','legends'],
 ['zidane','Zinedine Zidane','France','legends'],['henry','Thierry Henry','France','legends'],
 ['drogba','Didier Drogba','Ivory Coast','legends'],['iniesta','Andrés Iniesta','Spain','legends'],
 ['buffon','Gianluigi Buffon','Italy','legends'],['kaka','Kaká','Brazil','legends'],
 ['neymar','Neymar','Brazil','stars'],['suarez','Luis Suárez','Uruguay','stars'],
 ['griezmann','Antoine Griezmann','France','stars'],['saka','Bukayo Saka','England','stars'],
 ['foden','Phil Foden','England','stars'],['son','Son Heung-min','South Korea','stars'],
 ['mane','Sadio Mané','Senegal','stars'],['osimhen','Victor Osimhen','Nigeria','stars'],
 ['rodri','Rodri','Spain','stars'],['rice','Declan Rice','England','stars'],
 ['palmer','Cole Palmer','England','stars'],['dembele','Ousmane Dembélé','France','stars'],
 ['lautaro','Lautaro Martínez','Argentina','stars'],['fernandes','Bruno Fernandes','Portugal','stars'],
 ['van-dijk','Virgil van Dijk','Netherlands','stars'],
 ['mead','Beth Mead','England','women'],['williamson','Leah Williamson','England','women'],
 ['rapinoe','Megan Rapinoe','United States','women'],['morgan','Alex Morgan','United States','women'],
 ['lavelle','Rose Lavelle','United States','women'],
 ['pele','Pelé','Brazil','legends'],['maradona','Diego Maradona','Argentina','legends'],
 ['ronaldo-brazil','Ronaldo (Brazilian footballer)','Brazil','legends'],
 ['beckham','David Beckham','England','legends'],['gerrard','Steven Gerrard','England','legends'],
 ['benzema','Karim Benzema','France','stars'],['kroos','Toni Kroos','Germany','stars'],
 ['neuer','Manuel Neuer','Germany','stars'],['courtois','Thibaut Courtois','Belgium','stars'],
 ['alisson','Alisson Becker','Brazil','stars'],['pedri','Pedri','Spain','stars'],
 ['musiala','Jamal Musiala','Germany','stars'],['yamal','Lamine Yamal','Spain','stars'],
 ['lauren-james','Lauren James','England','women'],['chloe-kelly','Chloe Kelly','England','women'],
 ['alessia-russo','Alessia Russo','England','women'],['paralluelo','Salma Paralluelo','Spain','women'],
 ['caicedo','Linda Caicedo','Colombia','women'],['graham-hansen','Caroline Graham Hansen','Norway','women'],
 ['pirlo','Andrea Pirlo','Italy','legends'],['totti','Francesco Totti','Italy','legends'],
 ['puyol','Carles Puyol','Spain','legends'],['zlatan','Zlatan Ibrahimović','Sweden','legends'],
 ['rivaldo','Rivaldo','Brazil','legends'],['roberto-carlos','Roberto Carlos','Brazil','legends'],
 ['casillas','Iker Casillas','Spain','legends'],['kahn','Oliver Kahn','Germany','legends'],
 ['cech','Petr Čech','Czech Republic','legends'],['schmeichel','Peter Schmeichel','Denmark','legends'],
 ['van-der-sar','Edwin van der Sar','Netherlands','legends'],['ramos','Sergio Ramos','Spain','stars'],
 ['oblak','Jan Oblak','Slovenia','stars'],['wirtz','Florian Wirtz','Germany','stars'],
 ['earps','Mary Earps','England','women'],['hampton','Hannah Hampton','England','women'],
 ['hemp','Lauren Hemp','England','women'],['stanway','Georgia Stanway','England','women'],
 ['walsh','Keira Walsh','England','women'],['miedema','Vivianne Miedema','Netherlands','women'],
 ['harder','Pernille Harder','Denmark','women'],['shaw','Khadija Shaw','Jamaica','women']
].filter(([id])=>!records.some(p=>p.id===id));
if(!players.length){console.log('All roster portraits are already imported.');process.exit(0);}
const headers={'User-Agent':'LeoFootQuizContent/0.2 (https://github.com/aharroudj1518/Leo-Foot-Quiz)'};
async function json(url){const r=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`${r.status} ${url.hostname}`);return r.json();}
const wiki=new URL('https://en.wikipedia.org/w/api.php');
wiki.search=new URLSearchParams({action:'query',prop:'pageimages',piprop:'name',format:'json',titles:players.map(p=>p[1]).join('|')});
const pages=Object.values((await json(wiki)).query.pages);
const commons=new URL('https://commons.wikimedia.org/w/api.php');
commons.search=new URLSearchParams({action:'query',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'384',format:'json',titles:pages.filter(p=>p.pageimage).map(p=>'File:'+p.pageimage).join('|')});
const files=Object.values((await json(commons)).query.pages);
const plain=s=>String(s??'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
for(const [id,title,country,collection] of players){
  const name=pages.find(p=>p.title===title)?.pageimage;
  const file=files.find(f=>f.title.replaceAll('_',' ')===('File:'+name).replaceAll('_',' '));
  const info=file?.imageinfo?.[0],meta=info?.extmetadata;
  const license=plain(meta?.LicenseShortName?.value),licenseUrl=meta?.LicenseUrl?.value??info?.descriptionurl;
  // Exact additional ported licence reviewed: https://creativecommons.org/licenses/by/3.0/br/deed.en
  if(!info||!(/^(CC BY(?:-SA)? [234]\.0|CC BY-SA 3\.0 at|CC BY 3\.0 br|CC0(?: 1\.0)?|Public domain)$/.test(license)))throw new Error(`Unaccepted licence for ${title}: ${license}`);
  const imageUrl=new URL(info.thumburl??info.url);
  if(imageUrl.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(imageUrl.hostname))throw new Error(`Unexpected image host: ${title}`);
  const response=await fetch(imageUrl,{headers,signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Image ${title}: HTTP ${response.status}`);
  if(!response.headers.get('content-type')?.startsWith('image/jpeg'))throw new Error(`Expected JPEG for ${title}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(new URL(`${id}.jpg`,target),bytes);
  const displayNames={'Marta (footballer)':'Marta','Ronaldo (Brazilian footballer)':'Ronaldo Nazário'};
  records.push({id,name:displayNames[title]??title,country,collection,file:file.title,source:info.descriptionurl,identitySource:`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ','_'))}`,license,licenseUrl,creator:plain(meta.Artist?.value),changes:'Commons-served thumbnail or unscaled source; displayed with layout cropping.',sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:new Date().toISOString().slice(0,10),imageUrl:imageUrl.href,visualReview:false});
  fs.writeFileSync(new URL('manifest.json',target),JSON.stringify(records,null,2)+'\n');
  console.log(`${id}: ${license}, ${Math.round(bytes.length/1024)} KB`);
  await new Promise(resolve=>setTimeout(resolve,300));
}

