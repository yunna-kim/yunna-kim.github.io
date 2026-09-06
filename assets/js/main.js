
function toggleMenu(){document.getElementById('mobileMenu')?.classList.toggle('open')}
function scholarUrl(title){return 'https://scholar.google.com/scholar?q='+encodeURIComponent(title)}
function pubmedUrl(title){return 'https://pubmed.ncbi.nlm.nih.gov/?term='+encodeURIComponent(title)}
async function loadJSON(path){const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw new Error(path);return await r.json()}
function setPubCount(n){document.querySelectorAll('[data-pub-count]').forEach(el=>el.textContent=n+'+')}
function renderPublications(selector, path, limit, lang='ko'){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{const shown=limit?items.slice(0,limit):items; const count=lang==='ko'?`논문 ${items.length}편`:`${items.length} publications`; el.innerHTML=`<div class="count">${count}</div>`+shown.map(p=>{let btn=''; if(p.doi)btn+=`<a class="pub-btn btn-doi" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI ↗</a>`; btn+=`<a class="pub-btn btn-pubmed" href="${pubmedUrl(p.title)}" target="_blank" rel="noopener">PubMed</a>`; btn+=`<a class="pub-btn btn-scholar" href="${scholarUrl(p.title)}" target="_blank" rel="noopener">Google Scholar</a>`; if(p.url)btn+=`<a class="pub-btn btn-url" href="${p.url}" target="_blank" rel="noopener">Publisher</a>`; return `<div class="pub-item"><div class="year">${p.year||''}</div><div class="pub-text">${p.citation||p.title}</div><div class="pub-links">${btn}</div></div>`}).join(''); setPubCount(items.length);}).catch(()=>{el.innerHTML=lang==='ko'?'<div class="item">논문 목록을 불러오지 못했습니다.</div>':'<div class="item">Publications could not be loaded.</div>'})}
function renderNews(selector,path,limit,lang='ko'){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{const shown=limit?items.slice(0,limit):items; el.innerHTML=`<div class="count">${lang==='ko'?`언론보도 ${items.length}건`:`${items.length} press items`}</div>`+shown.map(n=>`<div class="item news-item"><div class="year">${n.date}</div><div><a href="${n.url}" target="_blank" rel="noopener">${n.title}</a><div class="item-meta"><span>${n.source||'Kyung Hee University Korean Medicine Hospital'}</span></div></div></div>`).join('')}).catch(()=>{el.innerHTML=(lang==='ko'?'<div class="item">언론보도를 불러오지 못했습니다.</div>':'<div class="item">Press coverage could not be loaded.</div>')})}
function renderNewsPaginated(selector,path,perPage=10,lang='ko'){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{let page=1; const total=Math.max(1,Math.ceil(items.length/perPage)); function draw(){const start=(page-1)*perPage; const shown=items.slice(start,start+perPage); const label=lang==='ko'?`언론보도 ${items.length}건`:`${items.length} press items`; const prev=lang==='ko'?'이전':'Prev'; const next=lang==='ko'?'다음':'Next'; el.innerHTML=`<div class="count">${label} · ${start+1}–${Math.min(start+perPage,items.length)}</div>`+shown.map(n=>`<div class="item news-item"><div class="year">${n.date}</div><div><a href="${n.url}" target="_blank" rel="noopener">${n.title}</a><div class="item-meta"><span>${n.source||'Kyung Hee University Korean Medicine Hospital'}</span></div></div></div>`).join('')+`<div class="pagination"><button class="page-btn" data-action="prev" ${page===1?'disabled':''}>${prev}</button>${Array.from({length:total},(_,i)=>`<button class="page-btn ${i+1===page?'active':''}" data-page="${i+1}">${i+1}</button>`).join('')}<button class="page-btn" data-action="next" ${page===total?'disabled':''}>${next}</button><span class="page-info">${page} / ${total}</span></div>`; el.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=Number(b.dataset.page);draw();}); const p=el.querySelector('[data-action="prev"]'); if(p)p.onclick=()=>{if(page>1){page--;draw();}}; const n=el.querySelector('[data-action="next"]'); if(n)n.onclick=()=>{if(page<total){page++;draw();}};} draw();}).catch(()=>{el.innerHTML=(lang==='ko'?'<div class="item">언론보도를 불러오지 못했습니다.</div>':'<div class="item">Press coverage could not be loaded.</div>')})}
function renderList(selector,path,type,limit,cats,lang){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{if(cats&&cats.length){items=items.filter(x=>cats.indexOf(x.category)>=0);} if(type==='talks'){items=items.slice().sort((a,b)=>normalizeDateForSort(b.date).localeCompare(normalizeDateForSort(a.date)));} const shown=limit?items.slice(0,limit):items; let head=''; if(type==='patents'){const ko=(lang!=='en'); const dom=x=>ko?x.country==='대한민국':x.country==='Korea'; const reg=x=>['등록','Registered','Registration'].indexOf(x.status)>=0; const c=(f)=>items.filter(f).length; const parts=[[ko?'국내 등록':'Domestic registered', c(x=>dom(x)&&reg(x))],[ko?'국내 출원':'Domestic applications', c(x=>dom(x)&&!reg(x))],[ko?'국외 등록':'International registered', c(x=>!dom(x)&&reg(x))],[ko?'국외 출원':'International applications', c(x=>!dom(x)&&!reg(x))]].filter(p=>p[1]>0).map(p=>`${p[0]} ${p[1]}${ko?'건':''}`).join(' · '); head=`<div class="count">${ko?'총 '+items.length+'건':items.length+' patents'} — ${parts}</div>`;} el.innerHTML=head+shown.map(x=>{if(type==='projects')return `<div class="item"><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.role}</span><span>${x.funder}</span><span>${x.period}</span>${x.amount?`<span>${x.amount}</span>`:''}</div><div class="item-desc">${x.desc||''}</div></div>`; if(type==='media')return `<div class="item"><span class="media-badge ${x.type==='TV'?'badge-tv':x.type==='Radio'?'badge-radio':''}">${x.type}</span><div class="item-title" style="margin-top:.6rem">${x.title}</div><div class="item-meta"><span>${x.date}</span></div>${x.url&&x.url!=='#'?`<a class="pill" style="margin-top:.7rem;display:inline-block" href="${x.url}" target="_blank" rel="noopener">View ↗</a>`:''}</div>`; if(type==='awards')return `<div class="item"><div class="year">${x.year}</div><div class="item-title">${x.name}</div><div class="item-meta"><span>${x.org}</span><span>${x.category||''}</span></div></div>`; if(type==='talks')return `<div class="item"><div class="year">${x.year||''}</div><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.category||''}</span><span>${x.date||''}</span><span>${x.event||''}</span><span>${x.location||''}</span></div></div>`; if(type==='patents')return `<div class="item"><div class="year">${x.year}</div><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.status}</span><span>${x.country}</span><span>${x.number}</span></div><div class="item-desc">${x.inventors||''}</div></div>`; if(type==='books')return `<div class="item"><div class="year">${x.year}</div><div class="item-title">${x.title}</div><div class="item-meta">${x.role?`<span>${x.role}</span>`:''}${x.publisher?`<span>${x.publisher}</span>`:''}${x.isbn?`<span>ISBN ${x.isbn}</span>`:''}</div>${x.desc?`<div class="item-desc">${x.desc}</div>`:''}</div>`; if(type==='service')return `<div class="item"><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.category||''}</span><span>${x.org||''}</span><span>${x.period||''}</span></div></div>`; return `<div class="item"><div class="item-title">${x.title||x.name}</div></div>`}).join('')})}
function renderPubCount(path,fallback){if(fallback){setPubCount(fallback)} loadJSON(path).then(items=>{setPubCount(items.length)}).catch(()=>{})}


function projectIsPI(x){
  const role=(x.role||'').toLowerCase();
  return role.includes('연구책임자') || role.includes('principal investigator');
}
function renderProjects(selector,path,mode='all',lang='ko'){
  const el=document.querySelector(selector); if(!el)return;
  loadJSON(path).then(items=>{
    const data=(mode==='pi')?items.filter(projectIsPI):items;
    const heading=(lang==='ko')
      ? `${data.length}건 ${mode==='pi'?'· 연구책임자 과제':'· 전체 수행 연구과제'}`
      : `${data.length} ${mode==='pi'?'projects as Principal Investigator':'research projects in total'}`;
    el.innerHTML=`<div class="count">${heading}</div>`+data.map(x=>{
      const roleClass=projectIsPI(x)?'role-pi':'role-participant';
      return `<div class="item project-item ${roleClass}"><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.role}</span><span>${x.funder}</span><span>${x.period}</span>${x.amount?`<span>${x.amount}</span>`:''}</div><div class="item-desc">${x.desc||''}</div></div>`
    }).join('')
  }).catch(()=>{el.innerHTML=lang==='ko'?'<div class="item">연구과제를 불러오지 못했습니다.</div>':'<div class="item">Projects could not be loaded.</div>'})
}
function normalizeDateForSort(s){
  if(!s) return '0000-00-00';
  const m=String(s).match(/(\d{4})[.\-\/년 ]+\s*(\d{1,2})?[.\-\/월 ]*\s*(\d{1,2})?/);
  if(!m) return '0000-00-00';
  const y=m[1], mo=(m[2]||'01').padStart(2,'0'), d=(m[3]||'01').padStart(2,'0');
  return `${y}-${mo}-${d}`;
}
function initProfilePhotos(){
  document.querySelectorAll('img[data-photo]').forEach(img=>{
    const sources=(img.dataset.srcs||img.getAttribute('src')||'').split('|').filter(Boolean);
    let i=0;
    const container=img.closest('.portrait-card')||img.closest('.profile-photo-wrap');
    function tryNext(){
      if(i>=sources.length){ if(container) container.style.display='none'; return; }
      img.onerror=tryNext;
      img.onload=()=>{ if(container) container.style.display=''; };
      const src=sources[i++];
      img.src=src + (src.includes('?')?'':'?v=6');
    }
    tryNext();
  });
}

document.addEventListener('DOMContentLoaded', initProfilePhotos);

function renderSupplementalPublications(selector,path){
  const el=document.querySelector(selector); if(!el)return;
  loadJSON(path).then(items=>{
    el.innerHTML=`<div class="count">${items.length} supplemental domestic journal articles</div>`+items.map(p=>{
      const btn=`<a class="pub-btn btn-scholar" href="${scholarUrl(p.title)}" target="_blank" rel="noopener">Google Scholar</a>`;
      return `<div class="pub-item"><div class="year">${p.year||''}</div><div class="pub-text">${p.citation||p.title}</div>${p.journal?`<div class="pub-journal">${p.journal}${p.role?` · ${p.role}`:''}</div>`:''}<div class="pub-links">${btn}</div></div>`
    }).join('')
  }).catch(()=>{el.innerHTML='<div class="item">Supplemental publications could not be loaded.</div>'})
}
function renderHomeStats(lang='ko'){
  const base=lang==='ko'?'assets':'../assets';
  loadJSON(base+'/data/publications.json').then(items=>{
    document.querySelectorAll('[data-pub-count]').forEach(el=>{
      const current=parseInt((el.textContent||'').replace(/\D/g,''))||0;
      el.textContent=Math.max(current, items.length)+'+';
    });
  }).catch(()=>{});
  loadJSON(base+'/data/projects_'+(lang==='ko'?'ko':'en')+'.json').then(items=>{
    const pi=items.filter(projectIsPI).length;
    document.querySelectorAll('[data-pi-project-count]').forEach(el=>el.textContent=pi);
  }).catch(()=>{});
  loadJSON(base+'/data/patents_'+(lang==='ko'?'ko':'en')+'.json').then(items=>{
    document.querySelectorAll('[data-patent-count]').forEach(el=>el.textContent=items.length);
  }).catch(()=>{});
  loadJSON(base+'/data/awards_'+(lang==='ko'?'ko':'en')+'.json').then(items=>{
    document.querySelectorAll('[data-award-count]').forEach(el=>el.textContent=items.length);
  }).catch(()=>{});
}

function renderJournalPublications(selector,path,label='journal articles'){
  const el=document.querySelector(selector); if(!el)return;
  loadJSON(path).then(items=>{
    el.innerHTML=`<div class="count">${items.length} ${label}</div>`+items.map(p=>{
      let btn='';
      if(p.doi)btn+=`<a class="pub-btn btn-doi" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI ↗</a>`;
      btn+=`<a class="pub-btn btn-scholar" href="${scholarUrl(p.title)}" target="_blank" rel="noopener">Google Scholar</a>`;
      return `<div class="pub-item"><div class="year">${p.year||''}</div><div class="pub-text">${p.citation||p.title}</div>${p.journal?`<div class="pub-journal">${p.journal}${p.role?` · ${p.role}`:''}</div>`:''}<div class="pub-links">${btn}</div></div>`
    }).join('')
  }).catch(()=>{el.innerHTML='<div class="item">Supplemental journal articles could not be loaded.</div>'})
}

// 학회·강연 지도. talks_*.json 과 talk_locations.json 만 보고 그리므로,
// 발표를 추가하면 지도에도 자동으로 반영된다. (Leaflet + OpenStreetMap)
function renderTalkMap(elId, talksPath, locPath, lang='ko'){
  const el=document.getElementById(elId); if(!el)return;
  if(!window.L){el.style.display='none';return;}
  Promise.all([loadJSON(talksPath),loadJSON(locPath)]).then(([talks,locs])=>{
    const groups={};
    talks.forEach(t=>{
      const c=locs[t.location]; if(!c)return;
      const k=c.lat+','+c.lng;
      if(!groups[k])groups[k]={c:c,items:[]};
      groups[k].items.push(t);
    });
    const keys=Object.keys(groups);
    if(!keys.length){el.style.display='none';return;}
    const map=L.map(elId,{scrollWheelZoom:false});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const pts=[];
    // 팝업이 지도보다 넓으면 오른쪽 글자가 잘린다. 컨테이너 폭에 맞춰 줄인다.
    const popW=()=>Math.max(200,Math.min(330,el.clientWidth-46));
    keys.forEach(k=>{
      const g=groups[k], n=g.items.length;
      const name=lang==='ko'?g.c.ko:g.c.en;
      const head=lang==='ko'?`${name} · ${n}건`:`${name} · ${n} ${n>1?'presentations':'presentation'}`;
      g.items.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
      const li=g.items.map(t=>`<li><span class="map-pop-date">${t.date||''}</span> ${t.title||''}`
        +(t.event?`<span class="map-pop-event">${t.event}</span>`:'')+`</li>`).join('');
      L.circleMarker([g.c.lat,g.c.lng],{
        radius:Math.min(9+n*1.6,22),color:'#7a9e87',weight:2,
        fillColor:'#7a9e87',fillOpacity:.45
      }).addTo(map).bindPopup(`<div class="map-pop"><h4>${head}</h4><ul>${li}</ul></div>`,{maxWidth:popW()});
      pts.push([g.c.lat,g.c.lng]);
    });
    el._map=map;
    // 컨테이너 크기가 잡히기 전에 fitBounds 가 돌면 최대 줌으로 확대돼 버린다.
    // 레이아웃이 끝난 뒤 크기를 다시 재고 범위를 맞춘다. maxZoom 은 안전장치.
    const fit=()=>{map.invalidateSize();map.fitBounds(pts,{padding:[34,34],maxZoom:6});};
    fit(); setTimeout(fit,120);
    if(window.ResizeObserver){new ResizeObserver(()=>{
      map.invalidateSize();
      const w=popW();
      map.eachLayer(l=>{const p=l.getPopup&&l.getPopup(); if(p)p.options.maxWidth=w;});
    }).observe(el);}
  }).catch(()=>{el.style.display='none'});
}

// 연구 페이지 상단 요약 — 데이터에서 세므로 항목을 추가하면 자동으로 따라온다.
function renderResearchStats(base, lang='ko'){
  const set=(k,v)=>document.querySelectorAll('[data-research-'+k+']').forEach(el=>el.textContent=v);
  loadJSON(base+'/data/projects_'+(lang==='ko'?'ko':'en')+'.json').then(p=>{
    set('all',p.length); set('pi',p.filter(projectIsPI).length);
  }).catch(()=>{});
  loadJSON(base+'/data/patents_'+(lang==='ko'?'ko':'en')+'.json').then(p=>{
    const ko=lang!=='en';
    const reg=x=>['등록','Registered','Registration'].indexOf(x.status)>=0;
    const dom=x=>x.country===(ko?'대한민국':'Korea');
    const d=p.filter(dom), i=p.filter(x=>!dom(x));
    const sub=(a,r)=>{const parts=[];
      if(r) parts.push(ko?('등록 '+r+'건'):(r+' registered'));
      if(a-r) parts.push(ko?('출원 '+(a-r)+'건'):((a-r)+' filed'));
      return parts.join(' · ');};
    set('patentsdom',d.length); set('patentsintl',i.length);
    document.querySelectorAll('[data-research-sub-dom]').forEach(el=>el.textContent=sub(d.length,d.filter(reg).length));
    document.querySelectorAll('[data-research-sub-intl]').forEach(el=>el.textContent=sub(i.length,i.filter(reg).length));
  }).catch(()=>{});
}

// 활동 전체 목록 — category 별로 소제목을 달아 묶어서 그린다.
// 분류 순서는 데이터에 나온 순서를 따른다.
function renderServiceGrouped(selector, path){
  const el=document.querySelector(selector); if(!el)return;
  loadJSON(path).then(items=>{
    const order=[], groups={};
    items.forEach(x=>{
      const c=x.category||'';
      if(!groups[c]){groups[c]=[]; order.push(c);}
      groups[c].push(x);
    });
    el.innerHTML=order.map(c=>{
      const rows=groups[c].map(x=>
        `<div class="item"><div class="item-title">${x.title||''}</div>`
        +`<div class="item-meta">${[x.org,x.period].filter(Boolean).map(v=>`<span>${v}</span>`).join('')}</div></div>`
      ).join('');
      return `<h3 class="item-group-title">${c} <span class="group-count">${groups[c].length}</span></h3>${rows}`;
    }).join('');
  }).catch(()=>{el.innerHTML='<div class="item">활동 목록을 불러오지 못했습니다.</div>'});
}
