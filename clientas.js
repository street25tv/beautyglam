/* Panel de administración · Clientas: ficha, consentimientos y fidelización.
 * Usa las funciones del panel (api, $, esc, nav, bindNav, S, pesosC, fechaCorta). */

const MESES_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
let CL = { sub: 'fichas', q: '' };

(function estilosClientas() {
  const st = document.createElement('style');
  st.textContent = `
    .cl-item { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--line); cursor: pointer; }
    .cl-item:last-child { border-bottom: 0; }
    .cl-item b { display: block; }
    .cl-item .der { text-align: right; font-size: 13px; color: var(--sub); white-space: nowrap; }
    .alerta { display: inline-block; background: #4a2420; color: #ffb4a8; border-radius: 999px; padding: 1px 8px; font-size: 12px; font-weight: 600; margin-top: 3px; }
    .ficha-top { display: flex; gap: 12px; align-items: center; }
    .ficha-top .ini { flex: none; width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--acc); display: grid; place-items: center;
      font-family: Lora, Georgia, serif; font-size: 24px; color: var(--acc); }
    .mini-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    .mini-kpis div { background: var(--card2, #2e231e); border-radius: 10px; padding: 8px; text-align: center; }
    .mini-kpis b { display: block; font-size: 17px; }
    .mini-kpis span { font-size: 12px; color: var(--sub); }
    .firma-img { display: block; max-width: 100%; background: #fff; border-radius: 8px; margin-top: 6px; }
    .resp { font-size: 13px; margin-top: 6px; }
    .resp div { padding: 3px 0; border-bottom: 1px dotted var(--line); }
    .resp .si { color: #ffb4a8; font-weight: 600; }
    .estrellas-s { color: var(--acc); letter-spacing: 1px; }
    .fid-item { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--line); }
    .fid-item:last-child { border-bottom: 0; }
    .fid-item .btn.mini { flex: none; }
    .tarjeta-reg { border: 2px dashed var(--acc); border-radius: 14px; padding: 14px; text-align: center; margin-top: 10px; }
    .tarjeta-reg .cod { font-family: Lora, Georgia, serif; font-size: 28px; letter-spacing: 2px; color: var(--acc); }
    .cumple-sel { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; }
  `;
  document.head.appendChild(st);
})();

function subNavClientas() {
  const s = [['fichas', 'Fichas'], ['fidel', 'Fidelización'], ['tarjetas', 'Tarjetas regalo']];
  return `<div class="chips">${s.map(x => `<button class="chip ${CL.sub === x[0] ? 'on' : ''}" data-sub="${x[0]}">${x[1]}</button>`).join('')}</div>`;
}
function bindSubClientas() {
  document.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => { CL.sub = b.dataset.sub; cargarClientas(); });
}

async function cargarClientas(msg) {
  if (CL.sub === 'fidel' || CL.sub === 'tarjetas') return cargarFidelizacion(msg);
  $('#app').innerHTML = nav('clientas') + subNavClientas() + `
    ${msg ? `<div class="okmsg">${esc(msg)}</div>` : ''}
    <div class="card"><label for="cl-q" style="margin-top:0">Buscar por nombre o WhatsApp</label><input id="cl-q" value="${esc(CL.q)}" placeholder="Ana, 300…" autocomplete="off"></div>
    <div class="card" id="cl-lista"><p class="muted">Cargando…</p></div>`;
  bindNav(); bindSubClientas();
  let t = null;
  $('#cl-q').oninput = () => { clearTimeout(t); t = setTimeout(() => { CL.q = $('#cl-q').value.trim(); listarClientas(); }, 350); };
  listarClientas();
}

async function listarClientas() {
  const caja = $('#cl-lista');
  try {
    const r = await api({ a: 'aClientas', token: S.token, q: CL.q });
    if (!$('#cl-lista')) return;
    caja.innerHTML = `<div class="muted">${CL.q ? r.clientas.length + ' resultados' : 'Últimas clientas · ' + r.total + ' en total'}</div>` +
      (r.clientas.length ? r.clientas.map(c => `<div class="cl-item" data-cl="${esc(c.id)}">
        <div><b>${esc(c.nombre)}</b><span class="muted">${esc(c.tel ? '+' + c.tel : 'Sin WhatsApp')}${c.cumple ? ' · 🎂 ' + esc(c.cumple) : ''}</span>
          ${c.alergias ? `<div class="alerta">⚠ ${esc(c.alergias)}</div>` : ''}</div>
        <div class="der">${c.visitas} ${c.visitas === 1 ? 'visita' : 'visitas'}<br>${c.ultima ? esc(fechaCorta(c.ultima)) : '—'}</div></div>`).join('')
        : '<p class="muted">No encontré clientas con esa búsqueda.</p>');
    caja.querySelectorAll('[data-cl]').forEach(x => x.onclick = () => vistaFicha(x.dataset.cl));
  } catch (e) { caja.innerHTML = `<div class="err">${esc(e.message)}</div>`; }
}

async function vistaFicha(id, msg) {
  $('#app').innerHTML = nav('clientas') + '<p class="muted" style="text-align:center;margin-top:24px">Cargando ficha…</p>';
  bindNav();
  let f;
  try { f = await api({ a: 'aClienta', token: S.token, id }); }
  catch (e) { $('#app').innerHTML = nav('clientas') + `<div class="err">${esc(e.message)}</div>`; bindNav(); return; }
  const [cm, cd] = (f.cumple || '').split('-');
  const vig = Object.keys(f.vigentes || {});
  $('#app').innerHTML = nav('clientas') + `
    <div class="top" style="margin-top:6px"><button class="link" id="volver">← Clientas</button>${f.wa ? `<a class="btn mini wa" target="_blank" rel="noopener" href="${esc(f.wa)}">WhatsApp</a>` : ''}</div>
    ${msg ? `<div class="okmsg">${esc(msg)}</div>` : ''}
    <div class="card">
      <div class="ficha-top"><div class="ini">${esc((f.nombre || '?').charAt(0).toUpperCase())}</div>
        <div><b style="font-size:18px">${esc(f.nombre)}</b><div class="muted">${f.tel ? '+' + esc(f.tel) : 'Sin WhatsApp'}${f.cumpleTxt ? ' · 🎂 ' + esc(f.cumpleTxt) : ''}</div>
          ${f.alergias ? `<div class="alerta">⚠ Alergias: ${esc(f.alergias)}</div>` : ''}</div></div>
      <div class="mini-kpis">
        <div><b>${f.visitas}</b><span>visitas</span></div>
        <div><b>${pesosC(f.gasto)}</b><span>ha pagado</span></div>
        <div><b>${f.noAsistio}</b><span>no asistió</span></div>
      </div>
      ${f.favoritos.length ? `<div class="muted" style="margin-top:10px">Sus servicios: ${esc(f.favoritos.join(', '))}</div>` : ''}
      ${f.profesionales.length ? `<div class="muted">La atienden: ${esc(f.profesionales.join(', '))}</div>` : ''}
      ${f.membresias.length ? `<div class="muted">Membresía: ${esc(f.membresias.join(' · '))}</div>` : ''}
      <div class="muted">Clienta desde ${f.registro ? esc(fechaCorta(f.registro)) : '—'} · última visita ${f.ultima ? esc(fechaCorta(f.ultima)) : '—'}</div>
    </div>
    <div class="card">
      <b>Ficha</b>
      <div class="fila"><div><label for="fc-nombre">Nombre</label><input id="fc-nombre" maxlength="60" value="${esc(f.nombre)}"></div>
        <div><label for="fc-tel">WhatsApp</label><input id="fc-tel" inputmode="numeric" value="${esc(f.tel ? f.tel.replace(/^57/, '') : '')}"></div></div>
      <label>Cumpleaños</label>
      <div class="cumple-sel"><select id="fc-dia"><option value="">Día</option>${Array.from({ length: 31 }, (_, i) => `<option ${Number(cd) === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
        <select id="fc-mes"><option value="">Mes</option>${MESES_L.map((m, i) => `<option value="${i + 1}" ${Number(cm) === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
      <label for="fc-al">Alergias y condiciones de salud</label><input id="fc-al" maxlength="300" value="${esc(f.alergias)}" placeholder="Látex, adhesivo de pestañas, embarazo…">
      <label for="fc-pref">Preferencias y ficha técnica</label><textarea id="fc-pref" rows="3" maxlength="500" placeholder="Forma de uña almendra, largo M · Pestañas 10-12 mm curva C · Tono nude…">${esc(f.preferencias)}</textarea>
      <label for="fc-notas">Notas internas</label><textarea id="fc-notas" rows="2" maxlength="500">${esc(f.notas)}</textarea>
      <div id="fc-msg" class="err"></div>
      <button class="btn" id="fc-guardar">Guardar ficha</button>
    </div>
    <div class="card">
      <b>Consentimientos</b> ${vig.length ? `<span class="tag si">Vigente: ${esc(vig.join(', '))}</span>` : '<span class="tag pend">Ninguno vigente</span>'}
      ${f.consentimientos.length ? f.consentimientos.map((c, i) => `<div class="fid-item"><div><b>${esc(fechaCorta(c.fecha))} · ${esc(c.categorias)}</b><div class="muted">Firmó: ${esc(c.firmadoPor)}</div></div>
        <button class="btn mini sec" data-ver="${i}">Ver</button></div><div class="hidden" id="ci-${i}">
        <div class="resp">${Object.keys(c.respuestas).map(k => `<div>${esc(k)} <span class="${c.respuestas[k] === 'Sí' ? 'si' : ''}">${esc(c.respuestas[k])}</span></div>`).join('')}</div>
        ${c.firma ? `<img class="firma-img" src="${esc(c.firma)}" alt="Firma">` : ''}</div>`).join('') : '<p class="muted">Aún no ha firmado. Se le pide al reservar servicios de pestañas, cejas o depilación.</p>'}
    </div>
    ${f.encuestas.length ? `<div class="card"><b>Encuestas</b>${f.encuestas.map(e => `<div class="fid-item"><div><span class="estrellas-s">${'★'.repeat(e.puntaje)}${'☆'.repeat(5 - e.puntaje)}</span>
      <div class="muted">${esc(fechaCorta(e.fecha))} · ${esc(e.servicio)} con ${esc(e.profesional)}</div>${e.comentario ? `<div>“${esc(e.comentario)}”</div>` : ''}</div></div>`).join('')}</div>` : ''}
    <div class="card"><b>Historial de citas</b>
      ${f.citas.length ? f.citas.map(c => `<div class="fid-item"><div><b>${esc(fechaCorta(c.fecha))} · ${esc(c.hora12)}</b>
        <div class="muted">${esc(c.servicio)} · ${esc(c.profesional)}</div>${c.nota ? `<div class="muted">📝 ${esc(c.nota)}</div>` : ''}</div>
        <div style="text-align:right"><span class="tag ${({ Atendida: 'si', Cancelada: 'pend', 'No asistió': 'pend' })[c.estado] || ''}">${esc(c.estado)}</span><div class="muted">${pesosC(c.precio)}</div></div></div>`).join('') : '<p class="muted">Sin citas.</p>'}
    </div>`;
  bindNav();
  $('#volver').onclick = () => { CL.sub = 'fichas'; cargarClientas(); };
  document.querySelectorAll('[data-ver]').forEach(b => b.onclick = () => { $('#ci-' + b.dataset.ver).classList.toggle('hidden'); });
  $('#fc-guardar').onclick = async () => {
    const b = $('#fc-guardar'); b.disabled = true; $('#fc-msg').textContent = '';
    const dia = $('#fc-dia').value, mes = $('#fc-mes').value;
    if ((dia && !mes) || (!dia && mes)) { $('#fc-msg').textContent = 'Elige día y mes del cumpleaños.'; b.disabled = false; return; }
    try {
      const r = await api({ a: 'aGuardarClienta', token: S.token, id, nombre: $('#fc-nombre').value, tel: $('#fc-tel').value, cumple: dia ? mes + '-' + dia : '',
        alergias: $('#fc-al').value, preferencias: $('#fc-pref').value, notas: $('#fc-notas').value });
      vistaFicha(id, r.texto);
    } catch (e) { b.disabled = false; $('#fc-msg').textContent = e.message; }
  };
}

/* ---------- Fidelización y tarjetas regalo ---------- */
let FIDEL = null;
async function cargarFidelizacion(msg, wa) {
  $('#app').innerHTML = nav('clientas') + subNavClientas() + '<p class="muted" style="text-align:center;margin-top:24px">Cargando…</p>';
  bindNav(); bindSubClientas();
  try { FIDEL = await api({ a: 'aFidelizacion', token: S.token }); }
  catch (e) { $('#app').innerHTML = nav('clientas') + subNavClientas() + `<div class="err">${esc(e.message)}</div>`; bindNav(); bindSubClientas(); return; }
  (CL.sub === 'tarjetas' ? vistaTarjetas : vistaFidel)(msg, wa);
}

/** Abre el WhatsApp y deja registrado el aviso (para no repetirlo). */
function avisoWa(tipo, cliente, detalle, boton) {
  api({ a: 'aAviso', token: S.token, tipo, cliente, detalle }).catch(() => {});
  const fila = boton.closest('.fid-item');
  if (fila) { fila.style.opacity = '.45'; boton.textContent = 'Enviado ✓'; }
}

function vistaFidel(msg) {
  const d = FIDEL, e = d.encuestas;
  $('#app').innerHTML = nav('clientas') + subNavClientas() + `
    ${msg ? `<div class="okmsg">${esc(msg)}</div>` : ''}
    <div class="card"><b>🎂 Cumpleaños de esta semana</b>
      <p class="muted" style="margin:4px 0 0">Mensaje con ${d.descuento}% de descuento (cámbialo en Configuración → "Descuento cumpleaños (%)").</p>
      ${d.cumple.length ? d.cumple.map(c => `<div class="fid-item" ${c.enviado ? 'style="opacity:.45"' : ''}><div><b>${esc(c.nombre)}</b><div class="muted">${esc(c.cuando)} · ${esc(c.cumpleTxt)}</div></div>
        ${c.wa ? `<a class="btn mini ${c.enviado ? 'sec' : 'wa'}" target="_blank" rel="noopener" href="${esc(c.wa)}" data-aviso="Cumpleaños" data-cli="${esc(c.id)}">${c.enviado ? 'Enviado ✓' : 'Felicitar'}</a>` : '<span class="muted">Sin WhatsApp</span>'}</div>`).join('')
        : '<p class="muted">Nadie cumple años esta semana. Las clientas dan su cumpleaños al reservar o lo agregas en su ficha.</p>'}
    </div>
    <div class="card"><b>💅 Toca mantenimiento</b>
      <p class="muted" style="margin:4px 0 0">Clientas que ya cumplieron el tiempo de su servicio y no tienen cita. Los días se ajustan en Servicios → Editar.</p>
      ${d.mantenimiento.length ? d.mantenimiento.map(c => `<div class="fid-item"><div><b>${esc(c.nombre)}</b><div class="muted">${esc(c.servicio)} hace ${c.dias} días (cada ${c.cada}) · ${esc(c.profesional)}</div></div>
        ${c.wa ? `<a class="btn mini wa" target="_blank" rel="noopener" href="${esc(c.wa)}" data-aviso="Mantenimiento" data-cli="${esc(c.id)}" data-det="${esc(c.servicio)}">Recordar</a>` : '<span class="muted">Sin WhatsApp</span>'}</div>`).join('')
        : '<p class="muted">Nadie pendiente por ahora.</p>'}
    </div>
    <div class="card"><b>⭐ Encuestas de satisfacción</b>
      <p class="muted" style="margin:4px 0 0">El link va en el WhatsApp de cada factura. Quien califica 4 o 5 ve el botón para dejar reseña en Google.</p>
      ${d.resena ? '' : '<div class="err">Falta el link de reseñas de Google: ponlo en la hoja → Configuración → "Link reseñas Google".</div>'}
      <div class="mini-kpis"><div><b>${e.promedio ? e.promedio.toFixed(1) : '—'}</b><span>promedio</span></div><div><b>${e.total}</b><span>respuestas</span></div><div><b>${e.resenas}</b><span>fueron a Google</span></div></div>
      ${e.porProfesional.map(p => `<div class="fid-item"><span>${esc(p.profesional)}</span><span><span class="estrellas-s">★</span> ${p.promedio.toFixed(1)} <span class="muted">(${p.total})</span></span></div>`).join('')}
      ${e.ultimas.length ? '<div class="muted" style="margin-top:10px">Últimas</div>' + e.ultimas.map(x => `<div class="fid-item"><div><span class="estrellas-s">${'★'.repeat(x.puntaje)}${'☆'.repeat(5 - x.puntaje)}</span>
        <div class="muted">${esc(fechaCorta(x.fecha))} · ${esc(x.cliente)} · ${esc(x.servicio)} con ${esc(x.profesional)}</div>${x.comentario ? `<div>“${esc(x.comentario)}”</div>` : ''}</div></div>`).join('') : ''}
    </div>`;
  bindNav(); bindSubClientas();
  document.querySelectorAll('[data-aviso]').forEach(a => a.addEventListener('click', () => avisoWa(a.dataset.aviso, a.dataset.cli, a.dataset.det || '', a)));
}

function vistaTarjetas(msg, wa, nueva) {
  const d = FIDEL;
  $('#app').innerHTML = nav('clientas') + subNavClientas() + `
    ${msg ? `<div class="okmsg">${esc(msg)}</div>` : ''}
    ${nueva ? `<div class="tarjeta-reg"><div class="muted">Tarjeta regalo</div><div class="cod">${esc(nueva.codigo)}</div><b>${pesosC(nueva.valor)}</b>
      <div class="muted">${nueva.para ? 'Para ' + esc(nueva.para) + ' · ' : ''}vence el ${esc(nueva.venceTxt)}</div></div>
      ${wa ? `<a class="btn wa" target="_blank" rel="noopener" href="${esc(wa)}">Enviar la tarjeta por WhatsApp</a>` : ''}` : ''}
    <div class="card"><b>Vender tarjeta regalo</b>
      <div class="fila"><div><label for="tg-comp">Quién la compra</label><input id="tg-comp" maxlength="60"></div>
        <div><label for="tg-tel">Su WhatsApp</label><input id="tg-tel" inputmode="numeric" placeholder="300 123 4567"></div></div>
      <div class="fila"><div><label for="tg-para">Para (opcional)</label><input id="tg-para" maxlength="60"></div>
        <div><label for="tg-telp">WhatsApp de quien la recibe</label><input id="tg-telp" inputmode="numeric" placeholder="opcional"></div></div>
      <div class="fila"><div><label for="tg-valor">Valor</label><input id="tg-valor" inputmode="numeric" placeholder="100000"></div>
        <div><label for="tg-medio">Medio de pago</label><select id="tg-medio">${(d.medios || ['Efectivo']).map(m => `<option>${esc(m)}</option>`).join('')}</select></div></div>
      <div class="muted">El dinero entra hoy a caja. Al usarla, en Facturar elige "Tarjeta regalo" y escribe el código.</div>
      <div id="tg-msg" class="err"></div>
      <button class="btn" id="tg-vender">Vender tarjeta</button>
    </div>
    <div class="card"><b>Tarjetas</b> <span class="muted">· saldo por usar ${pesosC(d.tarjetasSaldo)}</span>
      ${d.tarjetas.length ? d.tarjetas.map(t => `<div class="fid-item"><div><b>${esc(t.codigo)}</b> <span class="tag ${t.estado === 'Activa' ? 'si' : 'pend'}">${esc(t.estado)}</span>
        <div class="muted">${pesosC(t.saldo)} de ${pesosC(t.valor)} · ${esc(t.comprador)}${t.para ? ' → ' + esc(t.para) : ''} · vence ${esc(fechaCorta(t.vence))}</div>
        ${t.usos ? `<div class="muted">Usos: ${esc(t.usos)}</div>` : ''}</div>
        ${t.estado === 'Activa' ? `<button class="btn mini sec" data-anular="${esc(t.codigo)}">Anular</button>` : ''}</div>`).join('') : '<p class="muted">Todavía no hay tarjetas vendidas.</p>'}
    </div>`;
  bindNav(); bindSubClientas();
  $('#tg-vender').onclick = async () => {
    const b = $('#tg-vender'); b.disabled = true; $('#tg-msg').textContent = '';
    try {
      const r = await api({ a: 'aVenderTarjeta', token: S.token, comprador: $('#tg-comp').value, tel: $('#tg-tel').value, para: $('#tg-para').value,
        telPara: $('#tg-telp').value, valor: $('#tg-valor').value, medio: $('#tg-medio').value });
      FIDEL = await api({ a: 'aFidelizacion', token: S.token });
      vistaTarjetas(r.texto, r.wa, r.tarjeta);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { b.disabled = false; $('#tg-msg').textContent = e.message; }
  };
  document.querySelectorAll('[data-anular]').forEach(b => b.onclick = async () => {
    if (!confirm('¿Anular la tarjeta ' + b.dataset.anular + '? Ya no se podrá usar.')) return;
    try { const r = await api({ a: 'aAnularTarjeta', token: S.token, codigo: b.dataset.anular }); FIDEL = await api({ a: 'aFidelizacion', token: S.token }); vistaTarjetas(r.texto); }
    catch (e) { alert(e.message); }
  });
}
