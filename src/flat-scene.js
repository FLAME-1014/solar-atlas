import { PLANETS, MOON, MOONS, SMALL_BODIES, MISSIONS, CONSTELLATIONS, OCEAN_CURRENTS, orbitalPosition } from './data.js';

const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
// A Canvas 2D scene keeps navigation and all reference panels available without WebGL.
export class FlatScene {
  constructor(container,labels,callbacks={}){
    this.container=container;this.callbacks=callbacks;this.isFallback=true;this.mode='atlas';this.landing=true;this.date=Date.now();this.layers=new Set(['asteroids']);this.textures={};this.settings={orbits:true,labels:true,asteroids:true,missions:true,stars:true,clouds:true,grid:false,auto:false};this.records=new Map([...PLANETS,...MOONS,...SMALL_BODIES].map(data=>[data.id,{data,position:{x:0,y:0,z:0}}]));this.constellations=CONSTELLATIONS;this.currentRoot={visible:false};this.scienceRoot={visible:false};this.controls={enabled:true,autoRotate:false};this.flight={target:'earth',autopilot:false,speed:1142,velocity:{length:()=>0},travelled:0};this.zoomLevel=1;this.elapsed=0;this.hits=[];
    this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-label','无需 WebGL 的兼容图谱');this.ctx=this.canvas.getContext('2d');if(!this.ctx)throw new Error('Canvas 2D unavailable');container.replaceChildren(this.canvas);this.labels=labels;labels.replaceChildren();this.ratio=1;
    this.renderer={domElement:this.canvas,setPixelRatio:value=>{this.ratio=Math.min(1.5,value);this.resize();},getPixelRatio:()=>this.ratio};
    this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(container);
    this.canvas.addEventListener('click',event=>{if(this.landing||this.saturnTour)return;const rect=this.canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;if(this.mode==='globe'){this.callbacks.onGlobePick?.({lon:(x/this.width-.5)*360,lat:(.5-y/this.height)*180});return;}const hit=this.hits.find(h=>Math.hypot(x-h.x,y-h.y)<h.r+15);if(hit)this.callbacks.onSelect?.({type:'planet',id:hit.id});});
    this.canvas.addEventListener('pointerdown',event=>{if(this.saturnTour?.phase==='approach'||this.saturnTour?.phase==='edge')this.finishSaturnTour();this.pointer={x:event.clientX,y:event.clientY};});
    this.canvas.addEventListener('pointerup',event=>{if(this.pointer){this.zoomLevel=Math.max(.5,Math.min(4,this.zoomLevel*(this.pointer.x-event.clientX<0?1.12:.9)));}this.pointer=null;});this.canvas.addEventListener('pointercancel',()=>{this.pointer=null;});
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom(e.deltaY>0?1:-1);},{passive:false});
  }
  async init(){
    this.callbacks.onProgress?.(.5,'兼容场景');this.running=true;this.tick=()=>{if(!this.running)return;this.elapsed+=1/30;this.draw();this.frame=setTimeout(this.tick,1000/30);};this.tick();this.canvas.dataset.ready='true';this.callbacks.onProgress?.(1,'READY');this.callbacks.onReady?.();
    for(const id of ['earth','sun','moon','saturn']){const image=new Image();image.onload=()=>this.textures[id]=image;image.src=`./assets/mobile/${id==='saturn'?'saturn-uv':id}.jpg`;}
    const rings=new Image();rings.onload=()=>this.textures.ring=rings;rings.src='./assets/mobile/saturn-ring.png';
    fetch('./assets/catalog/constellations.json').then(r=>r.json()).then(data=>{this.constellations=data.figures;this.callbacks.onCatalog?.(data);}).catch(()=>{});
    return this;
  }
  resize(){this.width=this.container.clientWidth||innerWidth;this.height=this.container.clientHeight||innerHeight;this.canvas.width=this.width*this.ratio;this.canvas.height=this.height*this.ratio;this.canvas.style.width=this.width+'px';this.canvas.style.height=this.height+'px';}
  setLanding(value){this.landing=value;this.mode='atlas';if(value)this.clearSaturnTour();}
  setMode(mode){this.clearSaturnTour();this.mode=mode;this.landing=false;this.selected=null;this.flight.autopilot=false;this.callbacks.onMode?.(mode);}
  focus(id){this.clearSaturnTour();this.selected=id;}
  startSaturnTour(reducedMotion){this.saturnTour={phase:reducedMotion?'static':'approach',framing:reducedMotion?[1,5]:[0,28],start:performance.now()};this.selected='saturn';}
  updateSaturnTour(){if(!this.saturnTour||this.saturnTour.phase==='static'||this.saturnTour.phase==='arrived')return;const tour=this.saturnTour,seconds=(performance.now()-tour.start)/1000,ease=value=>{const p=clamp(value,0,1);return p*p*(3-2*p);},approach=ease(seconds/5.8),turn=ease((seconds-5.8)/4.6);tour.framing=[approach,28-23*turn];if(seconds>=10.4){this.finishSaturnTour();return;}const phase=seconds<5.8?'approach':'edge';if(phase!==tour.phase){tour.phase=phase;this.callbacks.onSaturnTour?.(phase);}}
  finishSaturnTour(){const tour=this.saturnTour;if(!tour||tour.phase==='arrived'||tour.phase==='static')return;this.saturnTour={...tour,phase:'arrived'};this.callbacks.onSaturnTour?.('arrived');}
  setSaturnAngle(open){if(this.saturnTour?.phase==='static')this.saturnTour.framing=[1,open?28:5];}
  clearSaturnTour(){this.saturnTour=null;}
  setDate(date,playing=false){this.date=date;this.playing=playing;}
  setSetting(key,value){this.settings[key]=value;if(key==='asteroids')value?this.layers.add(key):this.layers.delete(key);}
  setReducedMotion(value){this.reducedMotion=Boolean(value);if(this.reducedMotion&&this.saturnTour&&['approach','edge'].includes(this.saturnTour.phase)){this.saturnTour.phase='static';this.saturnTour.framing=[1,5];this.callbacks.onSaturnTour?.('static');}}
  setScience(id,value){value?this.layers.add(id):this.layers.delete(id);}
  setQuality(value){this.renderer.setPixelRatio(value==='low'?.75:1);}
  setMissionFilter(value){this.missionCategory=value;}
  resetView(){this.zoomLevel=1;this.selected=null;}
  zoom(direction){this.zoomLevel=Math.max(.5,Math.min(4,this.zoomLevel*(direction>0?.85:1.18)));}
  setGlobeLayer(value){this.globeLayer=value;this.currentRoot.visible=value==='currents';}
  flyToGeo(lon,lat){this.location={lon,lat};}
  lookAtSky(ra,dec){this.mode='deep';this.sky={ra,dec};}
  startFlight(){this.flight.started=Date.now();this.flight.target='earth';this.flight.autopilot=false;this.flight.travelled=0;}
  setFlightTarget(id){this.flight.target=id;this.flight.autopilot=false;}
  alignFlight(){}
  autopilot(){this.flight.autopilot=!this.flight.autopilot;}
  dispose(){this.running=false;clearTimeout(this.frame);this.observer.disconnect();}
  draw(){
    const c=this.ctx,w=this.width,h=this.height;c.setTransform(this.ratio,0,0,this.ratio,0,0);c.fillStyle='#05090e';c.fillRect(0,0,w,h);
    for(let i=0;i<180;i++){const x=((i*97.13)%1)*w,y=((i*53.17)%1)*h;c.fillStyle=i%4?'#616c7d':'#d2d3cd';c.fillRect(x,y,i%9?1:2,i%9?1:2);}
    this.updateSaturnTour();
    if(this.saturnTour){this.drawSaturn(w,h);return;}
    this.hits=[];
    if(this.mode==='globe'||this.mode==='flight'){
      const r=Math.min(w*.37,h*.28)*this.zoomLevel,x=w/2,y=h*.48;c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();c.fillStyle='#2c577b';c.fillRect(x-r,y-r,r*2,r*2);if(this.textures.earth)c.drawImage(this.textures.earth,x-r,y-r,r*2,r*2);const shade=c.createLinearGradient(x-r,y,x+r,y);shade.addColorStop(0,'#0000');shade.addColorStop(1,'#000b');c.fillStyle=shade;c.fillRect(x-r,y-r,r*2,r*2);
      if(this.mode==='globe'&&this.globeLayer==='currents')for(const flow of OCEAN_CURRENTS){c.beginPath();flow.points.forEach(([lon,lat],i)=>{const px=x+lon/180*r,py=y-lat/90*r;i?c.lineTo(px,py):c.moveTo(px,py);});c.strokeStyle=flow.warm?'#efbb7c':'#7cc9de';c.lineWidth=1.5;c.stroke();}c.restore();c.strokeStyle='#65c6d344';c.lineWidth=5;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();
      if(this.mode==='flight'){this.callbacks.onFlight?.({elapsed:(Date.now()-(this.flight.started||Date.now()))/1000,sunAU:1,closest:'地球',travelled:0,irradiance:1361,lightSun:499,gravity:.27,escape:4.6,gamma:1,distance:38000,speed:0,altitude:31629,acceleration:.27,cruise:this.flight.speed,autopilot:false});}
    }else if(this.mode==='deep'){
      c.strokeStyle='#8faabe55';c.font='11px sans-serif';for(let i=0;i<Math.min(20,this.constellations.length);i++){const f=this.constellations[i],p=f.coord||f.points?.[0]||[i*17,20];c.fillStyle='#b1b6bb';c.fillText(f.name,((p[0]+360)%360)/360*w,(.5-p[1]/180)*h);}this.callbacks.onStats?.({ra:this.sky?.ra||268,dec:this.sky?.dec||-27,fov:72,fps:30,stars:0});
    }else{
      const cx=this.landing?w*.65:w*.5,cy=h*.48,max=Math.min(w*.43,h*.31)*this.zoomLevel;
      for(let i=1;i<PLANETS.length;i++){const r=max*(.18+i*.082);if(this.settings.orbits){c.strokeStyle='#b6a17a30';c.lineWidth=.7;c.beginPath();c.ellipse(cx,cy,r,r*.47,0,0,Math.PI*2);c.stroke();}const p=PLANETS[i],orbit=orbitalPosition(p,this.date),angle=this.mode==='atlas'?i*.69:Math.atan2(orbit[2],orbit[0]);const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.47,size=(p.size*2.5+2)*(p.id===this.selected?1.4:1);c.beginPath();c.arc(x,y,size,0,Math.PI*2);c.fillStyle=p.color;c.fill();this.hits.push({x,y,r:size,id:p.id});if(this.settings.labels&&!this.landing){c.font='10px sans-serif';c.fillStyle=p.id===this.selected?'#f0c68d':'#bfc4c2';c.textAlign='center';c.fillText(p.name,x,y-size-9);}}
      const glow=c.createRadialGradient(cx,cy,0,cx,cy,37);glow.addColorStop(0,'#ffdb8c');glow.addColorStop(.25,'#e9ab51');glow.addColorStop(1,'#ecad4800');c.fillStyle=glow;c.fillRect(cx-37,cy-37,74,74);this.hits.push({x:cx,y:cy,r:14,id:'sun'});
    }
    if(!this.landing){c.textAlign='center';c.fillStyle='#8eaaa9';c.font='10px sans-serif';c.fillText('兼容视图 · 无需 WebGL · 档案与目录可正常浏览',w/2,this.mode==='globe'?h-88:h-224);}
  }
  drawSaturn(w,h){
    const c=this.ctx,tour=this.saturnTour,closeWidth=clamp(.68-(1440-w)*.00009,.56,.68),approach=tour.framing[0],width=.24*(closeWidth/.24)**approach,scale=Math.min(w*width/2.16,h*.42),cx=w*.5,cy=h*.51,angle=tour.framing[1]*Math.PI/180;
    c.save();c.translate(cx,cy);c.rotate(-.45);c.scale(1,Math.max(.045,Math.sin(angle)));
    const outer=scale*1.08,texture=this.textures.ring;
    if(texture?.complete){const height=Math.min(40,outer*.12);c.globalAlpha=.88;c.drawImage(texture,0,0,texture.naturalWidth,texture.naturalHeight,-outer,-height/2,outer*2,height);}
    else{const gradient=c.createLinearGradient(cx-outer,0,cx+outer,0);gradient.addColorStop(0,'#9d8966');gradient.addColorStop(.2,'#d4c29b');gradient.addColorStop(.35,'#6b5b48');gradient.addColorStop(.48,'#e0cca1');gradient.addColorStop(.65,'#8c7655');gradient.addColorStop(1,'#b39c71');c.fillStyle=gradient;c.fillRect(-outer,0,outer*2,Math.max(1,scale*.045));}
    c.restore();c.beginPath();c.arc(cx,cy,scale*.5,0,Math.PI*2);if(this.textures.saturn?.complete)c.clip();else{const gradient=c.createLinearGradient(cx-scale/2,0,cx+scale/2,0);gradient.addColorStop(0,'#948675');gradient.addColorStop(.36,'#e1cfa7');gradient.addColorStop(.72,'#e8d9b9');gradient.addColorStop(1,'#66605a');c.fillStyle=gradient;c.fill();}
    if(this.textures.saturn?.complete)c.drawImage(this.textures.saturn,cx-scale*.5,cy-scale*.5,scale,scale);
    c.restore();
    c.save();c.translate(cx,cy);c.rotate(-.45);c.scale(1,Math.max(.045,Math.sin(angle)));c.beginPath();c.rect(-scale*1.2,0,scale*2.4,scale*2);c.clip();
    if(texture?.complete){const height=Math.min(40,outer*.12);c.globalAlpha=.93;c.drawImage(texture,0,0,texture.naturalWidth,texture.naturalHeight,-outer,-height/2,outer*2,height);}
    else{c.fillStyle='#ddc99d';c.fillRect(-outer,0,outer*2,Math.max(1,scale*.045));}c.restore();
  }
}
