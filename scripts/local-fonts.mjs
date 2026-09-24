import fs from 'node:fs/promises';
const root='public/little-jetter/fonts';await fs.mkdir(root,{recursive:true});
const response=await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&display=swap');
if(!response.ok)throw Error('Font stylesheet unavailable');
let css=await response.text();let i=0;
for(const match of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)){
 const remote=match[1],name=`font-${i++}.${remote.endsWith('.woff2')?'woff2':'ttf'}`;
 const r=await fetch(remote);if(!r.ok)throw Error('Font unavailable');
 await fs.writeFile(`${root}/${name}`,Buffer.from(await r.arrayBuffer()));
 css=css.replace(remote,`/little-jetter/fonts/${name}`);
}
for(const family of ['dmsans','fraunces']){
 const r=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);
 if(!r.ok)throw Error('License unavailable');await fs.writeFile(`${root}/${family}-OFL.txt`,await r.text());
}
const file='src/little-jetter.css';let original=await fs.readFile(file,'utf8');
original=css+'\n'+original.replace(/^@import url\([^\n]+\);\r?\n/,'');await fs.writeFile(file,original);
console.log(`Vendored ${i} font files and licenses.`);
