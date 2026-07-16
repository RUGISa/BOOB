import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js";

    const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
    const STORE_KEY='box_appraisal_connected_v3';
    const LEGACY_KEYS=['box_appraisal_connected_v1','box_appraisal_connected_v2'];
    const MAX_BOXES=15;
    const GRADE_REWARDS=[300,450,650,900,1200];
    const PURCHASES={
      standard:{label:'일반 입고',price:200,note:'1~3성 중심의 기본 입고입니다.',weights:[42,28,17,9,4]},
      safe:{label:'안전 입고',price:260,note:'낮은 등급과 안전 물품의 비중이 높습니다.',weights:[55,28,12,4,1],category:'safe'},
      premium:{label:'고급 입고',price:500,note:'3~5성 상자가 나올 확률이 높습니다.',weights:[8,17,30,28,17]},
      seized:{label:'압류품 입고',price:150,note:'저렴하지만 위험·폭발물 비중이 높습니다.',weights:[48,28,15,7,2],category:'seized'},
      auction:{label:'미확인 경매',price:350,note:'등급 분포가 넓고 결과를 예측하기 어렵습니다.',weights:[20,20,20,20,20]}
    };
    const riskLabel={safe:'안전',warning:'주의',danger:'위험'};
    const chestNames=['나무 상자','은 상자','금 상자','다이아 상자','봉인된 상자'];
    const palettes=[
      {body:0x765437,panel:0x8a6442,trim:0x373633,accent:0x9e7b52,m:.08,r:.82},
      {body:0x6d7478,panel:0x858b8e,trim:0xb1b4b4,accent:0x494f52,m:.72,r:.34},
      {body:0x96691e,panel:0xaf812c,trim:0xd0a244,accent:0x39352f,m:.65,r:.34},
      {body:0x3f7580,panel:0x548994,trim:0x83b1b8,accent:0x29454b,m:.54,r:.29},
      {body:0x28272a,panel:0x343237,trim:0x555158,accent:0x71586e,m:.46,r:.42}
    ];
    // ==============================
    // 카테고리별 아이템 데이터
    // 위험도: 1~5 위험 / 6~10 주의 / 11~15 안전
    // ==============================
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


    const defaultState=()=>({money:1000,boxes:[],tutorialDone:false,collection:{},day:1,processedToday:0,streak:0,bestStreak:0,dayCorrect:0,dayReward:0,sound:true});
    let state=loadState();
    let current=null,used=0,results=[],resolved=false,insMode='idle',insTime=0;

    function normalizeBox(box){
      if(!box||typeof box!=='object')return null;
      const content=itemCatalog[box.content]?box.content:'mimic';
      const grade=Math.max(0,Math.min(4,Number(box.grade)||0));
      const itemIndex=Math.max(0,Math.min(14,Number(box.itemIndex)||0));
      return{...box,id:box.id||`BX-${Date.now()}-${rint(100,999)}`,content,grade,itemIndex,risk:itemCatalog[content].items[itemIndex].risk};
    }
    function loadState(){
      const base=defaultState();
      try{
        let raw=localStorage.getItem(STORE_KEY);
        if(!raw){for(const key of LEGACY_KEYS){raw=localStorage.getItem(key);if(raw)break}}
        const parsed=raw?JSON.parse(raw):null;
        if(!parsed||typeof parsed!=='object')return base;
        return{...base,...parsed,money:Number.isFinite(parsed.money)?parsed.money:base.money,boxes:Array.isArray(parsed.boxes)?parsed.boxes.map(normalizeBox).filter(Boolean).slice(0,MAX_BOXES):[],collection:parsed.collection&&typeof parsed.collection==='object'?parsed.collection:{}};
      }catch(error){console.warn('저장 데이터 불러오기 실패',error);return base}
    }
    function saveState(){
      try{localStorage.setItem(STORE_KEY,JSON.stringify(state));LEGACY_KEYS.forEach(key=>localStorage.removeItem(key))}catch(error){console.warn('저장 실패',error)}
      updateGlobalUI();
    }
    const money=v=>`${Math.round(v).toLocaleString('ko-KR')} G`;
    const rand=(a,b)=>Math.random()*(b-a)+a;
    const rint=(a,b)=>Math.floor(rand(a,b+1));
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    function weighted(entries){let total=entries.reduce((s,e)=>s+e.weight,0),roll=Math.random()*total;for(const e of entries){roll-=e.weight;if(roll<=0)return e.value}return entries.at(-1).value}

    function createBoxData(type='standard'){
      const purchase=PURCHASES[type]||PURCHASES.standard;
      let content;
      if(purchase.category==='seized')content=weighted([{value:'explosive',weight:48},{value:'mimic',weight:22},{value:'junk',weight:20},{value:'treasure',weight:10}]);
      else content=pick(Object.keys(itemCatalog));
      const items=itemCatalog[content].items;
      let candidates=items.map((_,index)=>index);
      if(purchase.category==='safe')candidates=candidates.filter(index=>items[index].risk!=='danger');
      const itemIndex=pick(candidates);
      const grade=weighted(purchase.weights.map((weight,value)=>({value,weight})));
      return{id:`BX-${Date.now()}-${rint(100,999)}`,grade,itemIndex,content,risk:items[itemIndex].risk,stability:rint(20,95)};
    }

    function mat(color,metalness=0,roughness=.6,em=0,ei=0){return new THREE.MeshStandardMaterial({color,metalness,roughness,emissive:em,emissiveIntensity:ei})}
    function box(w,h,d,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return o}
    function clear(group){while(group.children.length){const c=group.children[0];group.remove(c);c.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())})}}
    function buildChest(group,grade){
      clear(group);const p=palettes[grade],body=mat(p.body,p.m,p.r),panel=mat(p.panel,p.m,p.r),trim=mat(p.trim,Math.min(1,p.m+.22),Math.max(.14,p.r-.2)),accent=mat(p.accent,Math.min(1,p.m+.18),Math.max(.18,p.r-.16));
      group.add(box(3.05,1.34,2.02,body,0,-.25,0),box(3.08,.6,2.05,panel,0,.75,0),box(3.18,.13,2.15,trim,0,-.9,0),box(3.18,.13,2.15,trim,0,.4,0),box(3.18,.13,2.15,trim,0,1.02,0));
      [-1.18,1.18].forEach(x=>group.add(box(.14,2.05,2.13,trim,x,.03,0)));
      group.add(box(grade===4?.72:.55,grade===4?.88:.66,.13,accent,0,.18,1.08));
      const kh=mat(0x181817,.16,.58),circle=new THREE.Mesh(new THREE.CircleGeometry(.055,18),kh);circle.position.set(0,.23,1.151);group.add(circle,box(.052,.13,.025,kh,0,.14,1.153));
    }
    function makeScene(canvas){
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100),renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
      camera.position.set(0,2.6,8);camera.lookAt(0,.15,0);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
      scene.add(new THREE.HemisphereLight(0xffffff,0x77736d,2.2));const dl=new THREE.DirectionalLight(0xffffff,4.3);dl.position.set(4,7,5);dl.castShadow=true;scene.add(dl);
      scene.add(box(7.5,.35,5,mat(0xb1a794,.02,.88),0,-1.25,0));scene.add(box(4.8,.04,3.35,mat(0x4b4a45,0,.95),0,-1.05,0));
      return{scene,camera,renderer};
    }

    const inspectionPack=makeScene($('#inspectionCanvas'));
    const inspectionRoot=new THREE.Group(),inspectionModel=new THREE.Group();inspectionRoot.add(inspectionModel);inspectionRoot.position.y=.02;inspectionRoot.rotation.y=-.16;inspectionPack.scene.add(inspectionRoot);
    const storagePack=makeScene($('#storageCanvas'));
    const storageRoot=new THREE.Group();storageRoot.rotation.y=-.12;storagePack.scene.add(storageRoot);
    const storageDropLight=new THREE.PointLight(0xffd996,0,5,2);storageDropLight.position.set(0,4,2);storagePack.scene.add(storageDropLight);

    const tools=[
      {id:'weight',icon:'㎏',name:'무게 측정',info:'내용물의 특징'},
      {id:'temperature',icon:'℃',name:'표면 온도',info:'카테고리 측정'},
      {id:'scan',icon:'▧',name:'투과 검사',info:'내용물 힌트'},
      {id:'surface',icon:'⌕',name:'표면 흔적',info:'안전성 측정'},
      {id:'reagent',icon:'●',name:'반응 시약',info:'내용물 힌트'},
      {id:'seal',icon:'封',name:'봉인 검사',info:'안전성 측정'}
    ];
    function truthful(id){
      const category=itemCatalog[current.content]||itemCatalog.mimic;
      const item=category.items[current.itemIndex]||category.items[0];
      const categoryClues={
        mimic:{
          temperature:['내용물에서 체온과 비슷한 열이 감지됩니다.'],
          weight:['내용물의 무게 중심이 스스로 조금씩 이동합니다.'],
          scan:['생물로 보이는 형체가 감지됩니다.'],
          reagent:['내용물 표면에서 생체 반응이 검출됩니다.']
        },
        treasure:{
          temperature:['내용물의 온도는 주변과 거의 같습니다.'],
          weight:['크기에 비해 밀도가 높은 내용물입니다.'],
          scan:['정교하게 가공된 형태가 확인됩니다.'],
          reagent:['금속성 또는 보존 처리에 사용되는 성분이 검출됩니다.']
        },
        explosive:{
          temperature:['내용물의 한 지점에서 비정상적인 열이 감지됩니다.'],
          weight:['내용물 내부의 한쪽에 고밀도 부분이 있습니다.'],
          scan:['내부에서 배선이나 압축된 구조가 확인됩니다.'],
          reagent:['내용물에서 연소성 또는 반응성 성분이 검출됩니다.']
        },
        junk:{
          temperature:['내용물에서 특별한 열 변화가 감지되지 않습니다.'],
          weight:['무게 중심이 한쪽으로 치우쳐 있습니다.'],
          scan:['용도를 바로 알아보기 어려운 형태가 확인됩니다.'],
          reagent:['먼지, 녹 또는 합성수지 계열의 성분이 검출됩니다.']
        }
      };
      if(id==='temperature')return pick(categoryClues[current.content].temperature);
      if(id==='weight')return pick(categoryClues[current.content].weight);
      if(id==='scan')return pick(categoryClues[current.content].scan);
      if(id==='reagent')return pick(categoryClues[current.content].reagent);
      if(id==='surface')return pick({danger:['상자 안쪽에 깊은 긁힘과 강한 충격 흔적이 있습니다.'],warning:['상자 안쪽에 얕은 긁힘과 마찰 자국이 있습니다.'],safe:['상자 안쪽은 큰 손상 없이 비교적 깨끗합니다.']}[current.risk]);
      if(id==='seal')return pick({danger:['고위험 화물용 이중 봉인이 사용됐습니다.'],warning:['표준 봉인에 보조 잠금이 추가돼 있습니다.'],safe:['일반 운송용 봉인이 정상적으로 유지됩니다.']}[current.risk]);
      return `${item.name}과 관련된 간접 반응이 감지됩니다.`;
    }

    function createTools(){
      const list=$('#toolList');list.innerHTML='';
      tools.forEach(t=>{const b=document.createElement('button');b.className='tool-button';b.dataset.tool=t.id;b.innerHTML=`<span class="tool-icon">${t.icon}</span><span><span class="tool-name">${t.name}</span><span class="tool-info">${t.info}</span></span><span class="tool-accuracy">정확</span>`;b.onclick=()=>inspect(t);list.appendChild(b)});
    }
    function inspect(tool){if(!current||resolved||used>=4)return;used++;results.push({id:tool.id,name:tool.name,text:truthful(tool.id)});insMode=tool.id==='weight'?'lift':'inspect';insTime=0;updateInspectionUI();advanceInspectionGuide('tool',tool.id)}

    function beginCurrentBox(){
      current=state.boxes.length?state.boxes[0]:null;if(current&&!itemCatalog[current.content])current.content='mimic';used=0;results=[];resolved=false;$('#contentGuess').value='unknown';$('#riskGuess').value='unknown';$('#resultLayer').classList.remove('show');
      if(current){buildChest(inspectionModel,current.grade);inspectionRoot.visible=true;$('#inspectionEmpty').classList.add('hidden')}else{clear(inspectionModel);inspectionRoot.visible=false;$('#inspectionEmpty').classList.remove('hidden')}
      updateInspectionUI();
    }
    function updateInspectionUI(){
      $('#inspectionMoney').textContent=money(state.money);$('#inspectionInventoryText').textContent=`보유 상자 ${state.boxes.length} / ${MAX_BOXES}개`;$('#inspectionBoxCount').textContent=`${state.boxes.length} / ${MAX_BOXES}`;$('#inventoryProgress').style.width=`${state.boxes.length/MAX_BOXES*100}%`;
      if(current){$('#caseNumber').textContent='STORED BOX';$('#caseName').textContent=chestNames[current.grade];$('#caseSub').textContent=`${current.id.split('-').slice(0,2).join('-')} · 미감정 상태`}else{$('#caseName').textContent='상자 없음';$('#caseSub').textContent='적재소에서 상자를 구매하세요'}
      const total=current?GRADE_REWARDS[current.grade]:GRADE_REWARDS[0];const half=total/2;$('#currentRewardText').innerHTML=current?`<strong>${current.grade+1}성 상자</strong> · 카테고리 정답 +${money(half)} · 안전성 정답 +${money(half)}<br>둘 다 맞히면 총 ${money(total)}를 받습니다.`:'상자를 준비하면 등급별 판정 보상이 표시됩니다.';
      $$('#inspectionCount .inspection-dot').forEach((d,i)=>d.className=`inspection-dot ${i<used?'used':'available'}`);
      $('#clueList').innerHTML=results.length?results.map((r,i)=>`<article class="clue-item"><div class="clue-head"><span class="clue-name">${i+1}. ${r.name}</span><span class="clue-confidence">정확</span></div><p class="clue-result">${r.text}</p></article>`).join(''):'<div class="clue-empty">아직 기록된 조사 결과가 없습니다.</div>';
      $$('#toolList .tool-button').forEach(b=>b.disabled=!current||resolved||used>=4||results.some(r=>r.id===b.dataset.tool));
      $$('#inspectionGame .action-button').forEach(b=>b.disabled=!current||resolved);$('#contentGuess').disabled=$('#riskGuess').disabled=!current||resolved;
    }
    function collectionKey(box){return `${box.content}:${box.itemIndex}`}
    function revealResult(category,item,categoryCorrect,riskCorrect,reward){
      $('#resultKicker').textContent='ANSWER CHECK';
      $('#resultTitle').textContent=categoryCorrect&&riskCorrect?'완벽한 감정':categoryCorrect||riskCorrect?'부분 감정 성공':'감정 실패';
      $('#resultDescription').textContent=`상자를 열어 ${item.name}을(를) 확인했습니다.`;
      $('#resultMoney').textContent=`+${money(reward)}`;$('#resultMoney').style.color=reward>0?'var(--green)':'var(--sub)';
      const half=GRADE_REWARDS[current.grade]/2;
      $('#resultDetails').innerHTML=`<div class="result-detail-row"><span>실제 물품</span><strong>${item.name}</strong></div><div class="result-detail-row"><span>설명</span><strong>${item.description}</strong></div><div class="result-detail-row"><span>실제 카테고리</span><strong>${category.label}</strong></div><div class="result-detail-row"><span>실제 안전성</span><strong>${riskLabel[current.risk]}</strong></div><div class="result-detail-row"><span>카테고리 판정</span><strong>${categoryCorrect?`정답 +${money(half)}`:'오답 +0 G'}</strong></div><div class="result-detail-row"><span>안전성 판정</span><strong>${riskCorrect?`정답 +${money(half)}`:'오답 +0 G'}</strong></div><div class="result-detail-row"><span>총 보상</span><strong>+${money(reward)}</strong></div>`;
      $('#resultNext').textContent=state.processedToday>=8?'일일 정산 보기':state.boxes.length?'다음 보유 상자':'적재소로 이동';
      $('#resultLayer').classList.add('show');
    }
    function resolveAction(action){
      if(!current||resolved||action!=="open")return;
      if($('#contentGuess').value==='unknown'||$('#riskGuess').value==='unknown'){alert('카테고리와 안전성을 모두 선택해주세요.');return}
      resolved=true;
      const category=itemCatalog[current.content],item=category.items[current.itemIndex];
      const categoryCorrect=$('#contentGuess').value===current.content,riskCorrect=$('#riskGuess').value===current.risk;
      const half=GRADE_REWARDS[current.grade]/2,reward=(categoryCorrect?half:0)+(riskCorrect?half:0);
      state.money+=reward;state.processedToday+=1;state.dayReward+=reward;
      if(categoryCorrect&&riskCorrect){state.streak+=1;state.bestStreak=Math.max(state.bestStreak,state.streak);state.dayCorrect+=1}else state.streak=0;
      const key=collectionKey(current),previous=state.collection[key]||{count:0,bestGrade:-1};state.collection[key]={count:previous.count+1,bestGrade:Math.max(previous.bestGrade,current.grade)};
      state.boxes.shift();saveState();
      $('#openingLayer').classList.add('show');
      setTimeout(()=>{$('#openingLayer').classList.remove('show');revealResult(category,item,categoryCorrect,riskCorrect,reward)},550);
      advanceInspectionGuide('open');updateInspectionUI();updateStorageUI();renderCollection();
    }

    let storageDropAnimation=null;
    let storageAnimating=false;
    let onboardingActive=false;
    let onboardingPurchased=false;

    function storagePlacement(index){
      const scale=.29;
      const chestMinY=-.965;
      const chestHeight=2.03;
      const platformTop=-1.03;
      const firstY=platformTop-chestMinY*scale+.018;
      const step=chestHeight*scale+.05;
      const columnX=[-1.12,0,1.12];
      const column=Math.floor(index/5);
      const row=index%5;
      return{
        scale,
        column,
        row,
        x:columnX[column],
        y:firstY+row*step,
        z:0,
        rotationY:(column-1)*.025
      };
    }

    function buildStorageStack(animatedIndex=-1){
      clear(storageRoot);
      storageDropAnimation=null;
      const visible=state.boxes.slice(0,MAX_BOXES);
      if(!visible.length)return;

      visible.forEach((data,index)=>{
        const place=storagePlacement(index);
        const g=new THREE.Group();
        buildChest(g,data.grade);
        g.scale.setScalar(place.scale);
        g.position.set(place.x,place.y,place.z);
        g.rotation.y=place.rotationY;
        g.userData.stackColumn=place.column;
        g.userData.stackRow=place.row;
        storageRoot.add(g);

        if(index===animatedIndex){
          g.position.set(place.x,place.y+3.65,place.z);
          g.rotation.set(.03,place.rotationY+.025,.02);
          g.scale.setScalar(place.scale*.94);
          const ghosts=[];
          for(let ghostIndex=0;ghostIndex<1;ghostIndex++){
            const ghost=new THREE.Group();buildChest(ghost,data.grade);ghost.scale.setScalar(place.scale*(.94-ghostIndex*.025));ghost.position.set(place.x,place.y+3.65+(ghostIndex+1)*.28,place.z);ghost.rotation.copy(g.rotation);ghost.traverse(object=>{if(object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{material.transparent=true;material.opacity=.055;material.depthWrite=false})}});storageRoot.add(ghost);ghosts.push(ghost);
          }
          storageDropAnimation={mesh:g,ghosts,time:0,duration:.92,startY:g.position.y,targetX:place.x,targetY:place.y,targetZ:place.z,targetScale:place.scale,targetRotationY:place.rotationY,column:place.column};
        }
      });
    }

    function finishStorageDrop(){
      if(storageDropAnimation?.ghosts)storageDropAnimation.ghosts.forEach(ghost=>{storageRoot.remove(ghost);ghost.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())})});
      storageDropAnimation=null;
      storageDropLight.intensity=0;
      storageAnimating=false;
      storageRoot.position.x=0;
      storageRoot.rotation.z=0;
      updateStorageUI(false);
      if(onboardingActive&&onboardingPurchased){onboardingPurchased=false;setTimeout(startMoveGuide,360)}
    }

    function buyBox(){
      const type=$('#purchaseType').value,purchase=PURCHASES[type]||PURCHASES.standard;if(storageAnimating||state.money<purchase.price||state.boxes.length>=MAX_BOXES)return;
      const newIndex=state.boxes.length;
      storageAnimating=true;
      state.money-=purchase.price;
      state.boxes.push(createBoxData(type));
      if(onboardingActive){onboardingPurchased=true;guideOverlay.classList.add('hidden')};
      saveState();
      updateStorageUI(false);
      buildStorageStack(newIndex);
    }
    function updateStorageUI(rebuild=true){
      $('#storageMoney').textContent=money(state.money);$('#storageCount').textContent=state.boxes.length;$('#storageProgressText').textContent=`보유 상자 ${state.boxes.length} / ${MAX_BOXES}개`;$('#storageProgress').style.width=`${state.boxes.length/MAX_BOXES*100}%`;$('#storageLabelTitle').textContent=state.boxes.length?`${state.boxes.length}개 적재 중`:'빈 적재대';$('#storageLabelSub').textContent=state.boxes.length>=MAX_BOXES?'보관 한도에 도달했습니다. 감정소에서 상자를 처리하세요.':'한 더미에 5개씩, 최대 15개까지 보관할 수 있습니다.';
      const purchase=PURCHASES[$('#purchaseType').value]||PURCHASES.standard;$('#purchasePrice').textContent=money(purchase.price);$('#purchaseNote').textContent=purchase.note;
      const purchaseLocked=storageAnimating||state.money<purchase.price||state.boxes.length>=MAX_BOXES;
      $('#buyBoxButton').disabled=$('#buyAnotherButton').disabled=purchaseLocked;
      $('#buyBoxButton').textContent=$('#buyAnotherButton').textContent=state.boxes.length>=MAX_BOXES?'보관 한도 15개':'상자 1개 구매';
      $('#goInspectionButton').disabled=state.boxes.length===0;
      const list=$('#storageList');list.innerHTML=state.boxes.length?state.boxes.map((b,i)=>`<div class="storage-row"><span>${i+1}. 미감정 상자</span><span>${chestNames[b.grade]}</span></div>`).join(''):'<div class="storage-empty">보유한 상자가 없습니다.</div>';
      if(rebuild)buildStorageStack();
    }
    function discoveredCount(){return Object.keys(state.collection||{}).length}
    function updateGlobalUI(){
      const discovered=discoveredCount();
      $('#menuMoney').textContent=money(state.money);$('#menuBoxes').textContent=`${state.boxes.length}개`;$('#menuCollection').textContent=`${discovered} / 60`;$('#menuDay').textContent=`DAY ${state.day}`;$('#menuStreak').textContent=`BEST ${state.bestStreak}`;
      $('#inspectionMoney').textContent=money(state.money);$('#inspectionBoxCount').textContent=`${state.boxes.length} / ${MAX_BOXES}`;$('#storageMoney').textContent=money(state.money);
      $('#dayStatusText').textContent=`DAY ${state.day} · ${state.processedToday}/8`;$('#streakText').textContent=`연속 ${state.streak}`;
      $('#collectionProgressText').textContent=`발견 ${discovered} / 60`;$('#collectionCount').textContent=`${discovered} / 60`;$('#collectionProgress').style.width=`${discovered/60*100}%`;
    }


    const mainMenu=$('#mainMenu'),inspectionGame=$('#inspectionGame'),storageGame=$('#storageGame'),collectionGame=$('#collectionGame');
    let previousScreen=mainMenu,currentCollectionCategory='mimic';
    function showScreen(screen){[mainMenu,inspectionGame,storageGame,collectionGame].forEach(x=>x.classList.add('hidden'));screen.classList.remove('hidden');updateGlobalUI()}
    function updateMainFirstRun(){mainMenu.classList.toggle('first-run',!state.tutorialDone)}
    function goMain(){showScreen(mainMenu);updateMainFirstRun();updateGlobalUI()}
    function goInspection(){showScreen(inspectionGame);beginCurrentBox();resizeInspection()}
    function goStorage(){showScreen(storageGame);updateStorageUI();resizeStorage()}

    function openCollection(){previousScreen=[inspectionGame,storageGame,mainMenu].find(screen=>!screen.classList.contains('hidden'))||mainMenu;showScreen(collectionGame);renderCollection()}
    function renderCollection(){
      const entries=Object.entries(itemCatalog),tabs=$('#collectionTabs');
      tabs.innerHTML=entries.map(([key,value])=>`<button type="button" class="collection-tab ${key===currentCollectionCategory?'active':''}" data-category="${key}">${value.label}</button>`).join('');
      $$('#collectionTabs .collection-tab').forEach(button=>button.onclick=()=>{currentCollectionCategory=button.dataset.category;renderCollection()});
      const category=itemCatalog[currentCollectionCategory];$('#collectionCategoryLabel').textContent=currentCollectionCategory.toUpperCase();$('#collectionCategoryTitle').textContent=`${category.label} 도감`;
      const found=category.items.reduce((sum,_,index)=>sum+(state.collection[`${currentCollectionCategory}:${index}`]?1:0),0);$('#collectionCategoryCount').textContent=`${found} / 15 발견`;
      $('#collectionGrid').innerHTML=category.items.map((item,index)=>{const record=state.collection[`${currentCollectionCategory}:${index}`],stars=record?'★'.repeat(record.bestGrade+1)+'☆'.repeat(4-record.bestGrade):'☆☆☆☆☆';return `<article class="collection-card ${record?'discovered':'undiscovered'}"><div class="collection-card-top"><span>${String(index+1).padStart(2,'0')}</span><strong>${stars}</strong></div><h3>${item.name}</h3><p>${item.description}</p><div class="collection-meta"><span>안전성 ${riskLabel[item.risk]}</span><span>${record?`${record.count}회 발견`:'미발견'}</span></div></article>`}).join('');
      updateGlobalUI();
    }
    function resetGame(button){
      if(button.dataset.confirm!=='yes'){button.dataset.confirm='yes';button.textContent='한 번 더 눌러 초기화';setTimeout(()=>{button.dataset.confirm='';button.textContent=button.id==='resetSaveButton'?'저장 데이터 초기화':'초기화'},3000);return}
      try{localStorage.removeItem(STORE_KEY);LEGACY_KEYS.forEach(key=>localStorage.removeItem(key))}catch(error){console.warn(error)}
      state=defaultState();current=null;used=0;results=[];resolved=false;signatureAccepted=false;signatureLength=0;signatureContext.clearRect(0,0,workerSignature.width,workerSignature.height);signaturePadWrap.classList.remove('signed','ready');saveState();buildStorageStack();beginCurrentBox();renderCollection();updateStorageUI(false);goMain();button.dataset.confirm='';button.textContent=button.id==='resetSaveButton'?'저장 데이터 초기화':'초기화';
    }
    function showDayReport(){
      const accuracy=Math.round(state.dayCorrect/8*100),grade=accuracy>=88?'S':accuracy>=75?'A':accuracy>=50?'B':accuracy>=25?'C':'D';
      $('#dayReportTitle').textContent=`DAY ${state.day} · 평가 ${grade}`;$('#dayReportDetails').innerHTML=`<div class="result-detail-row"><span>처리한 상자</span><strong>${state.processedToday} / 8</strong></div><div class="result-detail-row"><span>완벽 감정</span><strong>${state.dayCorrect}회</strong></div><div class="result-detail-row"><span>정확도</span><strong>${accuracy}%</strong></div><div class="result-detail-row"><span>오늘 획득</span><strong>${money(state.dayReward)}</strong></div>`;$('#dayReport').classList.remove('hidden');
    }

    const workerSignature=$('#workerSignature'),signaturePadWrap=$('#signaturePadWrap');
    const signatureContext=workerSignature.getContext('2d');
    let signatureDrawing=false,signatureLength=0,signatureLast=null,signatureAccepted=false,signatureMoveTimer=null;
    function resizeSignaturePad(){
      const rect=signaturePadWrap.getBoundingClientRect();if(!rect.width||!rect.height)return;
      const ratio=Math.min(devicePixelRatio||1,2),snapshot=document.createElement('canvas');
      snapshot.width=workerSignature.width;snapshot.height=workerSignature.height;snapshot.getContext('2d').drawImage(workerSignature,0,0);
      workerSignature.width=Math.round(rect.width*ratio);workerSignature.height=Math.round(rect.height*ratio);
      signatureContext.setTransform(ratio,0,0,ratio,0,0);signatureContext.lineCap='round';signatureContext.lineJoin='round';signatureContext.strokeStyle='#22201d';signatureContext.lineWidth=2.4;
      if(snapshot.width&&snapshot.height)signatureContext.drawImage(snapshot,0,0,snapshot.width,snapshot.height,0,0,rect.width,rect.height);
    }
    function signaturePoint(event){const rect=workerSignature.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top}}
    function finishSignature(){
      signatureDrawing=false;signatureLast=null;
      if(signatureLength<42||signatureAccepted)return;
      signatureAccepted=true;signaturePadWrap.classList.add('ready');
      clearTimeout(signatureMoveTimer);signatureMoveTimer=setTimeout(()=>{onboardingActive=true;goStorage();setTimeout(startStorageGuide,220)},700);
    }
    workerSignature.addEventListener('pointerdown',event=>{
      if(signatureAccepted)return;signatureDrawing=true;signatureLast=signaturePoint(event);workerSignature.setPointerCapture(event.pointerId);signaturePadWrap.classList.add('signed');
      signatureContext.beginPath();signatureContext.moveTo(signatureLast.x,signatureLast.y);event.preventDefault();
    });
    workerSignature.addEventListener('pointermove',event=>{
      if(!signatureDrawing||signatureAccepted)return;const point=signaturePoint(event),dx=point.x-signatureLast.x,dy=point.y-signatureLast.y;
      signatureLength+=Math.hypot(dx,dy);signatureContext.lineTo(point.x,point.y);signatureContext.stroke();signatureLast=point;event.preventDefault();
    });
    workerSignature.addEventListener('pointerup',finishSignature);workerSignature.addEventListener('pointercancel',finishSignature);workerSignature.addEventListener('pointerleave',event=>{if(signatureDrawing&&event.buttons===0)finishSignature()});
    $('#startLoopButton').onclick=goStorage;$('#modeInspectionButton').onclick=goInspection;$('#modeStorageButton').onclick=goStorage;$('#modeCollectionButton').onclick=openCollection;$('#menuCollectionQuick').onclick=openCollection;$('#inspectionCollection').onclick=openCollection;$('#storageCollection').onclick=openCollection;
    $('#collectionHome').onclick=()=>{showScreen(previousScreen||mainMenu);if(previousScreen===inspectionGame)resizeInspection();if(previousScreen===storageGame)resizeStorage()};
    $('#inspectionHome').onclick=goMain;$('#storageHome').onclick=goMain;$('#goStorageButton').onclick=goStorage;$('#emptyGoStorage').onclick=goStorage;$('#goInspectionButton').onclick=()=>{goInspection();if(onboardingActive&&guideMode==='move')setTimeout(startInspectionGuide,180)};
    $('#buyBoxButton').onclick=buyBox;$('#buyAnotherButton').onclick=buyBox;$('#purchaseType').onchange=()=>updateStorageUI(false);
    $('#clearBoxesButton').onclick=()=>{state.boxes=[];saveState();updateStorageUI();beginCurrentBox()};
    $('#resetSaveButton').onclick=()=>resetGame($('#resetSaveButton'));$('#resetSaveQuick').onclick=()=>resetGame($('#resetSaveQuick'));
    $('#ruleButton').onclick=()=>$('#ruleOverlay').classList.remove('hidden');$('#ruleClose').onclick=()=>$('#ruleOverlay').classList.add('hidden');
    $('#resultNext').onclick=()=>{$('#resultLayer').classList.remove('show');if(state.processedToday>=8)showDayReport();else if(state.boxes.length)beginCurrentBox();else goStorage()};
    $('#dayNextButton').onclick=()=>{$('#dayReport').classList.add('hidden');state.day+=1;state.processedToday=0;state.dayCorrect=0;state.dayReward=0;saveState();goStorage()};
    $('#soundToggle').onclick=()=>{state.sound=!state.sound;$('#soundToggle').textContent=`효과음 ${state.sound?'ON':'OFF'}`;saveState()};
    $$('#inspectionGame .action-button').forEach(b=>b.onclick=()=>resolveAction(b.dataset.action));
    $('#contentGuess').addEventListener('change',()=>{if($('#contentGuess').value!=='unknown'&&$('#riskGuess').value!=='unknown')advanceInspectionGuide('guess')});$('#riskGuess').addEventListener('change',()=>{if($('#contentGuess').value!=='unknown'&&$('#riskGuess').value!=='unknown')advanceInspectionGuide('guess')});


    const guideOverlay=$('#guideOverlay'),guideFocus=$('#guideFocus'),guideCard=$('#guideCard'),guideKicker=$('#guideKicker'),guideTitle=$('#guideTitle'),guideText=$('#guideText'),guideTask=$('#guideTask'),guideProgress=$('#guideProgress'),guideNext=$('#guideNext'),guideSkip=$('#guideSkip');
    let guideMode='',guideIndex=0;
    const inspectionGuideSteps=[
      {target:'[data-tool="weight"]',title:'첫 번째 단서를 직접 조사하세요',text:'무게 측정은 내용물의 움직임과 무게 중심을 알려줍니다.',task:'강조된 무게 측정 버튼을 눌러주세요.',action:'tool',value:'weight'},
      {target:'#guideCluesTarget',title:'조사 기록을 확인하세요',text:'방금 얻은 단서가 조사 기록에 추가됐습니다. 모든 결과는 정확하지만 표현은 간접적입니다.',task:'기록을 읽은 뒤 아래 확인 버튼을 눌러주세요.',action:'next'},
      {target:'[data-tool="surface"]',title:'안전성 단서를 하나 더 찾으세요',text:'표면 흔적은 상자 안쪽의 긁힘과 충격 흔적으로 안전성을 알려줍니다.',task:'강조된 표면 흔적 버튼을 눌러주세요.',action:'tool',value:'surface'},
      {target:'#guideGuessTarget',title:'판정을 직접 입력하세요',text:'카테고리와 안전성을 선택해야 개봉 결과와 비교할 수 있습니다.',task:'카테고리와 안전성을 모두 선택해주세요.',action:'guess'},
      {target:'#guideOpenTarget',title:'상자를 개봉해 답을 확인하세요',text:'개봉하면 상자 한 개가 소비되고 등급별 보상을 카테고리와 안전성이 절반씩 나눠 받습니다.',task:'강조된 상자 개봉 버튼을 눌러주세요.',action:'open'},
      {target:'#resultLayer .result-card',title:'정산표를 읽어보세요',text:'각 상자의 별 등급 최대 보상을 카테고리와 안전성이 절반씩 나눠 받습니다.',task:'정산 내역을 확인하면 첫 업무가 끝납니다.',action:'complete'}
    ];
    function renderGuideProgress(total,current){guideProgress.innerHTML=Array.from({length:total},(_,i)=>`<span class="${i<=current?'done':''}"></span>`).join('')}
    function positionGuide(targetSelector,title,text,kicker='FIRST SHIFT',task='강조된 부분을 확인하세요.'){
      const target=$(targetSelector);if(!target)return;const rect=target.getBoundingClientRect(),pad=8;
      guideFocus.style.left=`${rect.left-pad}px`;guideFocus.style.top=`${rect.top-pad}px`;guideFocus.style.width=`${rect.width+pad*2}px`;guideFocus.style.height=`${rect.height+pad*2}px`;
      guideKicker.textContent=kicker;guideTitle.textContent=title;guideText.textContent=text;guideTask.textContent=task;
      let left=rect.right+18,top=Math.max(18,rect.top);if(left+380>innerWidth-18)left=Math.max(18,rect.left-398);if(top+300>innerHeight-18)top=Math.max(18,innerHeight-318);guideCard.style.left=`${left}px`;guideCard.style.top=`${top}px`;
    }
    function startMainGuide(){if(state.tutorialDone)return;onboardingActive=true;guideMode='main';guideIndex=0;guideOverlay.classList.remove('hidden');guideNext.textContent='서명 후 버튼을 눌러주세요';guideNext.disabled=true;renderGuideProgress(9,0);positionGuide('#workerSignature','업무 인수서에 서명하세요','쌓여 있는 서류 중 마지막 인수 확인서입니다. 빈칸에 이름을 입력한 뒤 업무 인수 버튼을 눌러주세요.','FIRST SHIFT · 1 / 9','서명란에 이름을 입력하고 아래 버튼을 눌러주세요.')}
    function startStorageGuide(){guideMode='storage';guideIndex=0;guideOverlay.classList.remove('hidden');guideNext.textContent='구매 버튼을 직접 눌러주세요';guideNext.disabled=true;renderGuideProgress(8,0);positionGuide('#buyBoxButton','첫 상자를 준비하세요','적재소는 감정할 상자를 사서 보관하는 장소입니다. 입고 방식마다 가격과 등급 확률이 다릅니다.','FIRST SHIFT · 1 / 8','강조된 상자 1개 구매 버튼을 직접 눌러주세요.')}
    function startMoveGuide(){guideMode='move';guideIndex=0;guideOverlay.classList.remove('hidden');guideNext.textContent='감정소 이동을 눌러주세요';guideNext.disabled=true;renderGuideProgress(8,1);positionGuide('#goInspectionButton','작업장 사이를 이동하세요','상자를 준비했으니 이제 감정소로 옮겨야 합니다. 이후에도 하단 이동 버튼으로 적재소와 감정소를 오갈 수 있습니다.','FIRST SHIFT · 2 / 8','강조된 감정소 이동 버튼을 직접 눌러주세요.')}
    function startInspectionGuide(){guideMode='inspection';guideIndex=0;guideOverlay.classList.remove('hidden');updateInspectionGuide()}
    function updateInspectionGuide(){const step=inspectionGuideSteps[guideIndex];guideNext.disabled=step.action!=='next'&&step.action!=='complete';guideNext.textContent=step.action==='next'?'확인했어요':step.action==='complete'?'튜토리얼 완료':'직접 조작해주세요';renderGuideProgress(8,guideIndex+2);positionGuide(step.target,step.title,step.text,`FIRST SHIFT · ${guideIndex+3} / 8`,step.task)}
    function advanceInspectionGuide(expectedAction,value=''){
      if(!onboardingActive||guideMode!=='inspection')return;
      const step=inspectionGuideSteps[guideIndex];if(!step||step.action!==expectedAction)return;if(value&&step.value!==value)return;
      if(guideIndex<inspectionGuideSteps.length-1){guideIndex++;setTimeout(updateInspectionGuide,220)}
    }
    function closeGuide(complete=false){guideOverlay.classList.add('hidden');if(complete){onboardingActive=false;state.tutorialDone=true;saveState();updateMainFirstRun()}}
    guideNext.onclick=()=>{if(guideMode==='inspection'){const step=inspectionGuideSteps[guideIndex];if(step.action==='next')advanceInspectionGuide('next');else if(step.action==='complete')closeGuide(true)}};
    guideSkip.onclick=()=>closeGuide(true);

    createTools();renderCollection();$('#soundToggle').textContent=`효과음 ${state.sound?'ON':'OFF'}`;updateGlobalUI();updateStorageUI();beginCurrentBox();updateMainFirstRun();setTimeout(resizeSignaturePad,80);

    function resizeRenderer(pack,element){const w=element.clientWidth,h=element.clientHeight;if(w<=0||h<=0)return;pack.renderer.setSize(w,h,false);pack.camera.aspect=w/h;pack.camera.updateProjectionMatrix()}
    function resizeInspection(){resizeRenderer(inspectionPack,$('#inspectionScene'))}function resizeStorage(){resizeRenderer(storagePack,$('#storageScene'))}
    addEventListener('resize',()=>{resizeInspection();resizeStorage();resizeSignaturePad();if(!guideOverlay.classList.contains('hidden')){if(guideMode==='storage')positionGuide('#buyBoxButton','첫 상자를 준비하세요','적재소는 감정할 상자를 사서 보관하는 장소입니다. 입고 방식마다 가격과 등급 확률이 다릅니다.','FIRST SHIFT · 1 / 8','강조된 상자 1개 구매 버튼을 직접 눌러주세요.');else if(guideMode==='move')positionGuide('#goInspectionButton','작업장 사이를 이동하세요','상자를 준비했으니 이제 감정소로 옮겨야 합니다. 이후에도 하단 이동 버튼으로 적재소와 감정소를 오갈 수 있습니다.','FIRST SHIFT · 2 / 8','강조된 감정소 이동 버튼을 직접 눌러주세요.');else if(guideMode==='inspection')updateInspectionGuide()}});
    const clock=new THREE.Clock();
    function animate(){requestAnimationFrame(animate);const d=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
      if(current&&insMode==='idle')inspectionRoot.position.y=.02+Math.sin(t*1.2)*.018;else if(insMode!=='idle'){insTime+=d;const p=Math.min(insTime/.75,1);if(insMode==='lift')inspectionRoot.position.y=.02+Math.sin(p*Math.PI)*.26;else inspectionRoot.rotation.z=Math.sin(p*Math.PI*6)*Math.sin(p*Math.PI)*.035;if(p>=1){insMode='idle';inspectionRoot.position.set(0,.02,0);inspectionRoot.rotation.z=0}}
      if(storageDropAnimation){
        const a=storageDropAnimation;a.time+=d;const p=Math.min(a.time/a.duration,1);const fall=Math.min(p/.72,1);const ease=fall<1?fall*fall:1;const settle=p>.72?(p-.72)/.28:0;
        a.mesh.position.x=a.targetX;a.mesh.position.z=a.targetZ;
        if(p<.72)a.mesh.position.y=THREE.MathUtils.lerp(a.startY,a.targetY,ease);
        else{const bounce=Math.abs(Math.sin(settle*Math.PI*3))*Math.pow(1-settle,2)*.17;a.mesh.position.y=a.targetY+bounce}
        const speedBlur=Math.max(0,1-Math.abs(fall-.62)*2.4);
        a.ghosts.forEach((ghost,index)=>{ghost.position.x=a.targetX;ghost.position.z=a.targetZ;ghost.position.y=a.mesh.position.y+(index+1)*(.18+.09*speedBlur);ghost.rotation.copy(a.mesh.rotation);ghost.visible=p<.82;ghost.traverse(object=>{if(object.material){(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>material.opacity=.045*speedBlur)}})});
        const squash=p>.69&&p<.92?Math.sin((p-.69)/.23*Math.PI):0;const base=THREE.MathUtils.lerp(a.targetScale*.94,a.targetScale,Math.min(p/.72,1));a.mesh.scale.set(base*(1+squash*.07),base*(1-squash*.13),base*(1+squash*.07));a.mesh.rotation.x=(1-p)*.03;a.mesh.rotation.y=THREE.MathUtils.lerp(a.targetRotationY+.025,a.targetRotationY,p);a.mesh.rotation.z=Math.sin(p*Math.PI*2)*(1-p)*.025;
        const impact=p>.69?Math.sin(Math.min((p-.69)/.31,1)*Math.PI):0;storageRoot.position.y=-impact*.035;storageRoot.rotation.z=(a.column-1)*impact*.009;
        storageDropLight.position.set(a.targetX,a.mesh.position.y+1.1,2.25);storageDropLight.intensity=p<.68?speedBlur*1.7:impact*4.2;
        if(p>.7&&p<.76&&!a.flashed){a.flashed=true;const flash=$('#dropFlash');const rect=$('#storageScene').getBoundingClientRect();flash.style.left=`${(a.targetX/4.8+.5)*100}%`;flash.style.top=`${72-a.targetY*5}%`;flash.classList.remove('show');void flash.offsetWidth;flash.classList.add('show')}
        if(p>=1){a.mesh.position.set(a.targetX,a.targetY,a.targetZ);a.mesh.scale.setScalar(a.targetScale);a.mesh.rotation.set(0,a.targetRotationY,0);storageRoot.position.y=0;storageRoot.rotation.z=0;finishStorageDrop()}
      }else{storageRoot.position.y=Math.sin(t*.9)*.008;storageDropLight.intensity=0}
      inspectionPack.renderer.render(inspectionPack.scene,inspectionPack.camera);storagePack.renderer.render(storagePack.scene,storagePack.camera)
    }
    resizeInspection();resizeStorage();animate();
