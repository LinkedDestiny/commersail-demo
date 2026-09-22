/* Interactive local prototype. AI candidates are preloaded reference media. */
(() => {
  'use strict';
  const C = window.DemoCore;
  const seed = window.DEMO_DATA.products;
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const e = C.escapeHTML;
  const clone = value => JSON.parse(JSON.stringify(value));
  const STORE = 'tuying-interactive-demo-v1:' + location.pathname;
  const names = { library:'数据包管理', albums:'图包管理', bulk:'批量处理', inspect:'人工鉴图', words:'违规词库', review:'风险检查', media:'媒体资源', studio:'AI 创作', export:'转换导出', tasks:'任务中心' };
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="10.8" cy="10.8" r="7.3"/><path d="m16 16 4.5 4.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    list: '<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    upload: '<path d="M12 16V3m-4 4 4-4 4 4M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
    download: '<path d="M12 3v13m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>', left: '<path d="m15 5-7 7 7 7"/>',
    check: '<path d="m5 12 4 4L19 6"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>',
    sparkle: '<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7ZM20 2v4M18 4h4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
    video: '<rect x="3" y="5" width="13" height="14" rx="3"/><path d="m16 10 5-3v10l-5-3Z"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 11 3 3 5-5"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    zoom: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5M7 10.5h7M10.5 7v7"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    file: '<path d="M14 2H5v20h14V7ZM14 2v6h5M8 12h8M8 16h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    refresh: '<path d="M20 7a8.5 8.5 0 1 0 .8 8M20 3v5h-5"/>',
    warning: '<path d="m12 3 10 18H2ZM12 9v5M12 17h.01"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 17l9 5 9-5"/>',
    cut: '<path d="M5 3v16h16M3 5h16v16"/>',
    wand: '<path d="m4 20 12-12 4 4L8 24ZM14 10l4 4M5 3v4M3 5h4M18 2v4M16 4h4"/>',
    box: '<path d="m12 2 9 5v10l-9 5-9-5V7Zm-9 5 9 5 9-5M12 12v10M7.5 4.5l9 5"/>',
    undo: '<path d="M3 10h10a7 7 0 0 1 0 14M3 10l5-5M3 10l5 5"/>',
    play: '<path d="m8 4 13 8-13 8Z"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.image}</svg>`;
  const btn = (label, action, cls = '', attrs = '', glyph = '') => `<button class="button ${cls}" data-action="${action}" ${attrs}>${glyph ? icon(glyph) : ''}<span>${label}</span></button>`;
  const ib = (label, action, glyph, attrs = '') => `<button class="icon-button" aria-label="${e(label)}" title="${e(label)}" data-action="${action}" ${attrs}>${icon(glyph)}</button>`;
  const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#eeeae4"/><path d="M220 240h160v120H220zM220 330l50-50 50 40 30-40 30 50" fill="none" stroke="#a9aaa1" stroke-width="5"/></svg>');
  const media = value => window.DEMO_ASSETS?.[value] || value;
  const src = value => typeof value === 'string' && (value === placeholder || /^assets\/[\w.-]+$/.test(value) || /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)) ? media(value) : placeholder;
  let stored;
  try { stored = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { stored = null; }
  const state = {
    products: (Array.isArray(stored?.products) ? stored.products : clone(seed)).map(p=>({...p,sourceId:p.sourceId||p.id,reviewedImages:Array.isArray(p.reviewedImages)?p.reviewedImages:[],packageId:p.packageId||'pack-default'})),
    packs: Array.isArray(stored?.packs) ? stored.packs : [{id:'pack-default',name:'阿里2026年09月21日18时26分16秒',group:'未分组',type:'数据包',createdAt:'2026/09/22 13:05',updatedAt:'2026/09/22 13:05',note:''}],
    libraryMode:'packages', packageQuery:'', packageGroup:'all', packageType:'all', selectedPacks:new Set(), pendingImportPackId:null,
    groups: stored?.groups || ['秋日童装', '夏日轻装'],
    favorites: stored?.favorites || [], generated: stored?.generated || [],
    tasks: (stored?.tasks || []).map(t => t.status === 'running' ? { ...t, status: 'cancelled' } : t),
    checked: stored?.scanVersions ? (stored?.checked||[]) : [], scanVersions:stored?.scanVersions||{}, ignored:stored?.ignored||[], scanned:stored?.scanned||false,
    blacklist:stored?.blacklist||[], uploads:stored?.uploads||[], wordLibraries:stored?.wordLibraries||[
      {id:'words-title',name:'标题基础词库',type:'title',words:['最强','第一','绝对','顶级','100%']},
      {id:'words-brand',name:'品牌关注词库',type:'brand',words:['NIKE','KITTY']},
      {id:'words-image',name:'图片文字词库',type:'image',words:['Nebeans','微信','联系方式']}
    ],
    rules: stored?.rules || { words: ['最强', '第一', '绝对', '顶级', '100%'], price: true, stock: true, images: true, title: true },
    page: 'library', group: 'all', filter: 'all', query: '', sort: 'default', view: 'grid', selected: new Set(),
    studio: {id:seed[0].id,mode:'white',ratio:'1:1',count:2,source:0,sourceRole:'main',targetRole:'whiteImages',preset:'自然光',prompt:'自然光，奶油色室内，保持商品细节',selected:0,result:null},
    reviewFilter:'all',reviewScope:null,reviewSelected:new Set(),wordType:'all',taskFilter:'all',mediaType:'all',
    export:{platform:'图映',tool:'图映默认数据包',format:'json',scope:'all',folders:0,distribution:'balanced',limit:0,mediaTypes:['main','portraitMain','skuImages','details','whiteImages','qualifications','video']},
  };
  state.rules={...state.rules,brand:state.rules.brand??true,libraryIds:state.rules.libraryIds||state.wordLibraries.map(w=>w.id),imageCounts:state.rules.imageCounts||{main:5,details:20,skuImages:5}};
  const timers = new Map(), downloads = new Map();
  let modal = null, undoAction = null, toastTimer, hoverTimer;
  const main = $('#main'), dialog = $('#dialog'), lightbox = $('#lightbox');
  const getProduct = id => state.products.find(p => p.id === id);
  const sourceId = p => String(p.sourceId||p.id);
  const blacklistKey = p => `${p.platform||'1688'}:${sourceId(p)}`;
  const excluded = p => state.blacklist.includes(blacklistKey(p));
  const packProducts = id => state.products.filter(p=>p.packageId===id);
  const activePool = () => state.products.filter(p=>!excluded(p));
  const packName = id => state.packs.find(p=>p.id===id)?.name||'未分组';
  const roles = {main:'1:1 主图',portraitMain:'3:4 主图',skuImages:'SKU 图',details:'详情图',whiteImages:'白底图',qualifications:'商品资质',video:'视频'};
  function ruleWords(type) {return [...new Set(state.wordLibraries.filter(w=>w.type===type&&state.rules.libraryIds.includes(w.id)).flatMap(w=>w.words))];}
  function checkSignature(p) {const v=JSON.stringify([p.title,p.category,p.platform,p.attributes,p.skus,p.main,p.portraitMain,p.skuImages,p.details,p.whiteImages,p.qualifications,p.video,p.originalSummaryPrice,state.rules,state.wordLibraries]);let h=2166136261;for(let i=0;i<v.length;i++)h=Math.imul(h^v.charCodeAt(i),16777619);return (h>>>0).toString(16);}
  const checkedNow = p => state.scanVersions[p.id]===checkSignature(p);
  function save() {
    // ponytail: browser storage is enough for this small demo; a real asset library needs a database.
    const { products,packs,groups,favorites,generated,tasks,checked,scanVersions,ignored,scanned,rules,blacklist,uploads,wordLibraries } = state;
    try { localStorage.setItem(STORE, JSON.stringify({products,packs,groups,favorites,generated,tasks,checked,scanVersions,ignored,scanned,rules,blacklist,uploads,wordLibraries})); return true; }
    catch { toast('本地存储已满，未能保存'); return false; }
  }
  function toast(message, undo) {
    clearTimeout(toastTimer); undoAction = undo || null;
    $('#toast').innerHTML = `${icon('check')}<span>${e(message)}</span>${undo ? '<button data-action="undo">撤销</button>' : ''}`;
    $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), undo ? 7000 : 3200);
  }
  function head(title, actions = '', meta = '') {
    return `<div class="page-head"><div class="page-title"><h1>${title}</h1>${meta ? `<span class="page-meta">${meta}</span>` : ''}</div><div class="page-actions">${actions}</div></div>`;
  }
  function activeProducts() {
    const q = state.query.trim().toLowerCase();
    const list = activePool().filter(p => (state.group === 'all' || p.group === state.group) && (!q || `${p.title} ${p.shortTitle} ${sourceId(p)} ${p.category}`.toLowerCase().includes(q)) && (state.filter !== 'favorites' || state.favorites.includes(p.id)) && (state.filter !== 'reviewed' || checkedNow(p)));
    if (state.sort === 'price-asc') list.sort((a,b) => a.price-b.price);
    if (state.sort === 'price-desc') list.sort((a,b) => b.price-a.price);
    return list;
  }
  function route(page) { if (!names[page]) page = 'library'; state.page = page; location.hash = page; document.body.classList.remove('sidebar-open', 'menu-open'); render(); }
  function render() {
    if (!getProduct(state.studio.id)||excluded(getProduct(state.studio.id))) state.studio.id = activePool()[0]?.id;
    $('[id="breadcrumb"]').textContent = names[state.page];
    $$('[data-nav]').forEach(el => { el.classList.toggle('active', el.dataset.nav === state.page); el.setAttribute('aria-current', el.dataset.nav === state.page ? 'page' : 'false'); });
    $$('[data-group]').forEach(el => el.classList.toggle('active', state.page === 'library' && state.group === el.dataset.group));
    $('#libraryCount').textContent = state.packs.length;
    $('.group-nav').innerHTML = `<button class="sidebar-group ${state.group==='all'?'active':''}" data-group="all">${icon('folder')}<span>全部商品</span><span>${state.products.length}</span></button>` + state.groups.map((g,i)=>`<button class="sidebar-group ${state.group===g?'active':''}" data-group="${e(g)}"><span class="group-dot ${i%2?'dot-sand':'dot-olive'}"></span><span>${e(g)}</span><span>${state.products.filter(p=>p.group===g).length}</span></button>`).join('');
    $('#taskDot').hidden = !state.tasks.some(t=>t.status==='running');
    $('#menuMobile').setAttribute('aria-expanded',String(document.body.classList.contains('sidebar-open')));
    if(state.page==='bulk'){main.innerHTML=head('批量处理')+'<div id="bulkHost"></div>';window.DemoBulk.mount($('#bulkHost'),{getProducts:()=>clone(state.products),getPackages:()=>clone(state.packs),getBlacklist:()=>[...state.blacklist],onApply:applyBulk});return;}
    main.innerHTML = ({library,albums:library,inspect:inspectionPage,words:wordsPage,media:mediaPage,studio,review,export:exportPage,tasks:tasksPage})[state.page]();
  }
  const visiblePacks = () => state.packs.filter(p=>(state.page!=='albums'||p.type==='图包')&&(state.packageType==='all'||p.type===state.packageType)&&(state.packageGroup==='all'||p.group===state.packageGroup)&&(!state.packageQuery||p.name.toLowerCase().includes(state.packageQuery.toLowerCase())));
  function library() {
    if(state.libraryMode==='products') return `<div class="pk-back">${btn('数据包管理','package-home','ghost','','left')}</div>`+productLibrary();
    const packs=visiblePacks();
    return head(state.page==='albums'?'图包管理':'数据包管理',btn('商品视图','product-view','','','grid')+(state.page==='albums'?btn('生成图包','make-album','primary','','plus'):btn('添加数据包','import','primary','','plus')),`${packs.length} 个${state.page==='albums'?'图包':'数据包'}`)+
      `<section class="pk-filters"><div class="pk-filter-fields"><div class="segmented pk-type">${[['all','全部'],['数据包','数据包'],['图包','图包']].map(([key,label])=>`<button class="segment ${state.packageType===key?'active':''}" data-action="package-type" data-value="${key}">${label}</button>`).join('')}</div><label class="pk-field"><span>数据包名称</span><input id="packageSearch" value="${e(state.packageQuery)}" placeholder="搜索数据包"></label><label class="pk-field"><span>所属分组</span><select id="packageGroup"><option value="all">全部</option>${['未分组',...state.groups].map(g=>`<option value="${e(g)}" ${state.packageGroup===g?'selected':''}>${e(g)}</option>`).join('')}</select></label>${btn('搜索','package-search','primary','','search')}${btn('重置','package-reset','','','refresh')}</div><div class="pk-batch-actions">${btn('批量删除','delete-packs','danger small',state.selectedPacks.size?'':'disabled','trash')}${btn('管理分组','manage-groups','small','','folder')+btn('黑名单','blacklist','small')+btn('合并数据包','merge-packs','small',state.selectedPacks.size<2?'disabled':'')}${btn('导出记录','package-records','small','','clock')}${btn('人工鉴图','inspect-package','small','','image')}${btn('AI 图片、标题检测','review-packages','small','','shield')}</div></section>`+
      `<div class="pk-table-wrap"><table class="pk-table"><thead><tr><th><input id="selectAllPacks" type="checkbox" aria-label="全选数据包" ${packs.length&&packs.every(p=>state.selectedPacks.has(p.id))?'checked':''}></th><th>ID</th><th>数据包名称</th><th>所属分组</th><th>商品数</th><th>类型</th><th>创建时间</th><th>更新时间</th><th>备注</th><th>操作</th></tr></thead><tbody>${packs.map((p,i)=>{const items=state.products.filter(x=>x.packageId===p.id);return `<tr><td><input type="checkbox" data-pack-select="${e(p.id)}" aria-label="选择数据包 ${e(p.name)}" ${state.selectedPacks.has(p.id)?'checked':''}></td><td>${i+1}</td><td><button class="pk-name" data-action="package-open" data-id="${e(p.id)}" title="${e(p.name)}">${e(p.name)}</button></td><td><select aria-label="数据包分组 ${e(p.name)}" data-pack-group="${e(p.id)}">${['未分组',...state.groups].map(g=>`<option ${p.group===g?'selected':''}>${e(g)}</option>`).join('')}</select></td><td>${items.length}</td><td><span class="status-pill neutral">${e(p.type)}</span></td><td class="pk-time">${e(p.createdAt)}</td><td class="pk-time">${e(p.updatedAt)}</td><td><input class="pk-note" data-pack-note="${e(p.id)}" value="${e(p.note)}" aria-label="数据包备注"></td><td><div class="pk-row-actions"><button class="pk-open" data-action="package-open" data-id="${e(p.id)}">查看商品 ${icon('arrow')}</button><button data-action="package-low" data-id="${e(p.id)}">低价检测</button><button data-action="package-export" data-id="${e(p.id)}">${p.type==='图包'?'下载图包':'导出数据包'}</button><button data-action="package-append" data-id="${e(p.id)}">追加数据包</button><button data-action="package-rename" data-id="${e(p.id)}">改名</button></div></td></tr>`}).join('')||'<tr><td colspan="10" class="pk-empty">暂无数据包</td></tr>'}</tbody></table></div><div class="pk-pagination"><span>共 ${packs.length} 条</span><select aria-label="每页条数"><option>20 条/页</option></select><button class="icon-button" disabled aria-label="上一页">${icon('left')}</button><span class="pk-page-number">1</span><button class="icon-button" disabled aria-label="下一页">${icon('chevron')}</button></div>`;
  }
  function openPackage(packId, initialId, initialTab='main') {
    const products=state.products.filter(p=>p.packageId===packId);
    const pack=state.packs.find(p=>p.id===packId);
    window.PackageWorkbench.open({products:clone(products),initialId,initialTab,inspection:state.page==='inspect',packageName:pack?.name||'数据包详情',src,media,getBlacklist:()=>[...state.blacklist],onBlacklistChange:setBlacklist,
      onSave(product){const validation=C.validateProduct(product);if(!validation.ok)return false;const next=clone(product),previous=state.products,previousSignature=checkSignature(getProduct(product.id));next.packageId=packId;syncDerived(next);state.products=state.products.map(p=>p.id===next.id?next:p);if(previousSignature!==checkSignature(next))changed(next.id);if(pack)pack.updatedAt=new Date().toLocaleString('zh-CN',{hour12:false});if(!save()){state.products=previous;return false;}return true;},
      onDelete(id){const before=state.products;state.products=state.products.filter(p=>p.id!==id);if(!save()){state.products=before;throw Error('删除未保存');}state.selected.delete(id);state.favorites=state.favorites.filter(x=>x!==id);},
      onDeletePackage(){const before={products:state.products,packs:state.packs};state.products=state.products.filter(p=>p.packageId!==packId);state.packs=state.packs.filter(p=>p.id!==packId);if(!save()){state.products=before.products;state.packs=before.packs;throw Error('删除未保存');}state.selectedPacks.delete(packId);state.selected.clear();render();},
      onOpenAI(id,mode){state.studio.id=id;state.studio.mode=mode||'scene';state.studio.source=0;state.studio.sourceRole='main';state.studio.targetRole=mode==='white'?'whiteImages':'main';state.studio.result=null;state.studio.comparison=false;route('studio');},
      onExport(ids){state.selected=new Set(ids);state.export.scope='selected';route('export');},
      onReview(ids,filter='all'){state.reviewScope=ids;state.reviewFilter=filter==='images'?'image':filter;route('review');scan();},
      onAppend(){state.pendingImportPackId=packId;importDialog();},onClose(){render();}
    });
  }
  function productLibrary() {
    const products = activeProducts();
    return head('商品资产', btn('新建分组','new-group','','','plus') + btn('导入数据包','import','primary','','upload'), `${state.products.length} 件商品`) +
      `<div class="collection-strip">${state.groups.map((g,i) => `<button class="collection-tile ${state.group === g ? 'active' : ''}" data-action="group" data-value="${e(g)}"><span class="collection-icon tone-${i % 2}">${icon('folder')}</span><span class="collection-info"><strong>${e(g)}</strong><span>${state.products.filter(p=>p.group===g).length} 件商品</span></span>${icon('chevron')}</button>`).join('')}<button class="collection-tile collection-add" data-action="new-group" aria-label="新建分组">${icon('plus')}</button></div>` +
      `<div class="tabs"><button class="tab ${state.filter==='all'?'active':''}" data-action="filter" data-value="all">全部商品 <span class="tab-count">${state.products.length}</span></button><button class="tab ${state.filter==='favorites'?'active':''}" data-action="filter" data-value="favorites">我的收藏 <span class="tab-count">${state.favorites.length}</span></button><button class="tab ${state.filter==='reviewed'?'active':''}" data-action="filter" data-value="reviewed">已检查 <span class="tab-count">${activePool().filter(checkedNow).length}</span></button><span class="tabs-spacer"></span>${state.group!=='all'?btn(e(state.group)+' ×','clear-group','ghost small'):''}</div>` +
      `<div class="toolbar"><div class="toolbar-left"><label class="check-row"><input type="checkbox" id="selectAll" ${products.length&&products.every(p=>state.selected.has(p.id))?'checked':''}> 全选</label><span class="muted">${products.length} 件商品</span></div><div class="toolbar-right"><select class="select-control" aria-label="商品排序" id="sort"><option value="default" ${state.sort==='default'?'selected':''}>最近添加</option><option value="price-asc" ${state.sort==='price-asc'?'selected':''}>价格从低到高</option><option value="price-desc" ${state.sort==='price-desc'?'selected':''}>价格从高到低</option></select><div class="view-switch">${ib('网格视图','view','grid',`data-value="grid" aria-pressed="${state.view==='grid'}"`)}${ib('列表视图','view','list',`data-value="list" aria-pressed="${state.view==='list'}"`)}</div></div></div>`+
      (products.length ? `<div class="product-grid ${state.view==='list'?'list-view':''}">${products.map(card).join('')}</div>` : `<div class="empty-state">${icon('search')}<h2>暂无商品</h2>${btn('查看全部','clear-search','primary')}</div>`) +
      (state.selected.size ? `<div class="selection-bar"><span><strong>${state.selected.size}</strong> 件已选</span>${btn('批量改价','batch-price','ghost','','edit')}${btn('移动分组','move-group','ghost','','folder')}${btn('风险检查','review-selected','ghost','','shield')}${btn('导出','export-selected','primary','','download')}${ib('删除选中商品','delete-selected','trash')}${ib('取消选择','clear-selected','close')}</div>` : '');
  }
  function card(p) {
    return `<article class="product-card ${state.selected.has(p.id)?'selected':''}"><div class="product-visual"><button class="card-image-button" data-action="detail" data-id="${p.id}" aria-label="编辑 ${e(p.shortTitle)}"><img class="product-image" src="${src(p.main[0])}" alt="${e(p.shortTitle)}" loading="lazy"></button><button class="card-select ${state.selected.has(p.id)?'checked':''}" data-action="select" data-id="${p.id}" aria-label="选择 ${e(p.shortTitle)}" aria-pressed="${state.selected.has(p.id)}">${state.selected.has(p.id)?icon('check'):''}</button><span class="card-badge">${p.skus.length} SKU</span><div class="card-actions">${ib('预览 '+p.shortTitle,'zoom','zoom',`data-src="${e(src(p.main[0]))}"`)}${ib(state.favorites.includes(p.id)?'取消收藏':'收藏','favorite','star',`data-id="${p.id}" aria-pressed="${state.favorites.includes(p.id)}"`)}</div></div><div class="product-info"><div class="product-meta"><span>1688</span><span>${e(p.category)}</span></div><button class="product-title" data-action="detail" data-id="${p.id}">${e(p.shortTitle || p.title)}</button><div class="product-footer"><span class="product-price"><small>¥</small>${C.formatMoney(p.price).replace(/[¥￥]/g,'')}${p.priceMax>p.price?`<small>起</small>`:''}</span><span class="product-status ${checkedNow(p)?'checked':''}">${checkedNow(p)?icon('check'):'<i></i>'}${checkedNow(p)?'已检查':'待检查'}</span></div></div></article>`;
  }
  const modes = { white: ['白底图','cut'], scene: ['商品生图','image'], repair: ['局部修补','wand'], video: ['商品视频','video'] };
  function studio() {
    const s = state.studio, p = getProduct(s.id);
    if (!p) return head('AI 创作') + '<div class="empty-state">暂无商品</div>';
    const sourceImages=s.sourceRole==='library'?state.uploads.filter(x=>x.kind==='image').map(x=>x.url):(p[s.sourceRole]||[]),sourceImage=sourceImages[s.source]||p.main[0];
    const task = state.tasks.find(t=>t.status==='running' && t.kind==='ai');
    const results = s.result?.productId === p.id && s.result.mode === s.mode ? s.result : null;
    const preview = results ? results.images[s.selected] : sourceImage;
    return head('AI 创作', `<span class="status-pill neutral">演示</span>${btn('创作记录','studio-history','','','clock')}`)+
      `<div class="studio-layout"><section class="studio-controls"><div class="field"><label class="field-label" for="studioPackage">数据包</label><select id="studioPackage">${state.packs.filter(pack=>activePool().some(x=>x.packageId===pack.id)).map(pack=>`<option value="${pack.id}" ${p.packageId===pack.id?'selected':''}>${e(pack.name)}</option>`).join('')}</select></div><div class="field"><label class="field-label" for="studioProduct">商品</label><select id="studioProduct" class="select-control">${activePool().filter(x=>x.packageId===p.packageId).map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${e(x.shortTitle)}</option>`).join('')}</select></div><div class="field"><label class="field-label" for="studioSourceRole">图片来源</label><select id="studioSourceRole">${[['main','主图'],['skuImages','SKU 图'],['details','详情图'],['library','媒体资源']].map(([k,l])=>`<option value="${k}" ${s.sourceRole===k?'selected':''}>${l}</option>`).join('')}</select></div><div class="source-picker">${sourceImages.map((im,i)=>`<button class="source-thumb ${s.source===i?'active':''}" data-action="studio-source" data-index="${i}" aria-label="选择源图 ${i+1}" aria-pressed="${s.source===i}"><img src="${src(im)}" alt="主图 ${i+1}"></button>`).join('')}</div><div class="field"><span class="field-label">创作类型</span><div class="creation-types">${Object.entries(modes).map(([key,[label,ico]])=>`<button class="creation-type ${s.mode===key?'active':''}" data-action="studio-mode" data-value="${key}" aria-pressed="${s.mode===key}">${icon(ico)}<span>${label}</span></button>`).join('')}</div></div><div class="field"><span class="field-label">画面比例</span><div class="segmented">${['1:1','3:4','9:16'].map(v=>`<button class="segment ${s.ratio===v?'active':''}" data-action="studio-ratio" data-value="${v}" aria-pressed="${s.ratio===v}">${v}</button>`).join('')}</div></div>${s.mode==='scene'||s.mode==='repair'?`<div class="field"><label class="field-label" for="aiPrompt">${s.mode==='repair'?'修补要求':'场景关键词'}</label><textarea id="aiPrompt" rows="3">${e(s.prompt)}</textarea></div>`:''}<div class="form-grid"><div class="field"><label class="field-label" for="candidateCount">候选数量</label><select class="select-control" id="candidateCount"><option value="2" ${s.count===2?'selected':''}>2 个</option><option value="4" ${s.count===4?'selected':''}>4 个</option></select></div><div class="field"><label class="field-label" for="aiPreset">${s.mode==='video'?'时长':'风格'}</label><select class="select-control" id="aiPreset">${(s.mode==='video'?['18 秒']:['自然光','柔和阴影','极简棚拍']).map(v=>`<option ${s.preset===v?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="field"><label class="field-label" for="studioTargetRole">采用用途</label><select id="studioTargetRole" ${s.mode==='video'?'disabled':''}>${[['main','主图'],['portraitMain','3:4 主图'],['details','详情图'],['whiteImages','白底图']].map(([k,l])=>`<option value="${k}" ${s.targetRole===k?'selected':''}>${l}</option>`).join('')}</select></div><div class="studio-generate">${btn(task?'生成中…':'开始生成','generate','primary',task||!sourceImages.length?'disabled':'','sparkle')}${task?`<div class="progress-track"><div class="progress-fill" style="width:${task.progress}%"></div></div>`:''}</div></section><section class="studio-preview"><div class="preview-toolbar"><div class="preview-tabs"><button class="${!s.comparison?'active':''}" data-action="compare" data-value="false">${results?'生成结果':'原始图片'}</button>${results?'<button data-action="compare" data-value="true" class="'+(s.comparison?'active':'')+'">前后对比</button>':''}</div><span class="muted">${e(s.ratio)}</span>${ib('放大预览','zoom','zoom',`data-src="${e(src(preview))}"`)}</div><div class="preview-stage ${s.comparison&&results?'comparison':''} ${task?'is-generating':''}">${s.comparison&&results?`<div class="compare-image"><span class="comparison-label">原图</span><img src="${src(results?.sourceImage||sourceImage)}" alt="原始商品图"></div>`:''}<div class="compare-image" style="--preview-ratio:${s.ratio.replace(':','/')}">${results?'<span class="comparison-label">候选 '+(s.selected+1)+'</span>':''}${results&&s.mode==='video'&&p.video?`<video src="${e(media(p.video))}" controls playsinline preload="metadata" poster="${src(preview)}"></video>`:`<img src="${src(preview)}" alt="${results?'候选结果':'原始商品图'}">`}${task?`<div class="generating-overlay">${icon('sparkle')}<strong>${task.progress}%</strong><span>生成中</span></div>`:''}</div></div>${results?`<div class="result-bar"><div class="result-grid">${results.images.map((im,i)=>`<button class="result-tile ${s.selected===i?'active':''}" data-action="candidate" data-index="${i}" aria-label="候选 ${i+1}" aria-pressed="${s.selected===i}"><img src="${src(im)}" alt="候选 ${i+1}"><span>${i+1}</span></button>`).join('')}</div>${btn('采用结果','adopt','primary','','check')}</div>`:`<div class="preview-bottom"><span>${e(p.shortTitle)}</span><span>${p.main.length} 张主图</span></div>`}</section></div>`;
  }
  const reviewProducts = () => activePool().filter(p=>state.packs.find(x=>x.id===p.packageId)?.type!=='图包').filter(p=>!state.reviewScope||state.reviewScope.includes(p.id));
  function getRisks(includeIgnored=false) {
    const products=reviewProducts().filter(checkedNow);
    const base=C.calculateRisks(products,{words:state.rules.title?ruleWords('title'):[]}).filter(r=>(state.rules.price||!['price-mismatch','low-price'].includes(r.type))&&(state.rules.stock||r.type!=='zero-stock'));
    for(const p of products){
      if(state.rules.brand){const brand=p.attributes.find(a=>a.key==='品牌')?.value||'';for(const word of ruleWords('brand'))if((p.title+' '+brand).toLowerCase().includes(word.toLowerCase()))base.push({id:p.id+':brand:'+word,productId:p.id,type:'brand',title:'品牌词命中',detail:word,fixable:false});}
      const at=p.main.indexOf(seed[0].main[0]);
      if(state.rules.images&&at>=0&&at<state.rules.imageCounts.main&&ruleWords('image').some(w=>'Nebeans'.toLowerCase().includes(w.toLowerCase())))base.push({id:p.id+':image-logo',productId:p.id,type:'image',title:'图片文字命中',detail:`主图 ${at+1} · Nebeans`,image:seed[0].main[0],fixable:true});
    }
    return includeIgnored?base:base.filter(r=>!state.ignored.includes(r.id));
  }
  function scanDialog() {
    const picks=state.reviewScope?new Set(state.products.filter(p=>state.reviewScope.includes(p.id)).map(p=>p.packageId)):new Set(state.packs.filter(p=>p.type==='数据包').map(p=>p.id));
    modal={type:'scan'};showModal('创建检测任务',`<div class="field"><label for="scanName">任务名称</label><input id="scanName" value="商品风险检查"></div><div class="field"><span class="field-label">数据包</span><div class="v3-pack-options">${state.packs.filter(p=>p.type==='数据包').map(p=>`<label class="check-row"><input type="checkbox" data-scan-pack="${p.id}" ${picks.has(p.id)?'checked':''}>${e(p.name)} <small>${packProducts(p.id).length}</small></label>`).join('')}</div></div><div class="form-grid"><div class="field"><span class="field-label">检查项目</span>${[['title','标题词库'],['brand','品牌词库'],['images','图片文字 · 演示'],['price','价格与低价 SKU'],['stock','SKU 库存']].map(([k,l])=>`<label class="check-row"><input type="checkbox" data-scan-rule="${k}" ${state.rules[k]?'checked':''}>${l}</label>`).join('')}</div><div class="field"><span class="field-label">违规词库</span>${state.wordLibraries.map(w=>`<label class="check-row"><input type="checkbox" data-scan-library="${w.id}" ${state.rules.libraryIds.includes(w.id)?'checked':''}>${e(w.name)}</label>`).join('')}</div></div><div class="v3-three">${[['main','主图'],['details','详情图'],['skuImages','SKU 图']].map(([key,label])=>`<div class="field"><label for="scan-${key}">${label}前 N 张</label><input type="number" id="scan-${key}" min="0" max="${key==='main'?20:50}" value="${state.rules.imageCounts[key]}"></div>`).join('')}</div><span id="scanError" class="field-error"></span>`,btn('取消','close-modal')+btn('创建并开始检测','scan-start','primary'));
  }
  function review() {
    const pool=reviewProducts(), checked=pool.filter(checkedNow), risks=getRisks(),rawRisks=getRisks(true),riskProducts=new Set(risks.map(r=>r.productId)),rawRiskProducts=new Set(rawRisks.map(r=>r.productId)),task=state.tasks.find(t=>t.kind==='scan'&&t.status==='running');
    const typeLabels={all:'全部',word:'标题',brand:'品牌',image:'图片','price-mismatch':'价格','low-price':'低价 SKU','zero-stock':'库存'};
    const shown=risks.filter(r=>state.reviewFilter==='all'||r.type===state.reviewFilter||(state.reviewFilter==='price-mismatch'&&r.type==='low-price'));
    return head('风险检查',btn('词库管理','goto-words','','','list')+btn('创建检测任务','scan-config','primary',task?'disabled':'','shield'))+`<div class="review-summary"><div class="review-stat"><span>商品总数</span><strong>${pool.length}<small>件</small></strong></div><div class="review-stat"><span>已检查</span><strong>${checked.length}<small>件</small></strong></div><div class="review-stat warning"><span>待处理</span><strong>${riskProducts.size}<small>件</small></strong></div><div class="review-stat"><span>当前规则未命中</span><strong>${checked.length-rawRiskProducts.size}<small>件</small></strong></div></div><div class="v3-review-range"><span>${state.reviewScope?'选定数据包':'全部数据包'} · 未检查 ${pool.length-checked.length} 件 · 已忽略 ${rawRisks.length-risks.length} 项</span>${state.reviewScope?btn('查看全部','review-all','small'):''}${btn('重新检查','scan','small',task?'disabled':'')}</div>${task?`<div class="scan-progress"><span>${e(task.name)}</span><div class="progress-track"><div class="progress-fill" style="width:${task.progress}%"></div></div><span>${task.progress}%</span></div>`:''}<section class="review-results"><div class="tabs v3-wrap-tabs">${Object.entries(typeLabels).map(([key,label])=>`<button class="tab ${state.reviewFilter===key?'active':''}" data-action="risk-filter" data-value="${key}">${label}<span class="tab-count">${key==='all'?risks.length:risks.filter(r=>r.type===key).length}</span></button>`).join('')}</div><div class="v3-risk-toolbar"><label class="check-row"><input type="checkbox" id="riskSelectAll" ${shown.length&&shown.every(r=>state.reviewSelected.has(r.id))?'checked':''}>全选</label><span>${state.reviewSelected.size} 项已选</span>${btn('批量修正','risk-fix-selected','small',state.reviewSelected.size?'':'disabled')}${btn('加入黑名单','risk-block-selected','small',state.reviewSelected.size?'':'disabled')}${btn('忽略','risk-ignore-selected','small',state.reviewSelected.size?'':'disabled')}</div><div class="risk-list">${!checked.length?`<div class="empty-state">${icon('shield')}<h2>待检查</h2>${btn('创建检测任务','scan-config','primary',task?'disabled':'')}</div>`:!shown.length?'<div class="empty-state"><h2>无待处理项</h2></div>':shown.map(r=>{const p=getProduct(r.productId);return `<article class="risk-item"><input type="checkbox" data-risk-select="${e(r.id)}" aria-label="选择 ${e(r.title)} ${e(p.shortTitle)}" ${state.reviewSelected.has(r.id)?'checked':''}><img class="risk-thumb" src="${src(r.image||p.main[0])}" alt="${e(p.shortTitle)}"><div class="risk-body"><div class="label-row"><strong>${e(r.title)}</strong><span class="status-pill ${r.type==='image'?'neutral':'warning'}">${r.type==='image'?'AI 演示':r.type==='brand'?'待复核':'待处理'}</span></div><button class="risk-product-link" data-action="detail" data-id="${p.id}">${e(p.shortTitle)}</button><p>${e(r.detail)} · ${e(packName(p.packageId))}</p></div><div class="risk-actions">${r.fixable?btn(r.type==='word'?'移除词语':r.type==='image'?'移除图片':'同步价格','fix-risk','small',`data-id="${e(r.id)}"`):btn('查看商品','detail','small',`data-id="${p.id}" data-tab="sku"`)}${ib('忽略此项','ignore-risk','close',`data-id="${e(r.id)}"`)}</div></article>`}).join('')}</div></section>`;
  }
  function fixRisks(ids) {
    const list=getRisks().filter(r=>ids.includes(r.id)&&r.fixable), before=clone(state.products),changedIds=new Set();
    for(const r of list){const p=getProduct(r.productId);if(!p)continue;if(r.type==='word')p.title=p.title.split(r.word).join('');if(r.type==='price-mismatch')p.originalSummaryPrice=p.price+'-'+p.priceMax;if(r.type==='image'){if(p.main.length===1&&p.main.includes(r.image))continue;p.main=p.main.filter(i=>i!==r.image);}changedIds.add(p.id);}
    for(const id of changedIds)changed(id);state.reviewSelected.clear();if(!save()){state.products=before;return;}render();toast(`已修正 ${changedIds.size} 件 · 待复查`,()=>{state.products=before;save();render();});
  }
  const targetTools={'图映':['图映默认数据包'],'淘宝':['黑老虎','如来','妙手','万象','大王','京大师','向阳萤火虫'],'拼多多':['黑老虎','飞入','宁晚','兵哥哥解析','星云','茶叶蛋','猴哥解析','大王','三老头','水饮6干','万象'],'京东':['黑老虎','万象'],'1688':['黑老虎','万象'],'快手':['黑老虎','万象'],'抖音':['黑老虎','店铺管家','福星','星云汇','小球','智能店长']};
  function exportProducts() {
    let list=activePool().filter(p=>state.export.format==='zip'||state.packs.find(x=>x.id===p.packageId)?.type!=='图包');const scope=state.export.scope;
    if(scope==='selected')list=list.filter(p=>state.selected.has(p.id));
    else if(scope.startsWith('pack:'))list=list.filter(p=>p.packageId===scope.slice(5));
    else if(scope!=='all')list=list.filter(p=>p.group===scope);
    return state.export.limit>0?list.slice(0,state.export.limit):list;
  }
  function exportPage() {
    const products=exportProducts(),x=state.export;if(!targetTools[x.platform].includes(x.tool))x.tool=targetTools[x.platform][0];
    const mediaCount=products.reduce((n,p)=>n+x.mediaTypes.reduce((a,k)=>a+(k==='video'?(p.video?1:0):(p[k]?.length||0)),0),0);
    return head('转换导出','<span class="status-pill neutral">演示格式</span>')+`<div class="export-layout"><section class="export-settings"><div class="field"><span class="field-label">导出方式</span><div class="segmented">${[['json','平台格式'],['zip','商品图包'],['csv','商品清单']].map(([k,v])=>`<button class="segment ${x.format===k?'active':''}" data-action="export-format" data-value="${k}">${v}</button>`).join('')}</div></div><div class="field"><label for="exportScope">商品范围</label><select class="select-control" id="exportScope"><option value="all" ${x.scope==='all'?'selected':''}>全部商品 · ${activePool().length}</option><option value="selected" ${x.scope==='selected'?'selected':''}>已选商品 · ${activePool().filter(p=>state.selected.has(p.id)).length}</option>${state.packs.filter(p=>x.format==='zip'||p.type!=='图包').map(p=>`<option value="pack:${p.id}" ${x.scope==='pack:'+p.id?'selected':''}>${e(p.name)} · ${packProducts(p.id).filter(p=>!excluded(p)).length}</option>`).join('')}</select></div>${x.format!=='zip'?`<div class="field"><span class="field-label">目标平台</span><div class="v3-platforms">${['图映','淘宝','拼多多','京东','1688','快手','抖音'].map(name=>`<button class="segment ${x.platform===name?'active':''}" data-action="platform" data-value="${name}">${name}</button>`).join('')}</div></div><div class="field"><label for="exportTool">目标工具</label><select id="exportTool" class="select-control">${targetTools[x.platform].map(t=>`<option ${t===x.tool?'selected':''}>${e(t)}</option>`).join('')}</select></div>`:`<div class="field"><span class="field-label">媒体范围</span><div class="v3-media-options">${Object.entries(roles).map(([k,v])=>`<label class="check-row"><input type="checkbox" data-export-role="${k}" ${x.mediaTypes.includes(k)?'checked':''}>${v}</label>`).join('')}</div></div><div class="form-grid"><div class="field"><label for="exportFolders">分包数量</label><input id="exportFolders" type="number" value="${x.folders}" min="0" max="20"></div><div class="field"><label for="exportDistribution">分配方式</label><select id="exportDistribution"><option value="balanced" ${x.distribution==='balanced'?'selected':''}>平均</option><option value="random" ${x.distribution==='random'?'selected':''}>随机</option></select></div></div>`}<div class="field"><label for="exportLimit">导出数量</label><input id="exportLimit" type="number" value="${x.limit}" min="0" max="500" placeholder="0 = 全部"></div><div class="export-summary"><div><span>商品</span><strong>${products.length}</strong></div><div><span>SKU</span><strong>${products.reduce((n,p)=>n+p.skus.length,0)}</strong></div><div><span>媒体</span><strong>${mediaCount}</strong></div></div>${btn('创建导出任务','export-run','primary',!products.length||(x.format==='zip'&&!x.mediaTypes.length)?'disabled':'','download')}</section><section class="export-preview"><div class="preview-toolbar"><h2>导出预览</h2><span class="status-pill neutral">${x.format.toUpperCase()}</span></div><div class="export-directory">${icon('folder')}<strong>${x.format==='zip'?'商品图包':e(x.platform+' · '+x.tool)}</strong></div><div class="v3-rows"><div><span>黑名单已排除</span><strong>${state.products.filter(excluded).length} 件</strong></div>${x.format==='zip'?`<div><span>文件夹</span><strong>${x.folders||1} 个</strong></div><div><span>资源类型</span><strong>${x.mediaTypes.map(k=>roles[k]).join(' / ')}</strong></div>`:''}</div><div class="export-table-wrap"><table class="sku-table"><thead><tr><th>商品</th><th>来源 ID</th><th>价格</th><th>SKU</th></tr></thead><tbody>${products.map(p=>`<tr><td><div class="export-product-cell"><img src="${src(p.main[0])}" alt=""><span>${e(p.shortTitle)}</span></div></td><td>${e(sourceId(p))}</td><td>¥${p.price.toFixed(2)}</td><td>${p.skus.length}</td></tr>`).join('')}</tbody></table></div><div class="export-preview-footer">${icon('check')}<span>${products.length} 件商品 · ${x.format==='zip'?'资源清单 + 商品数据':'JSON / CSV 演示数据'}</span></div></section></div>`;
  }
  function tasksPage() {
    const items=[...state.tasks].reverse().filter(t=>state.taskFilter==='all'||t.kind===state.taskFilter);
    return head('任务中心',btn('清理记录','clear-tasks','','','trash'),`${items.length} 个任务`)+`<div class="tabs">${[['all','全部'],['bulk','批量处理'],['scan','风险检查'],['ai','AI 创作'],['export','导出记录']].map(([key,label])=>`<button class="tab ${state.taskFilter===key?'active':''}" data-action="task-filter" data-value="${key}">${label}</button>`).join('')}</div><div class="task-table">${items.length?items.map(t=>`<article class="task-row"><div class="task-icon">${icon(t.kind==='ai'?'sparkle':t.kind==='scan'?'shield':t.kind==='bulk'?'layers':'download')}</div><div class="task-content"><strong>${e(t.name)}</strong><span>${e(t.time)} · ${t.total} ${t.kind==='ai'?'个候选':'件商品'}${t.kind==='ai'?' · 演示':''}</span></div><div class="task-progress">${t.status==='running'?`<div class="progress-track"><div class="progress-fill" style="width:${t.progress}%"></div></div><span>${t.progress}%</span>`:''}</div><span class="status-pill ${t.status==='done'?'success':t.status==='error'?'warning':'neutral'}">${{running:'进行中',done:'已完成',cancelled:'已取消',error:'失败'}[t.status]}</span>${btn('详情','task-detail','small',`data-id="${t.id}"`)}${t.status==='running'?ib('取消任务','cancel-task','close',`data-id="${t.id}"`):t.kind==='export'&&t.status==='done'?btn('再次下载','task-download','small',`data-id="${t.id}"`):t.kind==='ai'&&t.status==='done'?btn('查看结果','task-result','small',`data-id="${t.id}"`):''}</article>`).join(''):'<div class="empty-state"><h2>暂无任务</h2></div>'}</div>`;
  }
  function recordTask(kind,name,ids,details={}) {const task={id:'t'+Date.now()+Math.random().toString(16).slice(2,6),kind,name,total:ids.length,status:'done',progress:100,time:new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}),productIds:ids,details};state.tasks.push(task);return task;}
  function applyBulk(result) {
    if(result.baseFingerprint&&result.baseFingerprint!==JSON.stringify(state.products))throw Error('商品已变化，请重新预览');
    if(result.products.some(p=>!C.validateProduct(p).ok))throw Error('商品数据校验失败');
    const before=clone(state.products);state.products=clone(result.products);result.productIds.forEach(changed);
    const task=recordTask('bulk',result.label,result.productIds,{summary:result.summary,changes:result.changes||[]});
    if(!save()){state.products=before;state.tasks=state.tasks.filter(t=>t.id!==task.id);return false;}
    toast(`已更新 ${result.productIds.length} 件商品`,()=>{state.products=before;result.productIds.forEach(changed);save();render();});return true;
  }
  function setBlacklist(keys) {const before=state.blacklist;state.blacklist=[...new Set(keys.map(String))];if(!save()){state.blacklist=before;return false;}return true;}
  function blacklistDialog() {
    modal={type:'blacklist'};const rows=state.blacklist.map(key=>{const p=state.products.find(p=>blacklistKey(p)===key);return `<tr><td>${e(key.split(':')[0])}</td><td>${e(key.split(':').slice(1).join(':'))}</td><td>${e(p?.shortTitle||'—')}</td><td>${btn('移除','unblock','small',`data-key="${e(key)}"`)}</td></tr>`}).join('');
    showModal('黑名单管理',`<div class="form-grid"><div class="field"><label for="blackPlatform">来源平台</label><select id="blackPlatform"><option>1688</option><option>淘宝</option><option>拼多多</option><option>京东</option><option>抖音</option></select></div><div class="field"><label for="blackIds">商品 ID</label><textarea id="blackIds" rows="2"></textarea></div></div>${btn('添加到黑名单','block-add','primary')}<div class="export-table-wrap"><table class="sku-table"><thead><tr><th>平台</th><th>商品 ID</th><th>商品</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="4">暂无记录</td></tr>'}</tbody></table></div>`,btn('清空','block-clear','danger')+btn('完成','close-modal'));
  }
  function groupDialog() {modal={type:'groups'};showModal('分组管理',`<div class="v3-inline"><input id="manageGroupName" aria-label="新分组名称" placeholder="分组名称">${btn('新建','group-create','primary')}</div><div class="v3-rows">${state.groups.map(g=>`<div><strong>${e(g)}</strong><span>${state.packs.filter(p=>p.group===g).length} 个数据包</span>${btn('删除','group-remove','danger small',`data-value="${e(g)}"`)}</div>`).join('')}</div>`,btn('完成','close-modal'));}
  function mergeDialog() {const packs=state.packs.filter(p=>state.selectedPacks.has(p.id));if(packs.length<2){toast('请至少选择两个数据包');return;}modal={type:'merge',ids:packs.map(p=>p.id)};showModal('合并数据包',`<div class="field"><label for="mergeName">数据包名称</label><input id="mergeName" value="合并数据包"></div><div class="v3-rows">${packs.map(p=>`<div><span>${e(p.name)}</span><strong>${packProducts(p.id).length} 件</strong></div>`).join('')}</div><label class="check-row"><input id="mergeKeep" type="checkbox" checked>保留来源数据包</label><label class="check-row"><input id="mergeDedupe" type="checkbox" checked>去除重复商品</label>`,btn('取消','close-modal')+btn('合并','merge-confirm','primary'));}
  function inspectionPage() {return head('人工鉴图')+`<div class="pk-table-wrap"><table class="pk-table"><thead><tr><th>数据包</th><th>商品</th><th>已鉴图</th><th>未鉴图</th><th>操作</th></tr></thead><tbody>${state.packs.map(p=>{const list=packProducts(p.id).filter(p=>!excluded(p)),done=list.filter(p=>{const paths=Object.keys(roles).filter(k=>k!=='video').flatMap(k=>p[k]||[]);return paths.length&&Array.isArray(p.reviewedImages)&&paths.every(path=>p.reviewedImages.includes(path));}).length;return `<tr><td>${e(p.name)}</td><td>${list.length}</td><td>${done}</td><td>${list.length-done}</td><td>${btn('开始鉴图','package-inspect','primary small',`data-id="${p.id}"`)}</td></tr>`}).join('')}</tbody></table></div>`;}
  function wordsPage() {const types={title:'标题违规词',brand:'品牌关注词',image:'图片违规词'};return head('违规词库',btn('导入词库','word-import','primary','','upload'))+`<div class="tabs">${[['all','全部'],...Object.entries(types)].map(([key,label])=>`<button class="tab ${state.wordType===key?'active':''}" data-action="word-type" data-value="${key}">${label}</button>`).join('')}</div><div class="pk-table-wrap"><table class="pk-table"><thead><tr><th>名称</th><th>类型</th><th>词数</th><th>操作</th></tr></thead><tbody>${state.wordLibraries.filter(w=>state.wordType==='all'||state.wordType===w.type).map(w=>`<tr><td>${e(w.name)}</td><td>${types[w.type]}</td><td>${w.words.length}</td><td><div class="pk-row-actions">${btn('编辑','word-edit','small',`data-id="${w.id}"`)}${btn('删除','word-delete','danger small',`data-id="${w.id}"`)}</div></td></tr>`).join('')}</tbody></table></div>`;}
  function wordEditor(id) {const w=state.wordLibraries.find(x=>x.id===id);modal={type:'word-editor',id};showModal(w?'编辑词库':'导入词库',`<div class="form-grid"><div class="field"><label for="wordName">名称</label><input id="wordName" value="${e(w?.name||'新词库')}"></div><div class="field"><label for="wordCategory">词类型</label><select id="wordCategory">${[['title','标题违规词'],['brand','品牌关注词'],['image','图片违规词']].map(([k,v])=>`<option value="${k}" ${w?.type===k?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="field"><label for="wordContents">词条</label><textarea id="wordContents" rows="8">${e(w?.words.join('\n')||'')}</textarea></div><input id="wordUpload" type="file" accept=".txt" aria-label="选择词库 TXT"><span class="field-error" id="wordError"></span>`,btn('取消','close-modal')+btn('保存词库','word-save','primary'));}
  function mediaItems() {const map=new Map();for(const p of state.products){for(const [role,label]of Object.entries(roles)){for(const url of role==='video'?(p.video?[p.video]:[]):p[role]||[]){if(!map.has(url))map.set(url,{url,kind:role==='video'?'video':'image',label,name:p.shortTitle,productId:p.id,uses:1});else map.get(url).uses++;}}}for(const u of state.uploads)map.set(u.url,{...u,uploaded:true,uses:map.get(u.url)?.uses||0});return [...map.values()];}
  function mediaPage() {const items=mediaItems().filter(i=>state.mediaType==='all'||i.kind===state.mediaType);return head('媒体资源',`<label class="button primary">${icon('upload')}上传资源<input id="mediaUpload" type="file" accept="image/png,image/jpeg,image/webp,video/mp4" multiple hidden></label>`,`${items.length} 个素材`)+`<div class="tabs">${[['all','全部'],['image','图片'],['video','视频']].map(([k,v])=>`<button class="tab ${state.mediaType===k?'active':''}" data-action="media-type" data-value="${k}">${v}</button>`).join('')}</div><div class="v3-media-grid">${items.map((m,i)=>`<article>${m.kind==='video'?`<video src="${e(media(m.url))}" controls preload="metadata"></video>`:`<button data-action="zoom" data-src="${e(src(m.url))}" aria-label="预览 ${e(m.name)}"><img src="${src(m.url)}" alt="${e(m.name)}" loading="lazy"></button>`}<div><strong>${e(m.name)}</strong><span>${m.uploaded?'素材库':e(m.label)} · ${m.uses} 处引用</span></div>${m.kind==='image'?btn('使用素材','media-use','small',`data-index="${i}"`):''}${m.uploaded?btn('移除','media-remove','small danger',`data-id="${e(m.id)}"`):''}</article>`).join('')}</div>`;}
  function showModal(title, body, footer, cls='') {
    if(dialog.open) dialog.close();
    dialog.className=cls;
    dialog.setAttribute('aria-label',title);
    dialog.innerHTML=`<div class="modal-header"><h2 class="modal-title">${title}</h2>${ib('关闭弹窗','close-modal','close')}</div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}`;
    dialog.showModal();
  }
  function openDetail(id,tab='info') {
    const p=getProduct(id); if(!p)return;
    modal={type:'detail',id,draft:clone(p),tab,imageGroup:'main',imageIndex:0}; renderDetail();
  }
  function renderDetail() {
    const p=modal.draft;
    const gallery=p[modal.imageGroup]||p.main;
    const im=gallery[modal.imageIndex]||p.main[0];
    const tabs=`<div class="detail-tabs tabs">${[['info','商品信息'],['sku','SKU 规格'],['images','图片资源']].map(([key,label])=>`<button class="tab ${modal.tab===key?'active':''}" data-action="detail-tab" data-value="${key}">${label}</button>`).join('')}</div>`;
    let content='';
    if(modal.tab==='info')content=`<div class="field"><label class="field-label" for="editTitle">商品标题</label><textarea id="editTitle" rows="3">${e(p.title)}</textarea></div><div class="form-grid"><div class="field"><label class="field-label" for="editShortTitle">商品简称</label><input id="editShortTitle" value="${e(p.shortTitle)}"></div><div class="field"><label class="field-label" for="editGroup">分组</label><select id="editGroup" class="select-control">${state.groups.map(g=>`<option ${p.group===g?'selected':''}>${e(g)}</option>`).join('')}</select></div></div><div class="detail-row"><span>商品 ID</span><span>${p.id}</span></div><div class="detail-row"><span>来源</span><span>1688</span></div><div class="detail-row"><span>类目</span><span>${e(p.category)}</span></div><div class="detail-row"><span>价格</span><strong>¥${p.price.toFixed(2)}${p.priceMax>p.price?' – '+p.priceMax.toFixed(2):''}</strong></div><div class="detail-row"><span>库存</span><span>${p.stock}</span></div><div class="attribute-list">${p.attributes.slice(0,5).map(a=>`<div class="detail-row"><span>${e(a.key)}</span><span>${e(a.value)}</span></div>`).join('')}</div>`;
    if(modal.tab==='sku')content=`<div class="label-row"><strong>${p.skus.length} 个 SKU</strong>${btn('统一设置','detail-batch','small')}</div><div class="sku-table-wrap"><table class="sku-table"><thead><tr><th>规格</th><th>价格 / ¥</th><th>库存</th></tr></thead><tbody>${p.skus.map((s,i)=>`<tr><td>${e(s.name)}</td><td><input aria-label="SKU ${i+1} 价格" type="number" min="0" step="0.01" value="${s.price.toFixed(2)}" data-sku="${i}" data-field="price"></td><td><input aria-label="SKU ${i+1} 库存" type="number" min="0" step="1" value="${s.stock}" data-sku="${i}" data-field="stock"></td></tr>`).join('')}</tbody></table></div>`;
    if(modal.tab==='images')content=`<div class="segmented">${[['main','主图'],['skuImages','SKU 图'],['details','详情图']].map(([key,name])=>`<button class="segment ${modal.imageGroup===key?'active':''}" data-action="image-group" data-value="${key}">${name} ${p[key].length}</button>`).join('')}</div><div class="image-manager">${gallery.map((image,i)=>`<div class="image-tile"><button data-action="detail-image" data-index="${i}" aria-label="选择图片 ${i+1}"><img data-preview="${e(src(image))}" src="${src(image)}" alt="图片 ${i+1}"></button><span class="image-index">${i+1}</span><div class="image-tools">${ib('前移图片 '+(i+1),'image-left','left',`data-index="${i}" ${i===0?'disabled':''}`)}${ib('删除图片 '+(i+1),'delete-image','trash',`data-index="${i}" ${modal.imageGroup==='main'&&gallery.length===1?'disabled':''}`)}</div></div>`).join('')}</div>`;
    showModal('商品详情',`<div class="detail-layout"><div class="detail-preview"><button class="detail-main-image" data-action="zoom" data-src="${e(src(im))}"><img src="${src(im)}" alt="${e(p.shortTitle)}"></button><div class="image-strip">${gallery.slice(0,8).map((image,i)=>`<button class="source-thumb ${modal.imageIndex===i?'active':''}" data-action="detail-image" data-index="${i}" aria-label="预览图片 ${i+1}"><img src="${src(image)}" alt="图片 ${i+1}"></button>`).join('')}</div></div><div class="detail-editor">${tabs}${content}</div></div>`, `<span class="detail-save-status" id="detailError"></span>${btn('取消','close-modal')}${btn('保存修改','save-detail','primary','','check')}`,'detail-dialog');
  }
  function openZoom(value) { lightbox.innerHTML=`<div class="lightbox-toolbar">${ib('关闭图片','close-lightbox','close')}</div><img class="lightbox-image" src="${e(src(value))}" alt="商品大图">`; lightbox.showModal(); }
  function syncDerived(p) { if(p.skus.length) {p.price=Math.min(...p.skus.map(s=>s.price));p.priceMax=Math.max(...p.skus.map(s=>s.price));} p.stock=p.skus.reduce((n,s)=>n+s.stock,0); p.totalImages=['main','portraitMain','skuImages','details','whiteImages','qualifications'].reduce((n,key)=>n+(p[key]?.length||0),0); }
  function changed(id) { state.checked=state.checked.filter(x=>x!==id);delete state.scanVersions[id];state.ignored=state.ignored.filter(x=>!x.startsWith(id+':')); }
  function runTask(kind,name,total,complete,metadata={}) {
    const task={id:'t'+Date.now()+Math.random().toString(16).slice(2,6),kind,name,total,status:'running',progress:0,time:new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}),...metadata};
    state.tasks.push(task);save();render();
    const timer=setInterval(async()=>{
      task.progress=Math.min(96,task.progress+12);
      if(task.progress>=96) {clearInterval(timer);timers.delete(task.id);try { await complete(task);if(task.status!=='cancelled'){task.progress=100;task.status='done';toast(kind==='ai'?'候选已生成':kind==='scan'?'检查完成':'导出完成');} } catch(error) {if(task.status!=='cancelled'){task.status='error';toast(error.message||'任务失败');}}save();}
      render();
    },220);
    timers.set(task.id,timer);return task;
  }
  function generate() {
    if(state.tasks.some(t=>t.kind==='ai'&&t.status==='running'))return;
    const s=clone(state.studio), p=getProduct(s.id);
    if(!p)return;
    if(s.mode==='video'&&!p.video){toast('该商品暂无视频样片');return;}
    runTask('ai',modes[s.mode][0]+' · '+p.shortTitle,s.count,task=>{
      let pool=s.mode==='white'?[...p.main.slice(-1),...p.skuImages,...p.main]:s.mode==='repair'?[...p.main.slice(2),...p.main]:[...p.main.slice(1),...p.main];
      if(!pool.length)pool=[placeholder];
      const sourceImages=s.sourceRole==='library'?state.uploads.filter(x=>x.kind==='image').map(x=>x.url):(p[s.sourceRole]||[]);
      const result={id:task.id,productId:p.id,mode:s.mode,targetRole:s.targetRole,sourceIndex:s.source,sourceImage:sourceImages[s.source]||p.main[0],sourceRole:s.sourceRole,images:Array.from({length:s.count},(_,i)=>pool[i%pool.length]),ratio:s.ratio,prompt:s.prompt};
      state.generated.push(result);task.resultId=result.id;task.details={packageName:packName(p.packageId),sourceRole:s.sourceRole,targetRole:s.targetRole,mode:s.mode};
      if(state.studio.id===s.id&&state.studio.mode===s.mode){state.studio.result=result;state.studio.selected=0;state.studio.comparison=false;}
    });
  }
  function scan(name='商品风险检查') {
    if(state.tasks.some(t=>t.kind==='scan'&&t.status==='running'))return;
    const products=reviewProducts();if(!products.length){toast('没有可检查的商品');return;}
    const before=new Map(products.map(p=>[p.id,checkSignature(p)])),ids=products.map(p=>p.id);
    runTask('scan',name,ids.length,task=>{let count=0;for(const id of ids){const p=getProduct(id);if(p&&!excluded(p)&&checkSignature(p)===before.get(id)){state.scanVersions[id]=before.get(id);count++;}}state.scanned=true;state.checked=activePool().filter(checkedNow).map(p=>p.id);task.details={checked:count,changed:ids.length-count,rules:clone(state.rules),scope:ids};task.productIds=ids;});
  }
  function download(blob,filename) { const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000); }
  async function exportNow() {
    const products=clone(exportProducts()),config={...state.export};if(!products.length)return;
    runTask('export',`${config.platform} · ${config.format.toUpperCase()}`,products.length,async task=>{
      let blob,filename;
      if(config.format==='zip'){blob=await C.buildImageZip(products,url=>fetch(media(url)),config);filename=`图映_${config.platform}_图包.zip`;}
      else { const result=C.buildExport(products,config.format,config.platform,{tool:config.tool});blob=new Blob([result.content],{type:result.mime});filename=result.filename; }
      if(task.status==='cancelled')return;
      downloads.set(task.id,{blob,filename});task.exportConfig=config;task.productIds=products.map(p=>p.id);task.snapshot=products;task.details={platform:config.platform,tool:config.tool,format:config.format,mediaTypes:config.mediaTypes,folders:config.folders};download(blob,filename);
    });
  }
  function importDialog() {
    modal={type:'import',files:[]};const target=state.packs.find(p=>p.id===state.pendingImportPackId);
    showModal(target?'追加数据包':'导入数据包',`<div class="form-grid"><div class="field"><label for="importName">数据包名称</label><input id="importName" value="${e(target?.name||'新数据包')}" ${target?'disabled':''}></div><div class="field"><label for="importGroup">所属分组</label><select id="importGroup">${['未分组',...state.groups].map(g=>`<option>${e(g)}</option>`).join('')}</select></div></div><div class="v3-inline"><label class="import-drop" for="importFiles">${icon('upload')}<strong>选择文件</strong><span>JSON / TXT</span><input id="importFiles" type="file" accept=".json,.txt" multiple></label><label class="import-drop" for="importFolder">${icon('folder')}<strong>选择文件夹</strong><input id="importFolder" type="file" webkitdirectory multiple></label></div><label class="check-row"><input id="importDedupe" type="checkbox" checked>跳过包内重复商品</label><div id="importStatus" class="import-status"></div>`,btn('取消','close-modal')+btn('导入','confirm-import','primary'));
  }
  function normalizeImported(raw,index) {
    const d=clone(raw),origin=String(d.sourceId||d.productId||d.id||'import-'+Date.now()+'-'+index),known=seed.find(p=>p.id===origin);
    if(!/^[A-Za-z0-9_-]+$/.test(origin))throw Error('商品 ID 格式无效');
    const title=String(d.title||d.productName||'未命名商品');
    const skus=Array.isArray(d.skus)?d.skus.map((s,i)=>({id:String(s.skuId||s.id||origin+'-'+i),name:String(s.name||known?.skus.find(k=>k.id===String(s.skuId||s.id))?.name||s.id||'默认规格'),price:Number(s.price)/(d.productId?100:1),stock:Number(s.stock??s.quantity??0),image:typeof s.image==='string'?s.image:(known?.skus.find(k=>k.id===String(s.skuId||s.id))?.image||'')})):[];
    const p={id:origin,sourceId:origin,title,shortTitle:String(d.shortTitle||title),platform:String(d.platform||d.sellerType||'1688'),category:String(d.category||d.categoryName||'未分类'),group:String(d.group||'未分组'),price:0,priceMax:0,originalSummaryPrice:String(d.originalSummaryPrice||d.priceLow||d.price||'0'),stock:0,totalImages:0,skus,attributes:(Array.isArray(d.attributes)?d.attributes:known?.attributes||[]).filter(a=>a&&typeof a.key==='string').map(a=>({key:a.key,value:String(a.value??'')})),video:''};
    for(const role of Object.keys(roles).filter(k=>k!=='video')){const list=d[role]??known?.[role]??[];if(!Array.isArray(list)||list.some(x=>typeof x!=='string'))throw Error('媒体列表格式无效');p[role]=list;}
    if(typeof d.video==='string'&&(/^assets\/[\w.-]+\.(mp4|webm)$/.test(d.video)||/^data:video\/(mp4|webm);base64,[A-Za-z0-9+/=]+$/.test(d.video)))p.video=d.video;else p.video=known?.video||'';
    if(!p.main.length)p.main=[placeholder];syncDerived(p);return p;
  }
  async function confirmImport() {
    const files=[...($('#importFiles').files||[]),...($('#importFolder').files||[])].filter(f=>/\.(json|txt)$/i.test(f.name));if(!files.length){$('#importStatus').textContent='请选择 JSON / TXT 文件';return;}
    const imported=[],failures=[];for(const file of files){try{if(file.size>5_000_000)throw Error('文件超过 5 MB');const raw=JSON.parse(await file.text()),arr=Array.isArray(raw)?raw:Array.isArray(raw.products)?raw.products:[raw];if(arr.length>500)throw Error('商品超过 500 件');for(const [i,d]of arr.entries()){const p=normalizeImported(d,i),v=C.validateProduct(p);if(!v.ok)throw Error(v.errors[0]);imported.push(p);}}catch(error){failures.push(file.name+'：'+error.message);}}
    if(!imported.length){$('#importStatus').textContent=failures.join('；')||'未识别到有效商品';return;}
    const name=$('#importName').value.trim()||'新数据包',packId=state.pendingImportPackId||'pack-'+Date.now(),group=$('#importGroup').value,dedupe=$('#importDedupe').checked,before={products:clone(state.products),packs:clone(state.packs)},seen=new Set(packProducts(packId).map(blacklistKey));let skipped=0,blocked=0,added=0;
    for(const p of imported){const key=blacklistKey(p);if(excluded(p)){blocked++;continue;}if(dedupe&&seen.has(key)){skipped++;continue;}seen.add(key);p.packageId=packId;if(getProduct(p.id))p.id=sourceId(p)+'--'+packId+'-'+added;while(getProduct(p.id))p.id+='-1';state.products.push(p);added++;}
    if(added&&!state.packs.some(p=>p.id===packId)){const time=new Date().toLocaleString('zh-CN',{hour12:false});state.packs.push({id:packId,name,group,type:'数据包',createdAt:time,updatedAt:time,note:''});}
    if(!save()){state.products=before.products;state.packs=before.packs;$('#importStatus').textContent='本地空间不足';return;}
    state.pendingImportPackId=null;state.libraryMode='packages';dialog.close();render();showModal('导入结果',`<div class="v3-result-counts"><div><strong>${added}</strong><span>已导入</span></div><div><strong>${skipped}</strong><span>重复跳过</span></div><div><strong>${blocked}</strong><span>黑名单跳过</span></div><div><strong>${failures.length}</strong><span>失败文件</span></div></div>${failures.length?`<div class="field-error">${failures.map(e).join('<br>')}</div>`:''}`,btn('完成','close-modal','primary'));
  }
  document.addEventListener('click',async ev=>{
    const nav=ev.target.closest('[data-nav]');if(nav){if(nav.dataset.nav==='review')state.reviewScope=null;if(['library','albums'].includes(nav.dataset.nav)){state.libraryMode='packages';state.packageType='all';}if(nav.dataset.nav==='inspect')state.libraryMode='packages';route(nav.dataset.nav);return;}
    const grp=ev.target.closest('[data-group]');if(grp){state.group=grp.dataset.group;state.filter='all';state.libraryMode='products';route('library');return;}
    const el=ev.target.closest('[data-action]');if(!el)return;
    const {action,id,value,index}=el.dataset;
    const p=id?getProduct(id):null;
    switch(action){
      case 'goto-words':route('words');break;
      case 'manage-groups':groupDialog();break;
      case 'group-create':{const g=$('#manageGroupName').value.trim();if(!g||state.groups.includes(g))return;state.groups.push(g);save();groupDialog();break;}
      case 'group-remove':state.groups=state.groups.filter(g=>g!==value);state.packs.forEach(p=>{if(p.group===value)p.group='未分组'});state.products.forEach(p=>{if(p.group===value)p.group='未分组'});save();groupDialog();break;
      case 'blacklist':blacklistDialog();break;
      case 'block-add':{const platform=$('#blackPlatform').value,ids=$('#blackIds').value.split(/[\s,，]+/).filter(Boolean);if(ids.some(id=>!/^[A-Za-z0-9_-]+$/.test(id))){toast('商品 ID 格式无效');return;}setBlacklist([...state.blacklist,...ids.map(id=>platform+':'+id)]);blacklistDialog();render();break;}
      case 'unblock':setBlacklist(state.blacklist.filter(k=>k!==el.dataset.key));blacklistDialog();render();break;
      case 'block-clear':setBlacklist([]);blacklistDialog();render();break;
      case 'merge-packs':mergeDialog();break;
      case 'merge-confirm':{const name=$('#mergeName').value.trim();if(!name)return;const before={products:clone(state.products),packs:clone(state.packs)},ids=modal.ids,target='pack-'+Date.now(),seen=new Set(),newProducts=[];for(const product of state.products.filter(p=>ids.includes(p.packageId))){const key=blacklistKey(product);if($('#mergeDedupe').checked&&seen.has(key))continue;seen.add(key);newProducts.push({...clone(product),id:sourceId(product)+'--'+target+'-'+newProducts.length,sourceId:sourceId(product),packageId:target,reviewedImages:[]});}if(!$('#mergeKeep').checked){state.products=state.products.filter(p=>!ids.includes(p.packageId));state.packs=state.packs.filter(p=>!ids.includes(p.id));}state.products.push(...newProducts);const time=new Date().toLocaleString('zh-CN',{hour12:false});state.packs.push({id:target,name,type:'数据包',group:'未分组',createdAt:time,updatedAt:time,note:''});if(!save()){state.products=before.products;state.packs=before.packs;return;}state.selectedPacks.clear();dialog.close();render();toast(`已合并 ${newProducts.length} 件商品`,()=>{state.products=before.products;state.packs=before.packs;save();render();});break;}
      case 'package-inspect':state.page='inspect';openPackage(id);break;
      case 'make-album':{modal={type:'album'};showModal('生成图包',`<div class="field"><label for="albumName">图包名称</label><input id="albumName" value="商品图包"></div><div class="field"><span class="field-label">来源数据包</span>${state.packs.filter(p=>p.type==='数据包').map(p=>`<label class="check-row"><input type="checkbox" data-album-pack="${p.id}" checked>${e(p.name)}</label>`).join('')}</div>`,btn('取消','close-modal')+btn('生成图包','album-create','primary'));break;}
      case 'album-create':{const ids=$$('[data-album-pack]:checked',dialog).map(x=>x.dataset.albumPack);const source=activePool().filter(p=>ids.includes(p.packageId));if(!source.length){toast('请选择数据包');return;}const packId='album-'+Date.now(),name=$('#albumName').value.trim()||'商品图包',time=new Date().toLocaleString('zh-CN',{hour12:false}),oldProducts=state.products,oldPacks=state.packs;state.products=[...state.products,...source.map((p,i)=>({...clone(p),id:sourceId(p)+'--'+packId+'-'+i,sourceId:sourceId(p),packageId:packId}))];state.packs=[...state.packs,{id:packId,name,group:'未分组',type:'图包',createdAt:time,updatedAt:time,note:''}];if(!save()){state.products=oldProducts;state.packs=oldPacks;return;}dialog.close();state.libraryMode='packages';state.packageType='all';route('albums');toast('图包已生成');break;}
      case 'scan-config':scanDialog();break;
      case 'scan-start':{const ids=$$('[data-scan-pack]:checked',dialog).map(x=>x.dataset.scanPack),libs=$$('[data-scan-library]:checked',dialog).map(x=>x.dataset.scanLibrary);if(!ids.length){$('#scanError').textContent='请选择数据包';return;}if(libs.length>10){$('#scanError').textContent='最多选择 10 个词库';return;}const counts={};for(const key of ['main','details','skuImages']){const v=Number($('#scan-'+key).value);if(!Number.isInteger(v)||v<0||v>(key==='main'?20:50)){$('#scanError').textContent='图片数量超出范围';return;}counts[key]=v;}const rules={...state.rules};$$('[data-scan-rule]',dialog).forEach(x=>rules[x.dataset.scanRule]=x.checked);if(!['title','brand','images','price','stock'].some(k=>rules[k])){$('#scanError').textContent='请选择检查项目';return;}const selectedLibraries=state.wordLibraries.filter(w=>libs.includes(w.id)&&w.words.length);const hasWork=rules.price||rules.stock||(rules.title&&selectedLibraries.some(w=>w.type==='title'))||(rules.brand&&selectedLibraries.some(w=>w.type==='brand'))||(rules.images&&Object.values(counts).some(n=>n>0)&&selectedLibraries.some(w=>w.type==='image'));if(!hasWork){$('#scanError').textContent='请配置词库或检测项目';return;}rules.libraryIds=libs;rules.imageCounts=counts;if(JSON.stringify(rules)!==JSON.stringify(state.rules))state.ignored=[];state.rules=rules;state.reviewScope=state.products.filter(p=>ids.includes(p.packageId)).map(p=>p.id);state.reviewFilter='all';const name=$('#scanName').value.trim()||'商品风险检查';dialog.close();save();scan(name);break;}
      case 'review-all':state.reviewScope=null;state.reviewSelected.clear();render();break;
      case 'risk-fix-selected':fixRisks([...state.reviewSelected]);break;
      case 'risk-ignore-selected':state.ignored=[...new Set([...state.ignored,...state.reviewSelected])];state.reviewSelected.clear();save();render();break;
      case 'risk-block-selected':{const ids=new Set(getRisks().filter(r=>state.reviewSelected.has(r.id)).map(r=>r.productId));setBlacklist([...state.blacklist,...state.products.filter(p=>ids.has(p.id)).map(blacklistKey)]);state.reviewSelected.clear();render();break;}
      case 'word-type':state.wordType=value;render();break;
      case 'word-import':wordEditor();break;
      case 'word-edit':wordEditor(id);break;
      case 'word-delete':state.ignored=[];state.wordLibraries=state.wordLibraries.filter(w=>w.id!==id);state.rules.libraryIds=state.rules.libraryIds.filter(i=>i!==id);save();render();break;
      case 'word-save':{const name=$('#wordName').value.trim(),words=[...new Set($('#wordContents').value.split(/[\n,，]/).map(w=>w.trim()).filter(Boolean))];if(!name||!words.length){$('#wordError').textContent='请输入名称和词条';return;}const w={id:modal.id||'words-'+Date.now(),name,type:$('#wordCategory').value,words};state.wordLibraries=state.wordLibraries.filter(x=>x.id!==w.id);state.wordLibraries.push(w);state.ignored=[];if(!state.rules.libraryIds.includes(w.id))state.rules.libraryIds.push(w.id);save();dialog.close();render();break;}
      case 'media-type':state.mediaType=value;render();break;
      case 'media-remove':state.uploads=state.uploads.filter(m=>m.id!==id);save();render();break;
      case 'media-use':{const list=mediaItems().filter(i=>state.mediaType==='all'||i.kind===state.mediaType),item=list[Number(index)];if(!item)return;modal={type:'use-media',asset:item};showModal('使用素材',`<div class="field"><label for="mediaProduct">商品</label><select id="mediaProduct">${activePool().map(p=>`<option value="${p.id}">${e(p.shortTitle)} · ${e(packName(p.packageId))}</option>`).join('')}</select></div><div class="field"><label for="mediaRole">用途</label><select id="mediaRole">${Object.entries(roles).filter(([k])=>k!=='video').map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>`,btn('取消','close-modal')+btn('使用','media-apply','primary'));break;}
      case 'media-apply':{const p=getProduct($('#mediaProduct').value);if(!p)return;const role=$('#mediaRole').value,before=clone(p);p[role]=[...(p[role]||[]),modal.asset.url];p.reviewedImages=[];changed(p.id);syncDerived(p);if(!save()){state.products=state.products.map(x=>x.id===before.id?before:x);return;}dialog.close();render();toast('素材已添加');break;}
      case 'export-format':state.export.format=value;render();break;
      case 'task-filter':state.taskFilter=value;render();break;
      case 'task-detail':{const t=state.tasks.find(t=>t.id===id);if(!t)return;const details=t.details||{};showModal('任务详情',`<div class="v3-rows"><div><span>任务</span><strong>${e(t.name)}</strong></div><div><span>商品数量</span><strong>${t.total}</strong></div><div><span>状态</span><strong>${e({done:'已完成',running:'进行中',cancelled:'已取消',error:'失败'}[t.status])}</strong></div>${Object.entries(details).filter(([k,v])=>typeof v!=='object').map(([k,v])=>`<div><span>${e({checked:'已检查',changed:'已变化跳过',platform:'目标平台',tool:'目标工具',format:'文件格式',folders:'分包数量',packageName:'数据包',sourceRole:'图片来源',targetRole:'采用用途',mode:'创作类型'}[k]||k)}</span><strong>${e(v)}</strong></div>`).join('')}</div>${details.changes?.length?`<div class="v3-rows">${details.changes.slice(0,30).map(c=>`<div><span>${e(c.title||c.name||c.productId||'')}</span><span>${(c.details||[]).map(d=>e(d.label)+': '+e(d.images?(d.before.length+' 张'):d.before)+' → '+e(d.images?(d.after.length+' 张'):d.after)).join('<br>')}</span></div>`).join('')}</div>`:''}`,btn('关闭','close-modal'));break;}

      case 'package-home':state.libraryMode='packages';state.query='';$('#globalSearch').value='';render();break;
      case 'product-view':state.libraryMode='products';render();break;
      case 'package-type':state.packageType=value;render();break;
      case 'package-search':state.packageQuery=$('#packageSearch').value.trim();render();break;
      case 'package-reset':state.packageQuery='';state.packageGroup='all';state.packageType='all';render();break;
      case 'package-open':openPackage(id);break;
      case 'package-low':state.reviewScope=state.products.filter(p=>p.packageId===id).map(p=>p.id);state.reviewFilter='low-price';route('review');scan();break;
      case 'package-export':if(state.packs.find(p=>p.id===id)?.type==='图包')state.export.format='zip';state.selected=new Set(state.products.filter(p=>p.packageId===id).map(p=>p.id));state.export.scope='selected';route('export');break;
      case 'package-append':state.pendingImportPackId=id;importDialog();break;
      case 'package-records':state.taskFilter='export';route('tasks');break;
      case 'inspect-package':{const packId=[...state.selectedPacks][0]||state.packs[0]?.id;if(packId){state.page='inspect';openPackage(packId);}else toast('暂无数据包');break;}
      case 'review-packages':state.reviewScope=state.selectedPacks.size?state.products.filter(p=>state.selectedPacks.has(p.packageId)).map(p=>p.id):null;state.reviewFilter='all';route('review');scan();break;
      case 'package-rename':{const pack=state.packs.find(p=>p.id===id);modal={type:'rename-pack',id};showModal('修改名称','<div class="field"><label class="field-label" for="renamePack">数据包名称</label><input id="renamePack" value="'+e(pack.name)+'"></div>',btn('取消','close-modal')+btn('保存','confirm-pack-name','primary'));break;}
      case 'confirm-pack-name':{const name=$('#renamePack').value.trim();if(!name)return;state.packs.find(p=>p.id===modal.id).name=name;save();dialog.close();render();break;}
      case 'delete-packs':modal={type:'delete-packs'};showModal('删除数据包','<div class="reset-count">'+state.selectedPacks.size+'<span>个数据包</span></div><div class="v3-rows">'+state.packs.filter(p=>state.selectedPacks.has(p.id)).map(p=>'<div>'+e(p.name)+'</div>').join('')+'</div>',btn('取消','close-modal')+btn('删除','confirm-delete-packs','danger'));break;
      case 'confirm-delete-packs':{const previous={packs:clone(state.packs),products:clone(state.products)};state.products=state.products.filter(p=>!state.selectedPacks.has(p.packageId));state.packs=state.packs.filter(p=>!state.selectedPacks.has(p.id));state.selectedPacks.clear();save();dialog.close();render();toast('数据包已删除',()=>{state.products=previous.products;state.packs=previous.packs;save();render();});break;}
      case 'toggle-menu': document.body.classList.toggle('sidebar-open');$('#menuMobile').setAttribute('aria-expanded',String(document.body.classList.contains('sidebar-open')));break;
      case 'close-menu': document.body.classList.remove('sidebar-open','menu-open');break;
      case 'group':state.group=value;state.filter='all';render();break;
      case 'clear-group':state.group='all';render();break;
      case 'filter':state.filter=value;render();break;
      case 'view':state.view=value;render();break;
      case 'clear-search':state.query='';state.group='all';state.filter='all';$('#globalSearch').value='';render();break;
      case 'select':state.selected.has(id)?state.selected.delete(id):state.selected.add(id);render();break;
      case 'clear-selected':state.selected.clear();render();break;
      case 'favorite':state.favorites.includes(id)?state.favorites=state.favorites.filter(v=>v!==id):state.favorites.push(id);save();render();break;
      case 'detail':if(p)openPackage(p.packageId,p.id,el.dataset.tab==='sku'?'sku':'main');break;
      case 'detail-tab':modal.tab=value;renderDetail();break;
      case 'detail-image':modal.imageIndex=Number(index);renderDetail();break;
      case 'image-group':modal.imageGroup=value;modal.imageIndex=0;renderDetail();break;
      case 'image-left':{const a=modal.draft[modal.imageGroup],i=Number(index);if(i>0)[a[i-1],a[i]]=[a[i],a[i-1]];modal.imageIndex=Math.max(0,i-1);renderDetail();break;}
      case 'delete-image':{const a=modal.draft[modal.imageGroup];if(modal.imageGroup==='main'&&a.length<=1)return;a.splice(Number(index),1);modal.imageIndex=0;renderDetail();break;}
      case 'detail-batch':{const inputs=$$('[data-field="price"]',dialog);if(inputs.length){const price=Number(inputs[0].value);if(inputs[0].value.trim()!==''&&Number.isFinite(price)&&price>=0&&price<=100000000){modal.draft.skus.forEach(s=>s.price=price);renderDetail();}}break;}
      case 'save-detail':{const validation=C.validateProduct(modal.draft);if(!validation.ok){$('#detailError').textContent=validation.errors[0];return;}syncDerived(modal.draft);const original=clone(getProduct(modal.id));state.products=state.products.map(x=>x.id===modal.id?clone(modal.draft):x);changed(modal.id);save();dialog.close();render();toast('商品已保存',()=>{state.products=state.products.map(x=>x.id===original.id?original:x);save();render();});break;}
      case 'close-modal':dialog.close();break;
      case 'zoom':openZoom(el.dataset.src);break;
      case 'close-lightbox':lightbox.close();break;
      case 'undo':if(undoAction)undoAction();undoAction=null;$('#toast').classList.remove('show');break;
      case 'new-group':modal={type:'new-group'};showModal('新建分组','<div class="field"><label class="field-label" for="groupName">分组名称</label><input id="groupName" maxlength="24" autofocus></div><span class="field-error" id="groupError"></span>',btn('取消','close-modal')+btn('创建','confirm-group','primary'));break;
      case 'confirm-group':{const name=$('#groupName').value.trim();if(!name||state.groups.includes(name)){$('#groupError').textContent=!name?'请输入分组名称':'分组已存在';return;}state.groups.push(name);save();dialog.close();render();toast('分组已创建');break;}
      case 'move-group':modal={type:'move'};showModal('移动分组',`<div class="field"><label class="field-label" for="moveGroup">分组</label><select id="moveGroup">${state.groups.map(g=>`<option>${e(g)}</option>`).join('')}</select></div>`,btn('取消','close-modal')+btn('移动','confirm-move','primary'));break;
      case 'confirm-move':state.products.filter(x=>state.selected.has(x.id)).forEach(x=>x.group=$('#moveGroup').value);save();dialog.close();render();toast('分组已更新');break;
      case 'batch-price':modal={type:'batch-price'};showModal('批量改价',`<div class="form-grid"><div class="field"><label class="field-label" for="priceMethod">修改方式</label><select id="priceMethod"><option value="fixed">统一价格</option><option value="add">增加金额</option><option value="multiply">乘以系数</option></select></div><div class="field"><label class="field-label" for="priceAmount">数值</label><input id="priceAmount" type="number" step="0.01" min="0" value="39.90"></div></div><span class="field-error" id="priceError"></span>`,btn('取消','close-modal')+btn('应用修改','confirm-price','primary'));break;
      case 'confirm-price':{const n=Number($('#priceAmount').value),method=$('#priceMethod').value;if(!Number.isFinite(n)||n<0||n>1000000||$('#priceAmount').value===''||state.products.filter(x=>state.selected.has(x.id)).some(x=>x.skus.some(k=>(method==='multiply'?k.price*n:method==='add'?k.price+n:n)>100000000))){$('#priceError').textContent='请输入有效数值';return;}const before=clone(state.products);state.products.filter(x=>state.selected.has(x.id)).forEach(x=>{x.skus.forEach(s=>s.price=Math.round((method==='fixed'?n:method==='add'?s.price+n:s.price*n)*100)/100);syncDerived(x);x.originalSummaryPrice=x.price+'-'+x.priceMax;changed(x.id);});save();dialog.close();render();toast('价格已更新',()=>{state.products=before;save();render();});break;}
      case 'delete-selected':{const before=clone(state.products);state.products=state.products.filter(x=>!state.selected.has(x.id));state.selected.clear();save();render();toast('商品已移除',()=>{state.products=before;save();render();});break;}
      case 'review-selected':state.reviewScope=[...state.selected];route('review');scan();break;
      case 'export-selected':state.export.scope='selected';route('export');break;
      case 'studio-source':state.studio.source=Number(index);state.studio.result=null;render();break;
      case 'studio-mode':state.studio.mode=value;state.studio.targetRole=value==='white'?'whiteImages':'main';state.studio.result=null;state.studio.comparison=false;state.studio.preset=value==='video'?'18 秒':'自然光';render();break;
      case 'studio-ratio':state.studio.ratio=value;render();break;
      case 'candidate':state.studio.selected=Number(index);render();break;
      case 'compare':state.studio.comparison=value==='true';render();break;
      case 'generate':generate();break;
      case 'adopt':{const s=state.studio,product=getProduct(s.id);if(!s.result)return;const before=clone(product);if(s.mode==='video')product.video=getProduct(s.result.productId).video;else{const chosen=s.result.images[s.selected];const role=s.targetRole;product[role]=[chosen,...(product[role]||[]).filter(i=>i!==chosen)];product.reviewedImages=[];}changed(product.id);syncDerived(product);if(!save()){state.products=state.products.map(x=>x.id===before.id?before:x);return;}toast('结果已采用',()=>{state.products=state.products.map(x=>x.id===before.id?before:x);save();render();});break;}
      case 'studio-history':route('tasks');break;
      case 'go-studio':route('studio');break;
      case 'scan':scan();break;
      case 'risk-filter':state.reviewFilter=value;render();break;
      case 'word-list':route('words');break; case 'legacy-word-list':modal={type:'words'};showModal('违规词库',`<div class="field"><label class="field-label" for="wordList">标题词</label><textarea id="wordList" rows="7">${e(state.rules.words.join('\n'))}</textarea></div>`,btn('取消','close-modal')+btn('保存词库','save-words','primary'));break;
      case 'save-words':state.rules.words=[...new Set($('#wordList').value.split(/[\n,，]/).map(w=>w.trim()).filter(Boolean))];state.ignored=[];save();dialog.close();render();toast('词库已保存');break;
      case 'ignore-risk':state.ignored.push(id);save();render();toast('已忽略',()=>{state.ignored=state.ignored.filter(x=>x!==id);save();render();});break;
      case 'fix-risk':fixRisks([id]);break;
      case 'risk-image':{const r=getRisks().find(x=>x.id===id);if(r)openZoom(r.image||getProduct(r.productId).main[0]);break;}
      case 'platform':state.export.platform=value;render();break;
      case 'export-run':await exportNow();break;
      case 'cancel-task':{clearInterval(timers.get(id));timers.delete(id);const t=state.tasks.find(t=>t.id===id);if(t)t.status='cancelled';save();render();toast('任务已取消');break;}
      case 'clear-tasks':state.tasks=state.tasks.filter(t=>t.status==='running');save();render();toast('记录已清理');break;
      case 'task-download':{const cached=downloads.get(id),t=state.tasks.find(t=>t.id===id);if(cached)download(cached.blob,cached.filename);else if(t?.snapshot){try{const cfg=t.exportConfig;let blob,filename;if(cfg.format==='zip'){blob=await C.buildImageZip(t.snapshot,url=>fetch(media(url)),cfg);filename='图映-商品图包.zip';}else{const out=C.buildExport(t.snapshot,cfg.format,cfg.platform,{tool:cfg.tool});blob=new Blob([out.content],{type:out.mime});filename=out.filename;}download(blob,filename);}catch(err){toast(err.message);}}else toast('该记录无归档快照，请重新导出');break;}
      case 'task-result':{const t=state.tasks.find(x=>x.id===id),r=state.generated.find(x=>x.id===t?.resultId);if(r){state.studio.id=r.productId;state.studio.mode=r.mode;state.studio.sourceRole=r.sourceRole||'main';state.studio.source=r.sourceIndex||0;state.studio.targetRole=r.targetRole||(r.mode==='white'?'whiteImages':'main');state.studio.result=r;state.studio.selected=0;route('studio');}break;}
      case 'import':state.pendingImportPackId=null;importDialog();break;
      case 'confirm-import':await confirmImport();break;
      case 'reset':modal={type:'reset'};showModal('重置演示',`<div class="reset-count">${state.products.length}<span>件商品</span></div>`,btn('取消','close-modal')+btn('恢复初始数据','confirm-reset','primary'));break;
      case 'confirm-reset':timers.forEach(t=>clearInterval(t));timers.clear();try{localStorage.removeItem(STORE);localStorage.removeItem('tuying-workbench-blacklist:'+location.pathname);}catch{}location.hash='library';location.reload();break;
    }
  });
  document.addEventListener('input',ev=>{
    const el=ev.target;
    if(el.id==='globalSearch'){state.libraryMode='products';state.query=el.value;if(state.page!=='library')state.page='library';render();}
    if(modal?.type==='detail'){
      if(el.id==='editTitle')modal.draft.title=el.value;
      if(el.id==='editShortTitle')modal.draft.shortTitle=el.value;
      if(el.dataset.sku!==undefined)modal.draft.skus[Number(el.dataset.sku)][el.dataset.field]=el.value===''?NaN:Number(el.value);
    }
    if(el.id==='aiPrompt')state.studio.prompt=el.value;
  });
  document.addEventListener('change',async ev=>{
    const el=ev.target;
    if(el.id==='wordUpload'&&el.files[0]){const text=await el.files[0].text();$('#wordContents').value=text;}
    if(el.id==='riskSelectAll'){getRisks().filter(r=>state.reviewFilter==='all'||r.type===state.reviewFilter).forEach(r=>el.checked?state.reviewSelected.add(r.id):state.reviewSelected.delete(r.id));render();}
    if(el.dataset.riskSelect){el.checked?state.reviewSelected.add(el.dataset.riskSelect):state.reviewSelected.delete(el.dataset.riskSelect);render();}
    if(el.id==='exportTool'){state.export.tool=el.value;render();}
    if(el.id==='exportFolders'){state.export.folders=Math.max(0,Math.min(20,Math.floor(Number(el.value)||0)));render();}
    if(el.id==='exportDistribution'){state.export.distribution=el.value;render();}
    if(el.id==='exportLimit'){state.export.limit=Math.max(0,Math.min(500,Math.floor(Number(el.value)||0)));render();}
    if(el.dataset.exportRole){state.export.mediaTypes=el.checked?[...new Set([...state.export.mediaTypes,el.dataset.exportRole])]:state.export.mediaTypes.filter(k=>k!==el.dataset.exportRole);render();}
    if(el.id==='mediaUpload'){const before=state.uploads;const added=[];for(const file of el.files){if(file.size>1000000||!/^image\/(png|jpeg|webp)$|^video\/mp4$/.test(file.type)){toast('单个素材需小于 1 MB');continue;}const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});added.push({id:'media-'+Date.now()+'-'+added.length,url,name:file.name,kind:file.type.startsWith('video')?'video':'image'});}state.uploads=[...before,...added];if(!save())state.uploads=before;render();}

    if(el.id==='packageGroup'){state.packageGroup=el.value;render();}
    if(el.id==='selectAllPacks'){visiblePacks().forEach(p=>el.checked?state.selectedPacks.add(p.id):state.selectedPacks.delete(p.id));render();}
    if(el.dataset.packSelect){el.checked?state.selectedPacks.add(el.dataset.packSelect):state.selectedPacks.delete(el.dataset.packSelect);render();}
    if(el.dataset.packGroup){const p=state.packs.find(p=>p.id===el.dataset.packGroup);if(p){p.group=el.value;save();}}
    if(el.dataset.packNote){const p=state.packs.find(p=>p.id===el.dataset.packNote);if(p){p.note=el.value;save();}}
    if(el.id==='selectAll'){activeProducts().forEach(p=>el.checked?state.selected.add(p.id):state.selected.delete(p.id));render();}
    if(el.id==='sort'){state.sort=el.value;render();}
    if(el.id==='studioPackage'){const p=activePool().find(p=>p.packageId===el.value);if(p){state.studio.id=p.id;state.studio.source=0;state.studio.result=null;state.studio.comparison=false;render();}}
    if(el.id==='studioProduct'){state.studio.id=el.value;state.studio.source=0;state.studio.result=null;state.studio.comparison=false;render();}
    if(el.id==='studioSourceRole'){state.studio.sourceRole=el.value;state.studio.source=0;state.studio.result=null;render();}
    if(el.id==='studioTargetRole'){state.studio.targetRole=el.value;}
    if(el.id==='candidateCount')state.studio.count=Number(el.value);
    if(el.id==='aiPreset')state.studio.preset=el.value;
    if(el.id==='exportScope'){state.export.scope=el.value;render();}
    if(el.id==='exportFormat'){state.export.format=el.value;render();}
    if(el.id==='editGroup'&&modal?.draft)modal.draft.group=el.value;
    if(el.dataset.rule){state.rules[el.dataset.rule]=el.checked;save();render();}
    if(['importFiles','importFolder'].includes(el.id))$('#importStatus').textContent=[...el.files].slice(0,5).map(f=>f.name).join(' · ');
  });
  document.addEventListener('pointerover',ev=>{
    const im=ev.target.closest('img[data-preview]');if(!im)return;
    clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{const box=im.getBoundingClientRect(),pv=$('#hoverPreview');pv.innerHTML=`<img src="${e(im.dataset.preview)}" alt="放大预览">`;pv.style.left=Math.max(12,Math.min(innerWidth-284,box.right+12))+'px';pv.style.top=Math.max(12,Math.min(innerHeight-284,box.top-30))+'px';pv.classList.add('show');if(pv.showPopover)pv.showPopover();},320);
  });
  document.addEventListener('pointerout',ev=>{if(ev.target.matches('img[data-preview]')){clearTimeout(hoverTimer);$('#hoverPreview').classList.remove('show');if($('#hoverPreview').matches(':popover-open'))$('#hoverPreview').hidePopover();}});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){$('#hoverPreview').classList.remove('show');document.body.classList.remove('sidebar-open','menu-open');}if((ev.metaKey||ev.ctrlKey)&&ev.key==='k'){ev.preventDefault();$('#globalSearch').focus();}});
  dialog.addEventListener('click',ev=>{if(ev.target===dialog){const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();}});
  lightbox.addEventListener('click',ev=>{if(ev.target===lightbox)lightbox.close();});
  dialog.addEventListener('close',()=>{const pv=$('#hoverPreview');pv.classList.remove('show');if(pv.matches(':popover-open'))pv.hidePopover();});
  window.addEventListener('hashchange',()=>{const page=location.hash.slice(1);if(names[page]){state.page=page;render();}});
  state.page=names[location.hash.slice(1)]?location.hash.slice(1):'library';render();
})();
