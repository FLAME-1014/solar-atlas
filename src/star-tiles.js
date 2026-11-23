import * as THREE from 'three';
export class StarTiles{
  constructor(scene,index){this.scene=scene;this.index=index;this.root=new THREE.Group();scene.skyRoot.add(this.root);this.tiles=new Map();this.inflight=0;this.last=0;this.resident=0;this.baseCount=scene.catalogStars;this.centres=Array.from({length:96},(_,cell)=>{const face=Math.floor(cell/16),u=((cell%4+.5)/4)*2-1,v=((Math.floor(cell%16/4)+.5)/4)*2-1;return new THREE.Vector3(...(face===0?[1,v,u]:face===1?[-1,v,u]:face===2?[u,1,v]:face===3?[u,-1,v]:face===4?[u,v,1]:[u,v,-1])).normalize();});}
  async load(key,layer,cell){
    if(this.tiles.has(key)||this.inflight>=4)return;this.inflight++;this.tiles.set(key,{pending:true,last:performance.now(),layer,cell});
    try{const response=await fetch(`./assets/stars/${key}.bin`);if(!response.ok)throw new Error('Star tile unavailable');const buffer=await response.arrayBuffer(),view=new DataView(buffer),count=buffer.byteLength/8,positions=new Float32Array(count*3),colors=new Float32Array(count*3),color=new THREE.Color();
      for(let i=0;i<count;i++){positions[i*3]=view.getInt16(i*8,true)/32767*1850;positions[i*3+1]=view.getInt16(i*8+2,true)/32767*1850;positions[i*3+2]=view.getInt16(i*8+4,true)/32767*1850;const mag=this.index.mag0+view.getUint8(i*8+6)/255*this.index.magSpan,bp=this.index.bprp0+view.getUint8(i*8+7)/255*this.index.bprpSpan;color.set(bp>1.5?0xf1c69b:bp<.25?0xc3d6f8:0xe6e0cc);color.multiplyScalar(Math.max(.1,1-(mag-6)*.15));colors.set([color.r,color.g,color.b],i*3);}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));const points=new THREE.Points(geometry,new THREE.PointsMaterial({size:layer===0?.9:.7,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.7,depthWrite:false}));this.root.add(points);this.tiles.set(key,{points,layer,cell,count,last:performance.now()});this.resident+=count;
    }catch{this.tiles.delete(key);}finally{this.inflight--;}
  }
  update(){
    this.root.visible=this.scene.mode==='deep';if(!this.root.visible)return;const now=performance.now();if(now-this.last<450)return;this.last=now;const direction=this.scene.camera.getWorldDirection(new THREE.Vector3()),fov=this.scene.camera.fov,maxLayer=fov>55?1:fov>25?2:3,limit=Math.cos(Math.min(Math.PI,fov*Math.PI/180*.8+.55));
    this.load('l0',0,-1);for(let l=1;l<=maxLayer;l++){const cells=this.centres.map((c,i)=>({cell:i,score:c.dot(direction)})).filter(v=>v.score>limit).sort((a,b)=>b.score-a.score);for(const {cell} of cells.slice(0,this.scene.mobile?8:18))this.load(`l${l}-${cell}`,l,cell);}
    for(const [key,tile] of this.tiles){if(!tile.points)continue;tile.points.visible=tile.layer===0||tile.layer<=maxLayer&&this.centres[tile.cell].dot(direction)>limit;if(tile.points.visible)tile.last=now;}
    const cap=this.scene.mobile?450000:1500000;if(this.resident>cap){for(const [key,tile] of [...this.tiles.entries()].filter(([,t])=>t.points&&t.layer>0&&!t.points.visible).sort((a,b)=>a[1].last-b[1].last)){this.root.remove(tile.points);tile.points.geometry.dispose();tile.points.material.dispose();this.resident-=tile.count;this.tiles.delete(key);if(this.resident<=cap)break;}}
    this.scene.catalogStars=this.baseCount+this.resident;
  }
}
