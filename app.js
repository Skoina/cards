'use strict';
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const POSITIONS = ['此刻狀態','需要看見','下一步'];
const STORE_KEY = 'luca-oracle-journal-v2';
let topicKey='love', questionIndex=0, libraryGroup='all';
let storageAvailable = true, journal = [], readingStage = 'home', drawPhase = 'choose', deck = [], selected = [], active = null, toastTimer;
try {localStorage.setItem('luca-oracle-check','1');localStorage.removeItem('luca-oracle-check');const data=JSON.parse(localStorage.getItem(STORE_KEY)||'[]');if(Array.isArray(data))journal=data.filter(validRecord).slice(0,50);}catch{storageAvailable=false;}
function validRecord(r){return r&&typeof r.id==='string'&&r.id.length<100&&Object.hasOwn(TOPICS,r.topic)&&Number.isInteger(r.questionIndex)&&r.questionIndex>=0&&r.questionIndex<TOPICS[r.topic].questions.length&&Number.isFinite(r.time)&&Array.isArray(r.cards)&&r.cards.length===3&&new Set(r.cards.map(c=>c.id)).size===3&&r.cards.every(c=>Number.isInteger(c.id)&&c.id>=0&&c.id<TAROT.length&&typeof c.rev==='boolean');}
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(journal));return true;}catch{storageAvailable=false;toast('瀏覽器無法保存；你仍可下載這次解讀。');return false;}}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function randomInt(max){if(globalThis.crypto?.getRandomValues){const arr=new Uint32Array(1),limit=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(arr);}while(arr[0]>=limit);return arr[0]%max;}return Math.floor(Math.random()*max);}
function shuffle(items){const out=items.slice();for(let i=out.length-1;i>0;i--){const j=randomInt(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
function formatDate(time){return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(time));}
function cardData(pick){return TAROT[pick.id][pick.rev?'rev':'up'];}
function orientation(pick){return pick.rev?'逆位':'正位';}
function imageCard(pick,caption=true){const c=TAROT[pick.id];return `<img src="${c.img}" alt="${c.name}，${orientation(pick)}" class="${pick.rev?'reversed':''}">${caption?`<span class="card-caption">${c.name}</span>`:''}`;}
function showView(name,focus=true){for(const id of ['home','draw','result','library','journal'])$(id+'View').hidden=id!==name;const nav=['home','draw','result'].includes(name)?'reading':name;document.querySelectorAll('[data-nav]').forEach(b=>{if(!b.closest('nav'))return;b.classList.toggle('active',b.dataset.nav===nav);if(b.dataset.nav===nav)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});if(name==='library')renderLibrary();if(name==='journal')renderJournal();window.scrollTo({top:0,behavior:'instant'});if(focus){const h=$(name+'View').querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}}
document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.nav==='reading'?readingStage:b.dataset.nav)));
$('readingForm').addEventListener('submit',event=>{event.preventDefault();active={id:'reading-'+Date.now()+'-'+randomInt(1000000),time:Date.now(),topic:document.querySelector('input[name="topic"]:checked').value,questionIndex,reversals:$('reversals').checked,cards:[],completed:false};selected=[];drawPhase='choose';readingStage='draw';buildDeck();resetDraw();showView('draw');animateShuffle();});
function buildDeck(){deck=shuffle(TAROT.map(c=>({id:c.id,rev:active.reversals?randomInt(2)===1:false})));$('deckArea').innerHTML=deck.map((_,i)=>`<button class="deck-card" data-deck-index="${i}" style="--i:${i}" aria-label="選擇第 ${i+1} 張牌" aria-pressed="false"><img src="assets/back.webp" alt="" draggable="false"></button>`).join('');$('deckArea').scrollLeft=0;}
function resetDraw(){$('drawTitle').textContent='有些答案，正在靠近。';$('drawSubtitle').textContent='慢慢呼吸，選擇三張讓你停留的牌。';$('drawMessage').innerHTML='汪！不用挑「最好的」牌。<br>選讓你有感覺的，就好。';$('deckArea').hidden=false;document.querySelector('.draw-toolbar').hidden=false;$('deckHint').hidden=false;$('revealButton').hidden=false;$('revealButton').disabled=true;$('interpretButton').hidden=true;$('interpretButton').disabled=true;$('selectionCount').textContent='已選 0 / 3 張';renderSlots();}
async function animateShuffle(){$('shuffleButton').disabled=true;$('deckArea').classList.add('shuffling');await new Promise(r=>setTimeout(r,600));$('deckArea').classList.remove('shuffling');$('shuffleButton').disabled=false;}
$('shuffleButton').addEventListener('click',()=>{if(drawPhase!=='choose')return;selected=[];buildDeck();resetDraw();animateShuffle();toast('牌已重新洗好，慢慢選就好。');});
$('deckArea').addEventListener('click',event=>{const button=event.target.closest('[data-deck-index]');if(!button||drawPhase!=='choose'||$('deckArea').classList.contains('shuffling'))return;const index=Number(button.dataset.deckIndex);const exists=selected.findIndex(p=>p.index===index);if(exists>=0)selected.splice(exists,1);else if(selected.length<3)selected.push({...deck[index],index,visible:false});else{toast('三張已選好；點選已選的牌可重新挑選。');return;}renderSelection();});
function renderSelection(){document.querySelectorAll('.deck-card').forEach((b,i)=>{const order=selected.findIndex(p=>p.index===i);b.classList.toggle('picked',order>=0);b.dataset.order=order>=0?order+1:'';b.setAttribute('aria-pressed',order>=0?'true':'false');b.setAttribute('aria-label',order>=0?`取消第 ${order+1} 張已選牌`:`選擇第 ${i+1} 張牌`);});$('selectionCount').textContent=`已選 ${selected.length} / 3 張`;$('revealButton').disabled=selected.length!==3;renderSlots();}
function renderSlots(){
  $('spreadSlots').innerHTML=POSITIONS.map((position,i)=>{
    const p=selected[i],c=p?TAROT[p.id]:null;
    const label=!p?'':p.visible?`查看${c.name}，${orientation(p)}`:drawPhase==='choose'?`取消第 ${i+1} 張已選牌`:`翻開第 ${i+1} 張牌`;
    return `<li><span class="slot-label"><span class="slot-number">0${i+1}</span>${position}</span><div class="slot-card ${p?'filled':''} ${p?.visible?'revealed':''}">${p?`<button ${p.visible?`data-card-id="${p.id}" data-card-rev="${p.rev}"`:`data-slot="${i}"`} aria-label="${label}"><span class="shown-card">${p.visible?imageCard(p):'<img src="assets/back.webp" alt="塔羅牌背">'}</span></button>`:'<span aria-hidden="true">'+(i+1)+'</span>'}</div><strong class="slot-result-name">${p?.visible?c.name:''}</strong><span class="orientation-tag">${p?.visible?orientation(p):drawPhase==='reveal'&&p?'點一下翻牌':p?'已選，可重新挑選':'等待你的選擇'}</span></li>`;
  }).join('');
}
$('spreadSlots').addEventListener('click',event=>{
  const button=event.target.closest('[data-slot]');if(!button)return;
  const i=Number(button.dataset.slot);
  if(drawPhase==='choose'){selected.splice(i,1);renderSelection();}
  else if(selected[i]&&!selected[i].visible){
    selected[i].visible=true;renderSlots();
    const done=selected.filter(p=>p.visible).length;
    $('drawSubtitle').textContent=done===3?'三張牌都已翻開。卡卡準備好陪你解讀了。':`已翻開 ${done} / 3 張，繼續點選上方牌面。`;
    if(done===3){$('drawTitle').textContent='你的三張牌，已經翻開。';$('interpretButton').disabled=false;$('interpretButton').focus({preventScroll:true});}
    else $('spreadSlots').querySelector('button[data-slot]')?.focus({preventScroll:true});
  }
});
$('revealButton').addEventListener('click',()=>{if(selected.length!==3)return;drawPhase='reveal';active.cards=selected.map(p=>({id:p.id,rev:p.rev}));$('deckArea').hidden=true;document.querySelector('.draw-toolbar').hidden=true;$('deckHint').hidden=true;$('revealButton').hidden=true;$('interpretButton').hidden=false;$('drawTitle').textContent='你的三張牌，等你翻開。';$('drawSubtitle').textContent='依序點選牌面，看看它們想說什麼。';$('drawMessage').innerHTML='汪！正位與逆位都有值得聽的話。<br>我們一張一張，慢慢看。';renderSlots();$('spreadSlots').querySelector('button')?.focus({preventScroll:true});});
$('interpretButton').addEventListener('click',()=>{if(selected.length===3&&selected.every(p=>p.visible)){readingStage='result';renderResult();showView('result');}});
$('backHome').addEventListener('click',()=>{readingStage='home';showView('home');});
function summaryText(r){const [a,b,c]=r.cards;return `「${TAROT[a.id].name}」讓你留意${cardData(a)[0].split('・')[0]}；「${TAROT[b.id].name}」提醒你看看${cardData(b)[0].split('・')[0]}的部分。把兩張牌對照自己的處境，最後用「${TAROT[c.id].name}」的建議，選一個今天能開始的小行動。`;}
function renderResult(){
if(!validRecord(active))return;
const t=TOPICS[active.topic],saved=journal.some(r=>r.id===active.id);
$('resultContent').innerHTML=`
<div class="page-heading"><span class="eyebrow">A MESSAGE JUST FOR THIS MOMENT</span><h1 tabindex="-1">星星的話，卡卡說給你聽。</h1><p>${t.name} · 三張牌的提醒</p></div><p class="reading-date">${formatDate(active.time)} · 台北時間</p>
<div class="question-quote"><small>你選擇的提問</small><p>${selectedQuestion(active)}</p><p class="question-angle">${QUESTION_ANGLES[active.topic][active.questionIndex]}</p></div>
${t.note?`<p class="topic-note">${t.note}</p>`:''}
<div class="result-spread">${active.cards.map((p,i)=>`<button class="result-card" data-card-id="${p.id}" data-card-rev="${p.rev}" aria-label="查看${TAROT[p.id].name}，${orientation(p)}"><span class="slot-label">0${i+1} · ${POSITIONS[i]}</span><span class="image-wrap">${imageCard(p)}</span><strong>${TAROT[p.id].name}</strong><small>${orientation(p)}</small></button>`).join('')}</div><p class="tiny">點選牌面，可以靠近看它的故事。</p>
<div class="dog-message"><img src="assets/reader.webp" alt="卡卡先生"><p>汪！先看看哪一段最像你的心情。<br>帶走一小步，就已經很有力量。</p></div>
<div class="reading-summary"><span class="eyebrow">THE THREAD BETWEEN YOUR CARDS</span><h2>三張牌，連成一個提醒。</h2><p>${summaryText(active)}</p></div>
${active.cards.map((p,i)=>{const c=TAROT[p.id],d=cardData(p);return `<article class="reading-section"><span class="section-kicker">0${i+1} / ${POSITIONS[i]}</span><h3>${c.num} · ${c.name} <small style="font:10px var(--sans);color:var(--muted);letter-spacing:0">${orientation(p)}</small></h3><div class="meaning-tags">${d[0]}</div><p>${i===0?'在「此刻狀態」的位置，這張牌邀請你觀察目前的感受與模式。':i===1?'在「需要看見」的位置，這張牌是一個值得留意的角度，並不表示問題一定存在。':'在「下一步」的位置，這張牌把提醒轉成你可以嘗試的方向。'}</p><h4>這張牌代表什麼</h4><p>${d[1]}</p><p class="topic-lens">${t.name}的思考角度：${topicLens(p,active.topic)}</p><h4>你可以怎麼面對</h4><p>${d[2]}</p><div class="action-box"><b>${t.name}・改善的一小步</b><p>${topicAction(p,active.topic)}</p></div><details class="reading-detail"><summary>再靠近一點：牌面象徵與反思</summary><h4>牌面在說什麼</h4><p>${c.symbol}</p><h4>這個方向怎麼讀</h4><p>${orientationExplanation(p)}</p><div class="reflection-question"><p>${CARD_REFLECTIONS[p.id]}</p></div><h4>回到你選擇的提問</h4><p>「${selectedQuestion(active)}」<br>對照這張牌，辨認一項貼近你的實際經驗；沒有共鳴的部分，可以先保留。</p><a class="source-link" href="${c.source}" target="_blank" rel="noopener">這張牌的牌意參考</a></details></article>`;}).join('')}
<section class="next-step"><span class="eyebrow">ONE SMALL STEP IS ENOUGH</span><h2>今天，先從這件事開始。</h2><p>${topicAction(active.cards[2],active.topic)}</p><label><input type="checkbox" id="actionCheck" ${active.completed?'checked':''}><span>我已完成這個小行動</span></label><p class="soft-note">${selectedQuestion(active)}</p></section>
${rulesMarkup()}
<div class="result-actions"><button class="secondary-button" id="saveReading" ${saved?'disabled':''}>${saved?'已收藏到紀錄':'收藏這次解讀'}</button><button class="secondary-button" id="downloadReading">下載文字解讀</button></div><button class="primary-button" id="newReading">帶著新的心情，再聊一次</button><p class="soft-note">解讀依牌意、主題與點選提問整理，陪你自我對照。<br>牌面是一個思考角度；你的選擇，始終在你手裡。</p>`;
}
document.addEventListener('click',event=>{const card=event.target.closest('[data-card-id]');if(card){openCard(Number(card.dataset.cardId),card.dataset.cardRev==='true');return;}if(event.target.closest('#saveReading'))saveReading();if(event.target.closest('#downloadReading'))downloadReading();if(event.target.closest('#newReading')){readingStage='home';active=null;selected=[];showView('home');}});
document.addEventListener('change',event=>{if(event.target.id==='actionCheck'&&active){active.completed=event.target.checked;const old=journal.find(r=>r.id===active.id);if(old){old.completed=active.completed;persist();}toast(active.completed?'這一小步，值得被看見。':'慢慢來，準備好再開始。');}});
function saveReading(){if(!active||!validRecord(active)||journal.some(r=>r.id===active.id))return;if(!storageAvailable){toast('這個瀏覽器無法保存紀錄；請下載文字解讀。');return;}const candidate={...active,cards:active.cards.map(p=>({...p}))};const old=journal;journal=[candidate,...journal].slice(0,50);if(!persist()){journal=old;return;}$('saveReading').disabled=true;$('saveReading').textContent='已收藏到紀錄';toast('收藏好了。這份提醒，留給未來的你。');}
function readingText(r){const t=TOPICS[r.topic];return `卡卡塔羅屋 · Luca Oracle｜${t.name}\n${formatDate(r.time)}（台北時間）\n提問：${selectedQuestion(r)}\n${t.note||''}\n\n三張牌的提醒\n${summaryText(r)}\n\n`+r.cards.map((p,i)=>{const c=TAROT[p.id],d=cardData(p);return `${i+1}. ${POSITIONS[i]}｜${c.num} ${c.name}（${orientation(p)}）\n${d[0]}\n牌意：${d[1]}\n${t.name}：${topicLens(p,r.topic)}\n面對方式：${d[2]}\n改善的一小步：${topicAction(p,r.topic)}\n牌面象徵：${c.symbol}\n方向解讀：${orientationExplanation(p)}\n反思：${CARD_REFLECTIONS[p.id]}\n參考：${c.source}`;}).join('\n\n')+`\n\n今天先做：${topicAction(r.cards[2],r.topic)}\n完成狀態：${r.completed?'已完成':'尚未勾選完成'}\n\n牌組：本版使用 22 張大阿爾克那。傳統完整偉特系牌組為 78 張（22 大牌＋56 小牌）；本版未含 56 小牌。\n牌位：此刻狀態／需要看見／下一步，三張不重複。逆位不一律是壞消息，正位也不保證好結果。死神象徵結束與轉化，不是死亡預告。\n內容供娛樂與自我探索；不作健康診斷、投資指示或未來保證。`;
}
function downloadReading(){if(!active||!validRecord(active))return;const blob=new Blob(['\ufeff'+readingText(active)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='卡卡塔羅屋-'+new Date(active.time).toISOString().slice(0,10)+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('文字解讀已準備好下載。');}
function renderLibrary(){
const group=CARD_GROUPS[libraryGroup],filtered=group.ids.map(id=>TAROT[id]);
$('cardFilters').innerHTML=Object.entries(CARD_GROUPS).map(([key,g])=>`<button data-card-group="${key}" class="${key===libraryGroup?'active':''}" aria-pressed="${key===libraryGroup}">${g.name}</button>`).join('');
$('libraryCount').textContent=`${group.name} · ${filtered.length} 張牌 · 點選牌面認識正位與逆位`;
$('libraryGrid').innerHTML=filtered.map(c=>`<button class="library-card" data-card-id="${c.id}" aria-label="查看${c.name}的牌意"><span class="image-wrap"><img src="${c.img}" alt="${c.name}的狗狗塔羅牌面" loading="lazy"><span class="card-numeral">${c.num}</span><span class="card-caption">${c.name}</span></span><strong>${c.name}</strong><small>${c.en}</small></button>`).join('');
$('libraryRules').innerHTML=rulesMarkup();
}
$('cardFilters').addEventListener('click',event=>{const button=event.target.closest('[data-card-group]');if(button){libraryGroup=button.dataset.cardGroup;renderLibrary();$('cardFilters').querySelector(`[data-card-group="${libraryGroup}"]`).focus({preventScroll:true});}});
let dialogCard=0,dialogRev=false;
function openCard(id,rev=false){if(!TAROT[id])return;dialogCard=id;dialogRev=rev;renderDialog();$('cardDialog').showModal();}
function renderDialog(){
const c=TAROT[dialogCard],pick={id:dialogCard,rev:dialogRev},d=cardData(pick),topic=active?.topic||topicKey;
$('dialogBody').innerHTML=`<div class="dialog-inner"><div class="dialog-card">${imageCard(pick)}<span class="card-numeral">${c.num}</span></div><h2 id="dialogTitle">${c.name}</h2><div class="dialog-en">${c.en}</div><div class="orientation-switch" role="group" aria-label="選擇牌面方向"><button data-orientation="up" class="${!dialogRev?'active':''}" aria-pressed="${!dialogRev}">正位</button><button data-orientation="rev" class="${dialogRev?'active':''}" aria-pressed="${dialogRev}">逆位</button></div><p style="color:var(--lilac);font-size:11px">${d[0]}</p><h3>這張牌代表什麼</h3><p>${d[1]}</p><h3>${TOPICS[topic].name}的思考角度</h3><p>${topicLens(pick,topic)}</p><h3>你可以怎麼面對</h3><p>${d[2]}</p><div class="action-box"><b>改善的一小步</b><p>${topicAction(pick,topic)}</p></div><h3>方向怎麼讀</h3><p>${orientationExplanation(pick)}</p><p class="dialog-symbol">牌面象徵 · ${c.symbol}</p><div class="reflection-question"><p>${CARD_REFLECTIONS[dialogCard]}</p></div><a href="${c.source}" class="source-link" target="_blank" rel="noopener">閱讀牌意參考 · Labyrinthos</a>${rulesMarkup()}</div>`;
}
$('dialogBody').addEventListener('click',event=>{const button=event.target.closest('[data-orientation]');if(button){dialogRev=button.dataset.orientation==='rev';renderDialog();$('dialogBody').querySelector(`[data-orientation="${dialogRev?'rev':'up'}"]`).focus({preventScroll:true});}});
$('closeDialog').addEventListener('click',()=>$('cardDialog').close());
function renderJournal(){$('storageNote').textContent=storageAvailable?'紀錄只保存在目前的瀏覽器，最多 50 筆。':'這個瀏覽器無法保存紀錄，你可以在解讀頁下載文字。';$('journalList').innerHTML=journal.length?journal.map(r=>`<article class="journal-entry"><header><span>${TOPICS[r.topic].name}</span><time>${formatDate(r.time)}</time></header><p>${selectedQuestion(r)}</p><div class="journal-thumbs">${r.cards.map(p=>imageCard(p,false)).join('')}</div>${r.completed?'<small>已完成這次的小行動</small>':''}<div class="journal-buttons"><button class="text-button" data-journal-open="${escapeHTML(r.id)}">重讀這次解牌</button><button class="delete-entry" data-journal-delete="${escapeHTML(r.id)}">刪除紀錄</button></div></article>`).join(''):`<div class="journal-empty"><img src="assets/back.webp" alt="卡卡塔羅牌背"><h2>故事，還等著你開始。</h2><p>抽完牌後按「收藏這次解讀」，<br>就能把此刻的提醒留在這裡。</p><button class="primary-button" data-go-home>開始一段心的對話</button></div>`;}
$('journalList').addEventListener('click',event=>{const open=event.target.closest('[data-journal-open]'),del=event.target.closest('[data-journal-delete]');if(open){const r=journal.find(r=>r.id===open.dataset.journalOpen);if(r){active={...r,cards:r.cards.map(p=>({...p}))};readingStage='result';renderResult();showView('result');}}if(del&&window.confirm('刪除這筆占卜紀錄？刪除後無法恢復。')){const id=del.dataset.journalDelete,old=journal;journal=journal.filter(r=>r.id!==id);if(persist()){renderJournal();if(active?.id===id)renderResult();toast('這筆紀錄已刪除。');}else journal=old;}if(event.target.closest('[data-go-home]')){readingStage='home';showView('home');}});
function showHelp(){$('helpDialog').showModal();}
$('helpButton').addEventListener('click',showHelp);$('closeHelp').addEventListener('click',()=>$('helpDialog').close());$('helpStart').addEventListener('click',()=>{$('helpDialog').close();readingStage='home';showView('home');$('startButton').focus({preventScroll:true});});
$('learnButton').addEventListener('click',()=>{showView('library');const details=document.querySelector('.about-deck');details.open=true;details.scrollIntoView({behavior:'smooth',block:'center'});});
[$('cardDialog'),$('helpDialog')].forEach(d=>d.addEventListener('click',event=>{if(event.target===d){const rect=d.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)d.close();}}));
function selectedQuestion(r){return TOPICS[r.topic].questions[r.questionIndex]||TOPICS[r.topic].questions[0];}
function renderTopics(){
  $('topicOptions').innerHTML='<legend class="sr-only">占卜主題</legend>'+Object.entries(TOPICS).map(([key,t])=>`<label class="topic"><input type="radio" name="topic" value="${key}" ${topicKey===key?'checked':''}><span><b>${t.name}</b><small>${t.subtitle}</small></span></label>`).join('');
  renderQuestions();
}
function renderQuestions(){const t=TOPICS[topicKey];$('promptOptions').innerHTML='<legend>想問卡卡哪件事？</legend>'+t.questions.map((q,i)=>`<label class="prompt-choice"><input type="radio" name="prompt" value="${i}" ${i===questionIndex?'checked':''}><span>${q}</span></label>`).join('');}
$('readingForm').addEventListener('change',event=>{if(event.target.name==='topic'){topicKey=event.target.value;questionIndex=0;renderQuestions();}if(event.target.name==='prompt')questionIndex=Number(event.target.value);});
renderTopics();renderLibrary();renderJournal();
