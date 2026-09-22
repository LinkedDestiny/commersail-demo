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
  const names = { library: '商品资产', studio: 'AI 创作', review: '风险检查', export: '转换导出', tasks: '任务中心' };
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
    products: Array.isArray(stored?.products) ? stored.products : clone(seed),
    groups: stored?.groups || ['秋日童装', '夏日轻装'],
    favorites: stored?.favorites || [], generated: stored?.generated || [],
    tasks: (stored?.tasks || []).map(t => t.status === 'running' ? { ...t, status: 'cancelled' } : t),
    checked: stored?.checked || [], ignored: stored?.ignored || [], scanned: stored?.scanned || false,
    rules: stored?.rules || { words: ['最强', '第一', '绝对', '顶级', '100%'], price: true, stock: true, images: true, title: true },
    page: 'library', group: 'all', filter: 'all', query: '', sort: 'default', view: 'grid', selected: new Set(),
    studio: { id: seed[0].id, mode: 'white', ratio: '1:1', count: 2, source: 0, preset: '自然光', prompt: '自然光，奶油色室内，保持商品细节', selected: 0, result: null },
    reviewFilter: 'all', reviewScope: null, export: { platform: '图映', format: 'json', scope: 'all' },
  };
  const timers = new Map(), downloads = new Map();
  let modal = null, undoAction = null, toastTimer, hoverTimer;
  const main = $('#main'), dialog = $('#dialog'), lightbox = $('#lightbox');
  const getProduct = id => state.products.find(p => p.id === id);
  function save() {
    // ponytail: browser storage is enough for this small demo; a real asset library needs a database.
    const { products, groups, favorites, generated, tasks, checked, ignored, scanned, rules } = state;
    try { localStorage.setItem(STORE, JSON.stringify({ products, groups, favorites, generated, tasks, checked, ignored, scanned, rules })); }
    catch { toast('当前更改仅保留至本次关闭'); }
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
    const list = state.products.filter(p => (state.group === 'all' || p.group === state.group) && (!q || `${p.title} ${p.shortTitle} ${p.id} ${p.category}`.toLowerCase().includes(q)) && (state.filter !== 'favorites' || state.favorites.includes(p.id)) && (state.filter !== 'reviewed' || state.checked.includes(p.id)));
    if (state.sort === 'price-asc') list.sort((a,b) => a.price-b.price);
    if (state.sort === 'price-desc') list.sort((a,b) => b.price-a.price);
    return list;
  }
  function route(page) { if (!names[page]) page = 'library'; state.page = page; location.hash = page; document.body.classList.remove('sidebar-open', 'menu-open'); render(); }
  function render() {
    if (!getProduct(state.studio.id)) state.studio.id = state.products[0]?.id;
    $('[id="breadcrumb"]').textContent = names[state.page];
    $$('[data-nav]').forEach(el => { el.classList.toggle('active', el.dataset.nav === state.page); el.setAttribute('aria-current', el.dataset.nav === state.page ? 'page' : 'false'); });
    $$('[data-group]').forEach(el => el.classList.toggle('active', state.page === 'library' && state.group === el.dataset.group));
    $('#libraryCount').textContent = state.products.length;
    $('.group-nav').innerHTML = `<button class="sidebar-group ${state.group==='all'?'active':''}" data-group="all">${icon('folder')}<span>全部商品</span><span>${state.products.length}</span></button>` + state.groups.map((g,i)=>`<button class="sidebar-group ${state.group===g?'active':''}" data-group="${e(g)}"><span class="group-dot ${i%2?'dot-sand':'dot-olive'}"></span><span>${e(g)}</span><span>${state.products.filter(p=>p.group===g).length}</span></button>`).join('');
    $('#taskDot').hidden = !state.tasks.some(t=>t.status==='running');
    $('#menuMobile').setAttribute('aria-expanded',String(document.body.classList.contains('sidebar-open')));
    main.innerHTML = ({ library: library, studio: studio, review: review, export: exportPage, tasks: tasksPage })[state.page]();
  }
  function library() {
    const products = activeProducts();
    return head('商品资产', btn('新建分组','new-group','','','plus') + btn('导入数据包','import','primary','','upload'), `${state.products.length} 件商品`) +
      `<div class="collection-strip">${state.groups.map((g,i) => `<button class="collection-tile ${state.group === g ? 'active' : ''}" data-action="group" data-value="${e(g)}"><span class="collection-icon tone-${i % 2}">${icon('folder')}</span><span class="collection-info"><strong>${e(g)}</strong><span>${state.products.filter(p=>p.group===g).length} 件商品</span></span>${icon('chevron')}</button>`).join('')}<button class="collection-tile collection-add" data-action="new-group" aria-label="新建分组">${icon('plus')}</button></div>` +
      `<div class="tabs"><button class="tab ${state.filter==='all'?'active':''}" data-action="filter" data-value="all">全部商品 <span class="tab-count">${state.products.length}</span></button><button class="tab ${state.filter==='favorites'?'active':''}" data-action="filter" data-value="favorites">我的收藏 <span class="tab-count">${state.favorites.length}</span></button><button class="tab ${state.filter==='reviewed'?'active':''}" data-action="filter" data-value="reviewed">已检查 <span class="tab-count">${state.checked.length}</span></button><span class="tabs-spacer"></span>${state.group!=='all'?btn(e(state.group)+' ×','clear-group','ghost small'):''}</div>` +
      `<div class="toolbar"><div class="toolbar-left"><label class="check-row"><input type="checkbox" id="selectAll" ${products.length&&products.every(p=>state.selected.has(p.id))?'checked':''}> 全选</label><span class="muted">${products.length} 件商品</span></div><div class="toolbar-right"><select class="select-control" aria-label="商品排序" id="sort"><option value="default" ${state.sort==='default'?'selected':''}>最近添加</option><option value="price-asc" ${state.sort==='price-asc'?'selected':''}>价格从低到高</option><option value="price-desc" ${state.sort==='price-desc'?'selected':''}>价格从高到低</option></select><div class="view-switch">${ib('网格视图','view','grid',`data-value="grid" aria-pressed="${state.view==='grid'}"`)}${ib('列表视图','view','list',`data-value="list" aria-pressed="${state.view==='list'}"`)}</div></div></div>`+
      (products.length ? `<div class="product-grid ${state.view==='list'?'list-view':''}">${products.map(card).join('')}</div>` : `<div class="empty-state">${icon('search')}<h2>暂无商品</h2>${btn('查看全部','clear-search','primary')}</div>`) +
      (state.selected.size ? `<div class="selection-bar"><span><strong>${state.selected.size}</strong> 件已选</span>${btn('批量改价','batch-price','ghost','','edit')}${btn('移动分组','move-group','ghost','','folder')}${btn('风险检查','review-selected','ghost','','shield')}${btn('导出','export-selected','primary','','download')}${ib('删除选中商品','delete-selected','trash')}${ib('取消选择','clear-selected','close')}</div>` : '');
  }
  function card(p) {
    return `<article class="product-card ${state.selected.has(p.id)?'selected':''}"><div class="product-visual"><button class="card-image-button" data-action="detail" data-id="${p.id}" aria-label="编辑 ${e(p.shortTitle)}"><img class="product-image" src="${src(p.main[0])}" alt="${e(p.shortTitle)}" loading="lazy"></button><button class="card-select ${state.selected.has(p.id)?'checked':''}" data-action="select" data-id="${p.id}" aria-label="选择 ${e(p.shortTitle)}" aria-pressed="${state.selected.has(p.id)}">${state.selected.has(p.id)?icon('check'):''}</button><span class="card-badge">${p.skus.length} SKU</span><div class="card-actions">${ib('预览 '+p.shortTitle,'zoom','zoom',`data-src="${e(src(p.main[0]))}"`)}${ib(state.favorites.includes(p.id)?'取消收藏':'收藏','favorite','star',`data-id="${p.id}" aria-pressed="${state.favorites.includes(p.id)}"`)}</div></div><div class="product-info"><div class="product-meta"><span>1688</span><span>${e(p.category)}</span></div><button class="product-title" data-action="detail" data-id="${p.id}">${e(p.shortTitle || p.title)}</button><div class="product-footer"><span class="product-price"><small>¥</small>${C.formatMoney(p.price).replace(/[¥￥]/g,'')}${p.priceMax>p.price?`<small>起</small>`:''}</span><span class="product-status ${state.checked.includes(p.id)?'checked':''}">${state.checked.includes(p.id)?icon('check'):'<i></i>'}${state.checked.includes(p.id)?'已检查':'待检查'}</span></div></div></article>`;
  }
  const modes = { white: ['白底图','cut'], scene: ['商品生图','image'], repair: ['局部修补','wand'], video: ['商品视频','video'] };
  function studio() {
    const s = state.studio, p = getProduct(s.id);
    if (!p) return head('AI 创作') + '<div class="empty-state">暂无商品</div>';
    const task = state.tasks.find(t=>t.status==='running' && t.kind==='ai');
    const results = s.result?.productId === p.id && s.result.mode === s.mode ? s.result : null;
    const preview = results ? results.images[s.selected] : p.main[s.source] || p.main[0];
    return head('AI 创作', `<span class="status-pill neutral">演示</span>${btn('创作记录','studio-history','','','clock')}`)+
      `<div class="studio-layout"><section class="studio-controls"><div class="field"><label class="field-label" for="studioProduct">商品</label><select id="studioProduct" class="select-control">${state.products.map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${e(x.shortTitle)}</option>`).join('')}</select></div><div class="source-picker">${p.main.map((im,i)=>`<button class="source-thumb ${s.source===i?'active':''}" data-action="studio-source" data-index="${i}" aria-label="选择源图 ${i+1}" aria-pressed="${s.source===i}"><img src="${src(im)}" alt="主图 ${i+1}"></button>`).join('')}</div><div class="field"><span class="field-label">创作类型</span><div class="creation-types">${Object.entries(modes).map(([key,[label,ico]])=>`<button class="creation-type ${s.mode===key?'active':''}" data-action="studio-mode" data-value="${key}" aria-pressed="${s.mode===key}">${icon(ico)}<span>${label}</span></button>`).join('')}</div></div><div class="field"><span class="field-label">画面比例</span><div class="segmented">${['1:1','3:4','9:16'].map(v=>`<button class="segment ${s.ratio===v?'active':''}" data-action="studio-ratio" data-value="${v}" aria-pressed="${s.ratio===v}">${v}</button>`).join('')}</div></div>${s.mode==='scene'||s.mode==='repair'?`<div class="field"><label class="field-label" for="aiPrompt">${s.mode==='repair'?'修补要求':'场景关键词'}</label><textarea id="aiPrompt" rows="3">${e(s.prompt)}</textarea></div>`:''}<div class="form-grid"><div class="field"><label class="field-label" for="candidateCount">候选数量</label><select class="select-control" id="candidateCount"><option value="2" ${s.count===2?'selected':''}>2 个</option><option value="4" ${s.count===4?'selected':''}>4 个</option></select></div><div class="field"><label class="field-label" for="aiPreset">${s.mode==='video'?'时长':'风格'}</label><select class="select-control" id="aiPreset">${(s.mode==='video'?['18 秒']:['自然光','柔和阴影','极简棚拍']).map(v=>`<option ${s.preset===v?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="studio-generate">${btn(task?'生成中…':'开始生成','generate','primary',task?'disabled':'','sparkle')}${task?`<div class="progress-track"><div class="progress-fill" style="width:${task.progress}%"></div></div>`:''}</div></section><section class="studio-preview"><div class="preview-toolbar"><div class="preview-tabs"><button class="${!s.comparison?'active':''}" data-action="compare" data-value="false">${results?'生成结果':'原始图片'}</button>${results?'<button data-action="compare" data-value="true" class="'+(s.comparison?'active':'')+'">前后对比</button>':''}</div><span class="muted">${e(s.ratio)}</span>${ib('放大预览','zoom','zoom',`data-src="${e(src(preview))}"`)}</div><div class="preview-stage ${s.comparison&&results?'comparison':''} ${task?'is-generating':''}">${s.comparison&&results?`<div class="compare-image"><span class="comparison-label">原图</span><img src="${src(p.main[s.source])}" alt="原始商品图"></div>`:''}<div class="compare-image" style="--preview-ratio:${s.ratio.replace(':','/')}">${results?'<span class="comparison-label">候选 '+(s.selected+1)+'</span>':''}${results&&s.mode==='video'&&p.video?`<video src="${e(media(p.video))}" controls playsinline preload="metadata" poster="${src(preview)}"></video>`:`<img src="${src(preview)}" alt="${results?'候选结果':'原始商品图'}">`}${task?`<div class="generating-overlay">${icon('sparkle')}<strong>${task.progress}%</strong><span>生成中</span></div>`:''}</div></div>${results?`<div class="result-bar"><div class="result-grid">${results.images.map((im,i)=>`<button class="result-tile ${s.selected===i?'active':''}" data-action="candidate" data-index="${i}" aria-label="候选 ${i+1}" aria-pressed="${s.selected===i}"><img src="${src(im)}" alt="候选 ${i+1}"><span>${i+1}</span></button>`).join('')}</div>${btn('采用结果','adopt','primary','','check')}</div>`:`<div class="preview-bottom"><span>${e(p.shortTitle)}</span><span>${p.main.length} 张主图</span></div>`}</section></div>`;
  }
  const reviewProducts = () => state.reviewScope ? state.products.filter(p=>state.reviewScope.includes(p.id)) : state.products;
  function getRisks() {
    const products = reviewProducts();
    const base = C.calculateRisks(products, { words: state.rules.title ? state.rules.words : [] }).filter(r=> (state.rules.price || !['price-mismatch','low-price'].includes(r.type)) && (state.rules.stock || r.type!=='zero-stock'));
    const sample=products.find(p=>p.id===seed[0].id), sampleIndex=sample?.main.indexOf(seed[0].main[0]);
    if (state.rules.images && sample && sampleIndex>=0) base.push({ id:'sample-image-text',productId:seed[0].id,type:'image',title:'图片品牌文字',detail:`主图 ${sampleIndex+1} · Nebeans`,severity:'warning',fixable:false,image:seed[0].main[0] });
    return base.filter(r=>!state.ignored.includes(r.id));
  }
  function review() {
    const risks = state.scanned ? getRisks() : [], riskProducts = new Set(risks.map(r=>r.productId)), task=state.tasks.find(t=>t.kind==='scan'&&t.status==='running');
    const typeLabels = { all:'全部', 'price-mismatch':'价格', 'zero-stock':'库存', image:'图片', word:'标题' };
    const shown = risks.filter(r=>state.reviewFilter==='all'||r.type===state.reviewFilter||(state.reviewFilter==='price-mismatch'&&r.type==='low-price'));
    return head('风险检查', btn('词库管理','word-list','','','list') + btn(task?'检查中…':'开始检查','scan','primary',task?'disabled':'','shield')) +
      `<div class="review-summary"><div class="review-stat"><span>商品总数</span><strong>${reviewProducts().length}<small>件</small></strong></div><div class="review-stat"><span>已检查</span><strong>${state.scanned?reviewProducts().length:0}<small>件</small></strong></div><div class="review-stat warning"><span>待处理</span><strong>${riskProducts.size}<small>件</small></strong></div><div class="review-stat"><span>规则通过</span><strong>${state.scanned?reviewProducts().length-riskProducts.size:0}<small>件</small></strong></div></div>${task?`<div class="scan-progress"><span>正在检查 ${Math.min(reviewProducts().length,Math.ceil(reviewProducts().length*task.progress/100))} / ${reviewProducts().length}</span><div class="progress-track"><div class="progress-fill" style="width:${task.progress}%"></div></div><span>${task.progress}%</span></div>`:''}<div class="review-layout"><aside class="review-filters"><h2>检查项目</h2>${[['title','标题词库'],['price','价格与低价 SKU'],['stock','SKU 库存'],['images','图片文字 · 演示']].map(([key,label])=>`<label class="check-row"><input type="checkbox" data-rule="${key}" ${state.rules[key]?'checked':''}>${label}</label>`).join('')}<div class="rule-divider"></div><h2>违规词库</h2><div class="word-chips">${state.rules.words.slice(0,7).map(w=>`<span>${e(w)}</span>`).join('')}</div></aside><section class="review-results"><div class="tabs">${Object.entries(typeLabels).map(([key,label])=>`<button class="tab ${state.reviewFilter===key?'active':''}" data-action="risk-filter" data-value="${key}">${label}${key==='all'?` <span class="tab-count">${risks.length}</span>`:''}</button>`).join('')}</div><div class="risk-list">${!state.scanned?`<div class="empty-state">${icon('shield')}<h2>待检查</h2>${btn('开始检查','scan','primary',task?'disabled':'')}</div>`:!shown.length?`<div class="empty-state">${icon('check')}<h2>无待处理项</h2></div>`:shown.map(r=>{const p=getProduct(r.productId);return `<article class="risk-item"><img class="risk-thumb" src="${src(p.main[0])}" alt="${e(p.shortTitle)}"><div class="risk-body"><div class="label-row"><strong>${e(r.title)}</strong><span class="status-pill ${r.type==='image'?'neutral':'warning'}">${r.type==='image'?'AI 演示':'待处理'}</span></div><button class="risk-product-link" data-action="detail" data-id="${p.id}">${e(p.shortTitle)}</button><p>${e(r.detail)}</p></div><div class="risk-actions">${r.fixable?btn(r.type==='word'?'移除词语':'同步价格','fix-risk','small',`data-id="${e(r.id)}"`):btn(r.type==='image'?'查看图片':'编辑 SKU',r.type==='image'?'risk-image':'detail','small',`data-id="${r.type==='image'?e(r.id):p.id}" data-tab="sku"`)}${ib('忽略此项','ignore-risk','close',`data-id="${e(r.id)}"`)}</div></article>`}).join('')}</div></section></div>`;
  }
  function exportProducts() {
    if (state.export.scope==='selected') return state.products.filter(p=>state.selected.has(p.id));
    if (state.export.scope!=='all') return state.products.filter(p=>p.group===state.export.scope);
    return state.products;
  }
  function exportPage() {
    const p = exportProducts(), x=state.export;
    const platformColors={'图映':'#187765','淘宝':'#e97832','拼多多':'#d85652','京东':'#be4649','1688':'#d78a26','抖音':'#252b2a'};
    return head('转换导出', '<span class="status-pill neutral">通用清单</span>')+`<div class="export-layout"><section class="export-settings"><div class="field"><span class="field-label">目标平台</span><div class="platform-grid">${['图映','淘宝','拼多多','京东','1688','抖音'].map(name=>[name,platformColors[name]]).map(([name,color])=>`<button class="platform-option ${x.platform===name?'active':''}" data-action="platform" data-value="${name}" aria-pressed="${x.platform===name}"><span class="platform-logo" style="color:${color};background:${color}0c">${name==='图映'?icon('layers'):name==='1688'?'1688':name[0]}</span><span>${name}</span>${x.platform===name?icon('check'):''}</button>`).join('')}</div></div><div class="field"><label class="field-label" for="exportScope">商品范围</label><select class="select-control" id="exportScope"><option value="all" ${x.scope==='all'?'selected':''}>全部商品 · ${state.products.length}</option><option value="selected" ${x.scope==='selected'?'selected':''}>已选商品 · ${state.selected.size}</option>${state.groups.map(g=>`<option ${x.scope===g?'selected':''} value="${e(g)}">${e(g)} · ${state.products.filter(i=>i.group===g).length}</option>`).join('')}</select></div><div class="field"><label class="field-label" for="exportFormat">文件格式</label><select class="select-control" id="exportFormat"><option value="json" ${x.format==='json'?'selected':''}>商品数据 · JSON</option><option value="csv" ${x.format==='csv'?'selected':''}>商品清单 · CSV</option><option value="zip" ${x.format==='zip'?'selected':''}>商品图包 · ZIP</option></select></div><div class="export-summary"><div><span>商品</span><strong>${p.length}</strong></div><div><span>SKU</span><strong>${p.reduce((n,i)=>n+i.skus.length,0)}</strong></div><div><span>主图</span><strong>${p.reduce((n,i)=>n+i.main.length,0)}</strong></div></div>${btn('导出文件','export-run','primary',!p.length?'disabled':'','download')}</section><section class="export-preview"><div class="preview-toolbar"><h2>导出预览</h2><span class="status-pill neutral">${x.format.toUpperCase()}</span></div><div class="export-directory">${icon('folder')}<strong>图映_${e(x.platform)}_20260922</strong></div><div class="export-file-list">${x.format==='zip'?p.slice(0,6).map(i=>`<div class="export-file">${icon('folder')}<div class="file-detail"><strong>${e(i.shortTitle)}</strong><span>${i.main.length} 张主图 · product.json</span></div><span class="muted">${i.id}</span></div>`).join(''):`<div class="export-file"><div class="file-icon">${icon('file')}</div><div class="file-detail"><strong>商品清单.${x.format}</strong><span>${p.length} 件商品 · ${e(x.platform)}</span></div><span class="status-pill success">就绪</span></div><div class="export-table-wrap"><table class="sku-table"><thead><tr><th>商品</th><th>价格</th><th>SKU</th><th>库存</th></tr></thead><tbody>${p.map(i=>`<tr><td><div class="export-product-cell"><img src="${src(i.main[0])}" alt=""><span>${e(i.shortTitle)}</span></div></td><td>¥${i.price.toFixed(2)}</td><td>${i.skus.length}</td><td>${i.stock}</td></tr>`).join('')}</tbody></table></div>`}</div><div class="export-preview-footer">${icon('check')}<span>${p.length} 件商品已就绪</span></div></section></div>`;
  }
  function tasksPage() {
    const items=[...state.tasks].reverse();
    return head('任务中心', btn('清理记录','clear-tasks','','','trash'), `${items.length} 个任务`)+`<div class="task-table">${items.length?items.map(t=>`<article class="task-row"><div class="task-icon">${icon(t.kind==='ai'?'sparkle':t.kind==='scan'?'shield':'download')}</div><div class="task-content"><strong>${e(t.name)}</strong><span>${e(t.time)} · ${t.total} ${t.kind==='ai'?'个候选':'件商品'}${t.kind==='ai'?' · 演示':''}</span></div><div class="task-progress">${t.status==='running'?`<div class="progress-track"><div class="progress-fill" style="width:${t.progress}%"></div></div><span>${t.progress}%</span>`:''}</div><span class="status-pill ${t.status==='done'?'success':t.status==='error'?'warning':'neutral'}">${{running:'进行中',done:'已完成',cancelled:'已取消',error:'失败'}[t.status]}</span>${t.status==='running'?ib('取消任务','cancel-task','close',`data-id="${t.id}"`):t.kind==='export'&&t.status==='done'?btn('再次下载','task-download','small',`data-id="${t.id}"`):t.kind==='ai'&&t.status==='done'?btn('查看结果','task-result','small',`data-id="${t.id}"`):''}</article>`).join(''):`<div class="empty-state">${icon('clock')}<h2>暂无任务</h2>${btn('前往 AI 创作','go-studio','primary')}</div>`}</div>`;
  }
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
  function syncDerived(p) { if(p.skus.length) {p.price=Math.min(...p.skus.map(s=>s.price));p.priceMax=Math.max(...p.skus.map(s=>s.price));} p.stock=p.skus.reduce((n,s)=>n+s.stock,0); p.totalImages=p.main.length+p.skuImages.length+p.details.length; }
  function changed(id) { state.checked=state.checked.filter(x=>x!==id);state.ignored=[]; }
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
      const result={id:task.id,productId:p.id,mode:s.mode,images:Array.from({length:s.count},(_,i)=>pool[i%pool.length]),ratio:s.ratio,prompt:s.prompt};
      state.generated.push(result);task.resultId=result.id;
      if(state.studio.id===s.id&&state.studio.mode===s.mode){state.studio.result=result;state.studio.selected=0;state.studio.comparison=false;}
    });
  }
  function scan() {
    if(state.tasks.some(t=>t.kind==='scan'&&t.status==='running'))return;
    const ids=reviewProducts().map(p=>p.id);
    runTask('scan','商品风险检查',ids.length,()=>{state.scanned=true;state.checked=[...new Set([...state.checked,...ids])];});
  }
  function download(blob,filename) { const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000); }
  async function exportNow() {
    const products=clone(exportProducts()),config={...state.export};if(!products.length)return;
    runTask('export',`${config.platform} · ${config.format.toUpperCase()}`,products.length,async task=>{
      let blob,filename;
      if(config.format==='zip'){blob=await C.buildImageZip(products,url=>fetch(media(url)));filename=`图映_${config.platform}_图包.zip`;}
      else { const result=C.buildExport(products,config.format,config.platform);blob=new Blob([result.content],{type:result.mime});filename=result.filename; }
      if(task.status==='cancelled')return;
      downloads.set(task.id,{blob,filename});task.exportConfig=config;task.productIds=products.map(p=>p.id);download(blob,filename);
    });
  }
  function importDialog() {
    modal={type:'import',files:[]};
    showModal('导入数据包',`<div class="field"><label class="field-label" for="importName">数据包名称</label><input id="importName" value="新数据包"></div><label class="import-drop" for="importFiles">${icon('upload')}<strong>选择文件</strong><span>JSON / TXT</span><input id="importFiles" type="file" accept=".json,.txt" multiple></label><div id="importStatus" class="import-status"></div>`,btn('取消','close-modal')+btn('导入','confirm-import','primary'));
  }
  function normalizeImported(raw,index) {
    const d=clone(raw),known=seed.find(p=>p.id===String(d.id||d.productId));
    
    const id=String(d.id||d.productId||'import-'+Date.now()+'-'+index);
    if(!/^[A-Za-z0-9_-]+$/.test(id))throw new Error('商品 ID 格式无效');
    const title=String(d.title||d.productName||'未命名商品');
    const skus=Array.isArray(d.skus)?d.skus.map((s,i)=>({id:String(s.id||s.skuId||id+'-'+i),name:String(s.name||known?.skus.find(k=>k.id===String(s.skuId||s.id))?.name||s.id||'默认规格'),price:Number(s.price)/(d.productId?100:1),stock:Number(s.stock??s.quantity??0),image:s.image||known?.skus.find(k=>k.id===String(s.skuId||s.id))?.image||''})):[];
    const p={id,title,shortTitle:String(d.shortTitle||title),platform:String(d.platform||d.sellerType||'1688'),category:String(d.category||d.categoryName||'未分类'),group:String(d.group||'导入商品'),price:Number(d.price)||0,priceMax:Number(d.priceMax)||0,originalSummaryPrice:d.originalSummaryPrice||d.priceLow||String(d.price||0),stock:0,totalImages:0,main:d.main||known?.main||[],skuImages:d.skuImages||known?.skuImages||[],details:d.details||known?.details||[],skus,attributes:Array.isArray(d.attributes)?d.attributes:(known?.attributes||[]),video:/^assets\/[\w.-]+\.mp4$/.test(d.video||'')?d.video:(known?.video||'')};
    if(!p.main.length)p.main=[placeholder];syncDerived(p);return p;
  }
  document.addEventListener('click',async ev=>{
    const nav=ev.target.closest('[data-nav]');if(nav){if(nav.dataset.nav==='review')state.reviewScope=null;route(nav.dataset.nav);return;}
    const grp=ev.target.closest('[data-group]');if(grp){state.group=grp.dataset.group;state.filter='all';route('library');return;}
    const el=ev.target.closest('[data-action]');if(!el)return;
    const {action,id,value,index}=el.dataset;
    const p=id?getProduct(id):null;
    switch(action){
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
      case 'detail':openDetail(id,el.dataset.tab||'info');break;
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
      case 'studio-mode':state.studio.mode=value;state.studio.result=null;state.studio.comparison=false;state.studio.preset=value==='video'?'18 秒':'自然光';render();break;
      case 'studio-ratio':state.studio.ratio=value;render();break;
      case 'candidate':state.studio.selected=Number(index);render();break;
      case 'compare':state.studio.comparison=value==='true';render();break;
      case 'generate':generate();break;
      case 'adopt':{const s=state.studio,product=getProduct(s.id);if(!s.result)return;const before=clone(product);if(s.mode==='video')product.video=getProduct(s.result.productId).video;else{const chosen=s.result.images[s.selected];product.main=[chosen,...product.main.filter(i=>i!==chosen)];}changed(product.id);syncDerived(product);save();toast('结果已采用',()=>{state.products=state.products.map(x=>x.id===before.id?before:x);save();render();});break;}
      case 'studio-history':route('tasks');break;
      case 'go-studio':route('studio');break;
      case 'scan':scan();break;
      case 'risk-filter':state.reviewFilter=value;render();break;
      case 'word-list':modal={type:'words'};showModal('违规词库',`<div class="field"><label class="field-label" for="wordList">标题词</label><textarea id="wordList" rows="7">${e(state.rules.words.join('\n'))}</textarea></div>`,btn('取消','close-modal')+btn('保存词库','save-words','primary'));break;
      case 'save-words':state.rules.words=[...new Set($('#wordList').value.split(/[\n,，]/).map(w=>w.trim()).filter(Boolean))];state.ignored=[];save();dialog.close();render();toast('词库已保存');break;
      case 'ignore-risk':state.ignored.push(id);save();render();toast('已忽略',()=>{state.ignored=state.ignored.filter(x=>x!==id);save();render();});break;
      case 'fix-risk':{const risk=getRisks().find(r=>r.id===id);if(!risk)return;const product=getProduct(risk.productId),before=clone(product);if(risk.type==='price-mismatch')product.originalSummaryPrice=product.price+'-'+product.priceMax;else if(risk.type==='word')product.title=product.title.split(risk.word).join('');save();render();toast('已处理',()=>{state.products=state.products.map(x=>x.id===before.id?before:x);save();render();});break;}
      case 'risk-image':{const r=getRisks().find(x=>x.id===id);if(r)openZoom(r.image||getProduct(r.productId).main[0]);break;}
      case 'platform':state.export.platform=value;render();break;
      case 'export-run':await exportNow();break;
      case 'cancel-task':{clearInterval(timers.get(id));timers.delete(id);const t=state.tasks.find(t=>t.id===id);if(t)t.status='cancelled';save();render();toast('任务已取消');break;}
      case 'clear-tasks':state.tasks=state.tasks.filter(t=>t.status==='running');save();render();toast('记录已清理');break;
      case 'task-download':{const d=downloads.get(id);if(d)download(d.blob,d.filename);else{const t=state.tasks.find(x=>x.id===id);if(t?.exportConfig){state.export=t.exportConfig;state.selected=new Set(t.productIds);state.export.scope='selected';route('export');await exportNow();}}break;}
      case 'task-result':{const t=state.tasks.find(x=>x.id===id),r=state.generated.find(x=>x.id===t?.resultId);if(r){state.studio.id=r.productId;state.studio.mode=r.mode;state.studio.result=r;state.studio.selected=0;route('studio');}break;}
      case 'import':importDialog();break;
      case 'confirm-import':{const files=$('#importFiles').files;if(!files.length){$('#importStatus').textContent='请选择文件';return;}let imported=[],errors=0;for(const file of files){try{const raw=JSON.parse(await file.text());const arr=Array.isArray(raw)?raw:Array.isArray(raw.products)?raw.products:[raw];if(arr.length>500)throw Error('数量过多');for(const [i,d]of arr.entries()){const p=normalizeImported(d,i);if(!C.validateProduct(p).ok)throw Error('格式错误');imported.push(p);}}catch{errors++;}}if(!imported.length){$('#importStatus').textContent='未识别到有效商品';return;}const pack=$('#importName').value.trim()||'导入商品';if(!state.groups.includes(pack))state.groups.push(pack);let added=0;imported.forEach(p=>{if(!getProduct(p.id)){p.group=pack;state.products.push(p);added++;}});save();dialog.close();render();toast(`导入 ${added} 件 · 跳过 ${imported.length-added} 件${errors?' · 失败 '+errors+' 个文件':''}`);break;}
      case 'reset':modal={type:'reset'};showModal('重置演示',`<div class="reset-count">${state.products.length}<span>件商品</span></div>`,btn('取消','close-modal')+btn('恢复初始数据','confirm-reset','primary'));break;
      case 'confirm-reset':timers.forEach(t=>clearInterval(t));timers.clear();try{localStorage.removeItem(STORE);}catch{}location.hash='library';location.reload();break;
    }
  });
  document.addEventListener('input',ev=>{
    const el=ev.target;
    if(el.id==='globalSearch'){state.query=el.value;if(state.page!=='library')state.page='library';render();}
    if(modal?.type==='detail'){
      if(el.id==='editTitle')modal.draft.title=el.value;
      if(el.id==='editShortTitle')modal.draft.shortTitle=el.value;
      if(el.dataset.sku!==undefined)modal.draft.skus[Number(el.dataset.sku)][el.dataset.field]=el.value===''?NaN:Number(el.value);
    }
    if(el.id==='aiPrompt')state.studio.prompt=el.value;
  });
  document.addEventListener('change',ev=>{
    const el=ev.target;
    if(el.id==='selectAll'){activeProducts().forEach(p=>el.checked?state.selected.add(p.id):state.selected.delete(p.id));render();}
    if(el.id==='sort'){state.sort=el.value;render();}
    if(el.id==='studioProduct'){state.studio.id=el.value;state.studio.source=0;state.studio.result=null;state.studio.comparison=false;render();}
    if(el.id==='candidateCount')state.studio.count=Number(el.value);
    if(el.id==='aiPreset')state.studio.preset=el.value;
    if(el.id==='exportScope'){state.export.scope=el.value;render();}
    if(el.id==='exportFormat'){state.export.format=el.value;render();}
    if(el.id==='editGroup'&&modal?.draft)modal.draft.group=el.value;
    if(el.dataset.rule){state.rules[el.dataset.rule]=el.checked;save();render();}
    if(el.id==='importFiles')$('#importStatus').textContent=[...el.files].map(f=>f.name).join(' · ');
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
