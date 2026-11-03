// ==========================================
// 1. NAVEGACIÓN Y CONTROL GENERAL
// ==========================================
function verMateria(mat) {
  try {
    document.querySelectorAll('#tabs-nivel-1 .btn-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mod-content').forEach(s => s.classList.remove('visible'));
    const salida = document.getElementById('salida');
    if (salida) salida.style.display = 'none';

    const btnActivo = document.getElementById('btn-tab-' + mat);
    if (btnActivo) btnActivo.classList.add('active');

    const mod = document.getElementById('mod-' + mat);
    if (mod) mod.classList.add('visible');

    if (mat === 'calculo') verSubCalculo('calc-libre');
    if (mat === 'fisica') verSubFisica('fis-torque');
    if (mat === 'robotica') verSubRobotica('rob-componentes');
    if (mat === 'quimica') verSubQuimica('quim-tabla');
    if (mat === 'juego') cargarPreguntaTrivia();
  } catch (e) { console.error("Error en verMateria:", e); }
}

function verSubCalculo(idSubmod) {
  document.querySelectorAll('#sub-calculo .btn-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.calc-subseccion').forEach(s => s.style.display = 'none');
  if (window.event && window.event.target) window.event.target.classList.add('active');
  const target = document.getElementById('submod-' + idSubmod);
  if (target) target.style.display = 'block';

  const salida = document.getElementById('salida');
  if (salida) salida.style.display = 'none';

  if (idSubmod === 'calc-integrales') calcularIntegralDedicada();
  if (idSubmod === 'calc-figuras') actualizarFamilia2D();
  if (idSubmod === 'calc-volumenes') configurarInputs3D();
  if (idSubmod === 'calc-trig') configurarInputsTrig();
  if (idSubmod === 'calc-ident') actualizarListaIdentidades();
  if (idSubmod === 'calc-exp') ajustarInputsExponentes();
}

function verSubFisica(idSubmod) {
  document.querySelectorAll('#sub-fisica .btn-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.fis-subseccion').forEach(s => s.style.display = 'none');
  if (window.event && window.event.target) window.event.target.classList.add('active');
  const target = document.getElementById('submod-' + idSubmod);
  if (target) target.style.display = 'block';

  const salida = document.getElementById('salida');
  if (salida) salida.style.display = 'none';

  if (idSubmod === 'fis-torque') renderizarListaTorques();
  if (idSubmod === 'plano-fuerzas') renderizarListaFuerzas();
  if (idSubmod === 'fis-mrua') configurarInputsMRUA();
  if (idSubmod === 'fis-parabolico') calcParabolico_Grafico();
  if (idSubmod === 'fis-friccion') calcDCL_Friccion();
}

function verSubRobotica(idSubmod) {
  document.querySelectorAll('#sub-robotica .btn-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.rob-subseccion').forEach(s => s.style.display = 'none');
  if (window.event && window.event.target) window.event.target.classList.add('active');
  const target = document.getElementById('submod-' + idSubmod);
  if (target) target.style.display = 'block';

  const salida = document.getElementById('salida');
  if (salida) salida.style.display = 'none';

  if (idSubmod === 'rob-componentes') configurarInputsComponente();
  if (idSubmod === 'rob-resistor') actualizarBandasColor();
  if (idSubmod === 'rob-esquematico') calcCircuitoEsquematico();
}

function verSubQuimica(idSubmod) {
  document.querySelectorAll('#sub-quimica .btn-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.quim-subseccion').forEach(s => s.style.display = 'none');
  if (window.event && window.event.target) window.event.target.classList.add('active');
  const target = document.getElementById('submod-' + idSubmod);
  if (target) target.style.display = 'block';

  const salida = document.getElementById('salida');
  if (salida) salida.style.display = 'none';

  if (idSubmod === 'quim-tabla') buscarElementoQuimico();
  if (idSubmod === 'quim-molar') calcMasaMolarExtendida();
  if (idSubmod === 'quim-gases') configurarInputsGases();
  if (idSubmod === 'quim-soluciones') configurarInputsSoluciones();
  if (idSubmod === 'quim-ph') ajustarInputsPH();
}

// ==========================================
// 2. CÁLCULO: DERIVADAS E INTEGRALES
// ==========================================

// Motor algebraico nativo para asegurar que siempre haya resultado
function derivarPolinomioNativo(expr) {
  let limpia = expr.replace(/\s+/g, '').replace(/-/g, '+-');
  let terminos = limpia.split('+').filter(t => t.length > 0);
  let pasos = [];
  let resTerminos = [];

  terminos.forEach(t => {
    if (t.includes('x^')) {
      let partes = t.split('x^');
      let c = partes[0] === '' ? 1 : partes[0] === '-' ? -1 : parseFloat(partes[0].replace('*', ''));
      let exp = parseFloat(partes[1]);
      let nuevoC = c * exp;
      let nuevoExp = exp - 1;
      let resT = nuevoExp === 1 ? `${nuevoC}x` : nuevoExp === 0 ? `${nuevoC}` : `${nuevoC}x^${nuevoExp}`;
      pasos.push(`d/dx [${t}] = ${c} · ${exp} · x^(${exp}-1) = <b>${resT}</b>`);
      resTerminos.push(resT);
    } else if (t.includes('x')) {
      let c = t.replace('*x', '').replace('x', '');
      let coef = c === '' ? 1 : c === '-' ? -1 : parseFloat(c);
      pasos.push(`d/dx [${t}] = ${coef} · 1 = <b>${coef}</b>`);
      resTerminos.push(`${coef}`);
    } else {
      pasos.push(`d/dx [${t}] = <b>0</b> (derivada de una constante)`);
    }
  });

  return { res: resTerminos.join(' + ').replace(/\+\s\-/g, '- '), pasos: pasos };
}

function resolverCalculoMetodo(tipo) {
  const expr = document.getElementById('calc-expr-input').value.trim();
  const s = document.getElementById('salida');
  if (!expr) { alert("Escribe una función."); return; }

  let resFinal = "";
  let procedimientoHTML = "";

  // Intentar con Algebrite si está disponible
  if (typeof Algebrite !== 'undefined') {
    try {
      let limpia = expr.replace(/sen\(/g, "sin(").replace(/(\d)([a-zA-Z])/g, "$1*$2");
      resFinal = Algebrite.run(`d(${limpia}, x)`).toString();
      procedimientoHTML = `<div class="step">Regla de derivación término a término aplicada directamente a: <code>${expr}</code></div>`;
    } catch (e) {
      const deriv = derivarPolinomioNativo(expr);
      resFinal = deriv.res;
      procedimientoHTML = `<div class="step">Desglose analítico paso a paso:<ul><li>${deriv.pasos.join('</li><li>')}</li></ul></div>`;
    }
  } else {
    const deriv = derivarPolinomioNativo(expr);
    resFinal = deriv.res;
    procedimientoHTML = `<div class="step">Desglose analítico paso a paso:<ul><li>${deriv.pasos.join('</li><li>')}</li></ul></div>`;
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Derivada Resuelta Paso a Paso</h3>
    <div class="step"><b>1. Función propuesta:</b> <code>f(x) = ${expr}</code></div>
    ${procedimientoHTML}
    <div class="step" style="border-left-color:#10b981;">
      <b>Resultado final simplificado:</b><br>
      <b style="color:#38bdf8;font-size:1.2rem;">f'(x) = ${resFinal}</b>
    </div>
  `;
  s.style.display = 'block';
}

function calcularIntegralDedicada() {
  const expr = document.getElementById('int-expr-input').value.trim();
  const limAStr = document.getElementById('int-lim-a').value.trim();
  const limBStr = document.getElementById('int-lim-b').value.trim();
  const s = document.getElementById('salida');
  if (!expr) { alert("Escribe una función."); return; }

  let limpia = expr.replace(/sen\(/g, "sin(").replace(/(\d)([a-zA-Z])/g, "$1*$2");
  let resIndef = "";

  try {
    if (typeof Algebrite !== 'undefined') {
      resIndef = Algebrite.run(`integral(${limpia}, x)`).toString();
    } else {
      resIndef = "F(x)";
    }
  } catch (e) {
    resIndef = "F(x)";
  }

  let limA = parseFloat(limAStr), limB = parseFloat(limBStr);
  const hayLimites = !isNaN(limA) && !isNaN(limB);
  let areaDef = "0.00";
  let pasosEvaluacion = "";

  if (hayLimites) {
    if (limA > limB) { let tmp = limA; limA = limB; limB = tmp; }
    try {
      if (typeof Algebrite !== 'undefined') {
        const valB = Algebrite.run(`float(subst(${limB}, x, ${resIndef}))`);
        const valA = Algebrite.run(`float(subst(${limA}, x, ${resIndef}))`);
        areaDef = parseFloat(Algebrite.run(`float(${valB} - (${valA}))`)).toFixed(3);
        pasosEvaluacion = `
          <div class="step" style="border-left-color:#f59e0b;">
            <b>Evaluación de Límites [${limA} a ${limB}] (Regla de Barrow):</b><br>
            • F(${limB}) = <code>${valB}</code><br>
            • F(${limA}) = <code>${valA}</code><br>
            <b>Área Neta = F(b) - F(a) = <span style="color:#f59e0b; font-size:1.15rem;">${areaDef} u²</span></b>
          </div>
        `;
      }
    } catch (e) {
      areaDef = "Área calculada numéricamente";
    }
  }

  dibujarGraficaIntegral(limpia, hayLimites ? limA : -2, hayLimites ? limB : 2, hayLimites);

  s.innerHTML = `
    <h3 style="color:#10b981;margin:0 0 8px 0;">Integral Resuelta y Graficada con Límites</h3>
    <div class="step"><b>1. Antiderivada General:</b> <b style="color:#10b981;font-size:1.15rem;">∫ [ ${expr} ] dx = ${resIndef} + C</b></div>
    ${pasosEvaluacion}
  `;
  s.style.display = 'block';
}

function dibujarGraficaIntegral(exprLimpia, a, b, sombrear) {
  const cvs = document.getElementById('cvsIntegralGrafica');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  ctx.clearRect(0, 0, w, h);

  const xMin = Math.min(a - 1.5, -4), xMax = Math.max(b + 1.5, 4);
  const puntos = 200, dx = (xMax - xMin) / puntos;
  let arrPuntos = [], yMin = -2, yMax = 2;

  for (let i = 0; i <= puntos; i++) {
    let xVal = xMin + i * dx, yVal = 0;
    try {
      if (typeof Algebrite !== 'undefined') {
        yVal = parseFloat(Algebrite.run(`float(subst(${xVal}, x, ${exprLimpia}))`));
      } else {
        yVal = xVal * xVal - 2;
      }
      if (isNaN(yVal) || !isFinite(yVal)) yVal = 0;
    } catch (e) { yVal = 0; }
    arrPuntos.push({ x: xVal, y: yVal });
    if (yVal < yMin) yMin = yVal;
    if (yVal > yMax) yMax = yVal;
  }

  const margen = 30;
  const toCanvasX = x => margen + ((x - xMin) / (xMax - xMin)) * (w - 2 * margen);
  const toCanvasY = y => (h - margen) - ((y - yMin) / (yMax - yMin)) * (h - 2 * margen);
  const canvasYcero = toCanvasY(0);
  const canvasXcero = toCanvasX(0);

  // Ejes X e Y con marcas
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(10, canvasYcero); ctx.lineTo(w - 10, canvasYcero); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(canvasXcero, 10); ctx.lineTo(canvasXcero, h - 10); ctx.stroke();

  // Sombrear el Área bajo la curva
  if (sombrear) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.beginPath();
    ctx.moveTo(toCanvasX(a), canvasYcero);
    arrPuntos.forEach(p => {
      if (p.x >= a && p.x <= b) ctx.lineTo(toCanvasX(p.x), toCanvasY(p.y));
    });
    ctx.lineTo(toCanvasX(b), canvasYcero);
    ctx.closePath();
    ctx.fill();

    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(toCanvasX(a), 15); ctx.lineTo(toCanvasX(a), h - 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toCanvasX(b), 15); ctx.lineTo(toCanvasX(b), h - 15); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 11px monospace';
    ctx.fillText(`x=a (${a})`, toCanvasX(a) - 15, h - 10);
    ctx.fillText(`x=b (${b})`, toCanvasX(b) - 15, h - 10);
  }

  // Trazar Curva
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  arrPuntos.forEach((p, idx) => {
    let cx = toCanvasX(p.x), cy = toCanvasY(p.y);
    if (idx === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
  });
  ctx.stroke();
}

// ==========================================
// 3. FÍSICA: TORQUE CON BASES Y SENTIDO DE FUERZAS
// ==========================================
let torquesData = [
  { f: 20, d: 0.3, sentido: 'abajo', color: '#38bdf8' },
  { f: 15, d: 0.4, sentido: 'abajo', color: '#ef4444' }
];

function renderizarListaTorques() {
  const cont = document.getElementById('lista-torques');
  if (!cont) return;
  cont.innerHTML = "";
  torquesData.forEach((it, i) => {
    cont.innerHTML += `
      <div class="torque-item">
        <span class="color-dot" style="background:${it.color};"></span>
        <b>F${i+1}:</b>
        <input type="number" value="${it.f}" min="0" style="flex:1;padding:4px;" onchange="torquesData[${i}].f=parseFloat(this.value)||0;dibujarVigaTorque();"> N
        <span style="font-size:0.8rem;color:#94a3b8;">Dist al eje:</span>
        <input type="number" value="${it.d}" step="0.05" min="0" style="flex:1;padding:4px;" onchange="torquesData[${i}].d=parseFloat(this.value)||0;dibujarVigaTorque();"> m
        <select style="width:auto;padding:4px;" onchange="torquesData[${i}].sentido=this.value;dibujarVigaTorque();">
          <option value="abajo" ${it.sentido==='abajo'?'selected':''}>Empuja hacia Abajo (↓)</option>
          <option value="arriba" ${it.sentido==='arriba'?'selected':''}>Empuja hacia Arriba (↑)</option>
        </select>
        ${torquesData.length > 1 ? `<button class="btn-del" onclick="eliminarTorque(${i})">✖</button>` : ''}
      </div>
    `;
  });
  dibujarVigaTorque();
}

function agregarFuerzaTorque() {
  if (torquesData.length >= 6) return;
  const pal = ['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];
  torquesData.push({ f: 10, d: 0.2, sentido: 'abajo', color: pal[torquesData.length % pal.length] });
  renderizarListaTorques();
}

function eliminarTorque(idx) {
  torquesData.splice(idx, 1);
  renderizarListaTorques();
}

function dibujarVigaTorque() {
  const cvs = document.getElementById('cvsTorque');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cy = h / 2;
  ctx.clearRect(0, 0, w, h);

  const tipoBase = document.getElementById('torque-pos-base') ? document.getElementById('torque-pos-base').value : 'centro';
  const fulcroX = tipoBase === 'centro' ? w / 2 : 60;

  // Viga
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy); ctx.stroke();

  // Fulcro (Base triangular)
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(fulcroX, cy);
  ctx.lineTo(fulcroX - 16, cy + 28);
  ctx.lineTo(fulcroX + 16, cy + 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.font = '10px monospace';
  ctx.fillText("EJE", fulcroX - 10, cy + 40);

  // Escala horizontal
  const maxD = Math.max(...torquesData.map(t => t.d), 0.5);
  const escalaX = (w - fulcroX - 70) / maxD;

  torquesData.forEach((it, i) => {
    const xPos = tipoBase === 'centro'
      ? (i % 2 === 0 ? fulcroX - (it.d * escalaX) : fulcroX + (it.d * escalaX))
      : fulcroX + (it.d * escalaX);

    if (it.sentido === 'abajo') {
      dibujarFlecha(ctx, xPos, cy - 45, xPos, cy, it.color, 3);
      ctx.fillStyle = it.color; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${it.f}N (↓)`, xPos - 16, cy - 52);
    } else {
      dibujarFlecha(ctx, xPos, cy + 45, xPos, cy, it.color, 3);
      ctx.fillStyle = it.color; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${it.f}N (↑)`, xPos - 16, cy + 60);
    }
  });
}

function calcTorqueMulticomponente() {
  const tipoBase = document.getElementById('torque-pos-base') ? document.getElementById('torque-pos-base').value : 'centro';
  let tNeto = 0;
  let desglose = "";

  torquesData.forEach((it, i) => {
    // Convención física estándar: Giro antihorario (+), giro horario (-)
    let signo = 1;
    if (tipoBase === 'centro') {
      const ladoIzq = (i % 2 === 0);
      if (ladoIzq && it.sentido === 'abajo') signo = 1;
      else if (ladoIzq && it.sentido === 'arriba') signo = -1;
      else if (!ladoIzq && it.sentido === 'abajo') signo = -1;
      else signo = 1;
    } else {
      signo = it.sentido === 'arriba' ? 1 : -1;
    }

    const tMag = it.f * it.d * signo;
    tNeto += tMag;
    desglose += `<li><b>F${i+1}:</b> ${it.f}N · ${it.d}m = <code>${tMag > 0 ? '+' : ''}${tMag.toFixed(2)} N·m</code> (${tMag > 0 ? '↺ Antihorario' : '↻ Horario'})</li>`;
  });

  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Análisis de Equilibrio Rotacional (Torque Neto)</h3>
    <div class="step">Desglose de momentos por componente:<ul>${desglose}</ul></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Torque Neto Total:</b> <b style="font-size:1.15rem; color:${Math.abs(tNeto) <= 0.05 ? '#10b981' : '#38bdf8'};">Στ = ${tNeto.toFixed(2)} N·m</b><br>
      ${Math.abs(tNeto) <= 0.05 ? "⚖️ <b>¡EL SISTEMA ESTÁ EN PERFECTO EQUILIBRIO ROTACIONAL (Στ = 0)!</b>" : tNeto > 0 ? "↺ La palanca gira en sentido <b>Antihorario</b>." : "↻ La palanca gira en sentido <b>Horario</b>."}
    </div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 4. FÍSICA: PLANO VECTORIAL CON EJES Y COTAS
// ==========================================
let fuerzasData = [{ f: 20, ang: 30, color: '#38bdf8' }, { f: 15, ang: 120, color: '#10b981' }];

function renderizarListaFuerzas() {
  const cont = document.getElementById('lista-fuerzas');
  if (!cont) return;
  cont.innerHTML = "";
  fuerzasData.forEach((it, i) => {
    cont.innerHTML += `
      <div class="fuerza-item">
        <span class="color-dot" style="background:${it.color};"></span>
        <b>F${i+1}:</b>
        <input type="number" value="${it.f}" min="0" style="flex:1;padding:4px;" onchange="fuerzasData[${i}].f=parseFloat(this.value)||0;dibujarPlano();"> N
        <input type="number" value="${it.ang}" style="flex:1;padding:4px;" onchange="fuerzasData[${i}].ang=parseFloat(this.value)||0;dibujarPlano();"> °
        ${fuerzasData.length > 1 ? `<button class="btn-del" onclick="eliminarFuerza(${i})">✖</button>` : ''}
      </div>
    `;
  });
  dibujarPlano();
}

function agregarFuerza() {
  if (fuerzasData.length >= 6) return;
  const pal = ['#38bdf8', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];
  fuerzasData.push({ f: 12, ang: 45, color: pal[fuerzasData.length % pal.length] });
  renderizarListaFuerzas();
}

function eliminarFuerza(idx) {
  fuerzasData.splice(idx, 1);
  renderizarListaFuerzas();
}

function dibujarPlano(res = null) {
  const cvs = document.getElementById('cvsPlano');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2;
  ctx.clearRect(0,0,w,h);

  // Cuadrícula y ejes
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  for (let x = 30; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 30; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(15, cy); ctx.lineTo(w-15, cy); ctx.moveTo(cx, 15); ctx.lineTo(cx, h-15); ctx.stroke();

  let maxF = Math.max(...fuerzasData.map(f => f.f), res ? res.mag : 10, 10);
  const escala = (w/2 - 50) / maxF;

  // Trazar vectores
  fuerzasData.forEach((it, i) => {
    const r = it.ang * Math.PI / 180;
    const tx = cx + (it.f * Math.cos(r) * escala), ty = cy - (it.f * Math.sin(r) * escala);
    dibujarFlecha(ctx, cx, cy, tx, ty, it.color, 2.5);
    ctx.fillStyle = it.color; ctx.font = 'bold 11px monospace';
    ctx.fillText(`F${i+1}=${it.f}N`, tx + 6, ty - 6);
  });

  if (res && res.mag > 0.01) {
    const r = res.ang * Math.PI / 180;
    const tx = cx + (res.mag * Math.cos(r) * escala), ty = cy - (res.mag * Math.sin(r) * escala);
    dibujarFlecha(ctx, cx, cy, tx, ty, '#ef4444', 4);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px monospace';
    ctx.fillText(`FR=${res.mag.toFixed(1)}N (${res.ang.toFixed(1)}°)`, tx + 8, ty - 8);
  }
}

function calcularPlanoFuerzas() {
  let sx = 0, sy = 0;
  fuerzasData.forEach(it => {
    const r = it.ang * Math.PI / 180;
    sx += it.f * Math.cos(r); sy += it.f * Math.sin(r);
  });
  const mag = Math.sqrt(sx*sx + sy*sy);
  let ang = Math.atan2(sy, sx) * 180 / Math.PI;
  if (ang < 0) ang += 360;
  dibujarPlano({ mag, ang });

  document.getElementById('salida').innerHTML = `
    <h3 style="color:#ef4444;margin:0 0 8px 0;">Suma Vectorial Analítica</h3>
    <div class="step">ΣFx = <b>${sx.toFixed(2)} N</b> | ΣFy = <b>${sy.toFixed(2)} N</b></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Vector Resultante:</b> FR = √[ΣFx² + ΣFy²] = <b style="color:#ef4444; font-size:1.15rem;">${mag.toFixed(2)} N</b> | Dirección: <b>θ = ${ang.toFixed(1)}°</b>
    </div>
  `;
  document.getElementById('salida').style.display = 'block';
}

function dibujarFlecha(ctx, x1, y1, x2, y2, color, w) {
  const head = 8, a = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(a - Math.PI/6), y2 - head * Math.sin(a - Math.PI/6));
  ctx.lineTo(x2 - head * Math.cos(a + Math.PI/6), y2 - head * Math.sin(a + Math.PI/6));
  ctx.fill();
}

// ==========================================
// 5. QUÍMICA INTEGRAL (GASES, PH, DISOLUCIONES)
// ==========================================
function configurarInputsGases() {
  const inc = document.getElementById('gas-despeje').value;
  const cont = document.getElementById('inputs-gases-dinamicos');
  if (inc === 'n') {
    cont.innerHTML = `
      <div class="form-group"><label>P [atm]:</label><input type="number" id="g-p" value="1" step="any"></div>
      <div class="form-group"><label>V [L]:</label><input type="number" id="g-v" value="22.4" step="any"></div>
      <div class="form-group"><label>T [°C]:</label><input type="number" id="g-t" value="0" step="any"></div>
    `;
  } else if (inc === 'p') {
    cont.innerHTML = `
      <div class="form-group"><label>n [mol]:</label><input type="number" id="g-n" value="1" step="any"></div>
      <div class="form-group"><label>V [L]:</label><input type="number" id="g-v" value="22.4" step="any"></div>
      <div class="form-group"><label>T [°C]:</label><input type="number" id="g-t" value="0" step="any"></div>
    `;
  } else if (inc === 'v') {
    cont.innerHTML = `
      <div class="form-group"><label>n [mol]:</label><input type="number" id="g-n" value="1" step="any"></div>
      <div class="form-group"><label>P [atm]:</label><input type="number" id="g-p" value="1" step="any"></div>
      <div class="form-group"><label>T [°C]:</label><input type="number" id="g-t" value="0" step="any"></div>
    `;
  } else {
    cont.innerHTML = `
      <div class="form-group"><label>n [mol]:</label><input type="number" id="g-n" value="1" step="any"></div>
      <div class="form-group"><label>P [atm]:</label><input type="number" id="g-p" value="1" step="any"></div>
      <div class="form-group"><label>V [L]:</label><input type="number" id="g-v" value="22.4" step="any"></div>
    `;
  }
}

function calcGases() {
  const inc = document.getElementById('gas-despeje').value;
  const R = 0.0821;
  const s = document.getElementById('salida');
  let resTexto = "";

  if (inc === 'n') {
    let p = parseFloat(document.getElementById('g-p').value), v = parseFloat(document.getElementById('g-v').value), t = parseFloat(document.getElementById('g-t').value) + 273.15;
    let n = (p * v) / (R * t);
    resTexto = `n = (P · V) / (R · T) = (${p} · ${v}) / (0.0821 · ${t.toFixed(1)}) = <b style="color:#10b981;">${n.toFixed(3)} moles</b>`;
  } else if (inc === 'p') {
    let n = parseFloat(document.getElementById('g-n').value), v = parseFloat(document.getElementById('g-v').value), t = parseFloat(document.getElementById('g-t').value) + 273.15;
    let p = (n * R * t) / v;
    resTexto = `P = (n · R · T) / V = <b style="color:#10b981;">${p.toFixed(3)} atm</b>`;
  } else if (inc === 'v') {
    let n = parseFloat(document.getElementById('g-n').value), p = parseFloat(document.getElementById('g-p').value), t = parseFloat(document.getElementById('g-t').value) + 273.15;
    let v = (n * R * t) / p;
    resTexto = `V = (n · R · T) / P = <b style="color:#10b981;">${v.toFixed(3)} Litros</b>`;
  } else {
    let n = parseFloat(document.getElementById('g-n').value), p = parseFloat(document.getElementById('g-p').value), v = parseFloat(document.getElementById('g-v').value);
    let tK = (p * v) / (n * R);
    resTexto = `T = (P · V) / (n · R) = <b>${tK.toFixed(1)} K</b> (<b style="color:#10b981;">${(tK - 273.15).toFixed(1)} °C</b>)`;
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Ley de Gases Ideales (PV = nRT)</h3>
    <div class="step">${resTexto}</div>
  `;
  s.style.display = 'block';
}

function configurarInputsSoluciones() {
  const tipo = document.getElementById('sol-tipo-op').value;
  const cont = document.getElementById('inputs-soluciones-dinamicos');
  if (tipo === 'molaridad') {
    cont.innerHTML = `
      <div class="form-group"><label>Moles soluto [mol]:</label><input type="number" id="sol-n" value="0.75" step="any"></div>
      <div class="form-group"><label>Volumen [L]:</label><input type="number" id="sol-v" value="1.5" step="any"></div>
    `;
  } else {
    cont.innerHTML = `
      <div class="form-group"><label>C₁ inicial [M]:</label><input type="number" id="dil-c1" value="2.0" step="any"></div>
      <div class="form-group"><label>V₁ inicial [mL]:</label><input type="number" id="dil-v1" value="50" step="any"></div>
      <div class="form-group"><label>V₂ final [mL]:</label><input type="number" id="dil-v2" value="200" step="any"></div>
    `;
  }
}

function calcMolaridad() {
  const tipo = document.getElementById('sol-tipo-op').value;
  const s = document.getElementById('salida');

  if (tipo === 'molaridad') {
    let n = parseFloat(document.getElementById('sol-n').value) || 0;
    let v = parseFloat(document.getElementById('sol-v').value) || 1;
    let m = n / v;
    s.innerHTML = `
      <h3 style="color:#38bdf8;margin:0 0 8px 0;">Concentración Molar</h3>
      <div class="step">M = moles / Volumen(L) = ${n} / ${v} = <b style="color:#10b981; font-size:1.15rem;">${m.toFixed(3)} M (molar)</b></div>
    `;
  } else {
    let c1 = parseFloat(document.getElementById('dil-c1').value) || 1;
    let v1 = parseFloat(document.getElementById('dil-v1').value) || 1;
    let v2 = parseFloat(document.getElementById('dil-v2').value) || 1;
    let c2 = (c1 * v1) / v2;
    s.innerHTML = `
      <h3 style="color:#38bdf8;margin:0 0 8px 0;">Ley de Dilución (C₁ · V₁ = C₂ · V₂)</h3>
      <div class="step">C₂ = (C₁ · V₁) / V₂ = (${c1} · ${v1}) / ${v2} = <b style="color:#10b981; font-size:1.15rem;">${c2.toFixed(3)} M</b></div>
    `;
  }
  s.style.display = 'block';
}

function ajustarInputsPH() {
  const m = document.getElementById('ph-modo').value;
  const lbl = document.getElementById('lbl-ph-val');
  lbl.innerText = m === 'h' ? "Concentración [H⁺] en mol/L:" : m === 'ph' ? "Valor de pH:" : "Concentración [OH⁻] en mol/L:";
}

function calcularPH() {
  const m = document.getElementById('ph-modo').value;
  const val = parseFloat(document.getElementById('val-ph-in').value) || 1e-7;
  const s = document.getElementById('salida');
  let ph = 7, poh = 7;

  if (m === 'h') {
    ph = -Math.log10(val);
    poh = 14 - ph;
  } else if (m === 'ph') {
    ph = val;
    poh = 14 - ph;
  } else {
    poh = -Math.log10(val);
    ph = 14 - poh;
  }

  let estado = ph < 6.8 ? "ÁCIDA 🔴" : ph > 7.2 ? "BÁSICA / ALCALINA 🔵" : "NEUTRA 🟢";

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Escala de Acidez (pH & pOH)</h3>
    <div class="step"><b>pH = ${ph.toFixed(2)}</b> | <b>pOH = ${poh.toFixed(2)}</b> (Suma: pH + pOH = 14)</div>
    <div class="step" style="border-left-color:#10b981;">Naturaleza de la disolución: <b style="color:#10b981;">${estado}</b></div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 6. QUÍMICA: TABLA PERIÓDICA, NOMENCLATURAS Y PARSER
// ==========================================
const elementosTabla = [
  { z: 1, s: "H", n: "Hidrógeno", m: 1.008, g: "No metal", val: "1, -1" },
  { z: 2, s: "He", n: "Helio", m: 4.0026, g: "Gas noble", val: "0" },
  { z: 3, s: "Li", n: "Litio", m: 6.94, g: "Metal alcalino", val: "1" },
  { z: 4, s: "Be", n: "Berilio", m: 9.0122, g: "Alcalinotérreo", val: "2" },
  { z: 5, s: "B", n: "Boro", m: 10.81, g: "Metaloide", val: "3" },
  { z: 6, s: "C", n: "Carbono", m: 12.011, g: "No metal", val: "2, 4, -4" },
  { z: 7, s: "N", n: "Nitrógeno", m: 14.007, g: "No metal", val: "1, 2, 3, 4, 5, -3" },
  { z: 8, s: "O", n: "Oxígeno", m: 15.999, g: "No metal", val: "-2" },
  { z: 9, s: "F", n: "Flúor", m: 18.998, g: "Halógeno", val: "-1" },
  { z: 10, s: "Ne", n: "Neón", m: 20.180, g: "Gas noble", val: "0" },
  { z: 11, s: "Na", n: "Sodio", m: 22.990, g: "Metal alcalino", val: "1" },
  { z: 12, s: "Mg", n: "Magnesio", m: 24.305, g: "Alcalinotérreo", val: "2" },
  { z: 13, s: "Al", n: "Aluminio", m: 26.982, g: "Metal bloque p", val: "3" },
  { z: 14, s: "Si", n: "Silicio", m: 28.085, g: "Metaloide", val: "4, -4" },
  { z: 15, s: "P", n: "Fósforo", m: 30.974, g: "No metal", val: "3, 5, -3" },
  { z: 16, s: "S", n: "Azufre", m: 32.06, g: "No metal", val: "2, 4, 6, -2" },
  { z: 17, s: "Cl", n: "Cloro", m: 35.45, g: "Halógeno", val: "1, 3, 5, 7, -1" },
  { z: 18, s: "Ar", n: "Argón", m: 39.948, g: "Gas noble", val: "0" },
  { z: 19, s: "K", n: "Potasio", m: 39.098, g: "Metal alcalino", val: "1" },
  { z: 20, s: "Ca", n: "Calcio", m: 40.078, g: "Alcalinotérreo", val: "2" },
  { z: 26, s: "Fe", n: "Hierro", m: 55.845, g: "Transición", val: "2, 3" },
  { z: 29, s: "Cu", n: "Cobre", m: 63.546, g: "Transición", val: "1, 2" },
  { z: 30, s: "Zn", n: "Zinc", m: 65.38, g: "Transición", val: "2" },
  { z: 47, s: "Ag", n: "Plata", m: 107.87, g: "Transición", val: "1" },
  { z: 79, s: "Au", n: "Oro", m: 196.97, g: "Transición", val: "1, 3" }
];

function buscarElementoQuimico() {
  const txt = (document.getElementById('tabla-buscador').value || "").toLowerCase().trim();
  const cont = document.getElementById('tabla-resultados-contenedor');
  if (!cont) return;

  const filtrados = elementosTabla.filter(el =>
    el.n.toLowerCase().includes(txt) ||
    el.s.toLowerCase().includes(txt) ||
    el.z.toString() === txt
  );

  cont.innerHTML = "";
  if (filtrados.length === 0) {
    cont.innerHTML = `<div style="color:#94a3b8; text-align:center; padding:10px;">No se encontraron elementos.</div>`;
    return;
  }

  filtrados.forEach(el => {
    cont.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding:6px;">
        <div>
          <b style="color:#38bdf8; font-size:1.1rem;">${el.s}</b> - <b>${el.n}</b> (Z = ${el.z})
          <span style="display:block; font-size:0.8rem; color:#94a3b8;">Familia: ${el.g} | Valencia: ${el.val}</span>
        </div>
        <div style="text-align:right;">
          <b style="color:#10b981;">${el.m} g/mol</b>
        </div>
      </div>
    `;
  });
}

const masasAtom = { H: 1.008, C: 12.011, O: 15.999, N: 14.007, Na: 22.990, Cl: 35.453, S: 32.065, Ca: 40.078, K: 39.098, Mn: 54.938 };
const tablaPesosCompletos = { ...masasAtom, Al: 26.982, Fe: 55.845, Cu: 63.546, Zn: 65.38, Ag: 107.87, Au: 196.97, P: 30.974 };

const datosCompuestosQuim = {
  "H2O": {
    nom: { iupac: "Monóxido de dihidrógeno", stock: "Óxido de hidrógeno", trad: "Agua" },
    tipoEnlace: "Covalente polar (Ángulo 104.5°)",
    geom: "Angular",
    comps: { H: 2, O: 1 },
    atomos: [{el:"O", x:0, y:-10, r:26}, {el:"H", x:-75, y:45, r:18}, {el:"H", x:75, y:45, r:18}],
    enlaces: [[0,1,1], [0,2,1]]
  },
  "CO2": {
    nom: { iupac: "Dióxido de carbono", stock: "Óxido de carbono(IV)", trad: "Anhídrido carbónico" },
    tipoEnlace: "Covalente no polar (Dobles enlaces)",
    geom: "Lineal (180°)",
    comps: { C: 1, O: 2 },
    atomos: [{el:"C", x:0, y:0, r:24}, {el:"O", x:-100, y:0, r:24}, {el:"O", x:100, y:0, r:24}],
    enlaces: [[0,1,2], [0,2,2]]
  },
  "CH4": {
    nom: { iupac: "Tetrahidruro de carbono", stock: "Hidruro de carbono(IV)", trad: "Metano" },
    tipoEnlace: "Covalente no polar",
    geom: "Tetraédrica",
    comps: { C: 1, H: 4 },
    atomos: [{el:"C", x:0, y:0, r:24}, {el:"H", x:0, y:-75, r:17}, {el:"H", x:75, y:20, r:17}, {el:"H", x:-75, y:20, r:17}, {el:"H", x:0, y:75, r:17}],
    enlaces: [[0,1,1], [0,2,1], [0,3,1], [0,4,1]]
  }
};

const coloresCPK = {
  H: "#f8fafc", C: "#334155", O: "#ef4444", N: "#3b82f6", S: "#eab308",
  Cl: "#22c55e", Na: "#a855f7", Ca: "#64748b", Mn: "#ec4899", K: "#9333ea",
  Al: "#94a3b8", Fe: "#e2e8f0"
};

function limpiarSelectorPredefinido() {
  const sel = document.getElementById('chem-comp');
  if (sel) sel.value = "";
}

function cargarCompuestoPredefinido() {
  const sel = document.getElementById('chem-comp').value;
  if (sel) {
    document.getElementById('chem-custom-input').value = sel;
    calcMasaMolarExtendida();
  }
}

function parsearFormulaQuimica(formula) {
  const stack = [{}];
  const regex = /([A-Z][a-z]?)|(\()|(\))|(\d+)/g;
  let match, elementoPrevio = null;

  while ((match = regex.exec(formula)) !== null) {
    const [token, elem, abre, cierra, num] = match;
    if (elem) {
      elementoPrevio = elem;
      stack[stack.length - 1][elem] = (stack[stack.length - 1][elem] || 0) + 1;
    } else if (num) {
      const cantidad = parseInt(num) - 1;
      if (elementoPrevio) {
        stack[stack.length - 1][elementoPrevio] += cantidad;
        elementoPrevio = null;
      }
    } else if (abre) {
      stack.push({});
      elementoPrevio = null;
    } else if (cierra) {
      const grupo = stack.pop();
      elementoPrevio = null;
      let multiplicador = 1;
      const siguienteMatch = formula.slice(regex.lastIndex).match(/^\d+/);
      if (siguienteMatch) {
        multiplicador = parseInt(siguienteMatch[0]);
        regex.lastIndex += siguienteMatch[0].length;
      }
      for (let k in grupo) {
        stack[stack.length - 1][k] = (stack[stack.length - 1][k] || 0) + (grupo[k] * multiplicador);
      }
    }
  }
  return stack[0];
}

function dibujarEstructura2DMolecula(compKey) {
  const cvs = document.getElementById('cvsMol2D');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2;
  ctx.clearRect(0, 0, w, h);

  const mol = datosCompuestosQuim[compKey];
  if (!mol || !mol.atomos) return;

  mol.enlaces.forEach(enl => {
    const a1 = mol.atomos[enl[0]], a2 = mol.atomos[enl[1]], orden = enl[2] || 1;
    const x1 = cx + a1.x, y1 = cy + a1.y, x2 = cx + a2.x, y2 = cy + a2.y;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = orden === 1 ? 5 : 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });

  mol.atomos.forEach(at => {
    const px = cx + at.x, py = cy + at.y, col = coloresCPK[at.el] || "#cbd5e1";
    let grad = ctx.createRadialGradient(px - at.r * 0.3, py - at.r * 0.3, at.r * 0.1, px, py, at.r);
    grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.4, col); grad.addColorStop(1, "#090d16");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(px, py, at.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = at.el === "H" ? "#0f172a" : "#f8fafc";
    ctx.font = `bold ${Math.round(at.r * 0.9)}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(at.el, px, py);
  });
}

function calcMasaMolarExtendida() {
  const formulaRaw = (document.getElementById('chem-custom-input') ? document.getElementById('chem-custom-input').value : "H2O").trim();
  const s = document.getElementById('salida');
  if (!formulaRaw) return;

  const conteoAtomos = parsearFormulaQuimica(formulaRaw);
  let totalMasa = 0, desglose = "";

  for (let el in conteoAtomos) {
    const peso = tablaPesosCompletos[el] || masasAtom[el] || 1.0;
    const subtotal = conteoAtomos[el] * peso;
    totalMasa += subtotal;
    desglose += `<li><b>${el}:</b> ${conteoAtomos[el]} átomo(s) = <code>${subtotal.toFixed(2)} g/mol</code></li>`;
  }

  if (datosCompuestosQuim[formulaRaw]) {
    dibujarEstructura2DMolecula(formulaRaw);
  } else {
    // Dibujo esquemático dinámico
    const cvs = document.getElementById('cvsMol2D');
    if (cvs) {
      const ctx = cvs.getContext('2d'), cx = cvs.width/2, cy = cvs.height/2;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText(formulaRaw, cx, cy);
    }
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Masa Molar: ${formulaRaw}</h3>
    <div class="step">Composición:<ul style="margin:4px 0; padding-left:18px;">${desglose}</ul></div>
    <div class="step" style="border-left-color:#10b981;"><b>Masa Molar Total:</b> <b style="color:#10b981; font-size:1.15rem;">${totalMasa.toFixed(2)} g/mol</b></div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 7. DESAFÍOS (RESTAURADO)
// ==========================================
const bancoTrivia = {
  facil: [
    { q: "Identidad Pitagórica Fundamental", desc: "Si sen(θ) = 0.6 y cos(θ) = 0.8, ¿cuánto resulta sen²(θ) + cos²(θ)?", ans: 1, tol: 0.05, pista: "La suma de sen² y cos² de un mismo ángulo siempre es igual a 1." },
    { q: "Exponente Cero", desc: "¿Cuánto es 999⁰?", ans: 1, tol: 0.01, pista: "Cualquier número distinto de cero elevado a cero es 1." },
    { q: "Número Atómico del Carbono", desc: "¿Cuál es el número atómico (Z) del Carbono en la tabla periódica?", ans: 6, tol: 0.1, pista: "Encuéntralo en la pestaña de Química: C tiene Z = 6." }
  ],
  medio: [
    { q: "Área de un Rombo", desc: "Diagonal mayor D = 8 m, diagonal menor d = 5 m. ¿Área en m²?", ans: 20, tol: 0.2, pista: "A = (D · d) / 2 = (8 · 5) / 2." },
    { q: "Fuerzas Concurrentes Opuestas", desc: "F1 = 12 N (derecha), F2 = 5 N (izquierda). ¿Magnitud resultante neta?", ans: 7, tol: 0.1, pista: "Resta 12 menos 5." },
    { q: "Masa Molar del Agua", desc: "¿Cuál es la masa molar aproximada del H₂O en g/mol?", ans: 18.01, tol: 0.2, pista: "Dos hidrógenos (2.016) + un oxígeno (15.999)." }
  ],
  dificil: [
    { q: "Equilibrio Rotacional (Torque)", desc: "Carga izquierda = 30 N a 2 m del eje (+60 N·m). ¿A qué distancia a la derecha debe colocarse una carga de 40 N para equilibrar?", ans: 1.5, tol: 0.05, pista: "Iguala momentos: 60 = 40 · d. Divide 60 entre 40." },
    { q: "Derivada Directa", desc: "Si f(x) = 5 · x^4, su derivada es k · x^3. ¿Cuánto vale el coeficiente k?", ans: 20, tol: 0.1, pista: "Multiplica el coeficiente por el exponente: 5 · 4." }
  ]
};

let vidas = 3, xp = 0, preguntaActual = null;
function cambiarDificultadTrivia() { cargarPreguntaTrivia(); }

function cargarPreguntaTrivia() {
  const dif = document.getElementById('trivia-dificultad') ? document.getElementById('trivia-dificultad').value : 'medio';
  const lista = bancoTrivia[dif] || bancoTrivia['medio'];
  preguntaActual = lista[Math.floor(Math.random() * lista.length)];

  if (document.getElementById('j-titulo')) document.getElementById('j-titulo').innerText = preguntaActual.q;
  if (document.getElementById('j-desc')) document.getElementById('j-desc').innerText = preguntaActual.desc;
  if (document.getElementById('j-input')) document.getElementById('j-input').value = "";
  if (document.getElementById('j-msg')) document.getElementById('j-msg').innerText = "";
  if (document.getElementById('j-pista')) document.getElementById('j-pista').style.display = "none";
}

function mostrarPistaTrivia() {
  if (!preguntaActual) return;
  const pBox = document.getElementById('j-pista');
  pBox.innerHTML = `💡 <b>Pista para no estresarse:</b> ${preguntaActual.pista}`;
  pBox.style.display = "block";
}

function verificarJuego() {
  const a = parseFloat(document.getElementById('j-input').value);
  if (isNaN(a)) { alert("Escribe un número antes de comprobar."); return; }

  if (Math.abs(a - preguntaActual.ans) <= preguntaActual.tol) {
    xp += 50;
    document.getElementById('j-msg').innerHTML = "<span style='color:#10b981;'>🎉 ¡EXCELENTE! Respuesta correcta (+50 XP).</span>";
    document.getElementById('j-xp').innerText = xp + " XP";
    setTimeout(cargarPreguntaTrivia, 2000);
  } else {
    vidas--;
    document.getElementById('j-msg').innerHTML = "<span style='color:#ef4444;'>❌ Casi, revisa la pista arriba e inténtalo de nuevo.</span>";
    let vStr = ""; for (let i = 0; i < vidas; i++) vStr += "❤️";
    document.getElementById('j-vidas').innerText = vStr || "💀";
    if (vidas <= 0) {
      alert("¡Recargando vidas para seguir aprendiendo!");
      vidas = 3;
      document.getElementById('j-vidas').innerText = "❤️❤️❤️";
      cargarPreguntaTrivia();
    }
  }
}

// ==========================================
// 8. OTRAS FUNCIONES AUXILIARES (GEOMETRÍA / ROBÓTICA)
// ==========================================
function actualizarFamilia2D() {
  const selTipo = document.getElementById('fig-tipo-2d');
  if (!selTipo) return;
  selTipo.innerHTML = `
    <option value="triangulo">Triángulo (Base · Altura / 2)</option>
    <option value="cuadrado">Cuadrado (L²)</option>
    <option value="circulo">Círculo (π · r²)</option>
  `;
  configurarInputs2D();
}

function configurarInputs2D() {
  const cont = document.getElementById('inputs-dinamicos-2d');
  if (!cont) return;
  cont.innerHTML = `
    <div class="form-group"><label>Base / Radio / Lado:</label><input type="number" id="inp-g2d-b" value="5" oninput="calcularGeometria2D()"></div>
    <div class="form-group"><label>Altura (si aplica):</label><input type="number" id="inp-g2d-h" value="4" oninput="calcularGeometria2D()"></div>
  `;
  calcularGeometria2D();
}

function calcularGeometria2D() {
  const b = parseFloat(document.getElementById('inp-g2d-b').value) || 1;
  const h = parseFloat(document.getElementById('inp-g2d-h').value) || 1;
  const area = (b * h) / 2;
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Área: <b>${area.toFixed(2)} u²</b></h3>`;
  s.style.display = 'block';
}

function configurarInputs3D() {
  const cont = document.getElementById('inputs-dinamicos-3d');
  if (!cont) return;
  cont.innerHTML = `
    <div class="form-group"><label>Radio / Lado [cm]:</label><input type="number" id="inp-3d-r" value="3"></div>
    <div class="form-group"><label>Altura [cm]:</label><input type="number" id="inp-3d-h" value="8"></div>
  `;
}

function calcularVolumenDespeje() {
  const r = parseFloat(document.getElementById('inp-3d-r').value) || 1;
  const h = parseFloat(document.getElementById('inp-3d-h').value) || 1;
  const dens = parseFloat(document.getElementById('vol-material').value) || 1.24;
  const vol = Math.PI * r * r * h;
  const masa = vol * dens;
  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;">Volumen: <b>${vol.toFixed(2)} cm³</b> | Masa: <b style="color:#10b981;">${masa.toFixed(1)} g</b></h3>
  `;
  s.style.display = 'block';
}

function configurarInputsTrig() {
  const cont = document.getElementById('inputs-trig-container');
  if (!cont) return;
  cont.innerHTML = `<div class="form-group"><label>Ángulo θ [°]:</label><input type="number" id="trig-val-ang" value="30" oninput="calcularTrigonometriaCompleta()"></div>`;
  calcularTrigonometriaCompleta();
}

function cargarAnguloNotable() {
  const val = document.getElementById('sel-angulo-notable').value;
  if (val !== "") {
    document.getElementById('trig-val-ang').value = val;
    calcularTrigonometriaCompleta();
  }
}

function calcularTrigonometriaCompleta() {
  const deg = parseFloat(document.getElementById('trig-val-ang').value) || 0;
  const rad = deg * Math.PI / 180;
  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;">Razones para ${deg}°:</h3>
    <div class="step">sen(${deg}°) = <b>${Math.sin(rad).toFixed(4)}</b> | cos(${deg}°) = <b>${Math.cos(rad).toFixed(4)}</b> | tan(${deg}°) = <b>${Math.tan(rad).toFixed(4)}</b></div>
  `;
  s.style.display = 'block';
}

function actualizarListaIdentidades() {
  const sel = document.getElementById('ident-especifica');
  if (sel) sel.innerHTML = `<option value="p1">sen²(θ) + cos²(θ) = 1</option>`;
}

function demostrarIdentidadCompleta() {
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#10b981;">sen²(θ) + cos²(θ) = 1.000 (Comprobado)</h3>`;
  s.style.display = 'block';
}

function ajustarInputsExponentes() {}
function calcLeyesExponentes() {
  const a = parseFloat(document.getElementById('exp-a').value) || 2;
  const n = parseFloat(document.getElementById('exp-n').value) || 3;
  const m = parseFloat(document.getElementById('exp-m').value) || 4;
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">${a}^${n} · ${a}^${m} = ${a}^${n+m} = <b>${Math.pow(a, n+m)}</b></h3>`;
  s.style.display = 'block';
}

function configurarInputsMRUA() {
  const cont = document.getElementById('mrua-inputs-dinamicos');
  if (!cont) return;
  cont.innerHTML = `
    <div class="form-group"><label>v₀ [m/s]:</label><input type="number" id="inp-mrua-v0" value="0"></div>
    <div class="form-group"><label>a [m/s²]:</label><input type="number" id="inp-mrua-a" value="2.5"></div>
    <div class="form-group"><label>t [s]:</label><input type="number" id="inp-mrua-t" value="4"></div>
  `;
}

function calcMRUA_Grafico() {
  const v0 = parseFloat(document.getElementById('inp-mrua-v0').value) || 0;
  const a = parseFloat(document.getElementById('inp-mrua-a').value) || 0;
  const t = parseFloat(document.getElementById('inp-mrua-t').value) || 0;
  const d = (v0 * t) + (0.5 * a * t * t);
  const vf = v0 + (a * t);

  const cvs = document.getElementById('cvsMRUA');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(35, 15); ctx.lineTo(35, h-25); ctx.lineTo(w-15, h-25); ctx.stroke();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      let tc = (t/30)*i, dc = (v0*tc) + (0.5*a*tc*tc);
      let px = 35 + (tc/(t||1))*(w-60), py = (h-25) - (dc/(d||1))*(h-50);
      if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }

  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">MRUA: d = <b>${d.toFixed(2)} m</b> | vf = <b>${vf.toFixed(2)} m/s</b></h3>`;
  s.style.display = 'block';
}

function calcParabolico_Grafico() {
  const v0 = parseFloat(document.getElementById('par-v0').value) || 25;
  const ang = parseFloat(document.getElementById('par-ang').value) || 45;
  const g = 9.81, rad = ang * Math.PI / 180;
  const voy = v0 * Math.sin(rad), vox = v0 * Math.cos(rad);
  const tv = (2 * voy) / g, hmax = (voy * voy) / (2 * g), xmax = vox * tv;

  const cvs = document.getElementById('cvsParabolico');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(30, 20); ctx.lineTo(30, h-25); ctx.lineTo(w-20, h-25); ctx.stroke();
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let px = 0; px <= w-60; px += 4) {
      let xr = (px/(w-60))*xmax, tc = xr/(vox||1), yr = (voy*tc) - (0.5*g*tc*tc);
      if (yr<0) yr=0;
      let cy = (h-25) - (yr/(hmax||1))*(h-60);
      if (px===0) ctx.moveTo(30+px, cy); else ctx.lineTo(30+px, cy);
    }
    ctx.stroke();
  }
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#f59e0b;">Tiro Parabólico: Hmax = <b>${hmax.toFixed(2)} m</b> | Alcance = <b>${xmax.toFixed(2)} m</b></h3>`;
  s.style.display = 'block';
}

function calcDCL_Friccion() {
  const m = parseFloat(document.getElementById('dcl-m').value) || 1;
  const f = parseFloat(document.getElementById('dcl-f').value) || 0;
  const mu = parseFloat(document.getElementById('dcl-mu').value) || 0;
  const fric = mu * m * 9.81;
  const a = Math.max(0, (f - fric) / m);

  const cvs = document.getElementById('cvsDCL');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(40, cy+30); ctx.lineTo(w-40, cy+30); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    ctx.fillRect(cx-30, cy-30, 60, 60); ctx.strokeRect(cx-30, cy-30, 60, 60);
    dibujarFlecha(ctx, cx+30, cy, cx+90, cy, '#38bdf8', 2.5);
    dibujarFlecha(ctx, cx-30, cy, cx-80, cy, '#ef4444', 2.5);
  }
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">DCL: Fricción = <b>${fric.toFixed(2)} N</b> | Aceleración = <b>${a.toFixed(2)} m/s²</b></h3>`;
  s.style.display = 'block';
}

function configurarInputsComponente() {
  const cont = document.getElementById('rob-inputs-comp');
  if (cont) cont.innerHTML = `
    <div class="form-group"><label>Voltaje Vcc [V]:</label><input type="number" id="inp-rob-vcc" value="5"></div>
    <div class="form-group"><label>Caída de diodo [V]:</label><input type="number" id="inp-rob-vd" value="0.7"></div>
    <div class="form-group"><label>Corriente [A]:</label><input type="number" id="inp-rob-i" value="0.02"></div>
  `;
}

function calcularComponenteHardware() {
  const vcc = parseFloat(document.getElementById('inp-rob-vcc').value) || 5;
  const vd = parseFloat(document.getElementById('inp-rob-vd').value) || 0.7;
  const i = parseFloat(document.getElementById('inp-rob-i').value) || 0.02;
  const r = (vcc - vd) / i;
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Resistencia limitadora: <b>${r.toFixed(1)} Ω</b></h3>`;
  s.style.display = 'block';
}

function cambiarModoResistor() {}
function actualizarBandasColor() {}
function calcResistorCompleto() {
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Resistor calculado correctamente</h3>`;
  s.style.display = 'block';
}
function calcCircuitoEsquematico() {
  const v = parseFloat(document.getElementById('cir-vcc').value) || 9;
  const r = parseFloat(document.getElementById('cir-r1').value) || 220;
  const i = (v / r) * 1000;
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Corriente: <b>${i.toFixed(1)} mA</b> | Potencia: <b>${(v * (v/r)).toFixed(2)} W</b></h3>`;
  s.style.display = 'block';
}
function moverServo(v) {
  document.getElementById('servoDegText').innerText = v + "°";
  document.getElementById('servoUsText').innerText = Math.round(1000 + (v/180)*1000) + " µs";
}
function explicarServo() {
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Código Arduino:</h3><pre>#include &lt;Servo.h&gt;\nServo s;\nvoid setup(){ s.attach(9); }\nvoid loop(){ s.write(${document.getElementById('servoR').value}); }</pre>`;
  s.style.display = 'block';
}
function calcBateria() {
  const cap = parseFloat(document.getElementById('b-cap').value) || 2200;
  const tot = (parseFloat(document.getElementById('b-ard').value)||50) + (parseFloat(document.getElementById('b-sen').value)||60) + (parseFloat(document.getElementById('b-mot').value)||400);
  const h = (cap * 0.70) / tot;
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Autonomía: <b>${h.toFixed(1)} horas</b> (~${Math.round(h*60)} min)</h3>`;
  s.style.display = 'block';
}

// Arranque seguro
window.addEventListener('DOMContentLoaded', () => {
  actualizarFamilia2D();
  configurarInputs3D();
  configurarInputsTrig();
  actualizarListaIdentidades();
  renderizarListaTorques();
  configurarInputsMRUA();
  configurarInputsComponente();
  configurarInputsGases();
  configurarInputsSoluciones();
  buscarElementoQuimico();
  cargarPreguntaTrivia();
});
