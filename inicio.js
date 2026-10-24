/* Panel de administración · Inicio (tablero del día), Mensajes (plantillas) e Importar clientas.
 * Usa las funciones del panel (api, $, esc, nav, bindNav, S, pesosC, fechaCorta, h12, cargarAgenda, A). */

(function estilosInicio() {
  const st = document.createElement('style');
  st.textContent = `
    .ini-hola { margin: 14px 2px 4px; }
    .ini-hola b { font-family: Lora, 'Cormorant Garamond', Georgia, serif; font-size: 24px; display: block; }
    .ini-alertas { display: grid; gap: 8px; margin-top: 10px; }
    .ini-alerta { display: flex; align-items: center; gap: 10px; background: #2b1f1a; border: 1px solid #7a5f52; border-radius: 12px; padding: 10px 12px; cursor: pointer; text-align: left; color: var(--txt); font: inherit; width: 100%; }
    .ini-alerta .n { flex: none; min-width: 30px; height: 30px; border-radius: 999px; background: var(--acc); color: #2b170f; display: grid; place-items: center; font-weight: 700; padding: 0 8px; }
    .ini-alerta small { display: block; color: var(--sub); }
    .ini-alerta.ok { background: rgba(47, 191, 113, .1); border-color: rgba(47, 191, 113, .5); cursor: default; }
    .ini-alerta.ok .n { background: var(--ok); color: #04210f; }
    .kpi .delta { font-size: 12px; font-weight: 600; }
    .kpi .delta.up { color: var(--ok); } .kpi .delta.down { color: #ff8f8f; }
    .ini-cita { display: flex; gap: 10px; align-items: center; padding: 9px 0; border-bottom: 1px dashed var(--line); cursor: pointer; }
    .ini-cita:last-child { border-bottom: 0; }
    .ini-cita .h { flex: none; width: 84px; font-weight: 700; white-space: nowrap; font-size: 14px; }
    .ini-cita .h small { display: block; font-weight: 400; color: var(--sub); font-size: 11px; }
    .ini-cita .d { flex: 1; min-width: 0; } .ini-cita .d div { color: var(--sub); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ini-cita .live { display: inline-block; background: rgba(47, 191, 113, .18); color: #6fe3a3; border-radius: 999px; font-size: 11px; font-weight: 700; padding: 1px 7px; margin-left: 6px; }
    .barra { height: 8px; border-radius: 999px; background: var(--card2, #2e231e); overflow: hidden; margin-top: 4px; }
    .barra i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #9c7b6c, var(--acc)); }
    .oc-fila { display: grid; grid-template-columns: 1fr 44px; gap: 2px 8px; align-items: center; margin-top: 8px; font-size: 14px; }
    .oc-fila .barra { grid-column: 1 / -1; margin-top: 0; }
    .oc-fila b { text-align: right; }
    .ini-top div { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted var(--line); font-size: 14px; }
    .ini-top div:last-child { border-bottom: 0; }
    .pl-card textarea { min-height: 120px; font-size: 14px; line-height: 1.4; }
    .pl-vars { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }
    .pl-vars button { border: 1px dashed #7a5f52; background: transparent; color: var(--acc); border-radius: 999px; padding: 3px 9px; font-size: 12px; cursor: pointer; }
    .pl-prev { white-space: pre-wrap; background: #0f2b1c; color: #dff7e8; border-radius: 12px 12px 12px 4px; padding: 10px 12px; font-size: 14px; margin-top: 8px; line-height: 1.4; }
    .pl-tag { display: inline-block; font-size: 11px; font-weight: 700; border-radius: 999px; padding: 1px 8px; margin-left: 6px; background: var(--card2, #2e231e); color: var(--sub); }
    .pl-tag.propio { background: var(--acc); color: #2b170f; }
    .imp-tabla { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .imp-tabla th, .imp-tabla td { text-align: left; padding: 5px 4px; border-bottom: 1px solid var(--line); }
    .imp-avisos { font-size: 13px; color: #ffcf9e; margin-top: 8px; max-height: 160px; overflow: auto; }
  `;
  document.head.appendChild(st);
})();

/* ---------- Inicio ---------- */
async function cargarInicio() {
  $('#app').innerHTML = nav('inicio') + '<p class="muted" style="text-align:center;margin-top:24px">Cargando el resumen del día…</p>';
  bindNav();
  let d;
  try { d = await api({ a: 'aInicio', token: S.token }); }
  catch (e) {
    $('#app').innerHTML = nav('inicio') + `<div class="err">${esc(e.message)}</div><button class="btn sec" id="re">Reintentar</button>`;
    bindNav(); $('#re').onclick = cargarInicio; return;
  }
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const alertas = [];
  if (d.porConfirmar) alertas.push({ n: d.porConfirmar, t: d.porConfirmar === 1 ? 'Cita por confirmar' : 'Citas por confirmar', s: d.abonosPendientes ? d.abonosPendientes + (d.abonosPendientes === 1 ? ' espera abono' : ' esperan abono') : 'Revísalas en la agenda', ir: 'agenda' });
  if (d.cumpleTotal) alertas.push({ n: d.cumpleTotal, t: 'Cumpleaños esta semana', s: d.cumple.map(x => x.nombre.split(' ')[0] + ' (' + x.cuando.toLowerCase() + ')').join(', '), ir: 'fidel' });
  if (d.mantenimiento) alertas.push({ n: d.mantenimiento, t: 'Clientas para mantenimiento', s: 'Escríbeles para que vuelvan a agendar', ir: 'fidel' });
  if (d.espera) alertas.push({ n: d.espera, t: 'En lista de espera', s: 'Avísales si se libera un cupo', ir: 'agenda' });
  const delta = (a, b) => {
    if (!b) return '';
    const p = Math.round((a - b) * 100 / b);
    return `<span class="delta ${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p)}% vs. mes pasado</span>`;
  };
  const c = d.citas;
  $('#app').innerHTML = nav('inicio') + `
    <div class="ini-hola"><b>${saludo} ✨</b><span class="muted">${esc(d.hoyTxt.charAt(0).toUpperCase() + d.hoyTxt.slice(1))} · ${c.total} ${c.total === 1 ? 'cita' : 'citas'} hoy</span></div>
    <div class="ini-alertas">${alertas.length ? alertas.map(a => `<button class="ini-alerta" data-ir="${a.ir}"><span class="n">${a.n}</span><span><b>${esc(a.t)}</b><small>${esc(a.s)}</small></span></button>`).join('')
      : '<div class="ini-alerta ok"><span class="n">✓</span><span><b>Todo al día</b><small>No hay citas por confirmar ni pendientes</small></span></div>'}</div>
    <div class="kpis">
      <div class="kpi acc"><span>Ingresos hoy</span><b>${pesosC(d.ingresos.hoy)}</b><small>Semana: ${pesosC(d.ingresos.semana)}</small></div>
      <div class="kpi"><span>Ingresos del mes</span><b>${pesosC(d.ingresos.mes)}</b>${delta(d.ingresos.mes, d.ingresos.mesAnterior) || `<small>${d.ingresos.servicios} servicios</small>`}</div>
      <div class="kpi"><span>Utilidad del mes</span><b>${pesosC(d.ingresos.utilidadMes)}</b><small>Egresos: ${pesosC(d.ingresos.egresosMes)}</small></div>
      <div class="kpi"><span>Ocupación semana</span><b>${d.ocupacion.pct}%</b><div class="barra"><i style="width:${d.ocupacion.pct}%"></i></div></div>
      <div class="kpi"><span>Clientas</span><b>${d.clientas.total}</b><small>${d.clientas.nuevasMes} nuevas este mes</small></div>
      <div class="kpi"><span>Ticket promedio</span><b>${pesosC(d.ingresos.ticket)}</b><small>por servicio, este mes</small></div>
    </div>
    <div class="card"><div class="top" style="margin:0"><b>Próximas citas de hoy</b><button class="link" data-ir="agenda">Ver agenda →</button></div>
      <div class="muted" style="font-size:13px">${c.confirmadas} confirmadas · ${c.pendientes} pendientes · ${c.finalizadas + c.atendidas} terminadas${c.noAsistio ? ' · ' + c.noAsistio + ' no asistió' : ''}</div>
      ${d.proximas.length ? d.proximas.map(x => `<div class="ini-cita" data-cita="${esc(x.id)}"><div class="h">${esc(h12(x.hora))}<small>a ${esc(h12(x.fin))}</small></div>
        <div class="d"><b>${esc(x.cliente)}</b>${x.enCurso ? '<span class="live">EN CURSO</span>' : ''}${x.estado === 'Pendiente' ? '<span class="pl-tag">Pendiente</span>' : ''}<div>${esc(x.servicio)} · ${esc(x.profesional)}</div></div></div>`).join('')
        : '<p class="muted">No quedan más citas por hoy.</p>'}
    </div>
    <div class="card"><b>Ocupación por profesional</b><div class="muted" style="font-size:13px">Horas con cita frente a sus horas de turno esta semana</div>
      ${d.ocupacion.profesionales.map(p => `<div class="oc-fila"><span>${esc(p.nombre)}</span><b>${p.pct}%</b><div class="barra"><i style="width:${p.pct}%"></i></div></div>`).join('')}
    </div>
    ${d.top.length ? `<div class="card ini-top"><b>Lo más pedido este mes</b>${d.top.map(t => `<div><span>${esc(t.servicio)}</span><b>${t.veces}</b></div>`).join('')}</div>` : ''}
    <button class="btn sec" id="ini-recargar">Actualizar</button>`;
  bindNav();
  $('#ini-recargar').onclick = cargarInicio;
  document.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => {
    if (b.dataset.ir === 'fidel' && typeof cargarClientas === 'function') { CL.sub = 'fidel'; cargarClientas(); }
    else { A.fecha = d.hoy; cargarAgenda(); }
  });
  document.querySelectorAll('[data-cita]').forEach(x => x.onclick = () => {
    A.fecha = d.hoy; cargarAgenda();
    const id = x.dataset.cita, t0 = Date.now();
    const buscar = () => { const el = document.getElementById('cita-' + id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); else if (Date.now() - t0 < 6000) setTimeout(buscar, 300); };
    setTimeout(buscar, 400);
  });
}

/* ---------- Mensajes (plantillas) ---------- */
async function vistaMensajes(msg) {
  $('#app').innerHTML = nav('clientas') + subNavClientas() + '<p class="muted" style="text-align:center;margin-top:20px">Cargando mensajes…</p>';
  bindNav(); bindSubClientas();
  let d;
  try { d = await api({ a: 'aPlantillas', token: S.token }); }
  catch (e) { $('#app').innerHTML = nav('clientas') + subNavClientas() + `<div class="err">${esc(e.message)}</div>`; bindNav(); bindSubClientas(); return; }
  const ej = d.ejemplo;
  const vista = t => t.replace(/\{(\w+)\}/g, (m, k) => ej[k] != null ? ej[k] : m).replace(/\n{3,}/g, '\n\n').trim();
  const NOMBRES = { nombre: 'nombre', negocio: 'salón', fecha: 'fecha', hora: 'hora', profesional: 'profesional', servicio: 'servicio', direccion: 'dirección',
    enlace: 'link de su cita', aviso: 'advertencia', cuando: 'cuándo', link: 'link para reservar', descuento: '% descuento', dias: 'días' };
  $('#app').innerHTML = nav('clientas') + subNavClientas() + `
    ${msg ? `<div class="okmsg">${esc(msg)}</div>` : ''}
    <div class="card"><b>Mensajes de WhatsApp</b><p class="muted" style="margin:4px 0 0">Escribe cada mensaje como quieras. Toca una etiqueta para insertar el dato de la clienta; el sistema lo reemplaza al enviar. Puedes usar emojis.</p></div>
    ${d.plantillas.map((t, i) => `<div class="card pl-card" data-pl="${i}">
      <b>${esc(t.titulo)}</b><span class="pl-tag ${t.valor ? 'propio' : ''}">${t.valor ? 'Personalizado' : 'De fábrica'}</span>
      <div class="pl-vars">${t.vars.map(v => `<button type="button" data-var="{${v}}">+ ${esc(NOMBRES[v] || v)}</button>`).join('')}</div>
      <textarea maxlength="1000">${esc(t.valor || t.defecto)}</textarea>
      <div class="muted" style="font-size:12px;margin-top:6px">Así le llega:</div>
      <div class="pl-prev">${esc(vista(t.valor || t.defecto))}</div>
      <div class="fila" style="margin-top:10px"><button class="btn mini" data-guardar>Guardar</button>${t.valor ? '<button class="btn mini sec" data-fabrica>Volver al de fábrica</button>' : ''}</div>
      <div class="err" data-msg></div>
    </div>`).join('')}`;
  bindNav(); bindSubClientas();
  document.querySelectorAll('[data-pl]').forEach(card => {
    const t = d.plantillas[Number(card.dataset.pl)];
    const ta = card.querySelector('textarea'), prev = card.querySelector('.pl-prev'), m = card.querySelector('[data-msg]');
    ta.oninput = () => { prev.textContent = vista(ta.value); };
    card.querySelectorAll('[data-var]').forEach(b => b.onclick = () => {
      const a = ta.selectionStart ?? ta.value.length, z = ta.selectionEnd ?? a;
      ta.value = ta.value.slice(0, a) + b.dataset.var + ta.value.slice(z);
      ta.focus(); ta.selectionStart = ta.selectionEnd = a + b.dataset.var.length; ta.oninput();
    });
    const guardar = async (texto, boton) => {
      boton.disabled = true; m.textContent = '';
      try { const r = await api({ a: 'aGuardarPlantilla', token: S.token, clave: t.clave, texto }); vistaMensajes(r.texto); }
      catch (e) { m.textContent = e.message; boton.disabled = false; }
    };
    card.querySelector('[data-guardar]').onclick = e => {
      const faltan = ['nombre'].filter(v => t.vars.indexOf(v) >= 0 && ta.value.indexOf('{' + v + '}') < 0);
      if (faltan.length && !confirm('El mensaje no incluye el nombre de la clienta. ¿Guardarlo así?')) return;
      guardar(ta.value, e.target);
    };
    const fab = card.querySelector('[data-fabrica]');
    if (fab) fab.onclick = e => { if (confirm('¿Volver al mensaje de fábrica?')) guardar('', e.target); };
  });
}

/* ---------- Importar clientas ---------- */
const MESES_IMP = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function cumpleDe(txt) {
  const s = String(txt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  if (!s) return '';
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);           // 1990-03-15
  if (m) return Number(m[2]) + '-' + Number(m[3]);
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2,4}))?$/);        // 15/03 o 15/03/1990 (día primero)
  if (m) { let d = Number(m[1]), me = Number(m[2]); if (me > 12 && d <= 12) [d, me] = [me, d]; return me >= 1 && me <= 12 && d >= 1 && d <= 31 ? me + '-' + d : ''; }
  m = s.match(/(\d{1,2})\s*(?:de\s+)?([a-z]{3,})/) || s.match(/([a-z]{3,})\s*(\d{1,2})/);
  if (m) {
    const [d, mesTxt] = /^\d/.test(m[1]) ? [Number(m[1]), m[2]] : [Number(m[2]), m[1]];
    const i = MESES_IMP.findIndex(x => mesTxt.startsWith(x)) ;
    const en = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].findIndex(x => mesTxt.startsWith(x));
    const k = i >= 0 ? i : en;
    if (k >= 0 && d >= 1 && d <= 31) return (k + 1) + '-' + d;
  }
  return '';
}
function separarLinea(l, sep) {
  if (sep !== ',') return l.split(sep);
  const out = []; let cur = '', q = false;
  for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; }
  out.push(cur); return out;
}
/** Texto pegado de Excel/Sheets o archivo CSV → filas { nombre, tel, cumple, notas }. */
function leerTabla(txt) {
  const lineas = String(txt || '').replace(/\r/g, '').split('\n').filter(l => l.trim());
  if (!lineas.length) return [];
  const sep = lineas[0].indexOf('\t') >= 0 ? '\t' : lineas[0].split(';').length > lineas[0].split(',').length ? ';' : ',';
  let celdas = lineas.map(l => separarLinea(l, sep).map(x => x.replace(/^"|"$/g, '').trim()));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const enc = celdas[0].map(norm);
  const col = { nombre: -1, apellido: -1, tel: -1, cumple: -1, notas: -1 };
  enc.forEach((h, i) => {
    if (col.nombre < 0 && /^(nombre|name|cliente|clienta|first name|given name)/.test(h)) col.nombre = i;
    else if (col.apellido < 0 && /(apellido|last name|family name)/.test(h)) col.apellido = i;
    else if (col.tel < 0 && /(whats|tel|cel|movil|phone|numero)/.test(h)) col.tel = i;
    else if (col.cumple < 0 && /(cumple|nacimiento|birth|fecha)/.test(h)) col.cumple = i;
    else if (col.notas < 0 && /(nota|observ|comentario|note)/.test(h)) col.notas = i;
  });
  if (col.nombre >= 0 || col.tel >= 0) celdas = celdas.slice(1);
  else { // sin encabezado: la columna con más dígitos es el teléfono; la primera de texto, el nombre
    const n = Math.max(...celdas.map(r => r.length));
    const dig = Array.from({ length: n }, (_, i) => celdas.filter(r => (r[i] || '').replace(/\D/g, '').length >= 7).length);
    col.tel = dig.indexOf(Math.max(...dig));
    col.nombre = Array.from({ length: n }, (_, i) => i).find(i => i !== col.tel) ?? 0;
    const rest = Array.from({ length: n }, (_, i) => i).filter(i => i !== col.tel && i !== col.nombre);
    col.cumple = rest.find(i => celdas.some(r => cumpleDe(r[i]))) ?? -1;
    col.notas = rest.find(i => i !== col.cumple) ?? -1;
  }
  const v = (r, i) => (i >= 0 ? r[i] || '' : '');
  return celdas.map(r => ({ nombre: (v(r, col.nombre) + ' ' + v(r, col.apellido)).trim(), tel: v(r, col.tel), cumple: cumpleDe(v(r, col.cumple)), notas: v(r, col.notas) }))
    .filter(f => f.nombre || f.tel);
}
/** Contactos del celular (.vcf) → filas. */
function leerVcf(txt) {
  return String(txt || '').replace(/\r/g, '').replace(/\n[ \t]/g, '').split(/BEGIN:VCARD/i).slice(1).map(b => {
    const campo = re => { const m = b.match(re); return m ? m[1].trim() : ''; };
    let nombre = campo(/\nFN[^:\n]*:(.*)/i);
    if (!nombre) { const n = campo(/\nN[^:\n]*:(.*)/i).split(';'); nombre = ((n[1] || '') + ' ' + (n[0] || '')).trim(); }
    const tels = [...b.matchAll(/\nTEL[^:\n]*:(.*)/gi)].map(m => m[1].trim());
    const tel = tels.find(t => /^\+?57?\s*3/.test(t.replace(/[^\d+]/g, ''))) || tels[0] || '';
    const bd = campo(/\nBDAY[^:\n]*:(.*)/i).replace(/^--/, '');
    let cumple = '';
    const m = bd.match(/(\d{4})?-?(\d{2})-?(\d{2})$/);
    if (m) cumple = Number(m[2]) + '-' + Number(m[3]);
    return { nombre, tel, cumple, notas: '' };
  }).filter(f => f.nombre && f.tel);
}

let IMP = { filas: [] };
function vistaImportar() {
  IMP = { filas: [] };
  $('#app').innerHTML = nav('clientas') + subNavClientas() + `
    <div class="top" style="margin-top:6px"><button class="link" id="imp-volver">← Fichas</button></div>
    <div class="card"><b>Importar clientas</b>
      <p class="muted" style="margin:4px 0 0">Trae tu lista de clientas de antes. Si una ya existe (mismo WhatsApp), no se repite: solo se completan los datos que le falten.</p>
      <label>Opción 1 · Archivo</label>
      <input type="file" id="imp-arch" accept=".csv,.txt,.vcf,text/csv,text/vcard,text/x-vcard">
      <div class="muted" style="font-size:12px;margin-top:4px">CSV de Excel o Google Sheets (Archivo → Descargar → CSV), o contactos del celular (.vcf).</div>
      <label for="imp-txt">Opción 2 · Copiar y pegar</label>
      <textarea id="imp-txt" rows="6" placeholder="Copia las columnas desde Excel y pégalas aquí:&#10;Nombre	WhatsApp	Cumpleaños	Notas&#10;Ana Gómez	3001234567	15/03	Prefiere tarde"></textarea>
      <button class="btn sec" id="imp-leer">Revisar lista</button>
      <div id="imp-res"></div>
    </div>`;
  bindNav(); bindSubClientas();
  $('#imp-volver').onclick = () => { CL.sub = 'fichas'; cargarClientas(); };
  $('#imp-arch').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    const t = await f.text();
    IMP.filas = /BEGIN:VCARD/i.test(t) ? leerVcf(t) : leerTabla(t);
    revisarImport();
  };
  $('#imp-leer').onclick = () => { IMP.filas = leerTabla($('#imp-txt').value); revisarImport(); };
}
async function revisarImport() {
  const caja = $('#imp-res');
  if (!IMP.filas.length) { caja.innerHTML = '<div class="err">No encontré clientas. Revisa que haya una columna de nombre y otra de WhatsApp.</div>'; return; }
  caja.innerHTML = '<p class="muted">Revisando ' + IMP.filas.length + ' filas…</p>';
  try {
    const r = await api({ a: 'aImportarClientas', token: S.token, filas: JSON.stringify(IMP.filas), probar: true });
    caja.innerHTML = `
      <table class="imp-tabla"><tr><th>Nombre</th><th>WhatsApp</th><th>Cumple</th></tr>
        ${IMP.filas.slice(0, 6).map(f => `<tr><td>${esc(f.nombre)}</td><td>${esc(f.tel)}</td><td>${esc(f.cumple ? (Number(f.cumple.split('-')[1]) + ' ' + MESES_IMP[Number(f.cumple.split('-')[0]) - 1]) : '—')}</td></tr>`).join('')}
      </table>
      ${IMP.filas.length > 6 ? `<div class="muted" style="font-size:12px">… y ${IMP.filas.length - 6} más</div>` : ''}
      <div class="kpis">
        <div class="kpi acc"><span>Nuevas</span><b>${r.nuevas}</b></div>
        <div class="kpi"><span>Se completan</span><b>${r.completadas}</b><small>ya existían</small></div>
        <div class="kpi"><span>Ya estaban</span><b>${r.omitidas}</b><small>no cambia nada</small></div>
        <div class="kpi"><span>Avisos</span><b>${r.totalErrores}</b></div>
      </div>
      ${r.errores.length ? `<div class="imp-avisos">${r.errores.map(esc).join('<br>')}</div>` : ''}
      ${r.nuevas + r.completadas ? `<button class="btn" id="imp-ok">Importar ${r.nuevas + r.completadas} clientas</button>` : '<p class="muted">No hay nada nuevo para importar.</p>'}
      <div id="imp-msg"></div>`;
    if ($('#imp-ok')) $('#imp-ok').onclick = async e => {
      e.target.disabled = true; e.target.textContent = 'Importando…';
      try {
        const z = await api({ a: 'aImportarClientas', token: S.token, filas: JSON.stringify(IMP.filas) });
        CL.sub = 'fichas'; CL.q = ''; cargarClientas(z.texto);
      } catch (err) { $('#imp-msg').innerHTML = `<div class="err">${esc(err.message)}</div>`; e.target.disabled = false; e.target.textContent = 'Reintentar'; }
    };
  } catch (e) { caja.innerHTML = `<div class="err">${esc(e.message)}</div>`; }
}
