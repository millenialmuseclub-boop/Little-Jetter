import fs from 'node:fs/promises';
import sharp from 'sharp';
const source='C:/Users/Jordann Lopez/.codex/generated_images/01a083a1-bbd8-7102-b84a-e1b00d888505/';
const root='public/little-jetter/catalog/tokyo/';
// Each input is one generated item. These operations only normalize full assets.
const assets=[
 ['cream-bow-blouse','exec-e972000e-8160-4494-a483-27d45633fbf0.png',195,185,320],
 ['little-jetter-logo-tee','exec-439a35ac-15d8-4d7d-ba90-b58188e72539.png',190,175,320],
];
for(const [id,name,width,height,top] of assets){
 const input=source+name,meta=await sharp(input).metadata();
 if(!meta.hasAlpha)throw Error(id+' lacks transparency');
 const art=await sharp(input).trim({background:'#00000000',threshold:10}).resize(width,height,{fit:'inside'}).png().toBuffer();
 const m=await sharp(art).metadata();
 await fs.mkdir(root+id,{recursive:true});
 await sharp({create:{width:600,height:900,channels:4,background:'#00000000'}}).composite([{input:art,left:Math.round(300-m.width/2),top}]).png().toFile(root+id+'/default.png');
 console.log('Replaced individual asset:',id);
}
const head=source+'exec-00299a3e-fe69-4bdd-8434-789df708d817.png';
const meta=await sharp(head).metadata();if(!meta.hasAlpha)throw Error('Head lacks alpha');
const art=await sharp(head).resize(Math.round(meta.width*.2),Math.round(meta.height*.2)).png().toBuffer();
await sharp({create:{width:600,height:900,channels:4,background:'#00000000'}}).composite([{input:art,left:180,top:130}]).png().toFile(root+'head/braids-golden.png');
console.log('Added standalone braid head');
