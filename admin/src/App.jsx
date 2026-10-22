import { useEffect, useState } from 'react';

const api = (u, o = {}) =>
  fetch('/api/admin' + u, { ...o, headers: { 'content-type': 'application/json', 'ngrok-skip-browser-warning': '1', 'x-admin-password': sessionStorage.pw || '' }, body: o.body && JSON.stringify(o.body) })
    .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Xato'); return j; });
const fmt = (n) => Number(n).toLocaleString('ru-RU') + " so'm";
const ST = { pending: '⏳ Kutilmoqda', delivered: '✅ Yetkazildi', cancelled: '❌ Bekor' };
const vStr = (v) => (v || []).map((x) => x.l + '=' + x.p).join(', ');
const vArr = (s) => s.split(',').map((t) => t.trim()).filter(Boolean).map((t) => { const [l, p] = t.split('='); return { l: l.trim(), p: parseInt(p, 10) || 0 }; });
const toData = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => rej(new Error('Rasm o\'qilmadi'));
    img.src = r.result;
  };
  r.onerror = () => rej(new Error('Fayl o\'qilmadi'));
  r.readAsDataURL(file);
});
const upImg = async (file) => (await api('/upload', { method: 'POST', body: { data: await toData(file) } })).url;
const EMPTY = { name: '', category: '', image: '', description: '', ingredients: '', price: '', oldPrice: '', variants: '', active: true };

export default function App() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState('');
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [f, setF] = useState(null);
  const [stories, setStories] = useState([]);
  const [sf, setSf] = useState({ title: '', text: '', image: '', hours: 24 });

  const loadO = () => api('/orders').then(setOrders).catch(() => {});
  const loadS = () => api('/stories').then(setStories).catch(() => {});
  const loadP = () => api('/products').then(setProducts).catch(() => {});
  const login = () => { sessionStorage.pw = pw; api('/login', { method: 'POST' }).then(() => setOk(true)).catch((e) => alert(e.message)); };
  useEffect(() => { if (sessionStorage.pw) api('/login', { method: 'POST' }).then(() => setOk(true)).catch(() => {}); }, []);
  useEffect(() => { if (!ok) return; loadO(); loadP(); loadS(); const t = setInterval(loadO, 8000); return () => clearInterval(t); }, [ok]);

  if (!ok) return (
    <div className="login"><h2>🔐 FastFood Admin</h2>
      <input className="input" type="password" placeholder="Parol" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} />
      <button className="btn pri" onClick={login}>Kirish</button></div>
  );

  const setSt = (id, status) => api('/orders/' + id, { method: 'PATCH', body: { status } }).then(loadO);
  const edit = (p) => setF({ ...p, ingredients: (p.ingredients || []).join(', '), variants: vStr(p.variants), oldPrice: p.oldPrice || '', image: p.image || '', description: p.description || '' });
  const save = async () => {
    const body = { ...f, ingredients: f.ingredients.split(',').map((s) => s.trim()).filter(Boolean), variants: vArr(f.variants || '') };
    try { await (f.id ? api('/products/' + f.id, { method: 'PUT', body }) : api('/products', { method: 'POST', body })); setF(null); loadP(); } catch (e) { alert(e.message); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const live = orders.filter((o) => o.status !== 'cancelled');

  return (
    <div className="wrap">
      <div className="top"><h2 style={{ margin: 0 }}>🍔 FastFood Admin</h2>
        <div className="tabs">
          <button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>Buyurtmalar ({orders.filter((o) => o.status === 'pending').length})</button>
          <button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>Mahsulotlar</button>
          <button className={tab === 'stories' ? 'on' : ''} onClick={() => setTab('stories')}>Storilar ({stories.filter((x) => new Date(x.expiresAt) > new Date()).length})</button>
        </div></div>

      {tab === 'orders' && <>
        <p style={{ color: '#666' }}>Jami: {live.length} ta buyurtma · {fmt(live.reduce((s, o) => s + o.total, 0))} (har 8 soniyada yangilanadi)</p>
        <table><thead><tr><th>№</th><th>Mijoz</th><th>Telefon</th><th>Buyurtma</th><th>Manzil</th><th>Summa</th><th>Sana</th><th>Holat</th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{o.user.name}</td><td>{o.user.phone}</td>
              <td>{o.items.map((i, k) => <div key={k}>{i.name}{i.label && ` (${i.label})`} × {i.qty}</div>)}</td>
              <td style={{ maxWidth: 180, wordBreak: 'break-all' }}>{o.location?.startsWith('http') ? <a href={o.location} target="_blank" rel="noreferrer">📍 Xarita</a> : o.location}</td>
              <td><b>{fmt(o.total)}</b></td><td>{new Date(o.createdAt).toLocaleString('ru-RU')}</td>
              <td><span className={'tag ' + o.status}>{ST[o.status]}</span><div style={{ marginTop: 6 }}>
                {o.status !== 'delivered' && <button className="btn" onClick={() => setSt(o.id, 'delivered')}>Yetkazildi</button>}
                {o.status === 'pending' && <button className="btn red" onClick={() => setSt(o.id, 'cancelled')}>Bekor</button>}</div></td>
            </tr>))}</tbody></table>
      </>}

      {tab === 'stories' && <>
        <div className="form">
          <input className="input" placeholder="Stori nomi (doira tagida ko'rinadi)" value={sf.title} onChange={(e) => setSf({ ...sf, title: e.target.value })} />
          <select className="input" value={sf.hours} onChange={(e) => setSf({ ...sf, hours: e.target.value })}>
            <option value={24}>24 soat ko'rinadi</option><option value={48}>2 kun</option><option value={168}>7 kun</option><option value={720}>30 kun</option>
          </select>
          <input className="input full" placeholder="Matn (ixtiyoriy): Aksiya! Ikkinchi burger -50%" value={sf.text} onChange={(e) => setSf({ ...sf, text: e.target.value })} />
          <label className="full" style={{ marginBottom: 8 }}>📷 Rasm: <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; try { setSf({ ...sf, image: await upImg(file) }); } catch (er) { alert(er.message); } }} />
            {sf.image && <img className="th" style={{ marginLeft: 10, verticalAlign: 'middle', borderRadius: '50%' }} src={sf.image} />}</label>
          <div><button className="btn pri" onClick={async () => { try { await api('/stories', { method: 'POST', body: sf }); setSf({ title: '', text: '', image: '', hours: 24 }); loadS(); } catch (er) { alert(er.message); } }}>➕ Stori joylash</button></div>
        </div>
        <table><thead><tr><th></th><th>Nomi</th><th>Matn</th><th>Tugaydi</th><th></th></tr></thead>
          <tbody>{stories.map((x) => {
            const live = new Date(x.expiresAt) > new Date();
            return (
              <tr key={x.id} style={{ opacity: live ? 1 : .5 }}>
                <td><img className="th" style={{ borderRadius: '50%' }} src={x.image} /></td><td>{x.title}</td><td>{x.text}</td>
                <td>{new Date(x.expiresAt).toLocaleString('ru-RU')} {live ? '' : '(tugagan)'}</td>
                <td><button className="btn red" onClick={() => confirm("O'chirilsinmi?") && api('/stories/' + x.id, { method: 'DELETE' }).then(loadS)}>🗑</button></td>
              </tr>);
          })}</tbody></table>
      </>}

      {tab === 'products' && <>
        <button className="btn pri" style={{ marginBottom: 14 }} onClick={() => setF({ ...EMPTY })}>➕ Yangi mahsulot</button>
        {f && <div className="form">
          <input className="input" placeholder="Nomi" value={f.name} onChange={set('name')} />
          <input className="input" placeholder="Kategoriya (masalan: Пицца)" value={f.category} onChange={set('category')} />
          <input className="input" placeholder="Narx" value={f.price} onChange={set('price')} />
          <input className="input" placeholder="Eski narx (ixtiyoriy)" value={f.oldPrice} onChange={set('oldPrice')} />
          <input className="input full" placeholder="Rasm URL (ixtiyoriy)" value={f.image} onChange={set('image')} />
          <label className="full" style={{ marginBottom: 8 }}>📷 Rasm yuklash: <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; try { setF({ ...f, image: await upImg(file) }); } catch (er) { alert(er.message); } }} />
            {f.image && <img className="th" style={{ marginLeft: 10, verticalAlign: 'middle' }} src={f.image} />}</label>
          <input className="input full" placeholder="Ta'rifi" value={f.description} onChange={set('description')} />
          <input className="input full" placeholder="Tarkibi (vergul bilan): Pishloq, Pomidor" value={f.ingredients} onChange={set('ingredients')} />
          <input className="input full" placeholder="O'lchamlar (ixtiyoriy): S=60000, M=75000, L=90000" value={f.variants} onChange={set('variants')} />
          <label><input type="checkbox" checked={f.active} onChange={set('active')} /> Menyuda ko'rinsin</label>
          <div><button className="btn pri" onClick={save}>Saqlash</button><button className="btn" onClick={() => setF(null)}>Bekor</button></div>
        </div>}
        <table><thead><tr><th></th><th>Nomi</th><th>Kategoriya</th><th>Narx</th><th>Holat</th><th></th></tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id} style={{ opacity: p.active ? 1 : .5 }}>
              <td><label className="thl" title="Rasmni almashtirish">
                <input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files[0]; e.target.value = ''; if (!file) return; try { const url = await upImg(file); await api('/products/' + p.id, { method: 'PUT', body: { ...p, image: url + '?v=' + Date.now() } }); loadP(); } catch (er) { alert(er.message); } }} />
                {p.image ? <img className="th" src={p.image} /> : <span className="th ph">🍽</span>}<small>📷 o'zgartirish</small></label></td><td>{p.name}</td><td>{p.category}</td>
              <td>{p.oldPrice && <s style={{ color: '#999' }}>{fmt(p.oldPrice)} </s>}{p.variants?.length ? vStr(p.variants) : fmt(p.price)}</td>
              <td>{p.active ? 'Faol' : 'Yashirin'}</td>
              <td><button className="btn" onClick={() => edit(p)}>✏️</button><button className="btn red" onClick={() => confirm("O'chirilsinmi?") && api('/products/' + p.id, { method: 'DELETE' }).then(loadP)}>🗑</button></td>
            </tr>))}</tbody></table>
      </>}
    </div>
  );
}
