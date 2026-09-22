(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titles = { title:'商品标题', stock:'库存', price:'SKU 价格', sku:'新增 SKU', main:'主图', details:'详情图', skuImages:'SKU 图片' };
  const weight = value => [...String(value)].reduce((n,c) => n + (c.charCodeAt(0) <= 127 ? 1 : 2), 0);
  const truncate = value => { let n=0;return [...value].filter(c => {n += c.charCodeAt(0)<=127?1:2;return n<=60;}).join(''); };
  const issue = (field, message) => { const error = new Error(message);error.field=field;throw error; };
  function number(value, field, integer=false) {
    const text=String(value ?? '').trim();
    if(!/^\d+(\.\d+)?$/.test(text)||!Number.isFinite(Number(text))||Number(text)>100000000||(integer&&!Number.isSafeInteger(Number(text)))) issue(field,integer?'请输入 0–100000000 的整数':'请输入 0–100000000 的有效数字');
    return Number(text);
  }
  function decimal(value, field, places=6) {
    number(value,field);
    const [whole,fraction='']=String(value).trim().split('.');
    if(fraction.length>places)issue(field,`最多保留 ${places} 位小数`);
    return [BigInt(whole+fraction),10n**BigInt(fraction.length)];
  }
  function cents(value, field) {const [n,d]=decimal(value,field);return (n*100n+d/2n)/d;}
  function derived(p, prices=false) {
    if(p.skus.length){p.price=Math.min(...p.skus.map(s=>s.price));p.priceMax=Math.max(...p.skus.map(s=>s.price));}
    p.stock=p.skus.reduce((sum,s)=>sum+s.stock,0);
    p.totalImages=['main','skuImages','details','whiteImages','qualifications'].reduce((n,key)=>n+(p[key]?.length||0),0);
    if(prices)p.originalSummaryPrice=p.price+'-'+p.priceMax;
  }
  function transform(products, config) {
    const result={ok:false,products:clone(products),productIds:[],changes:[],errors:[],summary:{matched:0,changed:0,unchanged:0,blacklisted:0,skuCount:0}};
    const c={...config}, filters=c.filters||{}, fieldLabels={keyword:'标题关键词',minPrice:'最低价格',maxPrice:'最高价格',skuKeyword:'SKU 关键词'};
    let min, max, value, factor, add, subtract, floor, positions, target, mainIndex, sourceIndex;
    try {
      if(!titles[c.operation])issue('operation','请选择修改项目');
      if(!Array.isArray(c.packageIds)||!c.packageIds.length)issue('packages','请选择数据包');
      min=String(filters.minPrice??'').trim()===''?null:cents(filters.minPrice,'minPrice');
      max=String(filters.maxPrice??'').trim()===''?null:cents(filters.maxPrice,'maxPrice');
      if(min!==null&&max!==null&&min>max)issue('maxPrice','最高价格不能低于最低价格');
      if(c.operation==='title') {
        if(!['fixed','prefix','suffix','replace','delete'].includes(c.action))issue('action','请选择标题操作');
        if(c.action==='replace'||c.action==='delete'){if(!String(c.search||'').trim())issue('search','请输入关键词');}
        else if(!String(c.text||'').trim())issue('text','请输入标题内容');
        if(c.action==='replace'&&!String(c.text||'').trim())issue('text','请输入替换内容，删词请选择删除关键词');
      }
      if(['stock','price'].includes(c.operation)&&c.skuScope&&!['all','stocked','zero','lowest','highest'].includes(c.skuScope))issue('skuScope','请选择 SKU 范围');
      if(c.operation==='stock') {if(!['fixed','add','subtract'].includes(c.action))issue('action','请选择库存操作');value=number(c.value,'value',true);}
      if(c.operation==='price') {
        if(c.action==='fixed')value=cents(c.value,'value');
        else if(c.action==='formula'){factor=decimal(c.factor,'factor');add=cents(c.add,'add');subtract=cents(c.subtract,'subtract');floor=cents(c.floor,'floor');}
        else issue('action','请选择价格操作');
      }
      if(c.operation==='sku') {if(!String(c.name||'').trim())issue('name','请输入规格名称');value=cents(c.value,'value');target=number(c.stock,'stock',true);}
      if(c.operation==='main'||c.operation==='details') {
        if(!['delete','first','keep','fill','insert','replace','swap'].includes(c.action))issue('action','请选择图片操作');
        if(['insert','replace'].includes(c.action)){if(!['main','skuImages','details'].includes(c.source))issue('source','请选择图片来源');sourceIndex=number(c.sourceIndex,'sourceIndex',true);if(sourceIndex<1)issue('sourceIndex','图片位置从 1 开始');}
        if(c.action==='fill'){target=number(c.count,'count',true);if(target<1||target>30)issue('count','图片数量为 1–30');if(!['main','skuImages','details'].includes(c.source))issue('source','请选择补足来源');}
        else {const raw=String(c.positions||'').trim().split(/[,，\s]+/);positions=[...new Set(raw.map(v=>number(v,'positions',true)))];if(positions.some(n=>n<(c.action==='insert'?0:1)))issue('positions','图片位置从 1 开始');if(c.action==='swap'&&positions.length!==2)issue('positions','交换需要 2 个图片位置');if(c.action==='insert'&&positions.length!==1)issue('positions','插入请选择 1 个位置');}
      }
      if(c.operation==='skuImages') {if(!['set','empty','delete'].includes(c.action))issue('action','请选择 SKU 图片操作');if(c.action!=='delete'){mainIndex=number(c.mainIndex,'mainIndex',true);if(mainIndex<1)issue('mainIndex','主图位置从 1 开始');}}
    } catch(error) {result.errors.push({field:error.field,message:error.message});return result;}
    const packages=new Set(c.packageIds.map(String)), blacklist=new Set((c.blacklist||[]).map(String));
    for(let pi=0;pi<products.length;pi++) {
      const before=products[pi];
      if(!packages.has(String(before.packageId||'pack-default')))continue;
      if(blacklist.has(`${before.platform||'1688'}:${before.sourceId||before.id}`)||blacklist.has(String(before.id))){result.summary.blacklisted++;continue;}
      const keyword=String(filters.keyword||'').trim().toLowerCase(), skuKeyword=String(filters.skuKeyword||'').trim().toLowerCase();
      if(keyword&&!String(before.title).toLowerCase().includes(keyword))continue;
      const skuMatch=s=>(!skuKeyword||String(s.name||'').toLowerCase().includes(skuKeyword))&&(min===null||cents(s.price,'minPrice')>=min)&&(max===null||cents(s.price,'maxPrice')<=max);
      let matching;
      try {matching=(before.skus||[]).map((s,i)=>skuMatch(s)?i:-1).filter(i=>i>=0);} catch(error) {result.errors.push({id:before.id,field:error.field,message:error.message});continue;}
      if((skuKeyword||min!==null||max!==null)&&!matching.length)continue;
      result.summary.matched++;
      if(['price','stock'].includes(c.operation)&&c.skuScope&&c.skuScope!=='all'){const prices=(before.skus||[]).map(s=>Number(s.price));matching=matching.filter(i=>c.skuScope==='stocked'?before.skus[i].stock>0:c.skuScope==='zero'?before.skus[i].stock===0:c.skuScope==='lowest'?Number(before.skus[i].price)===Math.min(...prices):c.skuScope==='highest'?Number(before.skus[i].price)===Math.max(...prices):false);}
      const next=clone(before), details=[];let changedSkus=0;
      try {
        if(c.operation==='title') {
          const original=String(before.title||'');
          let title=c.action==='fixed'?c.text:c.action==='prefix'?c.text+original:c.action==='suffix'?original+c.text:original.split(c.search).join(c.action==='delete'?'':c.text);
          if(weight(title)>60){if(c.overflow==='truncate')title=truncate(title);else issue('overflow',`标题长度 ${weight(title)} / 60`);}
          if(!title.trim())issue('text','修改后标题不能为空');
          if(title!==original){next.title=title;details.push({label:'标题',before:original,after:title,meta:weight(title)+' / 60'});}
        }
        if(c.operation==='stock'||c.operation==='price') {
          for(const i of matching){const original=before.skus[i], sku=next.skus[i];
            if(c.operation==='stock'){const stock=c.action==='fixed'?value:c.action==='add'?original.stock+value:original.stock-value;if(!Number.isSafeInteger(stock)||stock<0||stock>100000000)issue('value',`${original.name}：修改后库存超出范围`);sku.stock=stock;if(stock!==original.stock)details.push({label:original.name,before:String(original.stock),after:String(stock)});}
            else {let price=value;if(c.action==='formula'){const old=cents(original.price,'value');price=(old*factor[0]+factor[1]/2n)/factor[1]+add-subtract;if(price<0n)issue('subtract',`${original.name}：修改后价格不能为负数`);if(price<floor)price=floor;}if(price>10000000000n)issue('value','修改后价格超出范围');sku.price=Number(price)/100;if(sku.price!==original.price)details.push({label:original.name,before:'¥'+Number(original.price).toFixed(2),after:'¥'+sku.price.toFixed(2)});}
          }
          changedSkus=details.length;
          if(details.length)derived(next,c.operation==='price');
        }
        if(c.operation==='sku') {
          const name=c.name.trim();
          if(!next.skus.some(s=>String(s.name).trim().toLowerCase()===name.toLowerCase())) {
            let id=String(next.id)+'-bulk-'+(next.skus.length+1);while(next.skus.some(s=>String(s.id)===id))id+='x';
            next.skus.push({id,name,price:Number(value)/100,stock:target,image:''});derived(next,true);changedSkus=1;
            details.push({label:name,before:'—',after:`¥${(Number(value)/100).toFixed(2)} · 库存 ${target}`});
          }
        }
        if(c.operation==='main'||c.operation==='details') {
          const key=c.operation, images=[...(before[key]||[])];let imagesNext;
          if(c.action==='fill') {
            imagesNext=[...images];const pool=(before[c.source]||[]).filter(Boolean);
            if(imagesNext.length<target&&!pool.length)issue('source','补足来源没有图片');
            let index=0;while(imagesNext.length<target)imagesNext.push(pool[index++%pool.length]);
          } else {
            if(positions.some(p=>p>images.length+(c.action==='insert'?1:0)))issue('positions',`图片位置超出范围，共 ${images.length} 张`);
            if(['insert','replace'].includes(c.action)&&!before[c.source]?.[sourceIndex-1])issue('sourceIndex','来源图片不存在');
            if(c.action==='insert'){imagesNext=[...images];imagesNext.splice(positions[0]===0?images.length:positions[0]-1,0,before[c.source][sourceIndex-1]);}
            else if(c.action==='replace'){imagesNext=images.map((image,i)=>positions.includes(i+1)?before[c.source][sourceIndex-1]:image);}
            else if(c.action==='swap'){imagesNext=[...images];[imagesNext[positions[0]-1],imagesNext[positions[1]-1]]=[imagesNext[positions[1]-1],imagesNext[positions[0]-1]];}
            else if(c.action==='delete')imagesNext=images.filter((_,i)=>!positions.includes(i+1));
            else if(c.action==='keep')imagesNext=positions.map(p=>images[p-1]);
            else imagesNext=[...positions.map(p=>images[p-1]),...images.filter((_,i)=>!positions.includes(i+1))];
          }
          if(key==='main'&&!imagesNext.length)issue('positions','至少保留 1 张主图');
          if(JSON.stringify(images)!==JSON.stringify(imagesNext)) {
            next[key]=imagesNext;
            if(key==='main'){next.cover=imagesNext[0];for(const key of ['coverImage','thumbnail','mainImage'])if(typeof next[key]==='string')next[key]=imagesNext[0];}
            derived(next);details.push({label:titles[key],before:images,after:imagesNext,images:true});
          }
        }
        if(c.operation==='skuImages') {
          if(c.action!=='delete'&&(!before.main||!before.main[mainIndex-1]))issue('mainIndex','指定主图不存在');
          const removed=new Set();
          for(const i of matching){const s=next.skus[i];if(c.action==='empty'&&s.image)continue;const image=c.action==='delete'?'':before.main[mainIndex-1];if((s.image||'')!==image){if(s.image)removed.add(s.image);details.push({label:s.name,before:s.image?[s.image]:[],after:image?[image]:[],images:true});s.image=image;}}
          const refs=new Set(next.skus.map(s=>s.image).filter(Boolean));
          const imagesNext=matching.length===next.skus.length&&c.action!=='empty'?[...refs]:[...new Set([...(next.skuImages||[]).filter(x=>!removed.has(x)||refs.has(x)),...refs])];
          if(JSON.stringify(imagesNext)!==JSON.stringify(next.skuImages||[])){details.push({label:'SKU 图库',before:next.skuImages||[],after:imagesNext,images:true});next.skuImages=imagesNext;}
          if(details.length){derived(next);changedSkus=details.filter(d=>d.label!=='SKU 图库').length;}
        }
        if(details.length){result.products[pi]=next;result.productIds.push(before.id);result.changes.push({id:before.id,sourceId:before.sourceId||before.id,title:before.title,packageId:before.packageId||'pack-default',details});result.summary.changed++;result.summary.skuCount+=changedSkus;}
        else result.summary.unchanged++;
      } catch(error) {result.errors.push({id:before.id,title:before.title,field:error.field||Object.keys(fieldLabels)[0],message:error.message});}
    }
    result.ok=result.errors.length===0;
    return result;
  }

  function mount(host, options) {
    const defaults={title:{action:'prefix',text:'',search:'',overflow:'reject'},stock:{action:'fixed',skuScope:'all',value:'100'},price:{action:'formula',skuScope:'all',factor:'1',add:'0',subtract:'0',floor:'0',value:'29.90'},sku:{name:'',value:'29.90',stock:'100'},main:{action:'delete',positions:'1',count:'5',source:'skuImages',sourceIndex:'1'},details:{action:'delete',positions:'1',count:'10',source:'main',sourceIndex:'1'},skuImages:{action:'set',mainIndex:'1'}};
    const state={operation:'title',packageIds:new Set(options.getPackages().map(p=>p.id)),filters:{keyword:'',skuKeyword:'',minPrice:'',maxPrice:''},values:clone(defaults),preview:null,base:null,busy:false};
    const $=s=>host.querySelector(s), all=s=>[...host.querySelectorAll(s)];
    const input=(label,key,value,type='text',attrs='')=>`<label class="bulk-field"><span>${label}</span><input id="bulk-${key}" data-bulk-field="${key}" type="${type}" value="${escape(value)}" ${attrs}><small data-bulk-error="${key}"></small></label>`;
    const select=(label,key,value,items)=>`<label class="bulk-field"><span>${label}</span><select id="bulk-${key}" data-bulk-field="${key}">${items.map(([v,l])=>`<option value="${escape(v)}" ${v===value?'selected':''}>${l}</option>`).join('')}</select><small data-bulk-error="${key}"></small></label>`;
    const numeric=(label,key,value,integer=false)=>input(label,key,value,'number',`min="0" max="100000000" step="${integer?'1':'0.01'}"`);
    function fields() {
      const op=state.operation,v=state.values[op];let html='';
      if(op==='title'){html=select('修改方式','action',v.action,[['prefix','添加前缀'],['suffix','添加后缀'],['replace','替换关键词'],['delete','删除关键词'],['fixed','固定标题']]);if(['replace','delete'].includes(v.action))html+=input('关键词','search',v.search);if(v.action!=='delete')html+=input(v.action==='replace'?'替换为':'标题内容','text',v.text);html+=select('超过 60 字符','overflow',v.overflow,[['reject','停止并列出异常'],['truncate','保留前 60 字符']]);}
      if(op==='stock')html=select('修改方式','action',v.action,[['fixed','固定库存'],['add','增加库存'],['subtract','减少库存']])+numeric('库存数量','value',v.value,true);
      if(op==='price'){html=select('修改方式','action',v.action,[['formula','价格公式'],['fixed','固定价格']]);html+=v.action==='fixed'?numeric('价格 / ¥','value',v.value):`<div class="bulk-formula">原价 × 倍率 + 加价 − 减价</div>`+numeric('倍率','factor',v.factor)+numeric('加价 / ¥','add',v.add)+numeric('减价 / ¥','subtract',v.subtract)+numeric('最低价格 / ¥','floor',v.floor);}
      if(op==='sku')html=input('规格名称','name',v.name)+numeric('价格 / ¥','value',v.value)+numeric('库存','stock',v.stock,true);
      if(op==='main'||op==='details'){html=select('修改方式','action',v.action,[['delete','删除指定位置'],['insert','插入图片'],['replace','替换图片'],['swap','交换位置'],['first','移至最前'],['keep','只保留指定位置'],['fill','补足图片数量']]);html+=v.action==='fill'?numeric('目标数量','count',v.count,true):input(v.action==='insert'?'插入位置 · 0 为末尾':'图片位置','positions',v.positions,'text','placeholder="1, 3, 5"');if(['fill','insert','replace'].includes(v.action))html+=select('图片来源','source',v.source,[['main','主图'],['skuImages','SKU 图片'],['details','详情图']]);if(['insert','replace'].includes(v.action))html+=numeric('来源图片位置','sourceIndex',v.sourceIndex,true);}
      if(op==='skuImages'){html=select('修改方式','action',v.action,[['set','覆盖 SKU 图片'],['empty','仅补齐空图'],['delete','删除 SKU 图片']]);if(v.action!=='delete')html+=numeric('使用第几张主图','mainIndex',v.mainIndex,true);}
      if(['stock','price'].includes(op))html+=select('SKU 范围','skuScope',v.skuScope,[['all','全部 SKU'],['stocked','有库存 SKU'],['zero','零库存 SKU'],['lowest','最低价 SKU'],['highest','最高价 SKU']]);
      return html;
    }
    function render() {
      const packages=options.getPackages(),products=options.getProducts();
      host.innerHTML=`<section class="bulk-page"><div class="bulk-types" role="group" aria-label="批量修改项目">${Object.entries(titles).map(([key,label],i)=>`<button type="button" data-bulk-operation="${key}" aria-pressed="${state.operation===key}" class="${state.operation===key?'is-active':''}"><span class="bulk-type-number">0${i+1}</span><span>${label}</span></button>`).join('')}</div><div class="bulk-layout"><section class="bulk-scope"><div class="bulk-section-heading"><h2>数据范围</h2><button type="button" class="bulk-link" data-bulk-action="select-packs">${state.packageIds.size===packages.length?'清空':'全选'}</button></div><div class="bulk-packages" id="bulk-packages">${packages.map(p=>`<label class="bulk-package"><input type="checkbox" data-bulk-package="${escape(p.id)}" ${state.packageIds.has(p.id)?'checked':''}><span><strong>${escape(p.name)}</strong><small>${escape(p.type||'数据包')} · ${products.filter(x=>(x.packageId||'pack-default')===p.id).length} 件</small></span></label>`).join('')||'<div class="bulk-empty">暂无数据包</div>'}</div><small data-bulk-error="packages"></small><div class="bulk-filter-fields">${input('标题关键词','keyword',state.filters.keyword)}${input('SKU 关键词','skuKeyword',state.filters.skuKeyword)}<div class="bulk-field-pair">${numeric('最低 SKU 价格','minPrice',state.filters.minPrice)}${numeric('最高 SKU 价格','maxPrice',state.filters.maxPrice)}</div></div><div class="bulk-scope-total"><span>已选 ${state.packageIds.size} 个包</span><span>${products.filter(p=>state.packageIds.has(p.packageId||'pack-default')).length} 件商品</span></div></section><section class="bulk-config"><div class="bulk-section-heading"><h2>${titles[state.operation]}</h2><button type="button" class="bulk-link" data-bulk-action="reset">重置</button></div><div class="bulk-fields">${fields()}</div><div class="bulk-config-footer"><span class="bulk-state" data-bulk-status role="status">待预览</span><button type="button" class="button primary" data-bulk-action="preview">预览变更</button></div></section></div><section class="bulk-preview" data-bulk-preview aria-live="polite"><div class="bulk-empty">暂无预览</div></section></section>`;
    }
    function config() {return {operation:state.operation,...state.values[state.operation],filters:clone(state.filters),packageIds:[...state.packageIds],blacklist:options.getBlacklist?.()||[]};}
    const safeSrc=value=>typeof value==='string'&&(/^(assets\/[\w.-]+|data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+)$/.test(value))?(root.DEMO_ASSETS?.[value]||value):'';
    function content(value,isImages) {return isImages?`<div class="bulk-image-sequence">${value.map((image,i)=>`<span><img src="${escape(safeSrc(image))}" alt="图片 ${i+1}" loading="lazy"><small>${i+1}</small></span>`).join('')||'<span class="bulk-muted">无图片</span>'}</div>`:escape(value);}
    function showPreview() {
      const p=state.preview;
      all('[data-bulk-error]').forEach(el=>el.textContent='');all('[data-bulk-field]').forEach(el=>el.removeAttribute('aria-invalid'));
      for(const err of p.errors){const el=$(`[data-bulk-error="${err.field}"]`);if(el&&!el.textContent)el.textContent=err.message;const field=$(`[data-bulk-field="${err.field}"]`);field?.setAttribute('aria-invalid','true');}
      $('[data-bulk-status]').textContent=p.ok?'预览已就绪':'有异常';
      $('[data-bulk-preview]').innerHTML=`<div class="bulk-preview-heading"><div><h2>变更预览</h2><div class="bulk-counts"><span>命中 <b>${p.summary.matched}</b></span><span>修改 <b>${p.summary.changed}</b></span><span>未变 <b>${p.summary.unchanged}</b></span><span>黑名单跳过 <b>${p.summary.blacklisted}</b></span></div></div><button type="button" class="button primary" data-bulk-action="apply" ${!p.ok||!p.productIds.length?'disabled':''}>应用修改${p.productIds.length?' · '+p.productIds.length+' 件':''}</button></div>${p.errors.length?`<div class="bulk-errors" role="alert" tabindex="-1"><strong>${p.errors.length} 项异常</strong>${p.errors.map(err=>`<div>${err.id?`<span>${escape(err.id)}</span>`:''}${escape(err.message)}</div>`).join('')}</div>`:''}<div class="bulk-change-list">${p.changes.map(change=>`<article class="bulk-change"><div class="bulk-change-product"><strong>${escape(change.title)}</strong><span>${escape(change.sourceId||change.id)} · ${escape(options.getPackages().find(p=>p.id===change.packageId)?.name||'')}</span></div><div class="bulk-change-columns"><span>修改前</span><span>修改后</span></div>${change.details.map(d=>`<div class="bulk-change-detail"><span class="bulk-change-label">${escape(d.label)}${d.meta?`<small>${escape(d.meta)}</small>`:''}</span><div class="bulk-before">${content(d.before,d.images)}</div><div class="bulk-after">${content(d.after,d.images)}</div></div>`).join('')}</article>`).join('')||(!p.errors.length?'<div class="bulk-empty">没有需要修改的商品</div>':'')}</div>`;
      if(p.errors.length)$('.bulk-errors').focus({preventScroll:true});
    }
    function invalidate() {all('[data-bulk-error]').forEach(el=>el.textContent='');all('[data-bulk-field]').forEach(el=>el.removeAttribute('aria-invalid'));state.preview=null;state.base=null;const apply=$('[data-bulk-action="apply"]');if(apply)apply.disabled=true;$('[data-bulk-status]').textContent='待预览';if($('[data-bulk-preview]'))$('[data-bulk-preview]').innerHTML='<div class="bulk-empty">配置已更新 · 待预览</div>';}
    async function onClick(event) {
      const operation=event.target.closest('[data-bulk-operation]')?.dataset.bulkOperation;
      const action=event.target.closest('[data-bulk-action]')?.dataset.bulkAction;
      if(state.busy)return;
      if(operation){state.operation=operation;state.preview=null;state.base=null;render();return;}
      if(action==='select-packs'){const packs=options.getPackages();state.packageIds=state.packageIds.size===packs.length?new Set():new Set(packs.map(p=>p.id));state.preview=null;state.base=null;render();}
      if(action==='reset'){state.values[state.operation]=clone(defaults[state.operation]);state.preview=null;state.base=null;render();}
      if(action==='preview'){state.base=clone(options.getProducts());state.preview=transform(state.base,config());showPreview();$('[data-bulk-preview]').scrollIntoView({behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
      if(action==='apply'&&state.preview?.ok&&state.preview.productIds.length) {
        if(JSON.stringify(options.getProducts())!==JSON.stringify(state.base)){invalidate();$('[data-bulk-status]').textContent='商品已更新，请重新预览';return;}
        const latestBlacklist=new Set((options.getBlacklist?.()||[]).map(String));
        if(state.base.filter(p=>state.preview.productIds.includes(p.id)).some(p=>latestBlacklist.has(`${p.platform||'1688'}:${p.sourceId||p.id}`)||latestBlacklist.has(String(p.id)))){invalidate();$('[data-bulk-status]').textContent='黑名单已更新，请重新预览';return;}
        state.busy=true;const button=$('[data-bulk-action="apply"]');button.disabled=true;button.textContent='正在保存';
        try {const applied=await options.onApply({label:'批量修改'+titles[state.operation],productIds:[...state.preview.productIds],products:clone(state.preview.products),summary:clone(state.preview.summary),changes:clone(state.preview.changes),baseFingerprint:JSON.stringify(state.base)});if(applied===false)throw Error('保存失败');state.preview=null;state.base=null;render();$('[data-bulk-status]').textContent='已应用';$('[data-bulk-preview]').innerHTML='<div class="bulk-complete"><span>修改已保存</span><button type="button" class="button" data-bulk-action="preview">重新预览</button></div>';}
        catch {button.disabled=false;button.textContent='重试保存';$('[data-bulk-status]').textContent='保存失败';}
        finally {state.busy=false;}
      }
    }
    function onInput(event) {
      const input=event.target, key=input.dataset.bulkField;
      if(state.busy)return;
      if(key){if(Object.prototype.hasOwnProperty.call(state.filters,key))state.filters[key]=input.value;else state.values[state.operation][key]=input.value;invalidate();if(key==='action')render();}
      if(input.dataset.bulkPackage){if(input.checked)state.packageIds.add(input.dataset.bulkPackage);else state.packageIds.delete(input.dataset.bulkPackage);invalidate();$('[data-bulk-action="select-packs"]').textContent=state.packageIds.size===options.getPackages().length?'清空':'全选';$('.bulk-scope-total').innerHTML=`<span>已选 ${state.packageIds.size} 个包</span><span>${options.getProducts().filter(p=>state.packageIds.has(p.packageId||'pack-default')).length} 件商品</span>`;}
    }
    host.addEventListener('click',onClick);host.addEventListener('input',onInput);render();
    return {destroy(){host.removeEventListener('click',onClick);host.removeEventListener('input',onInput);}};
  }
  root.DemoBulk={mount,transform,titleWeight:weight};
})(typeof window!=='undefined'?window:globalThis);
