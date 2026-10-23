/* Panel de administración · Gestión: egresos, agenda en cuadrícula, tarjeta de sellos y campañas.
 * Usa las funciones del panel (api, $, esc, nav, bindNav, S, pesosC, pesosF, fechaCorta, h12). */

(function estilosGestion() {
  const st = document.createElement('style');
  st.textContent = `
    .vista-ag { display: flex; gap: 6px; margin: 12px 0 0; }
    .grilla-wrap { overflow-x: auto; margin-top: 12px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); -webkit-overflow-scrolling: touch; }
    .grilla { display: grid; position: relative; min-width: 100%; }
    .g-cab { position: sticky; top: 0; z-index: 2; background: var(--card2, #2e231e); padding: 8px 6px; font-weight: 700; font-size: 13px; text-align: center; border-bottom: 1px solid var(--line); border-left: 1px solid var(--line); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .g-cab.h { border-left: 0; }
    .g-horas { position: relative; border-right: 1px solid var(--line); }
    .g-horas span { position: absolute; left: 0; right: 4px; font-size: 11px; color: var(--sub); text-align: right; transform: translateY(-6px); }
    .g-col { position: relative; border-left: 1px solid var(--line); }
    .g-col .linea { position: absolute; left: 0; right: 0; border-top: 1px dashed rgba(255,255,255,.06); }
    .g-col .fuera { position: absolute; left: 0; right: 0; background: repeating-linear-gradient(45deg, rgba(0,0,0,.25) 0 6px, rgba(0,0,0,.12) 6px 12px); }
    .g-cita { position: absolute; left: 3px; right: 3px; border-radius: 8px; padding: 4px 6px; font-size: 11.5px; line-height: 1.25; overflow: hidden; cursor: pointer; border-left: 4px solid; }
    .g-cita b { display: block; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .g-cita.Pendiente { background: #3a2a14; border-color: #f0a33a; }
    .g-cita.Confirmada { background: #1d3326; border-color: #2fbf71; }
    .g-cita.Finalizada { background: #2a2540; border-color: #9b8cff; }
    .g-cita.Atendida { background: #2b2b2b; border-color: #8a8a8a; opacity: .8; }
    .g-cita.Cancelada, .g-cita.No { background: #321a1a; border-color: #ff6b6b; opacity: .55; text-decoration: line-through; }
    .g-ahora { position: absolute; left: 0; right: 0; border-top: 2px solid #ff6b6b; z-index: 1; }
    .g-ley { display: flex; gap: 10px; flex-wrap: wrap; font-size: 12px; color: var(--sub); margin-top: 8px; }
    .g-ley i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 4px; vertical-align: -1px; }
    .eg-item { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--line); }
    .eg-item:last-child { border-bottom: 0; }
    .sellos-adm { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 8px; }
    .sellos-adm span { aspect-ratio: 1; border-radius: 50%; border: 1.5px dashed var(--line); display: grid; place-items: center; font-size: 12px; color: var(--sub); }
    .sellos-adm span.on { background: var(--acc); color: #2b170f; border: 0; font-size: 16px; }
    .camp-item { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 9px 0; border-bottom: 1px dashed var(--line); }
    .camp-item:last-child { border-bottom: 0; }
  `;
  document.head.appendChild(st);
})();

/* ---------- Egresos (Finanzas) ---------- */
function pintarEgresos(d) {
  const box = document.getElementById('egresos-box');
  if (!box || !d.egresos) return;
  const e = d.egresos, hoyISO = (d.hoy || '').slice(0, 10);
  const medios = d.medios && d.medios.length && typeof d.medios[0] === 'string' ? d.medios : ((AG && AG.medios) || ['Efectivo', 'Transferencia', 'Nequi']);
  box.innerHTML = `<div class="card"><b>Egresos del periodo</b> <span class="muted">· ${pesosF(e.total)}</span>
      <p class="muted" style="margin:4px 0 0">Gastos del salón. Los pagos a profesionales no van aquí: ya salen de su liquidación.</p>
      ${e.porCategoria.length ? '<div class="lineas" style="margin-top:8px">' + e.porCategoria.map(c => `<div><span>${esc(c.categoria)}</span><b>${pesosF(c.valor)}</b></div>`).join('') + '</div>' : ''}
      <button class="btn mini sec" id="eg-abrir" style="margin-top:10px">+ Registrar egreso</button>
      <div id="eg-form" class="hidden">
        <div class="fila"><div><label for="eg-fecha">Fecha</label><input type="date" id="eg-fecha" value="${esc(hoyISO)}" max="${esc(hoyISO)}"></div>
          <div><label for="eg-valor">Valor</label><input id="eg-valor" inputmode="numeric" placeholder="50000"></div></div>
        <div class="fila"><div><label for="eg-cat">Categoría</label><select id="eg-cat">${e.categorias.map(c => `<option>${esc(c)}</option>`).join('')}</select></div>
          <div><label for="eg-medio">Pagado con</label><select id="eg-medio">${medios.map(m => `<option>${esc(m)}</option>`).join('')}</select></div></div>
        <label for="eg-concepto">Concepto</label><input id="eg-concepto" maxlength="80" placeholder="Esmaltes y removedor">
        <div class="err" id="eg-msg"></div>
        <button class="btn" id="eg-guardar">Guardar egreso</button>
      </div>
      ${e.lista.length ? '<div style="margin-top:10px">' + e.lista.map(x => `<div class="eg-item"><div><b>${esc(x.concepto)}</b><div class="muted">${esc(fechaCorta(x.fecha))} · ${esc(x.categoria)} · ${esc(x.medio)}</div></div>
        <div style="text-align:right"><b>${pesosF(x.valor)}</b><br><button class="link" data-eg-anular="${esc(x.id)}" style="padding:2px 0;font-size:12px">Anular</button></div></div>`).join('') + '</div>' : ''}
    </div>`;
  $('#eg-abrir').onclick = () => { $('#eg-form').classList.remove('hidden'); $('#eg-abrir').classList.add('hidden'); $('#eg-valor').focus(); };
  $('#eg-guardar').onclick = async () => {
    const b = $('#eg-guardar'); b.disabled = true; $('#eg-msg').textContent = '';
    try {
      const r = await api({ a: 'aGuardarEgreso', token: S.token, fecha: $('#eg-fecha').value, valor: $('#eg-valor').value, categoria: $('#eg-cat').value, medio: $('#eg-medio').value, concepto: $('#eg-concepto').value });
      FD = await api({ a: 'aFinanzas', token: S.token, desde: d.desde, hasta: d.hasta, profesional: F.profesional });
      vistaFinanzas(r.texto);
    } catch (err) { b.disabled = false; $('#eg-msg').textContent = err.message; }
  };
  box.querySelectorAll('[data-eg-anular]').forEach(x => x.onclick = async () => {
    if (!confirm('¿Anular este egreso?')) return;
    try { const r = await api({ a: 'aAnularEgreso', token: S.token, id: x.dataset.egAnular }); FD = await api({ a: 'aFinanzas', token: S.token, desde: d.desde, hasta: d.hasta, profesional: F.profesional }); vistaFinanzas(r.texto); }
    catch (err) { alert(err.message); }
  });
}

/* ---------- Agenda en cuadrícula (una columna por profesional) ---------- */
function grillaHtml(g, visibles) {
  const aM = h => { const m = String(h || '').match(/(\d{1,2}):(\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  let ini = 24 * 60, fin = 0;
  visibles.forEach(b => b.turnos.forEach(t => { ini = Math.min(ini, aM(t[0])); fin = Math.max(fin, aM(t[1])); }));
  g.citas.forEach(c => { const a = aM(c.hora), f = aM(c.fin) || a + 30; if (a !== null) { ini = Math.min(ini, a); fin = Math.max(fin, f); } });
  if (ini >= fin) { ini = 8 * 60; fin = 20 * 60; }
  ini = Math.floor(ini / 60) * 60; fin = Math.ceil(fin / 60) * 60;
  const PX = 1.1; // px por minuto
  const alto = (fin - ini) * PX;
  const y = m => (m - ini) * PX;
  const horas = [];
  for (let m = ini; m <= fin; m += 60) horas.push(m);
  const ahora = (() => { const d = new Date(); return g.fecha === g.hoy ? d.getHours() * 60 + d.getMinutes() : null; })();
  const cols = visibles.map(b => {
    const mias = g.citas.filter(c => c.profesionalId === b.id);
    // Zonas fuera de turno (rayadas)
    const bloques = b.turnos.map(t => [aM(t[0]), aM(t[1])]).sort((p, q) => p[0] - q[0]);
    const fuera = []; let cur = ini;
    bloques.forEach(r => { if (r[0] > cur) fuera.push([cur, r[0]]); cur = Math.max(cur, r[1]); });
    if (cur < fin) fuera.push([cur, fin]);
    return `<div class="g-col" style="height:${alto}px">
      ${horas.map(m => `<div class="linea" style="top:${y(m)}px"></div>`).join('')}
      ${fuera.map(r => `<div class="fuera" style="top:${y(r[0])}px;height:${(r[1] - r[0]) * PX}px"></div>`).join('')}
      ${ahora !== null && ahora >= ini && ahora <= fin ? `<div class="g-ahora" style="top:${y(ahora)}px"></div>` : ''}
      ${mias.map(c => { const a = aM(c.hora), f = aM(c.fin) || a + 30;
        return `<div class="g-cita ${esc(c.estado.split(' ')[0])}" data-gcita="${esc(c.id)}" style="top:${y(a) + 1}px;height:${Math.max(22, (f - a) * PX - 2)}px" title="${esc(c.cliente + ' · ' + c.servicio)}">
          <b>${esc(h12(c.hora))} ${esc(c.cliente.split(' ')[0])}</b>${esc(c.servicio)}${c.consent ? ' · ⚠ consentimiento' : ''}</div>`; }).join('')}
    </div>`;
  });
  return `<div class="grilla-wrap"><div class="grilla" style="grid-template-columns: 46px repeat(${visibles.length}, minmax(130px, 1fr))">
      <div class="g-cab h"></div>${visibles.map(b => `<div class="g-cab">${esc(b.nombre.split(' ')[0])}</div>`).join('')}
      <div class="g-horas" style="height:${alto}px">${horas.map(m => `<span style="top:${y(m)}px">${String(Math.floor(m / 60) % 12 || 12)}${m < 720 ? 'a' : 'p'}</span>`).join('')}</div>
      ${cols.join('')}
    </div></div>
    <div class="g-ley"><span><i style="background:#f0a33a"></i>Pendiente</span><span><i style="background:#2fbf71"></i>Confirmada</span><span><i style="background:#9b8cff"></i>Finalizada</span><span><i style="background:#8a8a8a"></i>Atendida</span><span><i style="background:#ff6b6b"></i>Cancelada / no asistió</span><span>Rayado = fuera de turno</span></div>`;
}

/* ---------- Tarjeta de sellos (ficha) ---------- */
function sellosHtml(s) {
  if (!s) return '';
  return `<div class="card"><b>Tarjeta de sellos</b> ${s.listo ? '<span class="tag si">¡Completa!</span>' : `<span class="muted">· ${s.sellos} de ${s.meta}</span>`}
    <div class="sellos-adm">${Array.from({ length: s.meta }, (_, i) => `<span class="${i < s.sellos ? 'on' : ''}">${i < s.sellos ? '✦' : i + 1}</span>`).join('')}</div>
    <p class="muted" style="margin:8px 0 0">Premio: ${esc(s.premio)}. Cada visita facturada suma un sello.${s.canjeados ? ' Premios ya canjeados: ' + s.canjeados + '.' : ''}</p>
    ${s.listo ? '<button class="btn" id="canjear-sellos">Entregar premio y reiniciar tarjeta</button>' : ''}</div>`;
}

/* ---------- Campañas por WhatsApp ---------- */
let CAMP = { categoria: '', servicio: '', profesional: '', sinVisita: '', cumpleMes: '', sinCita: true,
  mensaje: 'Hola {nombre} 💖 Te extrañamos en Beauty Glam. Esta semana tenemos un detalle especial para ti. Reserva aquí: {link}', nombre: '' };
async function vistaCampanas(msg) {
  let base = null;
  try { base = (await api({ a: 'aServicios', token: S.token })); } catch (e) { base = { servicios: [], categorias: [], profesionales: [] }; }
  const cats = [...new Set(base.servicios.filter(s => s.activo).map(s => s.cat))];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  $('#app').innerHTML = nav('clientas') + subNavClientas() + `
    ${msg ? `<div class="okmsg">${esc(msg)}</div>` : ''}
    <div class="card"><b>Campaña por WhatsApp</b>
      <p class="muted" style="margin:4px 0 0">Elige a quién escribirle y el mensaje. Luego toca "Enviar" en cada clienta: se abre WhatsApp con el mensaje listo y queda marcada como enviada.</p>
      <label for="cp-nombre">Nombre de la campaña</label><input id="cp-nombre" maxlength="40" value="${esc(CAMP.nombre)}" placeholder="Promo noviembre">
      <div class="fila"><div><label for="cp-cat">Se ha hecho servicios de</label><select id="cp-cat"><option value="">Cualquier categoría</option>${cats.map(c => `<option ${CAMP.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
        <div><label for="cp-serv">Servicio</label><select id="cp-serv"><option value="">Cualquiera</option>${base.servicios.filter(s => s.activo).map(s => `<option value="${esc(s.id)}" ${CAMP.servicio === s.id ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select></div></div>
      <div class="fila"><div><label for="cp-prof">La atendió</label><select id="cp-prof"><option value="">Cualquiera</option>${(base.profesionales || []).filter(b => b.activo).map(b => `<option value="${esc(b.id)}" ${CAMP.profesional === b.id ? 'selected' : ''}>${esc(b.nombre)}</option>`).join('')}</select></div>
        <div><label for="cp-sin">Sin venir hace</label><select id="cp-sin"><option value="">No importa</option>${[21, 30, 45, 60, 90].map(n => `<option value="${n}" ${String(CAMP.sinVisita) === String(n) ? 'selected' : ''}>${n}+ días</option>`).join('')}</select></div></div>
      <div class="fila"><div><label for="cp-mes">Cumpleaños en</label><select id="cp-mes"><option value="">Cualquier mes</option>${meses.map((m, i) => `<option value="${i + 1}" ${String(CAMP.cumpleMes) === String(i + 1) ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        <div><label>&nbsp;</label><label class="switch" style="margin-top:6px"><input type="checkbox" id="cp-sincita" ${CAMP.sinCita ? 'checked' : ''}> Solo sin cita próxima</label></div></div>
      <label for="cp-msg">Mensaje</label><textarea id="cp-msg" rows="4" maxlength="900">${esc(CAMP.mensaje)}</textarea>
      <div class="muted">{nombre} = primer nombre de la clienta · {link} = página de reservas</div>
      <button class="btn" id="cp-buscar">Ver clientas</button>
    </div>
    <div id="cp-lista"></div>`;
  bindNav(); bindSubClientas();
  $('#cp-buscar').onclick = buscarAudiencia;
}
async function buscarAudiencia() {
  Object.assign(CAMP, { nombre: $('#cp-nombre').value.trim(), categoria: $('#cp-cat').value, servicio: $('#cp-serv').value, profesional: $('#cp-prof').value,
    sinVisita: $('#cp-sin').value, cumpleMes: $('#cp-mes').value, sinCita: $('#cp-sincita').checked, mensaje: $('#cp-msg').value });
  const caja = $('#cp-lista'); caja.innerHTML = '<p class="muted">Buscando…</p>';
  if (!CAMP.nombre) { caja.innerHTML = '<div class="err">Ponle un nombre a la campaña (así no le escribes dos veces a la misma clienta).</div>'; return; }
  try {
    const r = await api({ a: 'aAudiencia', token: S.token, campana: CAMP.nombre, categoria: CAMP.categoria, servicio: CAMP.servicio, profesional: CAMP.profesional,
      sinVisita: CAMP.sinVisita, cumpleMes: CAMP.cumpleMes, sinCita: CAMP.sinCita, mensaje: CAMP.mensaje });
    const pend = r.clientas.filter(c => !c.enviada).length;
    caja.innerHTML = `<div class="card"><b>${r.total} ${r.total === 1 ? 'clienta' : 'clientas'}</b> <span class="muted">· ${pend} por enviar${r.total > r.clientas.length ? ' · se muestran las primeras ' + r.clientas.length : ''}</span>
      ${r.clientas.map(c => `<div class="camp-item" ${c.enviada ? 'style="opacity:.45"' : ''}><div><b>${esc(c.nombre)}</b><div class="muted">+${esc(c.tel)}${c.ultima ? ' · última visita ' + esc(fechaCorta(c.ultima)) : ''}</div></div>
        <a class="btn mini ${c.enviada ? 'sec' : 'wa'}" target="_blank" rel="noopener" href="${esc(c.wa)}" data-camp="${esc(c.id)}">${c.enviada ? 'Enviada ✓' : 'Enviar'}</a></div>`).join('') || '<p class="muted">Ninguna clienta cumple esos filtros.</p>'}</div>`;
    caja.querySelectorAll('[data-camp]').forEach(a => a.addEventListener('click', () => {
      api({ a: 'aAviso', token: S.token, tipo: 'Campaña', cliente: a.dataset.camp, detalle: CAMP.nombre }).catch(() => {});
      a.closest('.camp-item').style.opacity = '.45'; a.textContent = 'Enviada ✓'; a.classList.remove('wa'); a.classList.add('sec');
    }));
  } catch (e) { caja.innerHTML = `<div class="err">${esc(e.message)}</div>`; }
}
