import fs from 'node:fs/promises';
import path from 'node:path';
import { COMPLETE_HEADS } from '../src/data/headManifest.ts';
const app=await fs.readFile('src/LittleJetterApp.tsx','utf8');
const catalog=JSON.parse(await fs.readFile('src/data/dressUpCatalog.json','utf8'));
const explore=JSON.parse(await fs.readFile('src/data/exploreContent.json','utf8'));
const missing=[];
for(const id of Object.keys(explore)) {
 try{await fs.access(`public/little-jetter/${id}-doll-backdrop.png`);}catch{missing.push(id+' backdrop');}
 for(const section of ['gastronomy','vocabulary','sites','madlib'])if(!explore[id][section])missing.push(id+' '+section);
}
const urls=new Set([...app.matchAll(/['"](\/little-jetter\/[\w./-]+\.(?:png|webp))['"]/g)].map(match=>match[1]));
for(const head of COMPLETE_HEADS.filter(head=>head.enabled)){urls.add(head.src);urls.add(head.thumbnailSrc);}
for(const url of Object.values(JSON.parse(await fs.readFile('src/data/wardrobeThumbnails.json','utf8'))))urls.add(url);
for(const id of Object.keys(explore))urls.add(`/little-jetter/place-thumbnails/${id}.webp`);
for(const url of ['/icon-192.png','/icon-512.png','/apple-touch-icon.png'])urls.add(url);
for(const destination of Object.values(catalog.destinations))for(const items of Object.values(destination))for(const item of items){if(item.imageUrl)urls.add(item.imageUrl);for(const v of item.variants??[])urls.add(v.imageUrl);}
for(const url of urls){try{await fs.access(path.join('public',url));}catch{missing.push(url);}}
const report={destinations:Object.keys(explore).length,referencedImages:urls.size,missing,wardrobeItems:Object.fromEntries(Object.entries(catalog.destinations.all).map(([group,items])=>[group,items.filter(item=>item.id!=='none').length]))};
await fs.writeFile('docs/qa/release-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(missing.length)process.exitCode=1;
