const params=new URLSearchParams(location.search);const accountId=params.get('account');let poll;let countdownTimer;let orderToken='';
function statusLabel(d){if(d.deliveryStatus==='sent')return'Credentials delivered by email.';if(d.deliveryStatus==='failed')return'Payment confirmed, but email delivery needs admin attention.';if(d.paymentStatus==='confirmed')return'Payment confirmed — preparing automatic email delivery.';if(d.paymentStatus==='detected')return`Payment detected (${d.confirmations||0}/1 confirmation).`;if(d.paymentStatus==='expired')return'Order expired. The account reservation was released.';return`Waiting for payment… (${d.confirmations||0}/1 confirmation)`}
async function refreshOrder(id){const q=orderToken?`?token=${encodeURIComponent(orderToken)}`:'';const r=await fetch('/api/checkout/order/'+encodeURIComponent(id)+q);const d=await r.json();const status=document.querySelector('#paymentStatus');if(!status)return;if(!r.ok){status.textContent=d.error||'Could not refresh order status.';return}status.textContent=statusLabel(d);if(['paid','completed','expired'].includes(d.status)){clearInterval(poll);if(d.deliveryStatus==='sent')status.classList.add('paid')}}
async function copyText(value,button){try{await navigator.clipboard.writeText(value);const old=button.textContent;button.textContent='✓ Copied';button.classList.add('copied');setTimeout(()=>{button.textContent=old;button.classList.remove('copied')},1600)}catch{prompt('Copy this value:',value)}}
function startCountdown(expiresAt){clearInterval(countdownTimer);const el=document.querySelector('#expiresCountdown');const update=()=>{if(!el)return;const ms=Math.max(0,Date.parse(expiresAt)-Date.now());const total=Math.floor(ms/1000);const m=String(Math.floor(total/60)).padStart(2,'0');const s=String(total%60).padStart(2,'0');el.textContent=`${m}:${s}`;if(ms<=0){clearInterval(countdownTimer);el.textContent='Expired'}};update();countdownTimer=setInterval(update,1000)}
const fallbackPaymentMethods=[
  {id:'btc',name:'Bitcoin',icon:'₿',enabled:true,recommended:true,mode:'automatic'},
  {id:'ltc',name:'Litecoin',icon:'Ł',enabled:true,recommended:false,mode:'automatic'}
];
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function normalizePaymentMethods(value){
  if(!Array.isArray(value))return fallbackPaymentMethods;
  const methods=value.filter(m=>m&&m.enabled!==false&&m.id&&m.name).map(m=>({
    id:String(m.id),name:String(m.name),icon:String(m.icon||'💳'),recommended:Boolean(m.recommended),mode:m.mode==='manual'?'manual':'automatic'
  }));
  return methods.length?methods:fallbackPaymentMethods;
}
function renderPaymentMethods(methods,usedFallback=false){
  const holder=document.querySelector('#paymentMethods');
  if(!holder)return;
  holder.innerHTML=methods.map((m,i)=>`<label class="coin"><input type="radio" name="payment" value="${escapeHtml(m.id)}" ${i===0?'checked':''}><span>${escapeHtml(m.icon)} ${escapeHtml(m.name)}${m.recommended?' · Recommended':''}<small>${m.mode==='automatic'?'Automatic confirmation':'Manual confirmation'}</small></span></label>`).join('')+(usedFallback?'<small class="payment-fallback-note">Bitcoin and Litecoin are available. Custom payment options could not be refreshed; checkout remains operational.</small>':'');
  document.querySelector('#submit').disabled=false;
}
async function loadProduct(){
  const el=document.querySelector('#product');
  const holder=document.querySelector('#paymentMethods');
  if(!accountId){el.textContent='No account selected.';document.querySelector('#checkoutForm').hidden=true;return}
  try{
    const r=await fetch('/api/site-data',{cache:'no-store'});
    if(!r.ok)throw new Error(`Site data request failed (${r.status})`);
    const d=await r.json();
    const a=(Array.isArray(d.accounts)?d.accounts:[]).find(x=>String(x.id)===String(accountId));
    if(!a||a.status!=='available'){el.textContent='This account is unavailable.';document.querySelector('#checkoutForm').hidden=true;return}
    if(a.saleMethod==='discord'){location.href=d.settings?.discord||'https://discord.gg/xDSvKT3ThQ';return}
    el.innerHTML=`<strong>${escapeHtml(a.title)}</strong><span>$${Number(a.price||0).toFixed(2)} USD</span>`;
    const rawMethods=d.paymentMethods;
    const methods=normalizePaymentMethods(rawMethods);
    renderPaymentMethods(methods,!Array.isArray(rawMethods)||!rawMethods.length);
  }catch(error){
    console.error('Checkout data load failed:',error);
    if(el.textContent==='Loading account…')el.textContent='Account selected. Payment options are available below.';
    renderPaymentMethods(fallbackPaymentMethods,true);
  }
}
renderPaymentMethods(fallbackPaymentMethods);
loadProduct();
document.querySelector('#checkoutForm').addEventListener('submit',async e=>{e.preventDefault();const btn=document.querySelector('#submit');btn.disabled=true;btn.textContent='Creating order…';const selectedPayment=document.querySelector('input[name=payment]:checked');if(!selectedPayment){alert('Choose a payment method.');btn.disabled=false;btn.textContent='Create order & reserve account';return}const body={accountId,email:document.querySelector('#email').value,discord:document.querySelector('#discord').value,paymentMethod:selectedPayment.value};const r=await fetch('/api/checkout/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const d=await r.json();btn.disabled=false;btn.textContent='Create order & reserve account';if(!r.ok){alert(d.error||'Could not create order');return}orderToken=d.publicToken||'';document.querySelector('#checkoutForm').hidden=true;const result=document.querySelector('#result');result.hidden=false;const statusUrl=d.statusUrl||`/order?order=${encodeURIComponent(d.orderId)}&token=${encodeURIComponent(orderToken)}`;const automatic=d.paymentMode==='automatic';const amount=automatic?`${Number(d.cryptoAmount).toFixed(8)} ${d.paymentMethod}`:`$${Number(d.uniqueAmountUsd).toFixed(2)} USD`;const paymentPanel=automatic?`<p>Send the <b>exact amount</b> below:</p><div class="copy-row"><div class="crypto-amount">${amount}</div><button class="copy-button" type="button" data-copy="${amount}">Copy amount</button></div><div class="copy-row"><div class="wallet">${d.paymentAddress}</div><button class="copy-button" type="button" data-copy="${d.paymentAddress}">Copy address</button></div><div class="exact-warning"><strong>⚠ Important</strong>Send the exact amount shown. Sending a different amount may delay automatic payment detection.</div>`:`<div class="delivery-confirm"><strong>${d.paymentMethodName||d.paymentMethod}</strong><p>${d.paymentInstructions||'Follow the payment details below, then contact support for confirmation.'}</p></div><div class="copy-row"><div class="wallet">${d.paymentAddress||'Contact Discord for payment details'}</div>${d.paymentAddress?`<button class="copy-button" type="button" data-copy="${d.paymentAddress}">Copy details</button>`:''}</div><p>Amount due: <b>${amount}</b></p>`;result.innerHTML=`<div class="order-box"><h2 class="success-title">🎉 Order Created!</h2><div class="copy-row"><div class="order-id-value">${d.orderId}</div><button class="copy-button" type="button" data-copy="${d.orderId}">Copy order ID</button></div><div class="success-checks"><span>✓ Account reserved</span><span>✓ ${automatic?'Waiting for blockchain payment':'Waiting for manual payment confirmation'}</span><span>✓ Credentials are emailed after payment is confirmed</span></div><div class="expires-panel"><span>Order expires in</span><b id="expiresCountdown">30:00</b></div>${paymentPanel}<p id="paymentStatus">${automatic?'Waiting for payment… (0/1 confirmation)':'Waiting for manual confirmation…'}</p><p><a class="status-link" href="${statusUrl}">Open your live order status page</a></p><p>Save the order-status link. You may close checkout and return to it later.</p></div>`;result.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>copyText(b.dataset.copy,b)));history.replaceState(null,'',statusUrl);startCountdown(d.expiresAt);refreshOrder(d.orderId);poll=setInterval(()=>refreshOrder(d.orderId),15000);});
