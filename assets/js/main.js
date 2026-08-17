
function toggleMenu(){document.getElementById('mobileMenu')?.classList.toggle('open')}
function scholarUrl(title){return 'https://scholar.google.com/scholar?q='+encodeURIComponent(title)}
function pubmedUrl(title){return 'https://pubmed.ncbi.nlm.nih.gov/?term='+encodeURIComponent(title)}
async function loadJSON(path){const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw new Error(path);return await r.json()}
function setPubCount(n){document.querySelectorAll('[data-pub-count]').forEach(el=>el.textContent=n+'+')}
function renderPublications(selector, path, limit, lang='ko'){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{const shown=limit?items.slice(0,limit):items; const count=lang==='ko'?`논문 ${items.length}편`:`${items.length} publications`; el.innerHTML=`<div class="count">${count}</div>`+shown.map(p=>{let btn=''; if(p.doi)btn+=`<a class="pub-btn btn-doi" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI ↗</a>`; btn+=`<a class="pub-btn btn-pubmed" href="${pubmedUrl(p.title)}" target="_blank" rel="noopener">PubMed</a>`; btn+=`<a class="pub-btn btn-scholar" href="${scholarUrl(p.title)}" target="_blank" rel="noopener">Google Scholar</a>`; if(p.url)btn+=`<a class="pub-btn btn-url" href="${p.url}" target="_blank" rel="noopener">Publisher</a>`; return `<div class="pub-item"><div class="year">${p.year||''}</div><div class="pub-text">${p.citation||p.title}</div><div class="pub-links">${btn}</div></div>`}).join(''); setPubCount(items.length);}).catch(()=>{el.innerHTML=lang==='ko'?'<div class="item">논문 목록을 불러오지 못했습니다.</div>':'<div class="item">Publications could not be loaded.</div>'})}
function renderNews(selector,path,limit,lang='ko'){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{const shown=limit?items.slice(0,limit):items; el.innerHTML=`<div class="count">${lang==='ko'?`언론보도 ${items.length}건`:`${items.length} press items`}</div>`+shown.map(n=>`<div class="item news-item"><div class="year">${n.date}</div><div><a href="${n.url}" target="_blank" rel="noopener">${n.title}</a><div class="item-meta"><span>${n.source||'Kyung Hee University Korean Medicine Hospital'}</span></div></div></div>`).join('')}).catch(()=>{el.innerHTML=(lang==='ko'?'<div class="item">언론보도를 불러오지 못했습니다.</div>':'<div class="item">Press coverage could not be loaded.</div>')})}
function renderNewsPaginated(selector,path,perPage=10,lang='ko'){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{let page=1; const total=Math.max(1,Math.ceil(items.length/perPage)); function draw(){const start=(page-1)*perPage; const shown=items.slice(start,start+perPage); const label=lang==='ko'?`언론보도 ${items.length}건`:`${items.length} press items`; const prev=lang==='ko'?'이전':'Prev'; const next=lang==='ko'?'다음':'Next'; el.innerHTML=`<div class="count">${label} · ${start+1}–${Math.min(start+perPage,items.length)}</div>`+shown.map(n=>`<div class="item news-item"><div class="year">${n.date}</div><div><a href="${n.url}" target="_blank" rel="noopener">${n.title}</a><div class="item-meta"><span>${n.source||'Kyung Hee University Korean Medicine Hospital'}</span></div></div></div>`).join('')+`<div class="pagination"><button class="page-btn" data-action="prev" ${page===1?'disabled':''}>${prev}</button>${Array.from({length:total},(_,i)=>`<button class="page-btn ${i+1===page?'active':''}" data-page="${i+1}">${i+1}</button>`).join('')}<button class="page-btn" data-action="next" ${page===total?'disabled':''}>${next}</button><span class="page-info">${page} / ${total}</span></div>`; el.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=Number(b.dataset.page);draw();}); const p=el.querySelector('[data-action="prev"]'); if(p)p.onclick=()=>{if(page>1){page--;draw();}}; const n=el.querySelector('[data-action="next"]'); if(n)n.onclick=()=>{if(page<total){page++;draw();}};} draw();}).catch(()=>{el.innerHTML=(lang==='ko'?'<div class="item">언론보도를 불러오지 못했습니다.</div>':'<div class="item">Press coverage could not be loaded.</div>')})}
function renderList(selector,path,type,limit){const el=document.querySelector(selector); if(!el)return; loadJSON(path).then(items=>{if(type==='talks'){items=items.slice().sort((a,b)=>normalizeDateForSort(b.date).localeCompare(normalizeDateForSort(a.date)));} const shown=limit?items.slice(0,limit):items; el.innerHTML=shown.map(x=>{if(type==='projects')return `<div class="item"><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.role}</span><span>${x.funder}</span><span>${x.period}</span>${x.amount?`<span>${x.amount}</span>`:''}</div><div class="item-desc">${x.desc||''}</div></div>`; if(type==='media')return `<div class="item"><span class="media-badge ${x.type==='TV'?'badge-tv':x.type==='Radio'?'badge-radio':''}">${x.type}</span><div class="item-title" style="margin-top:.6rem">${x.title}</div><div class="item-meta"><span>${x.date}</span></div>${x.url&&x.url!=='#'?`<a class="pill" style="margin-top:.7rem;display:inline-block" href="${x.url}" target="_blank" rel="noopener">View ↗</a>`:''}</div>`; if(type==='awards')return `<div class="item"><div class="year">${x.year}</div><div class="item-title">${x.name}</div><div class="item-meta"><span>${x.org}</span><span>${x.category||''}</span></div></div>`; if(type==='talks')return `<div class="item"><div class="year">${x.year||''}</div><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.category||''}</span><span>${x.date||''}</span><span>${x.event||''}</span><span>${x.location||''}</span></div></div>`; if(type==='patents')return `<div class="item"><div class="year">${x.year}</div><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.status}</span><span>${x.country}</span><span>${x.number}</span></div><div class="item-desc">${x.inventors||''}</div></div>`; if(type==='books')return `<div class="item"><div class="year">${x.year}</div><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.role||''}</span><span>${x.publisher||''}</span><span>${x.isbn||''}</span></div></div>`; if(type==='service')return `<div class="item"><div class="item-title">${x.title}</div><div class="item-meta"><span>${x.category||''}</span><span>${x.org||''}</span><span>${x.period||''}</span></div></div>`; return `<div class="item"><div class="item-title">${x.title||x.name}</div></div>`}).join('')})}
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
