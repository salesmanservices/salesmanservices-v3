(()=>{
function track(name,details={}){const payload={event:name,path:location.pathname,language:document.documentElement.lang||'en',ts:new Date().toISOString(),...details};window.gtag?.('event',name,details);try{navigator.sendBeacon?.('/api/event',new Blob([JSON.stringify(payload)],{type:'application/json'}))}catch{};console.debug('[Salesman analytics]',payload)}
window.salesmanTrack=track;
document.addEventListener('click',e=>{const link=e.target.closest('a,button');if(!link)return;const href=link.getAttribute('href')||'';let event=link.dataset.track;if(!event&&href.includes('discord.gg'))event='discord_click';if(!event&&href.includes('sell.app'))event='store_click';if(!event&&href.includes('sythe.org'))event='vouch_click';if(!event&&link.closest('.account-card'))event='account_interaction';if(event)track(event,{label:(link.textContent||'').trim().slice(0,100),href})});
document.addEventListener('change',e=>{if(e.target.closest('#calculator'))track('calculator_interaction',{field:e.target.id||e.target.name||e.target.tagName})});
window.addEventListener('salesman:language',e=>track('language_change',{selected:e.detail.lang}));
})();