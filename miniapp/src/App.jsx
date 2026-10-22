import { useEffect, useMemo, useState } from 'react';

const tg = window.Telegram?.WebApp;
const api = (u, o = {}) =>
  fetch('/api' + u, { ...o, headers: { 'content-type': 'application/json', 'x-init-data': tg?.initData || '', 'ngrok-skip-browser-warning': '1' }, body: o.body && JSON.stringify(o.body) })
    .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Xato'); return j; });
const fmt = (n) => n.toLocaleString('ru-RU') + " so'm";
const buzz = () => tg?.HapticFeedback?.impactOccurred('light');
const ls = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const ICON = { 'Shaurma': '🌯', 'Burgerlar': '🍔', 'Xot-Dog': '🌭', 'Nonburger': '🥙', 'Pitsa': '🍕', 'Sendvich': '🥪', 'Qanotchalar': '🍗', Strips: '🍤', 'Kartoshka': '🍟', 'Souslar': '🥫', 'Ichimliklar': '🥤' };
const UP = [['Souslar', '🥫 Souslar'], ['Kartoshka', '🍟 Kartoshka'], ['Ichimliklar', '🥤 Ichimliklar']];
const UPCATS = UP.map((u) => u[0]);
const SLIDES = [
  ['logo', 'Sizni ochlik qiynayaptimi?', 'Biz issiqqina taomlarni tezkor yetkazamiz.'],
  ['🛒', 'Bu qanday ishlaydi?', 'Tanlang, buyurtma bering va rohatlaning.'],
  ['🔥', '10,000+ odam allaqachon biz bilan', "Siz ham qo'shiling!"],
];
const COLA = 5000;
const vPrice = (p, i) => (p.variants?.length ? p.variants[i]?.p ?? p.variants[0].p : p.price);
const statusText = { pending: '⏳ Qabul qilindi', delivered: '✅ Yetkazildi', cancelled: '❌ Bekor qilindi' };

function fly(el, img) {
  const target = document.getElementById('navcart');
  if (!el || !target) return;
  const a = el.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'fly';
  if (img) d.style.backgroundImage = `url(${img})`;
  d.style.left = a.left + a.width / 2 - 20 + 'px';
  d.style.top = a.top + a.height / 2 - 20 + 'px';
  document.body.appendChild(d);
  const dx = t.left + t.width / 2 - (a.left + a.width / 2);
  const dy = t.top + t.height / 2 - (a.top + a.height / 2);
  const anim = d.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.45}px,${dy - 90}px) scale(.85)`, opacity: 1, offset: 0.45 },
    { transform: `translate(${dx}px,${dy}px) scale(.25)`, opacity: 0.3 },
  ], { duration: 700, easing: 'cubic-bezier(.45,0,.75,.45)' });
  anim.onfinish = () => {
    d.remove();
    target.classList.remove('bump');
    void target.offsetWidth;
    target.classList.add('bump');
  };
}

function Pic({ p, cls }) {
  const [bad, setBad] = useState(false);
  if (p.image && !bad) return <img className={cls} src={p.image} alt="" loading="lazy" onError={() => setBad(true)} />;
  return <div className={cls + ' ph'}>{ICON[p.category] || '🍽'}</div>;
}

function Card({ p, onOpen, onAdd, onSub, qty }) {
  const multi = p.variants?.length > 1;
  return (
    <div className="card" onClick={() => onOpen(p)}>
      <div className="imgw">
        <Pic p={p} cls="img" />
        {p.oldPrice && <span className="sale">-{Math.round((1 - p.price / p.oldPrice) * 100)}%</span>}
        <div className="ctl" onClick={(e) => e.stopPropagation()}>
          {qty > 0 && <><button className="minus" onClick={() => onSub(p)}>−</button><span className="qn">{qty}</span></>}
          <button className="plus gold" onClick={(e) => onAdd(e, p)}>+</button>
        </div>
      </div>
      <div className="cb">
        <div className="price">
          {p.oldPrice && <s>{fmt(p.oldPrice)}</s>}
          <b>{multi ? fmt(p.price).replace(" so'm", " so'mdan") : fmt(p.price)}</b>
        </div>
        <div className="nm">{p.name}</div>
        <div className="sub">{multi ? p.variants.map((v) => v.l).join(' · ') : '1 dona'}</div>
      </div>
    </div>
  );
}

function StoryView({ items, start, onClose, onSeen }) {
  const [i, setI] = useState(start);
  const cur = items[i];
  const next = () => (i < items.length - 1 ? setI(i + 1) : onClose());
  const prev = () => setI(Math.max(0, i - 1));
  useEffect(() => { onSeen(cur.id); const t = setTimeout(next, 5000); return () => clearTimeout(t); }, [i]);
  return (
    <div className="sv">
      <div className="svbars">{items.map((x, k) => <span key={x.id}><b className={k < i ? 'full' : k === i ? 'run' : ''} /></span>)}</div>
      <div className="svhead"><img src="/logo.jpg" alt="" /><span>{cur.title}</span><button onClick={onClose}>✕</button></div>
      <img className="svimg" key={cur.id} src={cur.image} alt="" />
      {cur.text && <div className="svtext">{cur.text}</div>}
      <div className="svl" onClick={prev} /><div className="svr" onClick={next} />
    </div>
  );
}

export default function App() {
  const [onb, setOnb] = useState(localStorage.getItem('onb') ? -1 : 0);
  const [page, setPage] = useState('home');
  const [products, setProducts] = useState(null);
  const [me, setMe] = useState(null);
  const [q, setQ] = useState('');
  const [sOpen, setSOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [sIdx, setSIdx] = useState(0);
  const [up, setUp] = useState(false);
  const [upTab, setUpTab] = useState(0);
  const [cola, setCola] = useState(false);
  const [name, setName] = useState(() => ls('ff_name', ''));
  const [phone, setPhone] = useState(() => ls('ff_phone', ''));
  const [loc, setLoc] = useState(() => { const v = ls('ff_loc', ''); return String(v).startsWith('http') ? '' : v; });
  const [geo, setGeo] = useState(() => ls('ff_geo', '') || (String(ls('ff_loc', '')).startsWith('http') ? ls('ff_loc', '') : ''));
  const [busy, setBusy] = useState(false);
  const [cart, setCart] = useState(() => ls('cart', {}));
  const [seen, setSeen] = useState(() => ls('ff_seen', []));
  const [stories, setStories] = useState([]);
  const [sview, setSview] = useState(null);
  const [sseen, setSseen] = useState(() => ls('ff_sseen', []));

  const loadMe = () => api('/me').then(setMe).catch(() => {});
  useEffect(() => {
    tg?.ready(); tg?.expand(); tg?.setHeaderColor?.('#ffffff'); tg?.setBackgroundColor?.('#ffffff');
    api('/menu').then(setProducts).catch((e) => alert(e.message));
    api('/stories').then(setStories).catch(() => {});
    loadMe();
  }, []);
  useEffect(() => save('cart', cart), [cart]);
  useEffect(() => save('ff_name', name), [name]);
  useEffect(() => save('ff_phone', phone), [phone]);
  useEffect(() => save('ff_loc', loc), [loc]);
  useEffect(() => save('ff_geo', geo), [geo]);
  useEffect(() => save('ff_seen', seen), [seen]);
  useEffect(() => save('ff_sseen', sseen), [sseen]);
  useEffect(() => {
    if (page !== 'orders') return undefined;
    loadMe();
    const t = setInterval(loadMe, 8000);
    return () => clearInterval(t);
  }, [page]);

  const list = products || [];
  const cats = useMemo(() => [...new Set(list.map((p) => p.category))], [list]);
  const byId = useMemo(() => Object.fromEntries(list.map((p) => [p.id, p])), [list]);

  useEffect(() => {
    if (page !== 'home') return undefined;
    const onScroll = () => {
      let cur = 0;
      cats.forEach((c, i) => { const el = document.getElementById('cat-' + i); if (el && el.getBoundingClientRect().top < 190) cur = i; });
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [page, cats]);

  const lines = Object.entries(cart).map(([k, qty]) => {
    const [id, idx] = k.split('|').map(Number); const p = byId[id];
    return p ? { k, p, idx, qty, label: p.variants?.[idx]?.l, price: vPrice(p, idx) } : null;
  }).filter(Boolean);
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0) + (cola && lines.length ? COLA : 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const qtyOf = (id) => Object.entries(cart).reduce((s, [k, v]) => (k.split('|')[0] === String(id) ? s + v : s), 0);

  const add = (id, idx, d = 1) => {
    buzz();
    setCart((c) => { const k = id + '|' + idx; const n = (c[k] || 0) + d; const x = { ...c }; if (n <= 0) delete x[k]; else x[k] = n; return x; });
  };
  const openSheet = (p) => { setSheet(p); setSIdx(0); };

  const addFromCard = (e, p) => {
    if (p.variants?.length > 1) { openSheet(p); return; }
    fly(e.currentTarget, p.image);
    add(p.id, 0);
    if (!UPCATS.includes(p.category)) setUp(true);
  };
  const subOne = (p) => {
    const k = Object.keys(cart).find((x) => x.split('|')[0] === String(p.id));
    if (k) { const [id, idx] = k.split('|').map(Number); add(id, idx, -1); }
  };
  const addFromUpsell = (e, p) => { fly(e.currentTarget, p.image); add(p.id, 0); };
  const addFromSheet = (e) => {
    const p = sheet;
    fly(e.currentTarget, p.image);
    add(p.id, sIdx);
    setSheet(null);
    if (!UPCATS.includes(p.category)) setUp(true);
  };

  const goCat = (i) => {
    const c = cats[i];
    if (!seen.includes(c)) setSeen([...seen, c]);
    setQ('');
    setTimeout(() => document.getElementById('cat-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };
  const go = (p) => { setPage(p); setUp(false); window.scrollTo(0, 0); if (p === 'profile') loadMe(); };

  const getGeo = () => {
    const ok = (la, lo) => { setGeo(`https://maps.google.com/?q=${la},${lo}`); buzz(); };
    const deny = () => alert("Joylashuvni aniqlab bo'lmadi. Telefon sozlamalarida Telegram uchun joylashuvga ruxsat bering yoki manzilni qo'lda yozing.");
    const fallback = () => {
      if (!navigator.geolocation) return deny();
      return navigator.geolocation.getCurrentPosition((pos) => ok(pos.coords.latitude, pos.coords.longitude), deny, { enableHighAccuracy: true, timeout: 15000 });
    };
    const lm = tg?.LocationManager;
    if (lm?.init) lm.init(() => (lm.isLocationAvailable ? lm.getLocation((d) => (d ? ok(d.latitude, d.longitude) : fallback())) : fallback()));
    else fallback();
  };

  const confirmOrder = async () => {
    const words = name.trim().split(/\s+/).filter((w) => w.length > 1);
    if (words.length < 2) { alert('Ism va familiyangizni yozing (masalan: Alisher Karimov)'); return; }
    if (phone.replace(/\D/g, '').length < 9) { alert("Telefon raqamingizni to'liq yozing (masalan: +998 90 123 45 67)"); return; }
    if (loc.trim().length < 3 && !geo) { alert('Manzilni yozing yoki xaritada joylashuvingizni belgilang'); return; }
    setBusy(true);
    try {
      await api('/orders', { method: 'POST', body: { items: lines.map((l) => ({ id: l.p.id, idx: l.idx, qty: l.qty })), cola, name: name.trim(), phone, location: [loc.trim(), geo].filter(Boolean).join('\n') } });
      tg?.HapticFeedback?.notificationOccurred('success');
      setCart({}); setCola(false);
      setTimeout(() => (tg ? tg.close() : go('orders')), 300);
    } catch (e) { alert(e.message); }
    setBusy(false);
  };
  const reorder = (o) => {
    const c = {};
    o.items.forEach((i) => { if (i.id && byId[i.id]) c[i.id + '|' + i.idx] = i.qty; });
    setCart(c); go('cart');
  };

  if (onb >= 0) {
    const [ic, t, d] = SLIDES[onb];
    const finish = () => { localStorage.setItem('onb', '1'); setOnb(-1); };
    return (
      <div className="onb">
        <button className="ghost" style={{ alignSelf: 'flex-end' }} onClick={finish}>O'tkazish</button>
        <div className="onbc">
          {ic === 'logo' ? <img className="olg" src="/logo.jpg" alt="" /> : <div className="big">{ic}</div>}
          <h2>{t}</h2><div className="muted">{d}</div>
        </div>
        <div>
          <div className="dots">{SLIDES.map((_, i) => <i key={i} className={i === onb ? 'on' : ''} />)}</div>
          <button className="btn gold" onClick={() => (onb < 2 ? setOnb(onb + 1) : finish())}>{onb < 2 ? 'Keyingisi' : 'Boshla'}</button>
        </div>
      </div>
    );
  }

  const ql = q.trim().toLowerCase();
  const last = me?.orders?.[0];
  const myOrders = me?.orders || [];
  const upItems = list.filter((p) => p.category === UP[upTab][0]);

  return (
    <div className="app">
      {sview !== null && stories[sview] && <StoryView items={stories} start={sview} onClose={() => setSview(null)} onSeen={(id) => setSseen((a) => (a.includes(id) ? a : [...a, id]))} />}
      {page === 'home' && <>
        <header className="top">
          <div className="row">
            <div className="brand"><img className="logo" src="/logo.jpg" alt="" /><div><h1>BURGER XAN</h1><span>Issiq. Tez. Mazali.</span></div></div>
            <div className="acts">
              <button className="ic" onClick={() => { setSOpen(!sOpen); if (sOpen) setQ(''); }}>{sOpen ? '✕' : '🔍'}</button>
            </div>
          </div>
          {sOpen && <input className="search" autoFocus placeholder="Taom nomini yozing…" value={q} onChange={(e) => setQ(e.target.value)} />}
          {!ql && (
            <div className="stories">
              {stories.map((st, i) => (
                <button key={'s' + st.id} className="story" onClick={() => setSview(i)}>
                  <span className={'ring' + (sseen.includes(st.id) ? ' seen' : '')}><img src={st.image} alt="" /></span>
                  <em>{st.title}</em>
                </button>
              ))}
              {cats.map((c, i) => (
                <button key={c} className={'story' + (active === i ? ' cur' : '')} onClick={() => goCat(i)}>
                  <span className={'ring' + (seen.includes(c) ? ' seen' : '')}><i>{ICON[c] || '🍽'}</i></span>
                  <em>{c}</em>
                </button>
              ))}
            </div>
          )}
        </header>

        {!products && <div className="skel">{[1, 2, 3, 4].map((i) => <div key={i} className="sk" />)}</div>}

        {!ql && last && (
          <div className="again" onClick={() => reorder(last)}>
            <div><b>Oxirgi buyurtmani takrorlang</b><span>{last.items.slice(0, 2).map((i) => i.name).join(', ')}{last.items.length > 2 ? '…' : ''}</span></div>
            <button className="gold mini">↻ {fmt(last.total)}</button>
          </div>
        )}

        {cats.map((c, i) => {
          const items = list.filter((p) => p.category === c && (!ql || p.name.toLowerCase().includes(ql)));
          if (!items.length) return null;
          return (
            <section className="sec" id={'cat-' + i} key={c}>
              <h2><span>{ICON[c] || '🍽'}</span> {c}</h2>
              <div className="grid">{items.map((p) => <Card key={p.id} p={p} onOpen={openSheet} onAdd={addFromCard} onSub={subOne} qty={qtyOf(p.id)} />)}</div>
            </section>
          );
        })}
        {ql && !list.some((p) => p.name.toLowerCase().includes(ql)) && <div className="empty">Hech narsa topilmadi 🤷</div>}
      </>}

      {page === 'cart' && (
        <div className="page">
          <h1 className="title">Savatcha</h1>
          {!lines.length ? <div className="empty">Savatcha bo'sh 🛒<button className="btn gold" style={{ marginTop: 18 }} onClick={() => go('home')}>Menyuga o'tish</button></div> : <>
            {lines.map((l) => (
              <div className="line" key={l.k}>
                <Pic p={l.p} cls="thumb" />
                <div className="lm"><b>{l.p.name}{l.label && ` (${l.label})`}</b><span>{fmt(l.price * l.qty)}</span></div>
                <div className="qty"><button onClick={() => add(l.p.id, l.idx, -1)}>−</button><b>{l.qty}</b><button onClick={() => add(l.p.id, l.idx, 1)}>+</button></div>
              </div>))}
            <div className="line sw-line"><span>Bunga qo'shimcha ravishda <b>Kola</b>ni atigi {fmt(COLA)}ga qo'shasizmi?</span><button className={'sw' + (cola ? ' on' : '')} onClick={() => setCola(!cola)} /></div>
            <input className="input" autoComplete="name" placeholder="👤 Ism va familiya" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" type="tel" autoComplete="tel" placeholder="📞 Telefon: +998 90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" placeholder="🏠 Manzil: ko'cha, uy, mo'ljal" value={loc} onChange={(e) => setLoc(e.target.value)} />
            {geo ? (
              <div className="geo ok"><span>✅ Joylashuv belgilandi</span><a href={geo} target="_blank" rel="noreferrer">Xarita</a><button onClick={() => setGeo('')}>✕</button></div>
            ) : (
              <button className="ghost wide" onClick={getGeo}>📍 Joylashuvimni belgilash</button>
            )}
            {geo && <button className="ghost wide" onClick={getGeo}>🔄 Joylashuvni yangilash</button>}
            <div className="sum"><span>Jami:</span><b>{fmt(total)}</b></div>
            <button className="btn gold" disabled={busy} onClick={confirmOrder}>{busy ? 'Yuborilmoqda…' : 'Buyurtmani tasdiqlash'}</button>
          </>}
        </div>
      )}

      {page === 'orders' && (
        <div className="page">
          <h1 className="title">Buyurtmalar</h1>
          {!myOrders.length && <div className="empty">Hali buyurtma yo'q 📭<button className="btn gold" style={{ marginTop: 18 }} onClick={() => go('home')}>Buyurtma berish</button></div>}
          {myOrders.map((o) => (
            <div className="ocard" key={o.id}>
              <div className="row"><b>№{o.id}</b><span className={'tag ' + o.status}>{statusText[o.status] || o.status}</span></div>
              <div className="muted2">{new Date(o.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
              {o.status !== 'cancelled' && (
                <div className="steps">
                  <span className="st on"><i />Qabul qilindi</span><u className={o.status === 'delivered' ? 'on' : ''} />
                  <span className={'st' + (o.status === 'delivered' ? ' on' : '')}><i />Yetkazildi</span>
                </div>
              )}
              <ul className="items">{o.items.map((i, k) => <li key={k}><span>{i.name}{i.label ? ` (${i.label})` : ''} ×{i.qty}</span><em>{fmt(i.price * i.qty)}</em></li>)}</ul>
              <div className="row"><b className="gt">{fmt(o.total)}</b><button className="ghost" onClick={() => reorder(o)}>↻ Yana shundan</button></div>
            </div>))}
        </div>
      )}

      {page === 'profile' && (
        <div className="page">
          <h1 className="title">Profil</h1>
          <div className="pcard">
            <div className="av">{(name.trim() || 'M')[0].toUpperCase()}</div>
            <div><b>{name.trim() || 'Mehmon'}</b><div className="muted2">Mijoz</div></div>
          </div>
          <label className="lbl">Ism va familiya</label>
          <input className="input" autoComplete="name" placeholder="Alisher Karimov" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="lbl">Telefon</label>
          <input className="input" type="tel" placeholder="+998 90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="lbl">Manzil</label>
          <input className="input" placeholder="Yetkazib berish manzili" value={loc} onChange={(e) => setLoc(e.target.value)} />
          <button className="ghost wide" onClick={() => go('orders')}>📜 Mening buyurtmalarim</button>
        </div>
      )}

      {up && lines.length > 0 && !sheet && page === 'home' && (
        <div className="upsell">
          <div className="uh"><b>Birga olasizmi? 😋</b><button onClick={() => setUp(false)}>✕</button></div>
          <div className="utabs">{UP.map((u, i) => <button key={u[0]} className={i === upTab ? 'on' : ''} onClick={() => setUpTab(i)}>{u[1]}</button>)}</div>
          <div className="urow">
            {upItems.map((p) => (
              <div className="uc" key={p.id}>
                <Pic p={p} cls="uimg" />
                <div className="un">{p.name}</div>
                <div className="up"><b>{fmt(vPrice(p, 0))}</b>{p.variants?.length > 1 && <small> {p.variants[0].l}</small>}</div>
                <div className="ctl sm">
                  {qtyOf(p.id) > 0 && <><button className="minus" onClick={() => subOne(p)}>−</button><span className="qn">{qtyOf(p.id)}</span></>}
                  <button className="plus gold sm" onClick={(e) => addFromUpsell(e, p)}>+</button>
                </div>
              </div>))}
          </div>
          <button className="btn gold" onClick={() => go('cart')}>Savatchaga o'tish · {fmt(total)}</button>
        </div>
      )}

      {sheet && <>
        <div className="shade" onClick={() => setSheet(null)} />
        <div className="sheet">
          <div className="grab" />
          <Pic p={sheet} cls="pic" />
          <div className="in">
            <h2 className="title">{sheet.name}</h2>
            {sheet.description && <div className="muted" style={{ marginTop: 6 }}>{sheet.description}</div>}
            {sheet.variants?.length > 0 && <div className="sizes">{sheet.variants.map((v, i) => <button key={i} className={'sz' + (i === sIdx ? ' on' : '')} onClick={() => setSIdx(i)}>{v.l} · {fmt(v.p)}</button>)}</div>}
            {sheet.ingredients?.length > 0 && <><b className="soft">Tarkibi:</b><ul>{sheet.ingredients.map((x) => <li key={x}>{x}</li>)}</ul></>}
          </div>
          <div className="sticky"><button className="btn gold" onClick={addFromSheet}>Savatchaga qo'shish — {fmt(vPrice(sheet, sIdx))}</button></div>
        </div>
      </>}

      {page === 'home' && count > 0 && !up && !sheet && (
        <button className="cartbar gold" onClick={() => go('cart')}><span>🛒 {count} ta</span><span>Savatchaga o'tish</span><b>{fmt(total)}</b></button>
      )}

      <nav className="nav">
        {[['home', '🏠', 'Asosiy'], ['cart', '🛒', 'Savatcha'], ['orders', '🧾', 'Buyurtmalar'], ['profile', '👤', 'Profil']].map(([k, ic, t]) => (
          <button key={k} className={page === k ? 'on' : ''} onClick={() => go(k)}>
            <b id={k === 'cart' ? 'navcart' : undefined}>{ic}</b>{t}{k === 'cart' && count > 0 && <span className="badge">{count}</span>}
          </button>))}
      </nav>
    </div>
  );
}
