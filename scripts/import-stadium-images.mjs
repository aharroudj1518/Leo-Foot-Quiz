import fs from 'node:fs';
import {createHash} from 'node:crypto';
const target=new URL('../assets/stadiums/',import.meta.url);
const existing=fs.existsSync(new URL('manifest.json',target))?JSON.parse(fs.readFileSync(new URL('manifest.json',target),'utf8')):[];
fs.mkdirSync(target,{recursive:true});
const players=[['san-siro','San Siro','Milan','stadiums'],['old-trafford','Old Trafford','Manchester','stadiums'],['camp-nou','Camp Nou','Barcelona','stadiums'],['stade-france','Stade de France','Saint-Denis','stadiums'],['soccer-city','FNB Stadium','Johannesburg','stadiums'],['azteca','Estadio Azteca','Mexico City','stadiums']];
const headers={'User-Agent':'LeoFootQuizContent/0.2 (https://github.com/aharroudj1518/Leo-Foot-Quiz)'};
players.push(['anfield','Anfield','Liverpool','stadiums'],['bernabeu','Santiago Bernabéu Stadium','Madrid','stadiums'],['dortmund','Westfalenstadion','Dortmund','stadiums'],['olympiastadion','Olympiastadion (Berlin)','Berlin','stadiums'],['velodrome','Stade Vélodrome','Marseille','stadiums'],['da-luz','Estádio da Luz','Lisbon','stadiums']);
async function json(url){const r=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`${r.status} ${url.hostname}`);return r.json();}
const wiki=new URL('https://en.wikipedia.org/w/api.php');
wiki.search=new URLSearchParams({action:'query',redirects:'1',prop:'pageimages',piprop:'name',format:'json',titles:players.map(p=>p[1]).join('|')});
const wikiData=(await json(wiki)).query;
const pages=Object.values(wikiData.pages);
const commons=new URL('https://commons.wikimedia.org/w/api.php');
commons.search=new URLSearchParams({action:'query',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960',format:'json',titles:pages.filter(p=>p.pageimage).map(p=>'File:'+p.pageimage).join('|')});
const files=Object.values((await json(commons)).query.pages);
const plain=s=>String(s??'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
const records=[...existing];
for(const [id,title,country,collection] of players){
  if(records.some(r=>r.id===id))continue;
  const resolved=wikiData.redirects?.find(r=>r.from===title)?.to??title;
  const name=pages.find(p=>p.title===resolved)?.pageimage;
  const file=files.find(f=>f.title.replaceAll('_',' ')===('File:'+name).replaceAll('_',' '));
  const info=file?.imageinfo?.[0],meta=info?.extmetadata;
  const license=plain(meta?.LicenseShortName?.value),licenseUrl=meta?.LicenseUrl?.value;
  if(!info||!(/^(CC BY(?:-SA)? [234]\.0|CC0(?: 1\.0)?|Public domain)$/.test(license))){console.warn(`Skipped ${title}: no accepted Commons licence (${license||"missing"}).`);continue;}
  const imageUrl=new URL(info.thumburl??info.url);
  if(imageUrl.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(imageUrl.hostname))throw new Error(`Unexpected image host: ${title}`);
  const response=await fetch(imageUrl,{headers,signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Image ${title}: HTTP ${response.status}`);
  if(!response.headers.get('content-type')?.startsWith('image/jpeg'))throw new Error(`Expected JPEG for ${title}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(new URL(`${id}.jpg`,target),bytes);
  records.push({id,name:title==='Marta (footballer)'?'Marta':title,country,collection,file:file.title,source:info.descriptionurl,license,licenseUrl,creator:plain(meta.Artist?.value),changes:'Commons-generated thumbnail requested at 960px; displayed with layout cropping.',sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:new Date().toISOString().slice(0,10),imageUrl:imageUrl.href,visualReview:false});
  fs.writeFileSync(new URL('manifest.json',target),JSON.stringify(records,null,2)+'\n');
  console.log(`${id}: ${license}, ${Math.round(bytes.length/1024)} KB`);
  await new Promise(resolve=>setTimeout(resolve,300));
}

