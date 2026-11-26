import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from '../server.mjs';

const server=createServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const desktop={viewport:{width:1440,height:900}};
const phone={viewport:{width:390,height:844},hasTouch:true,isMobile:true};
let browser;
try {
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  async function withPage(options,scenario,test){
    const context=await browser.newContext({...options,serviceWorkers:'block'});
    try {
      const page=await context.newPage();
      page.setDefaultTimeout(16000);
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await test(page,context);
      assert.deepEqual(errors,[]);
      console.log(`PASS · ${scenario}`);
    } finally { await context.close(); }
  }
  const ready=async page=>{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.solarAtlas?.state.ready);
    await page.locator('#landing').waitFor({state:'visible'});
  };
  const stage=(page,value)=>page.waitForFunction(stage=>document.body.dataset.saturnTour===stage,value);
  const position=page=>page.evaluate(()=>solarAtlas.scene.camera.position.toArray());

  await withPage(desktop,'desktop: full route, framing, controls and optional archive',async page=>{
    await ready(page);
    const start=page.getByRole('button',{name:'前往土星',exact:true});
    assert(await start.isVisible());
    await page.getByRole('button',{name:'自由探索图谱'}).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>solarAtlas.state.mode),'atlas');
    assert(!(await page.locator('#landing').isVisible()));
    await page.locator('#home').click();
    await start.focus();await page.keyboard.press('Enter');
    await stage(page,'approach');
    assert(!(await page.locator('#timeline').isVisible()));
    assert(!(await page.locator('#archive').isVisible()));
    const framing=await page.evaluate(async()=>{
      const scene=solarAtlas.scene,ring=scene.saturnRing,outer=ring.geometry.parameters.outerRadius;
      const points=Array.from({length:64},(_,index)=>{
        const angle=index/64*Math.PI*2;
        return scene.camera.position.clone().set(Math.cos(angle)*outer,Math.sin(angle)*outer,0);
      });
      const started=performance.now(),frames=[];
      while(performance.now()-started<15000){
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const phase=document.body.dataset.saturnTour;
        const projected=points.map(point=>ring.localToWorld(point.clone()).project(scene.camera));
        const left=Math.min(...projected.map(point=>point.x)),right=Math.max(...projected.map(point=>point.x));
        const inView=projected.every(point=>Math.abs(point.x)<.94&&Math.abs(point.y)<.9);
        const center=scene.records.get('saturn').position;
        const normal=points[0].clone().set(0,0,1).applyQuaternion(ring.getWorldQuaternion(scene.camera.quaternion.clone()));
        const angle=Math.asin(normal.dot(scene.camera.position.clone().sub(center).normalize()))*180/Math.PI;
        frames.push({phase,width:(right-left)/2,inView,angle});
        if(phase==='arrived')break;
      }
      return frames;
    });
    assert(framing.every(frame=>frame.inView));
    assert(framing[0].width>.16&&framing[0].width<.30);
    assert(framing.some(frame=>frame.phase==='edge'));
    assert.equal(framing.at(-1).phase,'arrived');
    assert(framing.at(-1).width>.50&&Math.abs(framing.at(-1).angle-5)<2);
    const before=await position(page);
    assert(await page.evaluate(()=>solarAtlas.scene.controls.enabled));
    await page.mouse.move(600,400);await page.mouse.down();await page.mouse.move(710,430,{steps:5});await page.mouse.up();
    assert.notDeepEqual(await position(page),before);
    await page.getByRole('button',{name:'土星档案'}).click();
    await page.locator('#archive h1').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'saturn-archive');
    assert.equal(await page.evaluate(()=>document.body.dataset.saturnTour),'arrived');
    await page.keyboard.press('Escape');assert(!(await page.locator('#saturn-tour').isVisible()));
  });

  await withPage(phone,'phone: skip, drag and pinch',async(page,context)=>{
    await ready(page);
    await page.getByRole('button',{name:'前往土星',exact:true}).tap();
    const skip=page.getByRole('button',{name:'跳过导览'});
    const box=await skip.boundingBox();
    assert(box.width>=44&&box.height>=44&&box.y+box.height<=844);
    await skip.tap();await stage(page,'arrived');
    const settled=await position(page);
    await page.waitForTimeout(180);
    assert(Math.hypot(...(await position(page)).map((value,index)=>value-settled[index]))<1e-6);
    const touch=await context.newCDPSession(page);
    const dispatch=(type,points)=>touch.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id}))});
    await dispatch('touchStart',[[135,300,1]]);await dispatch('touchMove',[[186,313,1]]);await dispatch('touchMove',[[228,322,1]]);await dispatch('touchEnd',[]);
    assert.notDeepEqual(await position(page),settled);
    await page.waitForTimeout(250);
    const distance=()=>page.evaluate(()=>solarAtlas.scene.camera.position.distanceTo(solarAtlas.scene.controls.target));
    const before=await distance();
    await dispatch('touchStart',[[135,300,1]]);await dispatch('touchStart',[[135,300,1],[245,300,2]]);
    await dispatch('touchMove',[[112,300,1],[270,300,2]]);await dispatch('touchMove',[[101,300,1],[280,300,2]]);await dispatch('touchEnd',[]);
    assert((await distance())<before*.95);
  });

  await withPage({...phone,reducedMotion:'reduce'},'reduced motion: stable view and manual angles',async page=>{
    await ready(page);await page.getByRole('button',{name:'前往土星',exact:true}).tap();await stage(page,'static');
    const before=await position(page);
    await page.waitForTimeout(200);assert(Math.hypot(...(await position(page)).map((value,index)=>value-before[index]))<1e-6);
    await page.getByRole('button',{name:'俯看环面'}).tap();
    assert.notDeepEqual(await position(page),before);
    await page.getByRole('button',{name:'侧看土星环'}).tap();
    assert(Math.hypot(...(await position(page)).map((value,index)=>value-before[index]))<1e-6);
  });

  await withPage(desktop,'system reduced-motion preference changes during approach',async page=>{
    await ready(page);await page.getByRole('button',{name:'前往土星',exact:true}).click();await stage(page,'approach');await stage(page,'edge');
    await page.emulateMedia({reducedMotion:'reduce'});await stage(page,'static');
    const before=await position(page);await page.waitForTimeout(200);
    assert(Math.hypot(...(await position(page)).map((value,index)=>value-before[index]))<1e-6);
    await page.getByRole('button',{name:'俯看环面'}).click();
    assert.notDeepEqual(await position(page),before);
  });

  await withPage(phone,'phone: full arrival holds the ring in frame',async page=>{
    await ready(page);await page.getByRole('button',{name:'前往土星'}).tap();await stage(page,'approach');
    const frames=await page.evaluate(async()=>{
      const scene=solarAtlas.scene,ring=scene.saturnRing,outer=ring.geometry.parameters.outerRadius,started=performance.now(),frames=[];
      const points=Array.from({length:64},(_,index)=>{const angle=index/64*Math.PI*2;return scene.camera.position.clone().set(Math.cos(angle)*outer,Math.sin(angle)*outer,0);});
      while(performance.now()-started<14000){await new Promise(resolve=>requestAnimationFrame(resolve));const phase=document.body.dataset.saturnTour,projected=points.map(point=>ring.localToWorld(point.clone()).project(scene.camera));const normal=points[0].clone().set(0,0,1).applyQuaternion(ring.getWorldQuaternion(scene.camera.quaternion)),center=scene.records.get('saturn').position,angle=Math.asin(normal.dot(scene.camera.position.clone().sub(center).normalize()))*180/Math.PI;frames.push({phase,width:(Math.max(...projected.map(point=>point.x))-Math.min(...projected.map(point=>point.x)))/2,inView:projected.every(point=>Math.abs(point.x)<.94&&Math.abs(point.y)<.9),angle});if(phase==='arrived')break;}
      return frames;
    });
    assert(frames.length>30&&frames.every(frame=>frame.inView));
    assert(frames.at(-1).phase==='arrived'&&frames.at(-1).width>.45&&frames.at(-1).width<.70&&Math.abs(frames.at(-1).angle-5)<2,JSON.stringify({last:frames.at(-1),widthRange:[Math.min(...frames.map(frame=>frame.width)),Math.max(...frames.map(frame=>frame.width))]}));
    await page.screenshot({path:'shots/saturn-mobile-arrival.png'});
    assert(await page.locator('#saturn-status').evaluate(element=>element.getBoundingClientRect().bottom<844));
  });

  await withPage(phone,'Canvas compatibility tour draws Saturn and responds to angle controls',async page=>{
    await page.goto(`${url}/?lite=1&tour=saturn`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.solarAtlas?.state.ready);
    await stage(page,'static');
    const scene=page.locator('#scene canvas');assert(await scene.evaluate(canvas=>canvas.width>0&&canvas.height>0));
    const before=await page.evaluate(()=>solarAtlas.scene.ctx.getImageData(0,0,solarAtlas.scene.canvas.width,solarAtlas.scene.canvas.height).data.filter((_,index)=>index%4===0).filter(value=>value>32).length);
    assert(before>1000);
    await page.getByRole('button',{name:'俯看环面'}).tap();
    assert.equal(await page.evaluate(()=>solarAtlas.scene.saturnTour.framing[1]),28);
    const after=await page.evaluate(()=>solarAtlas.scene.ctx.getImageData(0,0,solarAtlas.scene.canvas.width,solarAtlas.scene.canvas.height).data.filter((_,index)=>index%4===0).filter(value=>value>32).length);
    assert(after>1000);
  });

  await withPage(phone,'no WebGL: the Saturn archive is the destination',async page=>{
    await page.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};
    });
    await ready(page);
    await page.getByRole('button',{name:/查看土星/}).tap();
    await page.getByRole('button',{name:'土星档案'}).tap();
    await page.locator('#archive h1').waitFor();
    assert(await page.locator('#archive img').evaluate(image=>image.decode().then(()=>image.naturalWidth>0)));
    assert(!(await page.locator('#mode-nav [data-mode=flight]').isVisible()));
  });

  await withPage(phone,'mobile archive dismissal returns to Saturn',async page=>{
    await ready(page);await page.getByRole('button',{name:'前往土星'}).tap();await stage(page,'approach');await page.locator('#saturn-skip').tap();
    const start=await position(page);await page.locator('#saturn-archive').tap();await page.locator('#archive h1').waitFor();await page.locator('#close-archive').tap();
    assert.equal(await page.evaluate(()=>document.body.dataset.saturnTour),'arrived');
    assert(Math.hypot(...(await position(page)).map((value,index)=>value-start[index]))<1e-6);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'saturn-archive');
  });

  await withPage(phone,'context loss keeps Saturn selected',async page=>{
    await ready(page);await page.getByRole('button',{name:'前往土星',exact:true}).tap();await stage(page,'approach');
    await page.evaluate(()=>solarAtlas.scene.renderer.forceContextLoss());
    await page.locator('#saturn-tour').waitFor({state:'visible'});
    assert(await page.evaluate(()=>solarAtlas.state.compatibility));
    assert.equal(await page.evaluate(()=>solarAtlas.state.selection?.id),'saturn');
    assert.equal(await page.evaluate(()=>document.body.dataset.saturnTour),'static');
  });

  await withPage(phone,'bundle failure: open the Saturn text entry directly',async page=>{
    await page.route('**/app.bundle.js?*',route=>route.abort());
    await page.goto(`${url}/?tour=saturn`,{waitUntil:'domcontentloaded'});
    await page.locator('.boot-recovery a').click();
    await page.waitForURL('**/lite.html#saturn');
    assert(await page.locator('details#saturn').evaluate(detail=>detail.open));
  });
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
