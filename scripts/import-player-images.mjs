import fs from 'node:fs';
import {createHash} from 'node:crypto';
const target=new URL('../assets/players/',import.meta.url);
if(fs.existsSync(new URL('manifest.json',target)))throw new Error('An imported manifest already exists. Preserve reviewed assets; import updates in a separate checkout for comparison.');
fs.mkdirSync(target,{recursive:true});
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
 ['buffon','Gianluigi Buffon','Italy','legends'],['kaka','Kaká','Brazil','legends']
];
const headers={'User-Agent':'LeoFootQuizContent/0.2 (https://github.com/aharroudj1518/Leo-Foot-Quiz)'};
async function json(url){const r=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`${r.status} ${url.hostname}`);return r.json();}
const wiki=new URL('https://en.wikipedia.org/w/api.php');
wiki.search=new URLSearchParams({action:'query',prop:'pageimages',piprop:'name',format:'json',titles:players.map(p=>p[1]).join('|')});
const pages=Object.values((await json(wiki)).query.pages);
const commons=new URL('https://commons.wikimedia.org/w/api.php');
commons.search=new URLSearchParams({action:'query',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'384',format:'json',titles:pages.filter(p=>p.pageimage).map(p=>'File:'+p.pageimage).join('|')});
const files=Object.values((await json(commons)).query.pages);
const plain=s=>String(s??'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
const records=[];
for(const [id,title,country,collection] of players){
  const name=pages.find(p=>p.title===title)?.pageimage;
  const file=files.find(f=>f.title.replaceAll('_',' ')===('File:'+name).replaceAll('_',' '));
  const info=file?.imageinfo?.[0],meta=info?.extmetadata;
  const license=plain(meta?.LicenseShortName?.value),licenseUrl=meta?.LicenseUrl?.value;
  if(!info||!(/^(CC BY(?:-SA)? [234]\.0|CC0(?: 1\.0)?|Public domain)$/.test(license)))throw new Error(`Unaccepted licence for ${title}: ${license}`);
  const imageUrl=new URL(info.thumburl??info.url);
  if(imageUrl.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(imageUrl.hostname))throw new Error(`Unexpected image host: ${title}`);
  const response=await fetch(imageUrl,{headers,signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Image ${title}: HTTP ${response.status}`);
  if(!response.headers.get('content-type')?.startsWith('image/jpeg'))throw new Error(`Expected JPEG for ${title}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(new URL(`${id}.jpg`,target),bytes);
  records.push({id,name:title==='Marta (footballer)'?'Marta':title,country,collection,file:file.title,source:info.descriptionurl,license,licenseUrl,creator:plain(meta.Artist?.value),changes:'Commons-generated 384px thumbnail; displayed with layout cropping.',sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:new Date().toISOString().slice(0,10),imageUrl:imageUrl.href,visualReview:false});
  fs.writeFileSync(new URL('manifest.json',target),JSON.stringify(records,null,2)+'\n');
  console.log(`${id}: ${license}, ${Math.round(bytes.length/1024)} KB`);
  await new Promise(resolve=>setTimeout(resolve,300));
}

