import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='C:/Users/Jordann Lopez/.codex/generated_images/01a083a1-bbd8-7102-b84a-e1b00d888505/';
const root='public/little-jetter/catalog/tokyo/head/';
// Source landmarks align to a shared chin and eye line during export, not in CSS.
const entries=[
 {id:'freckles',skin:'porcelain',file:'exec-96e43e01-1665-43d9-9fe2-954c1f5ade41.png',scale:.22,left:161,top:111,eyes:[[265,268],[334,260]]},
 {id:'cropped-coils',skin:'deep',file:'exec-8fdf843d-f776-4f19-be4c-2ebfb24273a6.png',scale:.2,left:170,top:118,eyes:[[267,259],[338,252]]},
];
for(const e of entries){
 const meta=await sharp(source+e.file).metadata();if(!meta.hasAlpha)throw Error(e.id+' lacks alpha');
 const art=await sharp(source+e.file).resize(Math.round(meta.width*e.scale),Math.round(meta.height*e.scale)).png().toBuffer();
 await sharp({create:{width:600,height:900,channels:4,background:'#00000000'}}).composite([{input:art,left:e.left,top:e.top}]).png().toFile(root+e.id+'-'+e.skin+'.png');
}
entries.push({id:'braids',skin:'golden',eyes:[[265,272],[338,266]]});
for(const e of entries){
 const {data,info}=await sharp(root+e.id+'-'+e.skin+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const out=Buffer.alloc(info.width*info.height*4);
 for(const [cx,cy] of e.eyes)for(let dy=-11;dy<=11;dy++)for(let dx=-11;dx<=11;dx++){
  if(dx*dx+dy*dy>121)continue;
  const i=((cy+dy)*info.width+cx+dx)*4;
  if(data[i+3]<200 || (Math.max(data[i],data[i+1],data[i+2])+Math.min(data[i],data[i+1],data[i+2]))/510>.4)continue;
  out[i]=255;out[i+1]=255;out[i+2]=255;out[i+3]=255;
 }
 await sharp(out,{raw:{width:600,height:900,channels:4}}).png().toFile(root+e.id+'-iris-mask.png');
}
await fs.mkdir('docs/qa/dolls',{recursive:true});
for(const e of entries){
 await sharp({create:{width:600,height:900,channels:4,background:'#fff8e8'}}).composite([
  {input:'public/little-jetter/catalog/tokyo/body/'+e.skin+'.png'},
  {input:'public/little-jetter/catalog/tokyo/little-jetter-logo-tee/default.png'},
  {input:root+e.id+'-'+e.skin+'.png'},
 ]).png().toFile('docs/qa/dolls/'+e.id+'.png');
}
console.log('Normalized three head presets and individual iris masks.');
