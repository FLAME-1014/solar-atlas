(function(){
  'use strict';
  if(!Promise.allSettled)Promise.allSettled=function(items){return Promise.all(Array.from(items).map(function(p){return Promise.resolve(p).then(function(value){return {status:'fulfilled',value:value};},function(reason){return {status:'rejected',reason:reason};});}));};
  if(window.AbortSignal&&!AbortSignal.timeout)AbortSignal.timeout=function(ms){var controller=new AbortController();setTimeout(function(){controller.abort();},ms);return controller.signal;};
  if(!window.matchMedia)window.matchMedia=function(query){return {matches:false,media:query,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false;}};};
  if(!Element.prototype.replaceChildren)Element.prototype.replaceChildren=function(){while(this.firstChild)this.removeChild(this.firstChild);for(var i=0;i<arguments.length;i++)this.appendChild(arguments[i]);};
  if(!window.ResizeObserver)window.ResizeObserver=function(callback){this.callback=callback;this.observe=function(){window.addEventListener('resize',callback);};this.disconnect=function(){window.removeEventListener('resize',callback);};};
  var dialogs=document.querySelectorAll('dialog');for(var i=0;i<dialogs.length;i++){if(!dialogs[i].showModal){dialogs[i].showModal=function(){this.setAttribute('open','');this.open=true;};dialogs[i].close=function(){this.removeAttribute('open');this.open=false;};}}
  var progress=3,ready=false,stage=document.getElementById('boot-stage'),percent=document.getElementById('boot-percent');
  var controls=document.createElement('div');controls.className='boot-recovery';controls.hidden=true;
  controls.innerHTML='<p>可以先使用兼容视图浏览，三维资源不会阻挡进入。</p><button id="boot-lite" class="secondary-button">进入兼容视图</button><button id="boot-retry" class="quiet-button">重新加载</button><a href="./lite.html#saturn">打开土星文字资料 ↗</a>';
  document.querySelector('.boot-center').appendChild(controls);
  function set(value,label){progress=Math.max(progress,Math.min(100,Math.round(value)));percent.innerHTML=('00'+progress).slice(-3)+'<span>%</span>';if(label)stage.textContent=label;}
  function recover(message){if(ready)return;controls.hidden=false;stage.textContent=message||'启动较慢，可以先进入兼容视图';}
  window.solarBoot={progress:set,ready:function(){ready=true;clearTimeout(timer);},recover:recover};
  document.getElementById('boot-retry').onclick=function(){var url=new URL(location.href);url.searchParams.set('refresh',Date.now());location.replace(url.href);};
  document.getElementById('boot-lite').onclick=function(){var url=new URL(location.href);url.searchParams.set('lite','1');location.replace(url.href);};
  set(3,'正在启动图谱…');
  var timer=setTimeout(function(){recover('启动等待超过 10 秒，请选择继续方式');},10000);
  window.addEventListener('error',function(event){if(!ready&&event.message)recover('启动遇到兼容问题，可切换兼容视图');});
  window.addEventListener('unhandledrejection',function(){if(!ready)recover('资源暂未就绪，可先使用兼容视图');});
  var script=document.createElement('script');script.src='./assets/app.bundle.js?v=__SOLAR_BUILD_VERSION__';script.async=true;
  script.onerror=function(){recover('程序文件未加载完成，请重试或打开文字资料版');};
  document.head.appendChild(script);
  if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js?v=__SOLAR_BUILD_VERSION__',{scope:'./'}).catch(function(){});
})();
