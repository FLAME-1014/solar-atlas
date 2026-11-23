import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'assets/textures'),out=path.join(root,'assets/mobile');await fs.mkdir(out,{recursive:true});
const files=await fs.readdir(source);let bytes=0;
for(const file of files.filter(f=>/\.(jpg|png)$/i.test(f))){const target=path.join(out,file);const width=file==='milky-way.jpg'?2048:file==='sun.jpg'?1024:768;let pipeline=sharp(path.join(source,file)).resize({width,withoutEnlargement:true});pipeline=file.endsWith('.png')?pipeline.png({compressionLevel:9}):pipeline.jpeg({quality:76,mozjpeg:true});const info=await pipeline.toFile(target);bytes+=info.size;}
console.log(`Mobile textures prepared: ${(bytes/1024/1024).toFixed(2)} MB total.`);
