(function (root) {
  'use strict';

  const money = value => ['number', 'string'].includes(typeof value) && Number.isFinite(Number(value)) && String(value).trim() !== '' ? Number(value) : NaN;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const formatMoney = value => Number.isFinite(money(value)) ? money(value).toFixed(2) : '—';
  const mainImages = product => (product.mainImages || product.main || product.images || [])
    .filter(item => typeof item === 'string' || !item.type || ['main', '主图'].includes(item.type))
    .map(item => typeof item === 'string' ? item : item.src || item.url).filter(Boolean);
  const specs = sku => sku.name || sku.spec || sku.specs || '';

  function validateProduct(product) {
    const errors = [];
    if (!String(product.id ?? '').trim()) errors.push('商品 ID 不能为空');
    if (!String(product.title ?? '').trim()) errors.push('商品标题不能为空');
    if (!Array.isArray(product.skus) || !product.skus.length) errors.push('至少保留一个 SKU');
    for (const [index, sku] of (product.skus || []).entries()) {
      const label = specs(sku) || `SKU ${index + 1}`;
      if (!Number.isFinite(money(sku.price)) || money(sku.price) < 0) errors.push(`${label}：价格须为非负数字`);
      if (!Number.isSafeInteger(money(sku.stock)) || money(sku.stock) < 0) errors.push(`${label}：库存须为非负整数`);
    }
    return { ok: errors.length === 0, errors };
  }

  function summaryRange(product) {
    if (product.originalSummaryPrice != null) {
      const original = String(product.originalSummaryPrice).replace(/[¥￥\s]/g, '').split(/[-–—~～]/).map(money);
      return [original[0], original[1] ?? money(product.originalSummaryPriceMax)];
    }
    if (product.priceMin != null || product.priceMax != null) return [money(product.priceMin ?? product.price), money(product.priceMax ?? product.price)];
    if (Array.isArray(product.priceRange)) return product.priceRange.map(money);
    if (typeof product.price === 'number') return [product.price, product.price];
    const parts = String(product.price ?? '').replace(/[¥￥\s]/g, '').split(/[-–—~～]/).map(money);
    return parts.length === 1 ? [parts[0], parts[0]] : parts.slice(0, 2);
  }

  function calculateRisks(products, rules = {}) {
    const risks = [];
    const words = [...new Set((rules.words || ['最强', '第一', '绝对', '顶级', '100%']).map(String).filter(Boolean))];
    for (const product of products) {
      const add = (key, risk) => risks.push({ id: `${product.id}:${key}`, productId: String(product.id), ...risk });
      for (const word of words) if (String(product.title || '').includes(word)) {
        add(`word:${encodeURIComponent(word)}`, { type: 'word', title: '标题词库命中', detail: word, severity: 'high', fixable: true, field: 'title', word });
      }
      const skus = (product.skus || []).filter(sku => Number.isFinite(money(sku.price)) && money(sku.price) >= 0);
      if (skus.length) {
        const prices = skus.map(sku => money(sku.price));
        const low = Math.min(...prices), high = Math.max(...prices), average = prices.reduce((a, b) => a + b, 0) / prices.length;
        const [summaryLow, summaryHigh] = summaryRange(product);
        if ((Number.isFinite(summaryLow) && Math.abs(summaryLow - low) > 0.005) || (Number.isFinite(summaryHigh) && Math.abs(summaryHigh - high) > 0.005)) {
          const summary = Number.isFinite(summaryHigh) ? `${formatMoney(summaryLow)}–${formatMoney(summaryHigh)}` : formatMoney(summaryLow);
          add('price-summary', { type: 'price-mismatch', title: '商品价格不一致', detail: `¥${summary} / SKU ¥${formatMoney(low)}–${formatMoney(high)}`, severity: 'medium', fixable: true, field: 'price' });
        }
        skus.forEach((sku, index) => {
          const skuId = String(sku.id ?? index);
          if (money(sku.price) < average / 2) add(`low-price:${skuId}`, { type: 'low-price', title: '低价 SKU', detail: `${specs(sku)} · ¥${formatMoney(sku.price)}`, severity: 'medium', fixable: false, field: 'price', skuId });
        });
      }
      (product.skus || []).forEach((sku, index) => {
        if (money(sku.stock) === 0) {
          const skuId = String(sku.id ?? index);
          add(`zero-stock:${skuId}`, { type: 'zero-stock', title: '零库存 SKU', detail: String(specs(sku)), severity: 'low', fixable: false, field: 'stock', skuId });
        }
      });
    }
    return risks;
  }

  function csvCell(value, numeric = false) {
    let text = String(value ?? '');
    if (!numeric && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function buildExport(products, format = 'json', platform = '通用') {
    if (format === 'csv') {
      const rows = [['商品ID', '标题', '来源平台', '目标平台', '规格', '价格', '库存', '主图'].map(value => csvCell(value)).join(',')];
      for (const product of products) for (const sku of product.skus || []) {
        rows.push([product.id, product.title, product.platform || product.sourcePlatform || '', platform, specs(sku), sku.price, sku.stock, mainImages(product)[0] || '']
          .map((value, index) => csvCell(value, [5, 6].includes(index) && Number.isFinite(money(value)))).join(','));
      }
      return { content: '\ufeff' + rows.join('\r\n') + '\r\n', mime: 'text/csv;charset=utf-8', filename: '图映-商品清单.csv' };
    }
    if (format !== 'json') throw new Error('不支持的导出格式');
    return {
      content: JSON.stringify({ demo: true, format: 'tuying-demo-manifest', version: 1, platform, products }, null, 2),
      mime: 'application/json;charset=utf-8', filename: '图映-商品清单.json'
    };
  }

  // ponytail: Stored ZIP supports demo-sized image packs; stream compression when real large batches are introduced.
  async function buildImageZip(products, fetcher = root.fetch.bind(root)) {
    const encoder = new TextEncoder(), files = [], chunks = [], directory = [];
    const crcTable = Array.from({ length: 256 }, (_, i) => {
      for (let bit = 0; bit < 8; bit++) i = (i >>> 1) ^ (i & 1 ? 0xedb88320 : 0);
      return i >>> 0;
    });
    const safeName = value => String(value).replace(/[^a-zA-Z0-9_\-\u4e00-\u9fff]/g, '_').slice(0, 100) || 'product';
    for (const [productIndex, product] of products.entries()) {
      const folder = `${String(productIndex + 1).padStart(2, '0')}_${safeName(product.id)}`;
      files.push({ name: `${folder}/product.json`, bytes: encoder.encode(JSON.stringify({ ...product, demo: true }, null, 2)) });
      for (const [index, src] of mainImages(product).entries()) {
        const value = String(src);
        const isData = /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value);
        const isLocal = /^(?:\.\/)?assets\/[a-zA-Z0-9_\-./]+$/.test(value) && !value.includes('..');
        if (!isData && !isLocal) throw new Error('图包仅支持本地 assets 图片');
        const response = await fetcher(value);
        if (!response.ok) throw new Error(`图片读取失败：${index + 1}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        const extension = isData ? value.match(/^data:image\/([^;]+)/i)[1].replace('jpeg', 'jpg') : value.split('.').pop().toLowerCase();
        files.push({ name: `${folder}/主图_${index + 1}.${extension}`, bytes });
      }
    }
    let offset = 0;
    for (const file of files) {
      const name = encoder.encode(file.name), length = file.bytes.length;
      let crc = 0xffffffff;
      for (const byte of file.bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
      crc = (crc ^ 0xffffffff) >>> 0;
      const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
      lv.setUint32(14, crc, true); lv.setUint32(18, length, true); lv.setUint32(22, length, true); lv.setUint16(26, name.length, true); local.set(name, 30);
      const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, length, true); cv.setUint32(24, length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46);
      chunks.push(local, file.bytes); directory.push(central); offset += local.length + length;
    }
    const directorySize = directory.reduce((sum, entry) => sum + entry.length, 0), end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, directorySize, true); ev.setUint32(16, offset, true);
    return new Blob([...chunks, ...directory, end], { type: 'application/zip' });
  }

  root.DemoCore = { escapeHTML, formatMoney, validateProduct, calculateRisks, buildExport, buildImageZip };
  if (typeof module !== 'undefined') module.exports = root.DemoCore;
})(typeof window === 'undefined' ? globalThis : window);
