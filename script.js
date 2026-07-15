import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js";

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SAVE_VERSION=5, STORE_KEY='box_appraisal_connected_v5', LEGACY_KEYS=['box_appraisal_connected_v4','box_appraisal_connected_v1'];
const MAX_BOXES=15, DAY_TARGET=8;
const GRADE_TOTAL_REWARDS=[300,450,650,900,1200];
const riskLabel={safe:'안전',warning:'주의',danger:'위험'};
const categoryKeys=['mimic','treasure','explosive','junk'];
const categoryEnglish={mimic:'CREATURE',treasure:'TREASURE',explosive:'EXPLOSIVE',junk:'JUNK'};
const chestNames=['나무 상자','은 상자','금 상자','다이아 상자','봉인된 상자'];
const purchaseTypes={
  standard:{label:'일반 입고',price:200,weights:[42,28,17,9,4],note:'모든 등급이 고르게 섞입니다.'},
  safe:{label:'안전 입고',price:280,weights:[55,30,12,3,0],note:'1~3성 위주로 들어옵니다.'},
  premium:{label:'고급 입고',price:520,weights:[4,12,30,34,20],note:'3~5성 확률이 높습니다.'},
  seized:{label:'압류품 입고',price:150,weights:[48,28,15,7,2],note:'저렴하지만 위험 물품 비율이 높습니다.',riskBoost:true},
  auction:{label:'미확인 경매',price:350,weights:[20,20,20,20,20],note:'등급과 내용이 완전 무작위입니다.'}
};
const rewardForGrade=grade=>{const total=GRADE_TOTAL_REWARDS[Math.max(0,Math.min(4,grade))];return{total,category:Math.floor(total/2),risk:Math.ceil(total/2)}};
const palettes=[
 {body:0x765437,panel:0x8a6442,trim:0x373633,accent:0x9e7b52,m:.08,r:.82},
 {body:0x6d7478,panel:0x858b8e,trim:0xb1b4b4,accent:0x494f52,m:.72,r:.34},
 {body:0x96691e,panel:0xaf812c,trim:0xd0a244,accent:0x39352f,m:.65,r:.34},
 {body:0x3f7580,panel:0x548994,trim:0x83b1b8,accent:0x29454b,m:.54,r:.29},
 {body:0x28272a,panel:0x343237,trim:0x555158,accent:0x71586e,m:.46,r:.42}
];

const itemCatalog={
      mimic:{
        label:'생물',
        items:[
          {name:'슈뢰딩거의 고양이(적응)',description:'후루베 유라유라..',risk:'danger'},
          {name:'코가 긴 길고양이',description:'다라이가 살벌하기 짝이 없습니다',risk:'danger'},
          {name:'담배피는 고양이',description:'호흡기 질환을 유발합니다',risk:'danger'},
          {name:'드래곤',description:'멋있습니다',risk:'danger'},
          {name:'짱룡',description:'테무에서 나왔습니다',risk:'danger'},
          {name:'북극곰',description:'북극이 녹아내릴 때까지',risk:'warning'},
          {name:'마즈',description:'말레이고오옴',risk:'warning'},
          {name:'보노보',description:'거꾸로 해도 보노보',risk:'warning'},
          {name:'성인 남성',description:'왜 들어가 계십니까',risk:'warning'},
          {name:'개발자',description:'나 진짜 팔 거야..?',risk:'warning'},
          {name:'아트팀',description:'살려주세요',risk:'safe'},
          {name:'자라나는 금덩이',description:'쑥쑥 잘 자랍니다',risk:'safe'},
          {name:'슬라임',description:'끄..ㄴ..ㅈ..ㅓ..ㄱ',risk:'safe'},
          {name:'세상에서 가장 귀여운 고양이',description:'귀엽습니다',risk:'safe'},
          {name:'슈뢰딩거의 고양이(생존)',description:'하지만 살았죠?',risk:'safe'}
        ]
      },
      treasure:{
        label:'귀중품',
        items:[
          {name:'수상한 책',description:'수상합니다',risk:'danger'},
          {name:'상속인이 얽힌 집문서',description:'법정의 늪으로',risk:'danger'},
          {name:'하얀색 가루',description:'기분이 좋아집니다',risk:'danger'},
          {name:'콘솔 게임기',description:'사막에서 파헤쳤습니다',risk:'danger'},
          {name:'낡은 왕관',description:'왕은 없지만 왕관은 남았습니다',risk:'danger'},
          {name:'순금 명함',description:'주인을 알 수 없습니다',risk:'warning'},
          {name:'검은 진주',description:'빛을 삼키는 색입니다',risk:'warning'},
          {name:'고장 난 회중시계',description:'시간보다 값이 더 갑니다',risk:'warning'},
          {name:'봉인된 우표첩',description:'편지보다 오래 살아남았습니다',risk:'warning'},
          {name:'오래된 주식 증서',description:'종이 한 장에 희망이 붙어 있습니다',risk:'warning'},
          {name:'출처불명 금덩어리',description:'한때 다른 금덩이의 일부였습니다',risk:'safe'},
          {name:'금화',description:'금으로 만든 화폐입니다',risk:'safe'},
          {name:'가짜처럼 보이는 진짜 다이아몬드',description:'실험실에서 만들어졌습니다',risk:'safe'},
          {name:'비싼 술',description:'언제 마셔도 나쁘지 않습니다',risk:'safe'},
          {name:'두바이쫀득쿠키',description:'쫀득하고 바삭합니다',risk:'safe'}
        ]
      },
      explosive:{
        label:'폭발물',
        items:[
          {name:'알라의 요술봉',description:'붉은 모래, 검은 금',risk:'danger'},
          {name:'뚱뚱한 청년',description:'그림자가 먼저 도착합니다',risk:'danger'},
          {name:'작은 소년',description:'작지만 결코 가볍지 않습니다',risk:'danger'},
          {name:'빨간 풍선 99개',description:'너를 생각하며 날려보낼래',risk:'danger'},
          {name:'거꾸로 가는 시계',description:'시계아닌데~~시계아닌데~~',risk:'danger'},
          {name:'빨간 버튼',description:'보드게임 카페입니다',risk:'warning'},
          {name:'압력식 광산용 뇌관',description:'밟지 않아도 조심하세요',risk:'warning'},
          {name:'다이너마이트',description:'하나, 둘, 셋, 발파!',risk:'warning'},
          {name:'화약 꾸러미',description:'불씨를 가까이하지 마세요',risk:'warning'},
          {name:'LPG가스통',description:'서늘한 곳에 보관하세요',risk:'warning'},
          {name:'불붙은 폭죽',description:'이미 늦었을 수도 있습니다',risk:'safe'},
          {name:'보조 배터리',description:'때때로 터지기도 합니다',risk:'safe'},
          {name:'터질 듯한 풍선',description:'바늘 하나면 끝입니다',risk:'safe'},
          {name:'멘토스와 콜라',description:'조합법이 너무 유명합니다',risk:'safe'},
          {name:'흔들어진 콜라',description:'끈적하고 달콤합니다',risk:'safe'}
        ]
      },
      junk:{
        label:'잡동사니',
        items:[
          {name:'핵폐기물',description:'대체 왜 여기에 있는거죠?',risk:'danger'},
          {name:'끊어진 이어폰',description:'한쪽만 들리던 시절도 끝났습니다',risk:'danger'},
          {name:'빈 통조림',description:'안에는 추억도 없습니다',risk:'danger'},
          {name:'젖은 양말',description:'원인을 알고 싶지 않습니다',risk:'danger'},
          {name:'깨진 우산',description:'비보다 바람에게 졌습니다',risk:'danger'},
          {name:'낡은 리모컨',description:'어느 기기의 것인지 모릅니다',risk:'warning'},
          {name:'단추 한 통',description:'짝을 잃은 것들입니다',risk:'warning'},
          {name:'구겨진 영수증',description:'기억나지 않는 소비의 기록',risk:'warning'},
          {name:'바퀴 하나 없는 의자',description:'앉는 순간 결심하게 됩니다',risk:'warning'},
          {name:'빈 액자',description:'가장 중요한 것이 없습니다',risk:'warning'},
          {name:'고장 난 토스터',description:'빵보다 연기가 먼저 나옵니다',risk:'safe'},
          {name:'정체불명의 케이블',description:'버리면 다음 날 필요해집니다',risk:'safe'},
          {name:'OMR 카드',description:'각자의 이야기가 담긴 수십만의 꿈',risk:'safe'},
          {name:'연필깎이',description:'끝을 뾰족하게 만듭니다',risk:'safe'},
          {name:'일회용 귀마개',description:'언제 어디서나 편안하게',risk:'safe'}
        ]
      }
    };

const defaultState=()=>({
 version:SAVE_VERSION,money:1000,boxes:[],collection:{},favorites:{},excluded:{},tutorialDone:false,
 day:{number:1,processed:0,perfect:0,partial:0,failed:0,earned:0,toolsUsed:0,bestStreak:0},streak:0,bestStreak:0,
 inspection:{boxId:null,usedTools:[],clues:[],categoryGuess:'unknown',riskGuess:'unknown',resolved:false},
 settings:{sound:true},currentScreen:'main'
});
function migrate(raw){
 const base=defaultState(); if(!raw||typeof raw!=='object')return base;
 const out={...base,...raw,version:SAVE_VERSION};
 out.boxes=Array.isArray(raw.boxes)?raw.boxes:[]; out.collection=raw.collection||{};out.favorites=raw.favorites||{};out.excluded=raw.excluded||{};
 out.day={...base.day,...(raw.day||{})};out.inspection={...base.inspection,...(raw.inspection||{})};out.settings={...base.settings,...(raw.settings||{})};
 return out;
}
function storageGet(key){try{return window.localStorage.getItem(key)}catch(error){console.warn('저장 데이터를 읽지 못했습니다.',error);return null}}
function storageSet(key,value){try{window.localStorage.setItem(key,value);return true}catch(error){console.warn('저장 데이터를 기록하지 못했습니다.',error);return false}}
function storageRemove(key){try{window.localStorage.removeItem(key)}catch(error){console.warn('저장 데이터를 삭제하지 못했습니다.',error)}}
function loadState(){
 for(const key of [STORE_KEY,...LEGACY_KEYS]){
  try{
   const stored=storageGet(key);if(!stored)continue;
   const raw=JSON.parse(stored);if(raw){const migrated=migrate(raw);storageSet(STORE_KEY,JSON.stringify(migrated));return migrated}
  }catch(error){console.warn('저장 데이터 변환에 실패했습니다.',error)}
 }
 return defaultState();
}
let state=loadState();
const money=v=>`${Math.round(v).toLocaleString('ko-KR')} G`, pick=a=>a[Math.floor(Math.random()*a.length)], rint=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function weightedValues(values,weights){let t=weights.reduce((a,b)=>a+b,0),r=Math.random()*t;for(let i=0;i<values.length;i++){r-=weights[i];if(r<=0)return values[i]}return values.at(-1)}
function saveState(){state.version=SAVE_VERSION;storageSet(STORE_KEY,JSON.stringify(state));updateGlobalUI()}
function itemKey(content,index){return `${content}:${index}`}
function currentItem(box){return itemCatalog[box.content]?.items[box.itemIndex]||itemCatalog.mimic.items[0]}
function gradeStars(g){return '★'.repeat(g+1)+'☆'.repeat(4-g)}
function discoveredCount(){return Object.keys(state.collection).length}

// deterministic item metadata: each entry gets distinct tags and clue phrasing without adding new content entries
const categoryMeta={
 mimic:{tags:['생체','움직임','체온'],weight:['무게 중심이 스스로 이동합니다.','규칙적이지 않은 생체 움직임이 측정됩니다.'],temperature:['체온성 열원이 확인됩니다.','내부 온도가 움직임에 따라 변합니다.'],scan:['관절 또는 유연한 생체 구조가 보입니다.'],reagent:['생체 단백질 반응이 나타납니다.']},
 treasure:{tags:['가치','가공','보존'],weight:['작고 밀도 높은 물체가 안정적으로 놓여 있습니다.','무게 중심이 거의 움직이지 않습니다.'],temperature:['외부와 비슷한 안정된 온도입니다.'],scan:['가공된 모서리와 규칙적인 형태가 보입니다.'],reagent:['금속·종이·보존 성분 중 하나가 검출됩니다.']},
 explosive:{tags:['반응성','압력','점화'],weight:['고밀도 내용물이 한쪽에 집중돼 있습니다.'],temperature:['일부 지점에서 미세한 열 변화가 반복됩니다.'],scan:['선·용기·압축 물질이 조합된 형태입니다.'],reagent:['연소성 또는 급격한 반응성 물질이 검출됩니다.']},
 junk:{tags:['혼합','마모','불규칙'],weight:['여러 물체의 무게가 불규칙하게 섞여 있습니다.'],temperature:['특별한 열 변화가 없습니다.'],scan:['서로 다른 용도의 물건이 겹쳐 있습니다.'],reagent:['먼지·녹·합성수지 성분이 섞여 나옵니다.']}
};
function hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function itemTags(content,item,index){const h=hash(item.name);const extras=['가벼움','고밀도','원통형','평평함','액체','섬유','금속','유기물','불규칙','밀봉'];return [...categoryMeta[content].tags,extras[(h+index)%extras.length],extras[(h+index*3+2)%extras.length]]}
function clueFor(tool,box){
 const item=currentItem(box),meta=categoryMeta[box.content],tags=itemTags(box.content,item,box.itemIndex),grade=box.grade;
 const specificity=Math.max(0,2-Math.floor(grade/2));
 const unique={
  weight:`${tags[3]} 성질이 두드러지고 ${meta.weight[hash(item.name)%meta.weight.length]}`,
  temperature:`${meta.temperature[0]} ${tags[4]} 계열 특징이 약하게 남습니다.`,
  scan:`${meta.scan[0]} 윤곽은 ${item.name.length%2?'길고 좁은':'짧고 넓은'} 편입니다.`,
  reagent:`${meta.reagent[0]} ${tags[3]} 반응이 함께 나타납니다.`,
  surface:{danger:'안쪽에서 바깥으로 향한 깊은 긁힘과 강한 충격 흔적이 반복됩니다.',warning:'얕은 긁힘과 마찰 자국이 여러 방향으로 남아 있습니다.',safe:'큰 손상은 없고 가벼운 눌림만 확인됩니다.'}[box.risk],
  seal:{danger:'고위험 화물용 이중 봉인과 압력 경고 표시가 사용됐습니다.',warning:'표준 봉인에 보조 잠금이 하나 추가돼 있습니다.',safe:'일반 운송용 봉인이 손상 없이 유지됩니다.'}[box.risk]
 };
 if(grade<=1)return unique[tool];
 if(grade===2)return unique[tool].replace(item.name,'내용물');
 const vague={weight:meta.weight[0],temperature:meta.temperature[0],scan:meta.scan[0],reagent:meta.reagent[0],surface:unique.surface,seal:unique.seal};
 return grade===4?`${vague[tool]} 세부 윤곽은 노이즈 때문에 불분명합니다.`:vague[tool];
}

function createBoxData(type='standard'){
 const cfg=purchaseTypes[type]||purchaseTypes.standard;
 const content=pick(categoryKeys);let items=itemCatalog[content].items,itemIndex=rint(0,items.length-1);
 if(cfg.riskBoost){const dangerous=[];items.forEach((it,i)=>it.risk==='danger'&&dangerous.push(i));if(Math.random()<.58&&dangerous.length)itemIndex=pick(dangerous)}
 const grade=weightedValues([0,1,2,3,4],cfg.weights);
 return{id:`BX-${Date.now()}-${rint(100,999)}`,grade,itemIndex,content,risk:items[itemIndex].risk,purchaseType:type};
}

// small synthesized sound effects, no external files
let audioCtx=null;
function sound(type){if(!state.settings.sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);const now=audioCtx.currentTime;const map={click:[260,.035],tool:[420,.12],drop:[95,.18],correct:[660,.22],wrong:[150,.24],stamp:[110,.08],page:[300,.07],open:[220,.24]};const [f,d]=map[type]||map.click;o.frequency.setValueAtTime(f,now);if(type==='correct')o.frequency.exponentialRampToValueAtTime(990,now+d);if(type==='wrong')o.frequency.exponentialRampToValueAtTime(90,now+d);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.08,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.start(now);o.stop(now+d)}catch(e){}}

document.addEventListener('click',e=>{if(e.target.closest('button'))sound('click')});

function mat(color,metalness=0,roughness=.6,em=0,ei=0){return new THREE.MeshStandardMaterial({color,metalness,roughness,emissive:em,emissiveIntensity:ei})}
function boxMesh(w,h,d,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return o}
function clear(group){while(group.children.length){const c=group.children[0];group.remove(c);c.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())})}}
function buildChest(group,grade){clear(group);const p=palettes[grade],body=mat(p.body,p.m,p.r),panel=mat(p.panel,p.m,p.r),trim=mat(p.trim,Math.min(1,p.m+.22),Math.max(.14,p.r-.2)),accent=mat(p.accent,.7,.25);group.add(boxMesh(3.05,1.34,2.02,body,0,-.25,0),boxMesh(3.08,.6,2.05,panel,0,.75,0),boxMesh(3.18,.13,2.15,trim,0,-.9,0),boxMesh(3.18,.13,2.15,trim,0,.4,0),boxMesh(3.18,.13,2.15,trim,0,1.02,0));[-1.18,1.18].forEach(x=>group.add(boxMesh(.14,2.05,2.13,trim,x,.03,0)));group.add(boxMesh(.55,.66,.13,accent,0,.18,1.08))}
function makeScene(canvas){const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100),renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});camera.position.set(0,2.6,8);camera.lookAt(0,.15,0);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;scene.add(new THREE.HemisphereLight(0xffffff,0x77736d,2.2));const dl=new THREE.DirectionalLight(0xffffff,4.3);dl.position.set(4,7,5);dl.castShadow=true;scene.add(dl);scene.add(boxMesh(7.5,.35,5,mat(0xb1a794,.02,.88),0,-1.25,0));scene.add(boxMesh(4.8,.04,3.35,mat(0x4b4a45,0,.95),0,-1.05,0));return{scene,camera,renderer}}
const inspectionPack=makeScene($('#inspectionCanvas')),inspectionRoot=new THREE.Group(),inspectionModel=new THREE.Group();inspectionRoot.add(inspectionModel);inspectionRoot.rotation.y=-.16;inspectionPack.scene.add(inspectionRoot);
const storagePack=makeScene($('#storageCanvas')),storageRoot=new THREE.Group();storageRoot.rotation.y=-.12;storagePack.scene.add(storageRoot);const storageDropLight=new THREE.PointLight(0xffd996,0,5,2);storagePack.scene.add(storageDropLight);

const tools=[{id:'weight',icon:'㎏',name:'무게 측정',info:'크기·밀도·움직임'},{id:'temperature',icon:'℃',name:'표면 온도',info:'생체·반응성 구분'},{id:'scan',icon:'▧',name:'투과 검사',info:'형태·재질'},{id:'surface',icon:'⌕',name:'표면 흔적',info:'움직임·위험도'},{id:'reagent',icon:'●',name:'반응 시약',info:'생체·금속·화학'},{id:'seal',icon:'封',name:'봉인 검사',info:'위험도·운송 등급'}];
function createTools(){const list=$('#toolList');list.innerHTML='';tools.forEach(t=>{const b=document.createElement('button');b.className='tool-button';b.dataset.tool=t.id;b.innerHTML=`<span class="tool-icon">${t.icon}</span><span><span class="tool-name">${t.name}</span><span class="tool-info">${t.info}</span></span><span class="tool-accuracy">정확</span>`;b.onclick=()=>inspect(t);list.appendChild(b)})}

let current=null,insMode='idle',insTime=0,storageDropAnimation=null,storageAnimating=false,opening=false,openingTime=0;
function resetInspectionFor(box){state.inspection={boxId:box?.id||null,usedTools:[],clues:[],categoryGuess:'unknown',riskGuess:'unknown',resolved:false};saveState()}
function syncCurrentBox(forceNew=false){const first=state.boxes[0]||null;if(forceNew||state.inspection.boxId!==first?.id)resetInspectionFor(first);current=first;if(current){buildChest(inspectionModel,current.grade);inspectionRoot.visible=true;$('#inspectionEmpty').classList.add('hidden')}else{clear(inspectionModel);inspectionRoot.visible=false;$('#inspectionEmpty').classList.remove('hidden')}$('#contentGuess').value=state.inspection.categoryGuess;$('#riskGuess').value=state.inspection.riskGuess;$('#resultLayer').classList.remove('show');updateInspectionUI()}
function inspect(tool){if(!current||state.inspection.resolved||state.inspection.usedTools.length>=4||state.inspection.usedTools.includes(tool.id))return;state.inspection.usedTools.push(tool.id);state.inspection.clues.push({id:tool.id,name:tool.name,text:clueFor(tool.id,current)});insMode=tool.id==='weight'?'lift':tool.id;insTime=0;sound('tool');saveState();updateInspectionUI();advanceInspectionGuide('tool',tool.id)}
function resolveAction(){
 if(!current||state.inspection.resolved||opening)return;opening=true;openingTime=0;state.inspection.resolved=true;saveState();sound('open');$('#openingLayer').classList.add('show');
 setTimeout(()=>{
  const item=currentItem(current),gradeReward=rewardForGrade(current.grade),categoryCorrect=state.inspection.categoryGuess===current.content,riskCorrect=state.inspection.riskGuess===current.risk,perfect=categoryCorrect&&riskCorrect;
  const categoryReward=categoryCorrect?gradeReward.category:0;
  const safetyReward=riskCorrect?gradeReward.risk:0;
  const reward=categoryReward+safetyReward;
  if(perfect)state.streak++;else state.streak=0;
  state.bestStreak=Math.max(state.bestStreak,state.streak);state.day.bestStreak=Math.max(state.day.bestStreak,state.streak);state.day.processed++;state.day.toolsUsed+=state.inspection.usedTools.length;state.day.earned+=reward;if(perfect)state.day.perfect++;else if(categoryCorrect||riskCorrect)state.day.partial++;else state.day.failed++;
  state.money+=reward;const key=itemKey(current.content,current.itemIndex),prev=state.collection[key];state.collection[key]={count:(prev?.count||0)+1,bestGrade:Math.max(prev?.bestGrade??-1,current.grade),lastSeen:Date.now()};state.boxes.shift();saveState();
  $('#openingLayer').classList.remove('show');opening=false;
  $('#resultTitle').textContent=perfect?'완벽한 감정':categoryCorrect||riskCorrect?'부분 감정 성공':'감정 실패';$('#resultDescription').textContent=`상자를 열어 ${item.name}을(를) 확인했습니다.`;$('#resultMoney').textContent=`+${money(reward)}`;$('#resultMoney').style.color=reward?'var(--green)':'var(--sub)';
  $('#resultDetails').innerHTML=`<div class="result-detail-row"><span>실제 물품</span><strong>${item.name}</strong></div><div class="result-detail-row"><span>카테고리</span><strong>${itemCatalog[current.content].label}</strong></div><div class="result-detail-row"><span>안전성</span><strong>${riskLabel[current.risk]}</strong></div><div class="result-detail-row"><span>상자 등급</span><strong>${gradeStars(current.grade)}</strong></div><div class="result-detail-row"><span>카테고리 판정</span><strong>${categoryCorrect?`정답 +${money(gradeReward.category)}`:'오답 +0 G'}</strong></div><div class="result-detail-row"><span>안전성 판정</span><strong>${riskCorrect?`정답 +${money(gradeReward.risk)}`:'오답 +0 G'}</strong></div><div class="result-detail-row"><span>총 보상</span><strong>+${money(reward)}</strong></div>`;
  $('#resultNext').textContent=state.day.processed>=DAY_TARGET?'오늘 업무 정산':state.boxes.length?'다음 보유 상자':'적재소로 이동';$('#resultLayer').classList.add('show');perfect?sound('correct'):sound('wrong');advanceInspectionGuide('open');updateGlobalUI();updateStorageUI();
 },900)
}
function updateInspectionUI(){
 const i=state.inspection;$('#inspectionMoney').textContent=money(state.money);$('#inspectionInventoryText').textContent=`보유 상자 ${state.boxes.length} / ${MAX_BOXES}개`;$('#inspectionBoxCount').textContent=`${state.boxes.length} / ${MAX_BOXES}`;$('#inventoryProgress').style.width=`${state.boxes.length/MAX_BOXES*100}%`;$('#dayStatusText').textContent=`DAY ${state.day.number} · ${state.day.processed}/${DAY_TARGET}`;$('#streakText').textContent=`연속 ${state.streak}`;
 if(current){const r=rewardForGrade(current.grade);$('#caseName').textContent=chestNames[current.grade];$('#caseSub').textContent=`${gradeStars(current.grade)} · 최대 ${money(r.total)} · 난이도 ${['쉬움','보통','어려움','매우 어려움','전문가'][current.grade]}`;$('#currentRewardText').innerHTML=`<strong>${current.grade+1}성 상자</strong> · 카테고리 ${money(r.category)} · 안전성 ${money(r.risk)}<br>두 항목을 모두 맞히면 최대 ${money(r.total)}`}
 $$('#inspectionCount .inspection-dot').forEach((d,n)=>d.className=`inspection-dot ${n<i.usedTools.length?'used':'available'}`);$('#clueList').innerHTML=i.clues.length?i.clues.map((r,n)=>`<article class="clue-item"><div class="clue-head"><span class="clue-name">${n+1}. ${r.name}</span><span class="clue-confidence">정확</span></div><p class="clue-result">${r.text}</p></article>`).join(''):'<div class="clue-empty">아직 기록된 조사 결과가 없습니다.</div>';$$('#toolList .tool-button').forEach(b=>b.disabled=!current||i.resolved||i.usedTools.length>=4||i.usedTools.includes(b.dataset.tool));$$('#inspectionGame .action-button').forEach(b=>b.disabled=!current||i.resolved||i.categoryGuess==='unknown'||i.riskGuess==='unknown');$('#contentGuess').disabled=$('#riskGuess').disabled=!current||i.resolved;
}

function storagePlacement(index){const scale=.29,column=Math.floor(index/5),row=index%5;return{scale,column,row,x:[-1.12,0,1.12][column],y:-.72+row*.64,z:0,rotationY:(column-1)*.025}}
function buildStorageStack(animatedIndex=-1){
 clear(storageRoot);storageDropAnimation=null;
 state.boxes.slice(0,MAX_BOXES).forEach((data,index)=>{
  const p=storagePlacement(index),g=new THREE.Group();buildChest(g,data.grade);g.scale.setScalar(p.scale);g.position.set(p.x,p.y,p.z);g.rotation.y=p.rotationY;storageRoot.add(g);
  if(index===animatedIndex){
   const startY=p.y+4.25;g.position.y=startY;g.visible=true;
   storageDropAnimation={mesh:g,time:0,duration:1.08,startY,targetY:p.y,targetX:p.x,targetZ:p.z,scale:p.scale,column:p.column,rotationY:p.rotationY,started:false};
  }
 });
 storagePack.renderer.render(storagePack.scene,storagePack.camera);
}
function buyBox(){
 const type=$('#purchaseType').value,cfg=purchaseTypes[type];
 if(storageAnimating||state.money<cfg.price||state.boxes.length>=MAX_BOXES)return;
 storageAnimating=true;state.money-=cfg.price;
 const idx=state.boxes.length;state.boxes.push(createBoxData(type));saveState();updateStorageUI(false);
 resizeStorage();buildStorageStack(idx);
 requestAnimationFrame(()=>{
  resizeStorage();
  if(storageDropAnimation)storageDropAnimation.started=true;
  storagePack.renderer.render(storagePack.scene,storagePack.camera);
 });
 if(onboardingActive){onboardingPurchased=true;guideOverlay.classList.add('hidden')}
}
function updateStorageUI(rebuild=true){const type=$('#purchaseType')?.value||'standard',cfg=purchaseTypes[type];$('#purchasePrice').textContent=money(cfg.price);$('#purchaseNote').textContent=cfg.note;$('#storageMoney').textContent=money(state.money);$('#storageCount').textContent=state.boxes.length;$('#storageProgressText').textContent=`보유 상자 ${state.boxes.length} / ${MAX_BOXES}개`;$('#storageProgress').style.width=`${state.boxes.length/MAX_BOXES*100}%`;$('#storageLabelTitle').textContent=state.boxes.length?`${state.boxes.length}개 적재 중`:'빈 적재대';const locked=storageAnimating||state.money<cfg.price||state.boxes.length>=MAX_BOXES;$('#buyBoxButton').disabled=$('#buyAnotherButton').disabled=locked;$('#goInspectionButton').disabled=!state.boxes.length;$('#storageList').innerHTML=state.boxes.length?state.boxes.map((b,i)=>`<div class="storage-row"><span>${i+1}. ${purchaseTypes[b.purchaseType||'standard'].label}</span><span>${gradeStars(b.grade)}</span></div>`).join(''):'<div class="storage-empty">보유한 상자가 없습니다.</div>';if(rebuild)buildStorageStack()}

let collectionCategory='mimic',collectionReturn='main';
function renderCollection(){
 const items=itemCatalog[collectionCategory].items;
 $('#collectionTabs').innerHTML=categoryKeys.map(key=>`<button class="collection-tab ${key===collectionCategory?'active':''}" data-category="${key}">${itemCatalog[key].label}<span>${itemCatalog[key].items.filter((_,index)=>state.collection[itemKey(key,index)]).length}/15</span></button>`).join('');
 $('#collectionGrid').innerHTML=items.map((item,index)=>{
  const key=itemKey(collectionCategory,index),record=state.collection[key];
  return `<article class="collection-card ${record?'discovered':'reference'}">
    <div class="collection-card-head"><span class="collection-number">${String(index+1).padStart(2,'0')}</span><span class="collection-status">${record?'발견 완료':'미발견'}</span></div>
    <h3>${item.name}</h3>
    <p>${item.description}</p>
    <div class="collection-card-meta"><span>${riskLabel[item.risk]}</span><span>${record?`최고 ${gradeStars(record.bestGrade)}`:'기록 없음'}</span></div>
  </article>`;
 }).join('');
 const found=items.filter((_,index)=>state.collection[itemKey(collectionCategory,index)]).length;
 $('#collectionCategoryTitle').textContent=`${itemCatalog[collectionCategory].label} 도감`;
 $('#collectionCategoryLabel').textContent=categoryEnglish[collectionCategory];
 $('#collectionCategoryCount').textContent=`${found} / 15 발견`;
 $('#collectionProgressText').textContent=`발견 ${discoveredCount()} / 60`;
 $('#collectionCount').textContent=`${discoveredCount()} / 60`;
 $('#collectionProgress').style.width=`${discoveredCount()/60*100}%`;
 $$('#collectionTabs .collection-tab').forEach(button=>button.onclick=()=>{collectionCategory=button.dataset.category;renderCollection()});
}

function calculateDayGrade(){const d=state.day,accuracy=d.processed?((d.perfect+d.partial*.5)/d.processed):0,efficiency=d.processed?Math.max(0,1-d.toolsUsed/(d.processed*4)):.5,score=accuracy*.75+efficiency*.15+Math.min(d.bestStreak/5,1)*.1;return score>=.92?'S':score>=.8?'A':score>=.65?'B':score>=.45?'C':'D'}
function showDayReport(){const d=state.day,g=calculateDayGrade();$('#dayReportTitle').textContent=`DAY ${d.number} · 평가 ${g}`;$('#dayReportDetails').innerHTML=`<div><span>처리 상자</span><strong>${d.processed}개</strong></div><div><span>완벽 감정</span><strong>${d.perfect}개</strong></div><div><span>부분 성공</span><strong>${d.partial}개</strong></div><div><span>실패</span><strong>${d.failed}개</strong></div><div><span>최고 연속 정답</span><strong>${d.bestStreak}회</strong></div><div><span>일일 수익</span><strong>${money(d.earned)}</strong></div>`;$('#dayReport').classList.remove('hidden')}
function startNextDay(){state.day={...defaultState().day,number:state.day.number+1};saveState();$('#dayReport').classList.add('hidden');goStorage()}

const screens={main:$('#mainMenu'),inspection:$('#inspectionGame'),storage:$('#storageGame'),collection:$('#collectionGame')};
function showScreen(name){Object.values(screens).forEach(x=>x.classList.add('hidden'));screens[name].classList.remove('hidden');state.currentScreen=name;saveState();updateGlobalUI()}
function goMain(){showScreen('main');updateMainFirstRun()}
function goInspection(){showScreen('inspection');syncCurrentBox();resizeInspection()}
function goStorage(){showScreen('storage');updateStorageUI();requestAnimationFrame(()=>{resizeStorage();storagePack.renderer.render(storagePack.scene,storagePack.camera);requestAnimationFrame(()=>{resizeStorage();storagePack.renderer.render(storagePack.scene,storagePack.camera)})})}
function goCollection(from=state.currentScreen){collectionReturn=from==='collection'?'main':from;showScreen('collection');renderCollection();sound('page')}
function updateGlobalUI(){$('#menuMoney').textContent=money(state.money);$('#menuBoxes').textContent=`${state.boxes.length}개`;$('#menuCollection').textContent=`${discoveredCount()} / 60`;$('#inspectionMoney').textContent=money(state.money);$('#storageMoney').textContent=money(state.money);$('#menuDay').textContent=`DAY ${state.day.number}`;$('#menuStreak').textContent=`BEST ${state.bestStreak}`}
function updateMainFirstRun(){$('#mainMenu').classList.toggle('first-run',!state.tutorialDone)}

// stamp/sign onboarding retained
const workerSignature=$('#workerSignature'),signaturePadWrap=$('#signaturePadWrap'),signatureContext=workerSignature.getContext('2d');let drawing=false,len=0,last=null,accepted=false;
function resizeSignaturePad(){const r=signaturePadWrap.getBoundingClientRect();if(!r.width)return;const ratio=Math.min(devicePixelRatio||1,2);workerSignature.width=r.width*ratio;workerSignature.height=r.height*ratio;signatureContext.setTransform(ratio,0,0,ratio,0,0);signatureContext.lineCap='round';signatureContext.strokeStyle='#222';signatureContext.lineWidth=2.4}
function point(e){const r=workerSignature.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
workerSignature.onpointerdown=e=>{if(accepted)return;drawing=true;last=point(e);signatureContext.beginPath();signatureContext.moveTo(last.x,last.y);signaturePadWrap.classList.add('signed')};workerSignature.onpointermove=e=>{if(!drawing)return;const p=point(e);len+=Math.hypot(p.x-last.x,p.y-last.y);signatureContext.lineTo(p.x,p.y);signatureContext.stroke();last=p};workerSignature.onpointerup=()=>{drawing=false;if(len>42&&!accepted){accepted=true;signaturePadWrap.classList.add('ready');sound('stamp');setTimeout(()=>{onboardingActive=true;goStorage();startStorageGuide()},650)}};

// tutorial
const guideOverlay=$('#guideOverlay'),guideFocus=$('#guideFocus'),guideCard=$('#guideCard'),guideKicker=$('#guideKicker'),guideTitle=$('#guideTitle'),guideText=$('#guideText'),guideTask=$('#guideTask'),guideProgress=$('#guideProgress'),guideNext=$('#guideNext');let onboardingActive=false,onboardingPurchased=false,guideMode='',guideIndex=0;
const guideSteps=[
 {target:'[data-tool="weight"]',title:'무게를 먼저 확인하세요',text:'도구마다 맡는 정보가 다릅니다.',action:'tool',value:'weight'},
 {target:'#guideCluesTarget',title:'조사 기록을 읽으세요',text:'결과는 정확하지만 별이 높을수록 표현이 간접적입니다.',action:'next'},
 {target:'#inspectionCollection',title:'도감에서 후보를 비교하세요',text:'분류별 후보의 이름, 설명, 안전성을 조사 기록과 비교하세요.',action:'collection'},
 {target:'#collectionHome',title:'후보를 확인하고 돌아오세요',text:'도감의 후보 설명과 안전성을 확인한 뒤 감정소로 돌아가세요.',action:'returnCollection'},
 {target:'[data-tool="surface"]',title:'위험도를 확인하세요',text:'표면 흔적과 봉인 검사는 위험도 판단에 유리합니다.',action:'tool',value:'surface'},
 {target:'#guideGuessTarget',title:'판정을 입력하세요',text:'카테고리와 위험도를 모두 선택하세요.',action:'guess'},
 {target:'#guideOpenTarget',title:'일찍 제출하면 보너스',text:'완벽 감정일 때 조사 횟수를 아낄수록 추가 보상을 받습니다.',action:'open'},
 {target:'#resultLayer .result-card',title:'정산을 확인하세요',text:'카테고리와 안전성 정답 보상이 각각 계산됩니다.',action:'complete'}
];
function positionGuide(sel,title,text,kicker='FIRST SHIFT',task='강조된 부분을 직접 조작하세요.'){const t=$(sel);if(!t)return;guideFocus.style.opacity='0';requestAnimationFrame(()=>{const r=t.getBoundingClientRect(),p=8;guideFocus.style.left=`${r.left-p}px`;guideFocus.style.top=`${r.top-p}px`;guideFocus.style.width=`${r.width+p*2}px`;guideFocus.style.height=`${r.height+p*2}px`;guideFocus.style.opacity='1';guideKicker.textContent=kicker;guideTitle.textContent=title;guideText.textContent=text;guideTask.textContent=task;let left=r.right+18,top=Math.max(18,r.top);if(left+380>innerWidth-18)left=Math.max(18,r.left-398);if(top+300>innerHeight-18)top=Math.max(18,innerHeight-318);guideCard.style.left=`${left}px`;guideCard.style.top=`${top}px`})}
function renderGuideProgress(total,current){guideProgress.innerHTML=Array.from({length:total},(_,i)=>`<span class="${i<=current?'done':''}"></span>`).join('')}
function startStorageGuide(){guideMode='storage';guideOverlay.classList.remove('hidden');guideNext.disabled=true;renderGuideProgress(9,0);positionGuide('#buyBoxButton','첫 상자를 구매하세요','입고 방식에 따라 가격과 별 확률이 달라집니다.','FIRST SHIFT · 1 / 9')}
function startMoveGuide(){guideMode='move';guideOverlay.classList.remove('hidden');renderGuideProgress(9,1);positionGuide('#goInspectionButton','감정소로 이동하세요','구매한 상자는 감정소에서 실제 재고로 소비됩니다.','FIRST SHIFT · 2 / 9')}
function startInspectionGuide(){guideMode='inspection';guideIndex=0;guideOverlay.classList.remove('hidden');updateGuide()}
function updateGuide(){const s=guideSteps[guideIndex];guideNext.disabled=!['next','complete'].includes(s.action);guideNext.textContent=s.action==='next'?'확인':'튜토리얼 완료';renderGuideProgress(10,guideIndex+2);positionGuide(s.target,s.title,s.text,`FIRST SHIFT · ${guideIndex+3} / 10`)}
function advanceInspectionGuide(action,value=''){if(!onboardingActive||guideMode!=='inspection')return;const s=guideSteps[guideIndex];if(!s||s.action!==action||(value&&s.value!==value))return;if(guideIndex<guideSteps.length-1){guideIndex++;setTimeout(updateGuide,180)}}
function completeGuide(){guideOverlay.classList.add('hidden');onboardingActive=false;state.tutorialDone=true;saveState();updateMainFirstRun()}
guideNext.onclick=()=>{if(guideMode==='inspection'){const s=guideSteps[guideIndex];if(s.action==='next')advanceInspectionGuide('next');else if(s.action==='complete')completeGuide()}};$('#guideSkip').onclick=completeGuide;

// events
const bindClick=(selector,handler)=>{const element=$(selector);if(element)element.addEventListener('click',handler);return element};
const bindChange=(selector,handler)=>{const element=$(selector);if(element)element.addEventListener('change',handler);return element};

bindClick('#startLoopButton',goStorage);
bindClick('#modeInspectionButton',goInspection);
bindClick('#modeStorageButton',goStorage);
bindClick('#modeCollectionButton',()=>goCollection('main'));
bindClick('#menuCollectionQuick',()=>goCollection('main'));
bindClick('#inspectionCollection',()=>{advanceInspectionGuide('collection');goCollection('inspection')});
bindClick('#storageCollection',()=>goCollection('storage'));
bindClick('#collectionHome',()=>{
 if(onboardingActive&&guideMode==='inspection'&&guideSteps[guideIndex]?.action==='returnCollection'){advanceInspectionGuide('returnCollection');goInspection();return}
 collectionReturn==='inspection'?goInspection():collectionReturn==='storage'?goStorage():goMain();
});
bindClick('#inspectionHome',goMain);
bindClick('#storageHome',goMain);
bindClick('#goStorageButton',goStorage);
bindClick('#emptyGoStorage',goStorage);
bindClick('#goInspectionButton',()=>{goInspection();if(onboardingActive&&guideMode==='move')setTimeout(startInspectionGuide,180)});
bindClick('#buyBoxButton',buyBox);
bindClick('#buyAnotherButton',buyBox);
bindChange('#purchaseType',()=>updateStorageUI(false));
bindClick('#clearBoxesButton',()=>{
 if(!window.confirm('보유 상자를 모두 비울까요?'))return;
 state.boxes=[];resetInspectionFor(null);saveState();updateStorageUI();syncCurrentBox(true);
});

let resetArmedUntil=0;
function resetAll(event){
 const now=Date.now();
 const buttons=['#resetSaveButton','#resetSaveQuick'].map(selector=>$(selector)).filter(Boolean);
 if(now>resetArmedUntil){
  resetArmedUntil=now+3500;
  buttons.forEach(button=>{button.dataset.originalText=button.textContent;button.textContent='한 번 더 눌러 초기화';button.classList.add('reset-armed')});
  setTimeout(()=>{if(Date.now()>=resetArmedUntil){buttons.forEach(button=>{button.textContent=button.dataset.originalText||'초기화';button.classList.remove('reset-armed')})}},3600);
  return;
 }
 resetArmedUntil=0;
 for(const key of [STORE_KEY,...LEGACY_KEYS])storageRemove(key);
 state=defaultState();
 storageSet(STORE_KEY,JSON.stringify(state));
 current=null;storageDropAnimation=null;storageAnimating=false;opening=false;openingTime=0;onboardingActive=false;onboardingPurchased=false;
 clear(storageRoot);clear(inspectionModel);inspectionRoot.visible=false;
 $('#resultLayer')?.classList.remove('show');$('#dayReport')?.classList.add('hidden');$('#guideOverlay')?.classList.add('hidden');$('#ruleOverlay')?.classList.add('hidden');
 buttons.forEach(button=>{button.textContent=button.id==='resetSaveButton'?'저장 데이터 초기화':'초기화';button.classList.remove('reset-armed')});
 updateMainFirstRun();updateGlobalUI();updateStorageUI();syncCurrentBox(true);renderCollection();goMain();
 requestAnimationFrame(()=>{resizeInspection();resizeStorage()});
}
bindClick('#resetSaveButton',resetAll);
bindClick('#resetSaveQuick',resetAll);
bindClick('#ruleButton',()=>$('#ruleOverlay')?.classList.remove('hidden'));
bindClick('#ruleClose',()=>$('#ruleOverlay')?.classList.add('hidden'));
bindClick('#resultNext',()=>{if(state.day.processed>=DAY_TARGET){$('#resultLayer')?.classList.remove('show');showDayReport()}else if(state.boxes.length)syncCurrentBox(true);else goStorage()});
bindClick('#dayNextButton',startNextDay);
$$('#inspectionGame .action-button').forEach(button=>button.addEventListener('click',resolveAction));
bindChange('#contentGuess',event=>{state.inspection.categoryGuess=event.target.value;saveState();updateInspectionUI();if(state.inspection.categoryGuess!=='unknown'&&state.inspection.riskGuess!=='unknown')advanceInspectionGuide('guess')});
bindChange('#riskGuess',event=>{state.inspection.riskGuess=event.target.value;saveState();updateInspectionUI();if(state.inspection.categoryGuess!=='unknown'&&state.inspection.riskGuess!=='unknown')advanceInspectionGuide('guess')});
bindClick('#soundToggle',()=>{state.settings.sound=!state.settings.sound;const button=$('#soundToggle');if(button)button.textContent=state.settings.sound?'효과음 ON':'효과음 OFF';saveState()});

function resizeRenderer(pack,el){const w=el.clientWidth,h=el.clientHeight;if(w<=0||h<=0)return;pack.renderer.setSize(w,h,false);pack.camera.aspect=w/h;pack.camera.updateProjectionMatrix()}
function resizeInspection(){resizeRenderer(inspectionPack,$('#inspectionScene'))}function resizeStorage(){resizeRenderer(storagePack,$('#storageScene'))}
addEventListener('resize',()=>{resizeInspection();resizeStorage();resizeSignaturePad()});
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const d=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;if(current&&insMode==='idle')inspectionRoot.position.y=Math.sin(t*1.2)*.018;else if(insMode!=='idle'){insTime+=d;const p=Math.min(insTime/.65,1);if(insMode==='lift')inspectionRoot.position.y=Math.sin(p*Math.PI)*.28;else if(insMode==='temperature')inspectionRoot.scale.setScalar(1+Math.sin(p*Math.PI)*.025);else if(insMode==='scan')inspectionRoot.rotation.y=-.16+p*Math.PI*2;else inspectionRoot.rotation.z=Math.sin(p*Math.PI*6)*Math.sin(p*Math.PI)*.035;if(p>=1){insMode='idle';inspectionRoot.position.set(0,0,0);inspectionRoot.rotation.set(0,-.16,0);inspectionRoot.scale.set(1,1,1)}}if(storageDropAnimation){const a=storageDropAnimation;if(!a.started){storagePack.renderer.render(storagePack.scene,storagePack.camera)}else{a.time+=d;const p=Math.min(a.time/a.duration,1),fall=Math.min(p/.72,1),settle=p>.72?(p-.72)/.28:0;a.mesh.position.x=a.targetX;a.mesh.position.z=a.targetZ;a.mesh.position.y=p<.72?THREE.MathUtils.lerp(a.startY,a.targetY,fall*fall):a.targetY+Math.abs(Math.sin(settle*Math.PI*3))*Math.pow(1-settle,2)*.17;const squash=p>.69&&p<.92?Math.sin((p-.69)/.23*Math.PI):0;a.mesh.scale.set(a.scale*(1+squash*.07),a.scale*(1-squash*.13),a.scale*(1+squash*.07));storageDropLight.position.set(a.targetX,a.mesh.position.y+1,2);storageDropLight.intensity=p>.68?Math.sin(Math.min((p-.68)/.32,1)*Math.PI)*4:1;if(p>=1){a.mesh.position.y=a.targetY;a.mesh.scale.setScalar(a.scale);storageDropAnimation=null;storageAnimating=false;storageDropLight.intensity=0;sound('drop');updateStorageUI(false);storagePack.renderer.render(storagePack.scene,storagePack.camera);if(onboardingActive&&onboardingPurchased){onboardingPurchased=false;setTimeout(startMoveGuide,300)}}}}inspectionPack.renderer.render(inspectionPack.scene,inspectionPack.camera);storagePack.renderer.render(storagePack.scene,storagePack.camera)}

if('ResizeObserver' in window){const storageResizeObserver=new ResizeObserver(()=>{if(!screens.storage.classList.contains('hidden')){resizeStorage();storagePack.renderer.render(storagePack.scene,storagePack.camera)}});storageResizeObserver.observe($('#storageScene'))}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&storageDropAnimation){storageDropAnimation.started=true;resizeStorage()}});
createTools();resizeSignaturePad();updateMainFirstRun();updateGlobalUI();updateStorageUI();syncCurrentBox();renderCollection();$('#soundToggle').textContent=state.settings.sound?'효과음 ON':'효과음 OFF';resizeInspection();resizeStorage();animate();
