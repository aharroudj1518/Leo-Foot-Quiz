import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=f=>JSON.parse(fs.readFileSync(new URL(f,root),'utf8').replace(/^\uFEFF/,''));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(fc|cf|afc|fk|sk|kv|rc|ssc|as|ac|vfb|vfl|sv|sc|club|football|1907)\b/g,'').replace(/[^a-z0-9]/g,'');
const aliases={'FC Bayern München':'Bayern Munich','FC Internazionale Milano':'Inter Milan','SK Slavia Praha':'SK Slavia Prague','LOSC Lille':'LOSC Lille','Sporting Clube de Portugal':'Sporting CP','Atlético de Madrid':'Atlético de Madrid','Paris Saint-Germain':'Paris Saint-Germain','FC Shakhtar Donetsk':'Shakhtar Donetsk','ŠK Slovan Bratislava':'Slovan Bratislava','Galatasaray A.Ş.':'Galatasaray','Fenerbahçe SK':'Fenerbahce','Real Madrid C.F.':'Real Madrid'};
const tree=read('src/content/sources/crest-repository-tree.json').filter(x=>x.path.startsWith('logos/')&&x.path.endsWith('.png'));
const chapters=read('src/content/squad-chapters.json');
const uefaIds=new Map(read('src/content/sources/champions-league-2026-27.json').map(c=>[norm(aliases[c.name]??c.name),Number(c.code.split('-')[1])]));
const manifest=[],missing=[];fs.mkdirSync(new URL('assets/crests/',root),{recursive:true});
for(const c of chapters){
 const uefa=c.competition==='champions-league'?Number(c.code.split('-')[1]):uefaIds.get(norm(aliases[c.name]??c.name));
 if(uefa){const file=`assets/crests/${uefa}.png`,url=`https://img.uefa.com/imgml/TP/teams/logos/240x240/${uefa}.png`;if(!fs.existsSync(new URL(file,root))){const response=await fetch(url);if(!response.ok)throw new Error('Missing UEFA crest: '+c.name);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid UEFA image: '+c.name);fs.writeFileSync(new URL(file,root),bytes);}manifest.push({code:c.code,name:c.name,file,source:url,sha256:createHash('sha256').update(fs.readFileSync(new URL(file,root))).digest('hex'),status:'review-required',note:'Authentic club mark; rights remain with the club.'});continue;}
 const extra={'Feyenoord':'Feyenoord Rotterdam','Atlético Madrid':'Atlético de Madrid','Celta Vigo':'Celta de Vigo','TSG Hoffenheim':'TSG 1899 Hoffenheim','Bayer Leverkusen':'Bayer 04 Leverkusen'};
 const name=extra[c.name]??aliases[c.name]??c.name;
 const target=norm(name);
 let matches=tree.filter(x=>norm(path.basename(x.path,'.png'))===target);
 if(!matches.length)matches=tree.filter(x=>norm(path.basename(x.path,'.png')).includes(target));
 if(matches.length!==1){missing.push({name:c.name,candidates:tree.filter(x=>norm(path.basename(x.path,'.png')).includes(target)||target.includes(norm(path.basename(x.path,'.png')))).map(x=>x.path)});continue;}
 const p=matches[0].path,url='https://raw.githubusercontent.com/luukhopman/football-logos/master/'+p.split('/').map(encodeURIComponent).join('/');
 const file='assets/crests/'+norm(path.basename(p,'.png'))+'.png';
 if(!fs.existsSync(new URL(file,root))){const response=await fetch(url);if(!response.ok)throw new Error(`${response.status}: ${url}`);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Not PNG: '+url);fs.writeFileSync(new URL(file,root),bytes);}
 manifest.push({code:c.code,name:c.name,file,source:url,sha256:createHash('sha256').update(fs.readFileSync(new URL(file,root))).digest('hex'),status:'review-required',note:'Authentic club mark; source repository is not a commercial licence.'});
}
fs.writeFileSync(new URL('assets/crests/manifest.json',root),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(new URL('src/clubCrests.ts',root),"import type {ImageSourcePropType} from 'react-native';\nexport const clubCrests:Record<string,ImageSourcePropType>={\n"+[...new Map(manifest.map(c=>[c.name,c])).values()].map(c=>`${JSON.stringify(c.name)}:require('../${c.file}'),`).join('\n')+'\n};\n');
const register=read('src/content/asset-register.json');
for(const c of manifest){
 const id='crest-'+c.code,entry={id,status:'review-required',creator:c.name,licenseEvidence:c.source,platforms:['ios','android'],commercialUse:false,likenessAndMarksAssessment:'Authentic club mark; public-release assessment pending.',referenceImageAssessment:'Unmodified PNG; SHA-256 '+c.sha256};
 const index=register.assets.findIndex(a=>a.id===id);if(index<0)register.assets.push(entry);else register.assets[index]=entry;
}
fs.writeFileSync(new URL('src/content/asset-register.json',root),JSON.stringify(register,null,2)+'\n');
console.log(JSON.stringify({downloaded:manifest.length,missing},null,2));
