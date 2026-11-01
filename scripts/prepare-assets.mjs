import sharp from 'sharp';
import {readdir,writeFile,readFile,mkdir} from 'node:fs/promises';
for(const name of await readdir('public/images'))if(name.endsWith('.png'))await sharp('public/images/'+name).webp({quality:86}).toFile('public/images/'+name.replace('.png','.webp'));
for(const path of ['lib/catalog.ts','app/storefront.tsx','app/layout.tsx']){let s=await readFile(path,'utf8');s=s.replaceAll('.png','.webp');await writeFile(path,s);}
await mkdir('public/fonts',{recursive:true});
const url='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap';
try{let css=await(await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}})).text();let i=0;for(const link of [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))]){const name='font-'+(i++)+'.'+(link.endsWith('.woff2')?'woff2':'ttf');await writeFile('public/fonts/'+name,Buffer.from(await(await fetch(link)).arrayBuffer()));css=css.replaceAll(link,'/fonts/'+name);}let main=await readFile('app/globals.css','utf8');main=main.replace(/^@import url\([^\n]+\);/,css);await writeFile('app/globals.css',main);console.log('Self-hosted fonts:',i)}catch(e){console.error('Fonts kept on Google CDN:',e.message)}
console.log('Optimized images to WebP');
