/* Package workbench. Keeps drafts and media associations in the existing product schema. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy = value => JSON.parse(JSON.stringify(value));
  const weight = value => [...String(value || '')].reduce((n, c) => n + (c.codePointAt(0) <= 127 ? 1 : 2), 0);
  const icons = {
    close:'<path d="m6 6 12 12M6 18 18 6"/>', prev:'<path d="m15 5-7 7 7 7"/>', next:'<path d="m9 5 7 7-7 7"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>', plus:'<path d="M12 5v14M5 12h14"/>',
    check:'<path d="m5 12 4 4L19 6"/>', search:'<circle cx="10.8" cy="10.8" r="7.3"/><path d="m16 16 4.5 4.5"/>',
    refresh:'<path d="M20 7a8.5 8.5 0 1 0 .8 8M20 3v5h-5"/>', sparkle:'<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7ZM20 2v4M18 4h4"/>',
    download:'<path d="M12 3v13m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>', image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>', undo:'<path d="M4 10h10a6 6 0 0 1 0 12M4 10l5-5M4 10l5 5"/>', zoom:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5M7 10.5h7M10.5 7v7"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.image}</svg>`;
  const button = (label, action, cls = '', attrs = '', glyph = '') => `<button type="button" class="wb-button ${cls}" data-wb-action="${action}" ${attrs}>${glyph ? icon(glyph) : ''}${label}</button>`;
  const ib = (label, action, glyph, attrs = '') => button('', action, 'wb-icon', `aria-label="${esc(label)}" title="${esc(label)}" ${attrs}`, glyph);
  const tabs = [['main','主图'],['skuImages','SKU 图'],['details','详情图'],['qualifications','商品资质'],['video','视频'],['whiteImages','白底图']];
  let current;

  function open(options) {
    if (current) { current.focus(); return current; }
    const products = (options.products || []).map(copy), drafts = new Map(), histories = new Map(), selected = new Set();
    let activeId = products.find(p => p.id === options.initialId)?.id || products[0]?.id;
    let tab = tabs.some(t => t[0] === options.initialTab) ? options.initialTab : 'main', query = '', filter = 'all', page = 1, auto = true, inspection = false, selectedMedia = new Set(), status = '', error = '', saveTimer, hoverTimer, blocked = false;
    const pageSize = 10, dialog = document.createElement('dialog'), preview = document.createElement('div');
    dialog.className = 'wb-dialog'; dialog.setAttribute('aria-label', '数据包详情');
    preview.className = 'wb-hover'; preview.setAttribute('popover', 'manual');
    document.body.append(dialog); dialog.append(preview);
    current = dialog;
    const $ = q => dialog.querySelector(q);
    const src = path => options.src ? options.src(path) : path;
    const videoSrc = path => options.media ? options.media(path) : (window.DEMO_ASSETS?.[path] || path);
    const original = () => products.find(p => p.id === activeId);
    const draft = () => { if (!drafts.has(activeId) && original()) drafts.set(activeId, copy(original())); return drafts.get(activeId); };
    const dirty = p => p && JSON.stringify(p) !== JSON.stringify(products.find(x => x.id === p.id));
    const lowLimit = p => p.skus.length ? p.skus.reduce((n,s)=>n+Number(s.price),0) / p.skus.length / 2 : 0;
    const list = () => products.filter(p => (!query || `${p.title} ${p.shortTitle} ${p.id}`.toLowerCase().includes(query.toLowerCase())) && (filter !== 'selected' || selected.has(p.id)) && (filter !== 'low' || p.skus.some(s => s.price < lowLimit(p))) && (filter !== 'empty' || p.skus.some(s => s.stock === 0)));
    const visible = () => list().slice((page - 1) * pageSize, page * pageSize);
    const media = () => tab === 'video' ? (draft()?.video ? [draft().video] : []) : (draft()?.[tab] || []);
    const price = p => `¥${Number(p.price || 0).toFixed(2)}${p.priceMax > p.price ? ' – ' + Number(p.priceMax).toFixed(2) : ''}`;
    const sync = p => { p.stock = p.skus.reduce((sum, s) => sum + Number(s.stock), 0); if (p.skus.length) { p.price = Math.min(...p.skus.map(s => Number(s.price))); p.priceMax = Math.max(...p.skus.map(s => Number(s.price))); } p.totalImages = tabs.filter(t => t[0] !== 'video').reduce((n, t) => n + (p[t[0]]?.length || 0), 0); };
    function validate(p) {
      if (!p.title?.trim()) return '请输入商品标题';
      if (weight(p.title) > 60) return `标题超出 ${weight(p.title) - 60} 字`;
      if (!p.main?.length) return '至少保留 1 张主图';
      for (const s of p.skus) {
        if (String(s.price).trim() === '' || !Number.isFinite(Number(s.price)) || Number(s.price) < 0 || Number(s.price) > 100000000) return '请检查 SKU 价格';
        if (String(s.stock).trim() === '' || !Number.isInteger(Number(s.stock)) || Number(s.stock) < 0 || Number(s.stock) > 100000000) return '请检查 SKU 库存';
      }
      return '';
    }
    function setStatus(message = '', issue = '') {
      status = message; error = issue;
      const el = $('[data-wb-status]'); if (el) { el.textContent = issue || message; el.classList.toggle('wb-error', !!issue); }
    }
    async function commit(p = draft(), force = false) {
      clearTimeout(saveTimer);
      if (!p || (!dirty(p) && !force)) return true;
      const issue = validate(p);
      if (issue) { setStatus('', issue); return false; }
      const saved = copy(p); saved.skus.forEach(s => { s.price = Number(s.price); s.stock = Number(s.stock); }); sync(saved);
      try {
        const accepted = await options.onSave?.(copy(saved));
        if (accepted === false) { setStatus('', '保存失败，请检查商品数据'); return false; }
        const index = products.findIndex(x => x.id === saved.id); if (index >= 0) products[index] = saved;
        drafts.set(saved.id, copy(saved));
        if (p.id === activeId) setStatus('已保存');
        renderList(); return true;
      } catch (err) { setStatus('', err.message || '保存失败'); return false; }
    }
    function remember() {
      const p = draft(); if (!p) return;
      const history = histories.get(activeId) || []; history.push(copy(p)); if (history.length > 30) history.shift(); histories.set(activeId, history);
    }
    function changed(render = false) {
      setStatus('未保存'); clearTimeout(saveTimer);
      if (auto) saveTimer = setTimeout(() => commit(), 650);
      if (render) renderEditor();
    }
    async function guard() {
      clearTimeout(saveTimer);
      if (!dirty(draft())) return true;
      return auto ? commit() : true;
    }
    async function activate(id) {
      if (id === activeId || !await guard()) return;
      activeId = id; selectedMedia.clear(); setStatus(dirty(draft()) ? '未保存' : ''); renderList(); renderEditor();
      $('[data-wb-product].wb-active')?.scrollIntoView({block:'nearest'});
    }
    function renderList() {
      const container = $('[data-wb-list]'); if (!container) return;
      const count = list().length; page = Math.min(page, Math.max(1, Math.ceil(count / pageSize)));
      container.innerHTML = visible().map(p => `<article class="wb-product ${p.id === activeId ? 'wb-active' : ''}" data-wb-product="${esc(p.id)}"><label class="wb-product-check"><input type="checkbox" aria-label="选择 ${esc(p.shortTitle || p.title)}" data-wb-select="${esc(p.id)}" ${selected.has(p.id) ? 'checked' : ''}></label><button type="button" class="wb-product-open" data-wb-action="product" data-id="${esc(p.id)}"><img src="${esc(src(p.main?.[0]))}" alt="${esc(p.shortTitle || p.title)}"><span class="wb-product-copy"><strong>${esc(p.title)}</strong><span class="wb-id">${esc(p.id)}</span><span class="wb-product-meta"><span class="wb-platform">${esc(p.platform)}</span><span>${price(p)}</span></span></span></button></article>`).join('') || '<div class="wb-empty">无匹配商品</div>';
      $('[data-wb-pagination]').innerHTML = `<span>共 ${count} 件</span>${ib('上一页','page-prev','prev', page <= 1 ? 'disabled' : '')}<span>${page}</span>${ib('下一页','page-next','next', page * pageSize >= count ? 'disabled' : '')}`;
      const batch = $('[data-wb-action="delete-selected"]'); if (batch) { batch.disabled = !selected.size; batch.innerHTML = `${icon('trash')}批量删除${selected.size ? ` (${selected.size})` : ''}`; }
      const countEl = $('[data-wb-count]'); if (countEl) countEl.textContent = `${products.length} 件商品`;
    }
    function renderEditor() {
      hideHover();
      const p = draft(), area = $('[data-wb-editor]');
      area.classList.toggle('wb-inspection', inspection);
      if (!p) { area.innerHTML = '<div class="wb-empty wb-empty-full">暂无商品</div>'; return; }
      const titleWeight = weight(p.title), a = media();
      area.innerHTML = `<section class="wb-fields"><div class="wb-category"><label for="wbCategory">原始类目</label><input id="wbCategory" value="${esc(p.category)}" data-wb-field="category" autocomplete="off">${button('清空','clear-category','wb-text')}</div><div class="wb-title-field"><label for="wbTitle">商品标题</label><input id="wbTitle" value="${esc(p.title)}" data-wb-field="title" aria-describedby="wbTitleCount" class="${titleWeight > 60 ? 'wb-invalid' : ''}" autocomplete="off"><span id="wbTitleCount" class="wb-title-count ${titleWeight > 60 ? 'wb-error' : ''}">${titleWeight}<span> / 60</span></span></div><div class="wb-product-line"><span>商品 ID <b>${esc(p.id)}</b></span><span>${esc(p.platform)}</span><span>${price(p)}</span><span>${p.skus.length} 个 SKU</span></div></section><section class="wb-media-section"><div class="wb-tabs" role="tablist" aria-label="媒体类型">${tabs.map(([key,label]) => `<button type="button" role="tab" aria-selected="${tab === key}" class="wb-tab ${tab === key ? 'wb-active' : ''}" data-wb-action="tab" data-value="${key}">${label}<span>${key === 'video' ? (p.video ? 1 : 0) : (p[key]?.length || 0)}</span></button>`).join('')}</div><div class="wb-media-toolbar"><label class="wb-check"><input type="checkbox" data-wb-all-media ${a.length && selectedMedia.size === a.length ? 'checked' : ''} ${!a.length ? 'disabled' : ''}>全选</label>${button('删除所选','delete-media-selected','wb-small',!selectedMedia.size ? 'disabled' : '', 'trash')}<span class="wb-spacer"></span>${tab === 'video' ? button('生成视频','ai-video','wb-small','','sparkle') : tab === 'whiteImages' ? button('生成白底图','ai-white','wb-small','','sparkle') : button('AI 创作','ai','wb-small','','sparkle')}<label class="wb-button wb-small wb-upload">${icon('plus')}上传<input type="file" ${tab === 'video' ? 'accept="video/mp4,video/webm"' : 'accept="image/jpeg,image/png,image/webp,image/gif" multiple'} data-wb-upload></label></div><div class="wb-media-grid ${tab === 'video' ? 'wb-video-grid' : ''}">${a.map((path,i) => `<article class="wb-media-card"><div class="wb-card-head"><span>${String(i+1).padStart(2,'0')}</span><input type="checkbox" aria-label="选择图片 ${i+1}" data-wb-media="${i}" ${selectedMedia.has(i) ? 'checked' : ''}></div>${tab === 'video' ? `<video controls playsinline preload="metadata" src="${esc(videoSrc(path))}" poster="${esc(src(p.main[0]))}"></video>` : `<button type="button" class="wb-image" data-wb-action="zoom" data-index="${i}" aria-label="放大图片 ${i+1}"><img src="${esc(src(path))}" alt="${esc(p.shortTitle)} · ${tabs.find(t=>t[0]===tab)[1]} ${i+1}" data-wb-preview="${i}"></button>`}<div class="wb-image-actions">${inspection && tab !== 'video' ? button(p.reviewedImages?.includes(path) ? '已鉴图' : '标记已鉴图','review-image','wb-small wb-reviewed',`data-index="${i}"`,p.reviewedImages?.includes(path)?'check':'') : ''}${tab !== 'video' ? `${ib('前移图片 '+(i+1),'media-prev','prev',`data-index="${i}" ${i===0 ? 'disabled' : ''}`)}${ib('后移图片 '+(i+1),'media-next','next',`data-index="${i}" ${i===a.length-1 ? 'disabled' : ''}`)}` : ''}<span class="wb-spacer"></span>${ib('删除图片 '+(i+1),'delete-media','trash',`data-index="${i}" ${tab==='main' && a.length===1 ? 'disabled' : ''}`)}</div></article>`).join('')}${!a.length ? `<div class="wb-empty wb-empty-media">${icon(tab==='video' ? 'folder' : 'image')}<span>暂无${tabs.find(t=>t[0]===tab)[1]}</span></div>` : ''}</div></section><section class="wb-skus"><div class="wb-section-head"><h2>SKU 规格 <span>${p.skus.length}</span></h2><span class="wb-spacer"></span>${button('批量改价','batch-price','wb-small')}${button('添加 SKU','add-sku','wb-small','','plus')}</div><div class="wb-sku-wrap"><table class="wb-sku-table"><thead><tr><th>规格</th><th>SKU ID</th><th>价格 / ¥</th><th>库存</th><th></th></tr></thead><tbody>${p.skus.map((s,i) => `<tr><td><div class="wb-sku-name">${s.image ? `<img src="${esc(src(s.image))}" alt="${esc(s.name)}">` : ''}<input aria-label="SKU ${i+1} 规格" value="${esc(s.name)}" data-wb-sku="${i}" data-field="name"></div></td><td class="wb-sku-id">${esc(s.id)}</td><td><input type="number" min="0" max="100000000" step="0.01" aria-label="SKU ${i+1} 价格" value="${esc(s.price)}" data-wb-sku="${i}" data-field="price"></td><td><input type="number" min="0" max="100000000" step="1" aria-label="SKU ${i+1} 库存" value="${esc(s.stock)}" data-wb-sku="${i}" data-field="stock"></td><td>${ib('删除 SKU '+(i+1),'delete-sku','trash',`data-index="${i}" ${p.skus.length===1 ? 'disabled' : ''}`)}</td></tr>`).join('')}</tbody></table></div></section>`;
    }
    function render() {
      dialog.innerHTML = `<header class="wb-header"><div class="wb-heading">${icon('folder')}<h1 title="${esc(options.packageName || '')}">数据包详情</h1><span data-wb-count>${products.length} 件商品</span></div><div class="wb-header-right"><span class="wb-status ${error ? 'wb-error' : ''}" data-wb-status role="status">${esc(error || status)}</span><label class="wb-check wb-autosave"><input type="checkbox" data-wb-auto ${auto ? 'checked' : ''}>自动保存</label>${ib('关闭数据包详情','close','close')}</div></header><div class="wb-toolbar">${button('人工鉴图','review','wb-primary')}${button('低价检测','low-price')}${button('批量删除','delete-selected','wb-danger',!selected.size ? 'disabled' : '', 'trash')}${button('删除本页','delete-page','wb-danger')}${button('黑名单','blacklist')}${button('添加 SKU','add-sku')}${button('导出数据包','export','','','download')}<span class="wb-spacer"></span>${button('删除商品','delete-product','wb-danger')}${button('撤销','undo','','','undo')}${button('保存 (F)','save','wb-primary','','check')}</div><div class="wb-layout"><aside class="wb-sidebar"><div class="wb-sidebar-head"><h2>商品列表</h2>${ib('追加数据包','append','plus')}${ib('刷新列表','refresh','refresh')}</div><div class="wb-search">${icon('search')}<input aria-label="搜索商品" placeholder="搜索商品" data-wb-query value="${esc(query)}"></div><select class="wb-filter" aria-label="筛选商品" data-wb-filter><option value="all" ${filter==='all'?'selected':''}>全部商品</option><option value="selected" ${filter==='selected'?'selected':''}>已选择</option><option value="low" ${filter==='low'?'selected':''}>低于 SKU 均价 50%</option><option value="empty" ${filter==='empty'?'selected':''}>含零库存 SKU</option></select><div class="wb-product-list" data-wb-list></div><footer class="wb-pagination" data-wb-pagination></footer><div class="wb-navigation">${button('上一件 (W)','product-prev','wb-small','','prev')}${button('下一件 (S)','product-next','wb-small','','next')}</div></aside><main class="wb-editor" data-wb-editor></main></div><footer class="wb-bottom"><span>图映</span><span class="wb-spacer"></span>${button('删除数据包 (D)','delete-package','wb-text wb-danger')}</footer>`;
      dialog.append(preview); renderList(); renderEditor();
    }
    function hideHover() { clearTimeout(hoverTimer); if (preview.matches(':popover-open')) preview.hidePopover(); }
    function hoverImage(img) {
      if (window.innerWidth < 760) return;
      hideHover(); hoverTimer = setTimeout(() => {
        if (!img.isConnected || !dialog.open) return;
        const rect = img.getBoundingClientRect(), width = Math.min(350, innerWidth - 32), height = Math.min(430, innerHeight - 40);
        preview.innerHTML = `<img src="${esc(img.src)}" alt="${esc(img.alt)}">`;
        let left = rect.right + 14; if (left + width > innerWidth - 12) left = rect.left - width - 14;
        preview.style.left = `${Math.max(12,left)}px`; preview.style.top = `${Math.max(12,Math.min(innerHeight-height-12,rect.top-60))}px`; preview.style.width = `${width}px`; preview.style.height = `${height}px`;
        preview.showPopover();
      }, 180);
    }
    function panel(title, body, footer = '', setup) {
      hideHover(); const el = document.createElement('dialog'); el.className = 'wb-panel'; el.setAttribute('aria-label', title);
      el.innerHTML = `<div class="wb-panel-header"><h2>${esc(title)}</h2><button type="button" class="wb-button wb-icon" data-wb-panel-close aria-label="关闭">${icon('close')}</button></div><div class="wb-panel-body">${body}</div>${footer ? `<div class="wb-panel-footer">${footer}</div>` : ''}`;
      dialog.append(el); el.addEventListener('close', () => el.remove()); el.querySelector('[data-wb-panel-close]').addEventListener('click', () => el.close()); el.showModal(); setup?.(el); return el;
    }
    function confirm(title, detail, accept, danger = true) {
      panel(title, `<div class="wb-confirm">${detail}</div>`, `<button type="button" class="wb-button" data-wb-cancel>取消</button><button type="button" class="wb-button ${danger ? 'wb-danger-solid' : 'wb-primary'}" data-wb-confirm>确认</button>`, el => {
        el.querySelector('[data-wb-cancel]').onclick = () => el.close();
        el.querySelector('[data-wb-confirm]').onclick = async () => { const b = el.querySelector('[data-wb-confirm]'); b.disabled = true; try { await accept(); el.close(); } catch (err) { b.disabled = false; setStatus('',err.message || '操作失败'); } };
      });
    }
    async function removeProducts(ids) {
      clearTimeout(saveTimer);
      for (const id of ids) { await options.onDelete?.(id); const index = products.findIndex(p=>p.id===id); if (index>=0) products.splice(index,1); selected.delete(id); drafts.delete(id); histories.delete(id); }
      if (!products.some(p=>p.id===activeId)) activeId = products[0]?.id;
      selectedMedia.clear(); setStatus(`已删除 ${ids.length} 件商品`); renderList(); renderEditor();
    }
    async function finish(callback) {
      clearTimeout(saveTimer);
      for (const p of drafts.values()) if (dirty(p) && !await commit(p)) { activeId=p.id; renderList(); renderEditor(); return false; }
      hideHover(); document.removeEventListener('keydown', keydown); dialog.close(); dialog.remove(); current = null; options.onClose?.(); callback?.(); return true;
    }
    function removeMedia(indices) {
      const p=draft(), a=media();
      if (tab==='main' && a.length - indices.size < 1) { setStatus('','至少保留 1 张主图'); return; }
      remember();
      if (tab === 'skuImages') { const removed = new Set([...indices].map(i=>a[i])); p.skus.forEach(s=>{if(removed.has(s.image))s.image='';}); }
      if (p.reviewedImages) p.reviewedImages = p.reviewedImages.filter(path=>![...indices].some(i=>a[i]===path));
      if (tab==='video') p.video=''; else p[tab] = a.filter((_,i)=>!indices.has(i));
      selectedMedia.clear(); changed(true);
    }
    function skuDialog() {
      if (!draft()) return;
      panel('添加 SKU', '<form class="wb-panel-form" id="wbSkuForm"><label>规格<input name="name" required autocomplete="off"></label><div class="wb-form-row"><label>价格 / ¥<input name="price" type="number" min="0" max="100000000" step="0.01" value="19.90" required></label><label>库存<input name="stock" type="number" min="0" max="100000000" step="1" value="100" required></label></div></form>', '<button class="wb-button wb-primary" type="submit" form="wbSkuForm">添加</button>', el => el.querySelector('form').onsubmit = ev => {
        ev.preventDefault(); const form = new FormData(ev.target); if (!form.get('name').trim()) return;
        remember(); draft().skus.push({id:'SKU'+Date.now(),name:form.get('name').trim(),price:Number(form.get('price')),stock:Number(form.get('stock')),image:draft().skuImages[0] || draft().main[0]}); sync(draft()); changed(true); el.close();
      });
    }
    function lowPrice() {
      panel('低价检测', `<div class="wb-threshold"><select aria-label="低价规则" data-wb-low-mode><option value="relative">低于商品 SKU 均价的 50%</option><option value="fixed">固定阈值</option></select><input type="number" aria-label="价格阈值" min="0" step="0.01" value="20" data-wb-threshold hidden><span data-wb-threshold-unit hidden>元</span></div><div data-wb-low-results></div>`, '', el => {
        const update = () => { const fixed=el.querySelector('[data-wb-low-mode]').value==='fixed', input=el.querySelector('[data-wb-threshold]'); input.hidden=!fixed; el.querySelector('[data-wb-threshold-unit]').hidden=!fixed; const limit=Number(input.value); const hits=products.flatMap(p=>p.skus.filter(s=>s.price<(fixed?limit:lowLimit(p))).map(s=>({p,s}))); el.querySelector('[data-wb-low-results]').innerHTML = hits.length ? hits.map(({p,s})=>`<button type="button" class="wb-low-row" data-id="${esc(p.id)}"><span><strong>${esc(p.shortTitle)}</strong><small>${esc(s.name)}</small></span><b>¥${Number(s.price).toFixed(2)}</b>${icon('next')}</button>`).join('') : '<div class="wb-empty">无低价 SKU</div>'; el.querySelectorAll('.wb-low-row').forEach(b=>b.onclick=()=>{el.close();activate(b.dataset.id);}); };
        el.querySelector('[data-wb-threshold]').oninput=update; el.querySelector('[data-wb-low-mode]').onchange=update; update();
      });
    }
    function blacklist() {
      let words=[]; const key='tuying-workbench-blacklist:'+location.pathname; try { words=JSON.parse(localStorage.getItem(key)||'[]'); } catch {}
      panel('黑名单管理','<form class="wb-blacklist-form"><input name="word" placeholder="添加关键词" aria-label="黑名单关键词" required><button type="submit" class="wb-button wb-primary">添加</button></form><div class="wb-blacklist-words"></div><div class="wb-blacklist-matches"></div>','',el=>{
        const draw=()=>{el.querySelector('.wb-blacklist-words').innerHTML=words.map((w,i)=>`<button type="button" class="wb-word" data-index="${i}">${esc(w)} ${icon('close')}</button>`).join(''); const matches=products.filter(p=>words.some(w=>p.title.includes(w))); el.querySelector('.wb-blacklist-matches').innerHTML=matches.length ? `<div class="wb-section-head"><h2>匹配商品 <span>${matches.length}</span></h2></div>`+matches.map(p=>`<button class="wb-low-row" type="button" data-id="${esc(p.id)}"><span>${esc(p.shortTitle)}</span>${icon('next')}</button>`).join('') : '<div class="wb-empty">无匹配商品</div>'; el.querySelectorAll('.wb-word').forEach(b=>b.onclick=()=>{words.splice(Number(b.dataset.index),1);persist();}); el.querySelectorAll('.wb-low-row').forEach(b=>b.onclick=()=>{el.close();activate(b.dataset.id);});};
        const persist=()=>{try{localStorage.setItem(key,JSON.stringify(words));}catch{} draw();};
        el.querySelector('form').onsubmit=ev=>{ev.preventDefault();const input=el.querySelector('[name="word"]'),word=input.value.trim();if(word&&!words.includes(word))words.push(word);input.value='';persist();}; draw();
      });
    }
    async function action(buttonEl) {
      const {wbAction: act,id,index,value}=buttonEl.dataset; const p=draft();
      switch(act) {
        case 'close': await finish(); break;
        case 'product': await activate(id); break;
        case 'product-prev': case 'product-next': {const a=list(),i=a.findIndex(x=>x.id===activeId), next=a[i+(act==='product-prev'?-1:1)]; if(next) await activate(next.id); break;}
        case 'page-prev': page=Math.max(1,page-1);renderList();break;
        case 'page-next': page++;renderList();break;
        case 'refresh': renderList();setStatus('已刷新');break;
        case 'save': await commit(p,true);break;
        case 'undo': {const h=histories.get(activeId);if(h?.length){clearTimeout(saveTimer);drafts.set(activeId,h.pop());changed(true);}break;}
        case 'tab': tab=value;selectedMedia.clear();renderEditor();break;
        case 'clear-category': if(p){remember();p.category='';changed(true);}break;
        case 'media-prev': case 'media-next': {const a=media(),i=Number(index),to=i+(act==='media-prev'?-1:1); if(to>=0&&to<a.length){remember();[a[i],a[to]]=[a[to],a[i]];selectedMedia.clear();changed(true);}break;}
        case 'delete-media': removeMedia(new Set([Number(index)]));break;
        case 'delete-media-selected': removeMedia(selectedMedia);break;
        case 'zoom': {const path=media()[Number(index)];panel('图片预览',`<img class="wb-zoom-image" src="${esc(src(path))}" alt="${esc(p.shortTitle)}">`,'',el=>el.classList.add('wb-zoom-panel'));break;}
        case 'delete-product': if(p)confirm('删除当前商品',esc(p.shortTitle||p.title),()=>removeProducts([p.id]));break;
        case 'delete-selected': if(selected.size)confirm('批量删除',`已选择 ${selected.size} 件商品`,()=>removeProducts([...selected]));break;
        case 'delete-page': {const ids=visible().map(x=>x.id);if(ids.length)confirm('删除本页商品',`共 ${ids.length} 件商品`,()=>removeProducts(ids));break;}
        case 'delete-package': confirm('删除当前数据包',`共 ${products.length} 件商品`,async()=>{clearTimeout(saveTimer);await options.onDeletePackage?.();drafts.clear();hideHover();document.removeEventListener('keydown',keydown);dialog.close();dialog.remove();current=null;options.onClose?.();});break;
        case 'add-sku': skuDialog();break;
        case 'delete-sku': if(p?.skus.length>1){remember();p.skus.splice(Number(index),1);sync(p);changed(true);}break;
        case 'batch-price': if(p)panel('批量改价',`<form class="wb-panel-form" id="wbPriceForm"><label>统一价格 / ¥<input name="price" type="number" min="0" max="100000000" step="0.01" value="${Number(p.price).toFixed(2)}" required></label></form>`,'<button class="wb-button wb-primary" type="submit" form="wbPriceForm">应用</button>',el=>el.querySelector('form').onsubmit=ev=>{ev.preventDefault();remember();const v=Number(new FormData(ev.target).get('price'));draft().skus.forEach(s=>s.price=v);sync(draft());changed(true);el.close();});break;
        case 'low-price': lowPrice();break;
        case 'blacklist': blacklist();break;
        case 'ai': case 'ai-white': case 'ai-video': if(p)await finish(()=>options.onOpenAI?.(p.id,act==='ai-white'?'white':act==='ai-video'?'video':'scene'));break;
        case 'review': inspection=!inspection;buttonEl.textContent=inspection?'结束鉴图':'人工鉴图';renderEditor();break;
        case 'review-image': {const path=media()[Number(index)];remember();p.reviewedImages=p.reviewedImages||[];if(p.reviewedImages.includes(path))p.reviewedImages=p.reviewedImages.filter(x=>x!==path);else p.reviewedImages.push(path);changed(true);break;}
        case 'export': await finish(()=>options.onExport?.(selected.size?[...selected]:products.map(x=>x.id)));break;
        case 'append': await finish(()=>options.onAppend?.());break;
      }
    }
    dialog.addEventListener('click', ev => { const b=ev.target.closest('[data-wb-action]'); if(b&&!b.disabled&&!blocked){blocked=true; Promise.resolve(action(b)).catch(err=>setStatus('',err.message||'操作失败')).finally(()=>blocked=false);} });
    dialog.addEventListener('focusin', ev=>{if(ev.target.matches('[data-wb-field],[data-wb-sku]'))remember();});
    dialog.addEventListener('input', ev=>{
      const el=ev.target;
      if(el.matches('[data-wb-query]')){query=el.value;page=1;renderList();return;}
      if(el.dataset.wbField){draft()[el.dataset.wbField]=el.value;if(el.dataset.wbField==='title'){const n=weight(el.value);$('#wbTitleCount').innerHTML=`${n}<span> / 60</span>`;$('#wbTitleCount').classList.toggle('wb-error',n>60);el.classList.toggle('wb-invalid',n>60);}changed();}
      if(el.hasAttribute('data-wb-sku')){draft().skus[Number(el.dataset.wbSku)][el.dataset.field]=el.dataset.field==='name'?el.value:(el.value===''?'':Number(el.value));changed();}
    });
    dialog.addEventListener('change', async ev=>{
      const el=ev.target;
      if(el.matches('[data-wb-filter]')){filter=el.value;page=1;renderList();}
      if(el.matches('[data-wb-auto]')){auto=el.checked;if(auto)await commit();else clearTimeout(saveTimer);}
      if(el.dataset.wbSelect){el.checked?selected.add(el.dataset.wbSelect):selected.delete(el.dataset.wbSelect);renderList();}
      if(el.hasAttribute('data-wb-media')){const i=Number(el.dataset.wbMedia);el.checked?selectedMedia.add(i):selectedMedia.delete(i);renderEditor();}
      if(el.matches('[data-wb-all-media]')){selectedMedia=el.checked?new Set(media().map((_,i)=>i)):new Set();renderEditor();}
      if(el.matches('[data-wb-upload]')){
        const files=[...el.files]; if(!files.length)return;
        const p=draft(), group=tab; const limit=group==='video'?20*1024*1024:5*1024*1024;
        if(files.some(f=>f.size>limit)){setStatus('',group==='video'?'视频不能超过 20 MB':'图片不能超过 5 MB');return;}
        const allowed=group==='video'?/^video\/(mp4|webm)$/:/^image\/(jpeg|png|webp|gif)$/;
        if(files.some(f=>!allowed.test(f.type))){setStatus('','文件格式不支持');return;}
        try {const values=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);})));if(p!==draft()||group!==tab)return;remember();if(group==='video')p.video=values[0];else p[group]=[...(p[group]||[]),...values];changed(true);}catch{setStatus('','读取文件失败');}
      }
    });
    dialog.addEventListener('pointerover',ev=>{const img=ev.target.closest('[data-wb-preview]');if(img)hoverImage(img);});
    dialog.addEventListener('pointerout',ev=>{if(ev.target.matches('[data-wb-preview]'))hideHover();});
    dialog.addEventListener('cancel',ev=>{if(ev.target===dialog){ev.preventDefault();finish();}});
    function keydown(ev) {
      if(!dialog.open||dialog.querySelector('dialog[open]')||ev.isComposing||ev.ctrlKey||ev.metaKey||ev.altKey||ev.repeat||ev.target.closest('input,textarea,select,[contenteditable="true"]'))return;
      const act={w:'product-prev',s:'product-next',f:'save',d:'delete-package'}[ev.key.toLowerCase()];if(act){ev.preventDefault();dialog.querySelector(`[data-wb-action="${act}"]`)?.click();}
    }
    document.addEventListener('keydown',keydown); render(); dialog.showModal(); if (options.initialTab === 'sku') $('.wb-skus')?.scrollIntoView({block:'start'}); return dialog;
  }
  window.PackageWorkbench = {open, titleWeight:weight};
})();
