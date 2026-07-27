(()=>{
const dictionaries={
 en:{},
 tr:{
  'Services':'Hizmetler','Accounts':'Hesaplar','Calculator':'Hesaplayıcı','How it works':'Nasıl çalışır','Feedback':'Geri Bildirim','FAQ':'SSS','Join Discord':'Discord’a Katıl',
  'Browse live accounts':'Mevcut hesaplara göz at','Calculate a service':'Hizmet hesapla','One team. Every OSRS service.':'Tek ekip. Tüm OSRS hizmetleri.',
  'Available accounts':'Mevcut hesaplar','Recently sold':'Yakın zamanda satılanlar','Another account found its new owner.':'Bir hesap daha yeni sahibini buldu.',
  'How it works.':'Nasıl çalışır.','Feedback & vouches.':'Geri bildirim ve referanslar.','Frequently asked questions.':'Sık sorulan sorular.',
  'Ready to build the order?':'Siparişini oluşturmaya hazır mısın?','Open Discord':'Discord’u Aç','Visit SellApp':'SellApp’i Ziyaret Et',
  'Live support':'Canlı destek','AI + human':'Yapay zekâ + insan','Buy securely':'Güvenle satın al','Reserve on Discord':'Discord’da ayırt','Buy through Discord':'Discord üzerinden satın al',
  'Ask about similar accounts':'Benzer hesapları sor','Sold':'Satıldı','All':'Tümü','Zerker':'Zerker','Med Main':'Med Main','Pure':'Pure','Skiller':'Skiller'
 },
 nl:{
  'Services':'Diensten','Accounts':'Accounts','Calculator':'Calculator','How it works':'Hoe het werkt','Feedback':'Feedback','FAQ':'FAQ','Join Discord':'Word lid van Discord',
  'Browse live accounts':'Bekijk beschikbare accounts','Calculate a service':'Bereken een dienst','One team. Every OSRS service.':'Eén team. Elke OSRS-dienst.',
  'Available accounts':'Beschikbare accounts','Recently sold':'Recent verkocht','Another account found its new owner.':'Weer een account heeft een nieuwe eigenaar.',
  'How it works.':'Hoe het werkt.','Feedback & vouches.':'Feedback en vouches.','Frequently asked questions.':'Veelgestelde vragen.',
  'Ready to build the order?':'Klaar om je bestelling samen te stellen?','Open Discord':'Open Discord','Visit SellApp':'Bezoek SellApp',
  'Live support':'Live ondersteuning','AI + human':'AI + mens','Buy securely':'Veilig kopen','Reserve on Discord':'Reserveren via Discord','Buy through Discord':'Kopen via Discord',
  'Ask about similar accounts':'Vraag naar vergelijkbare accounts','Sold':'Verkocht','All':'Alles','Zerker':'Zerker','Med Main':'Med Main','Pure':'Pure','Skiller':'Skiller'
 }};
const original=new WeakMap();
function translateTextNode(node,lang){const raw=original.get(node)??node.nodeValue;original.set(node,raw);const key=raw.trim();if(!key)return;const value=dictionaries[lang]?.[key]||key;node.nodeValue=raw.replace(key,value)}
function apply(lang){document.documentElement.lang=lang;localStorage.setItem('salesman_language',lang);document.querySelector('#languageButton')?.replaceChildren(document.createTextNode('🌐 '+lang.toUpperCase()));const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>['SCRIPT','STYLE','OPTION'].includes(n.parentElement?.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while(n=walker.nextNode())translateTextNode(n,lang);window.dispatchEvent(new CustomEvent('salesman:language',{detail:{lang}}))}
window.SalesmanLanguages={apply};
document.addEventListener('DOMContentLoaded',()=>{const btn=document.querySelector('#languageButton'),menu=document.querySelector('#languageMenu');btn?.addEventListener('click',(event)=>{event.stopPropagation();const isOpen=menu?.classList.toggle('open');btn.setAttribute('aria-expanded',String(Boolean(isOpen)))});document.querySelectorAll('[data-language]').forEach(x=>x.addEventListener('click',()=>{apply(x.dataset.language);menu?.classList.remove('open');btn?.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(!e.target.closest('.language-picker')){menu?.classList.remove('open');btn?.setAttribute('aria-expanded','false')}});apply(localStorage.getItem('salesman_language')||'en')});
})();