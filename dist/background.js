({3441:function(){var e=this&&this.__awaiter||function(e,o,r,t){return new(r||(r=Promise))((function(n,s){function c(e){try{a(t.next(e))}catch(e){s(e)}}function i(e){try{a(t.throw(e))}catch(e){s(e)}}function a(e){var o;e.done?n(e.value):(o=e.value,o instanceof r?o:new r((function(e){e(o)}))).then(c,i)}a((t=t.apply(e,o||[])).next())}))};const o="https://api.netproxy.io/api/rotateProxy";let r=null,t="all",n="all";const s=(o,r,t)=>e(this,void 0,void 0,(function*(){chrome.runtime.sendMessage({command:o,message:r,config:t},(function(e){}))})),c=e=>{chrome.alarms.clear(e)};c("refreshPage");const i=o=>e(this,void 0,void 0,(function*(){const e=o.data.proxy,[r,t]=(o.data.newTab,e.split(":"));if(!r||!t)return void s("getProxyFailed",{error:"Thông tin proxy không hợp lệ!"},{});const n={mode:"fixed_servers",rules:{singleProxy:{scheme:"http",host:r,port:parseInt(t)},bypassList:["*netproxy.io, localhost ,127.0.0.1"]}};console.log("config",n),p(n)})),a=e=>new Promise(((o,r)=>{setTimeout(o,e)}));let l=!1,d=null;const u=r=>e(this,void 0,void 0,(function*(){try{const{timeRefresh:c,apiKey:u,country:h,type:p,isAutoRefresh:y,isConnected:g}=r.data;if(t=h,n=p,d&&(console.log("Stopping current worker..."),l=!0,yield d,d=null),l=!1,!y&&!g)return void s("autoChangeIpFailed",{error:"Auto-change proxy is disabled."},{});if(y&&c>0){let r=c;d=(()=>e(this,void 0,void 0,(function*(){for(;!l;){if(yield a(1e3),0===r){const e=new URL(`${o}/getNewProxy`),t={apiKey:u,country:"all"===h?void 0:h,type:"all"===p?void 0:p};Object.keys(t).forEach((o=>t[o]&&e.searchParams.append(o,t[o])));const n=yield fetch(e.toString(),{method:"GET"}),s=yield n.json();s&&(console.log("New proxy:",s),i(s),chrome.runtime.sendMessage({type:"proxy_autoChangeIp_result",data:s}),r=c)}r--,chrome.runtime.sendMessage({type:"proxy_autoChangeIp_countdown",data:r})}console.log("Worker stopped.")})))(),d.catch((e=>{console.error("Worker error:",e)}))}else l=!0,d=null,console.log("Auto-change proxy stopped.")}catch(e){console.error("Error when startThreadAutoChangeProxy:",e)}})),h=()=>{l=!0,d&&(console.log("Stopping worker..."),d=null)};chrome.alarms.onAlarm.addListener((function(o){return e(this,void 0,void 0,(function*(){o.name}))})),chrome.runtime.onMessage.addListener(((o,t,n)=>e(this,void 0,void 0,(function*(){switch(o.type){case"proxy_connect":y(),i(o);break;case"proxy_change":i(o);break;case"proxy_disconnect":c("flagLoop"),c("refreshPage"),chrome.proxy.settings.set({value:{mode:"direct"},scope:"regular"},(()=>{console.log("Proxy has been reset to direct connection.")})),y(),h();break;case"proxy_autoChangeIp":u(o);break;case"proxy_stopAutoChangeIp":h();break;case"setApiKey":r=o.data.apiKey;break;default:console.error("do nothing with this request")}}))));const p=e=>{chrome.action.setBadgeBackgroundColor({color:"#D6EBDC"}),chrome.action.setBadgeText({text:"ON"}),chrome.action.setBadgeTextColor({color:"#28c76f"}),chrome.proxy.settings.set({value:e,scope:"regular"})},y=()=>{chrome.action.setBadgeBackgroundColor({color:[162,36,36,255]}),chrome.action.setBadgeText({text:""}),chrome.proxy.settings.set({value:{mode:"direct"},scope:"regular"}),chrome.storage.sync.set({tx_proxy:null})},g=()=>e(this,void 0,void 0,(function*(){return new Promise(((e,o)=>{chrome.storage.local.get("apiKey",(r=>{console.log("result",r),chrome.runtime.lastError?o(chrome.runtime.lastError):(console.log("Fetched API Key:",r.apiKey),e(r.apiKey))}))}))})),m=()=>e(this,void 0,void 0,(function*(){return new Promise(((e,o)=>{chrome.storage.local.get("location",(r=>{console.log("result",r),chrome.runtime.lastError?o(chrome.runtime.lastError):(console.log("Fetched Location:",r.location),e(r.location))}))}))})),f=()=>e(this,void 0,void 0,(function*(){return new Promise(((e,o)=>{chrome.storage.local.get("type",(r=>{console.log("result",r),chrome.runtime.lastError?o(chrome.runtime.lastError):(console.log("Fetched type:",r.type),e(r.type))}))}))})),x=()=>e(this,void 0,void 0,(function*(){const e=new URL(`${o}/getNewProxy`),s=yield g(),c=yield m(),l=yield f();let d=null;const u={apiKey:s||r,country:c||t,type:l||n};Object.keys(u).forEach((o=>u[o]&&e.searchParams.append(o,u[o])));let h=!1;for(;!h;){try{const o=yield fetch(e.toString(),{method:"GET"}),r=yield o.json();r&&r.data&&r.data.proxy?(console.log("New proxy fetched:",r.data.proxy),yield i(r),h=!0,d=r.data):console.error("Failed to fetch new proxy: Invalid response format")}catch(e){console.error("Error fetching new proxy, retrying...",e)}h||(yield a(1e4))}return d})),v=()=>e(this,void 0,void 0,(function*(){const e=yield x();return{username:e.username,password:e.password}}));v(),chrome.webRequest.onAuthRequired.addListener((function(o){return e(this,void 0,void 0,(function*(){const{username:e,password:o}=yield v();return e&&o?(console.log("Using cached credentials for proxy authentication..."),{authCredentials:{username:e,password:o}}):(console.error("No cached credentials found. Please re-fetch proxy credentials."),{cancel:!0})}))}),{urls:["<all_urls>"]},["blocking"]),chrome.webRequest.onErrorOccurred.addListener((function(o){return e(this,void 0,void 0,(function*(){"net::ERR_PROXY_CONNECTION_FAILED"===o.error&&(console.log("Proxy connection failed, fetching a new proxy..."),yield x())}))}),{urls:["<all_urls>"]})}})[3441]();