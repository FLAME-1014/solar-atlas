import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const width=12,height=7,locations=Array.from({length:width*height},(_,i)=>({lon:-180+(i%width)*30,lat:-90+Math.floor(i/width)*30}));
const values=new Float32Array(width*height*3);let validTime;
try{
  for(let offset=0;offset<locations.length;offset+=21){
    const group=locations.slice(offset,offset+21),params=new URLSearchParams({latitude:group.map(p=>p.lat).join(','),longitude:group.map(p=>p.lon).join(','),hourly:'wind_speed_10m,wind_direction_10m,precipitation',wind_speed_unit:'ms',forecast_hours:'1',timezone:'UTC'});
    const response=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Open-Meteo '+response.status);let rows=await response.json();if(!Array.isArray(rows))rows=[rows];if(rows.length!==group.length)throw new Error('Location count mismatch');
    for(let j=0;j<rows.length;j++){const row=rows[j],speed=row.hourly?.wind_speed_10m?.[0],direction=row.hourly?.wind_direction_10m?.[0],rain=row.hourly?.precipitation?.[0];if(![speed,direction,rain].every(Number.isFinite))throw new Error('Invalid global sample');const k=(offset+j)*3;values[k]=-speed*Math.sin(direction*Math.PI/180);values[k+1]=-speed*Math.cos(direction*Math.PI/180);values[k+2]=rain;validTime??=row.hourly.time[0]+'Z';}
    console.log(`Weather locations: ${Math.min(offset+group.length,locations.length)} / ${locations.length}`);
  }
  const meta={source:'Open-Meteo · multi-model hourly samples',url:'https://open-meteo.com/',validTime,rainTime:validTime,downloadedAt:new Date().toISOString(),width,height,lon0:-180,lat0:-90,dLon:30,dLat:30,channels:['eastward wind m/s','northward wind m/s','hourly precipitation mm/h'],nativeResolution:'provider model dependent',displayResolution:'30° geographic sampling',binary:'./assets/catalog/weather-grid.bin',license:'Open-Meteo · CC BY 4.0',snapshot:true,interpolated:true};
  await fs.writeFile(path.join(root,'assets/catalog/weather-grid.bin'),Buffer.from(values.buffer));await fs.writeFile(path.join(root,'assets/catalog/weather-grid.json'),JSON.stringify(meta));console.log('Saved dated global weather samples.');
}catch(error){console.error(error.message);try{await fs.access(path.join(root,'assets/catalog/weather-grid.bin'));console.log('Kept existing weather snapshot.');}catch{process.exitCode=1;}}
