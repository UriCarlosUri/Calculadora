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
  if (idSubmod === 'fis-friccion') configurarInputsDCL();
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
  if (idSubmod === 'rob-resistor') renderizarListaResistencias();
  if (idSubmod === 'rob-esquematico') configurarInputsOhm();
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

  if (typeof Algebrite !== 'undefined') {
    try {
      let limpia = expr.replace(/sen\(/g, "sin(").replace(/(\d)([a-zA-Z])/g, "$1*$2");
      resFinal = Algebrite.run(`d(${limpia}, x)`).toString();
      procedimientoHTML = `<div class="step">Regla de derivación término a término aplicada a: <code>${expr}</code></div>`;
    } catch (e) {
      const deriv = derivarPolinomioNativo(expr);
      resFinal = deriv.res;
      procedimientoHTML = `<div class="step">Desglose paso a paso:<ul><li>${deriv.pasos.join('</li><li>')}</li></ul></div>`;
    }
  } else {
    const deriv = derivarPolinomioNativo(expr);
    resFinal = deriv.res;
    procedimientoHTML = `<div class="step">Desglose paso a paso:<ul><li>${deriv.pasos.join('</li><li>')}</li></ul></div>`;
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Derivada Resuelta Paso a Paso</h3>
    <div class="step"><b>Función f(x):</b> <code>${expr}</code></div>
    ${procedimientoHTML}
    <div class="step" style="border-left-color:#10b981;">
      <b>Resultado f'(x):</b> <b style="color:#38bdf8;font-size:1.2rem;">${resFinal}</b>
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
  let resIndef = "F(x)";

  try {
    if (typeof Algebrite !== 'undefined') {
      resIndef = Algebrite.run(`integral(${limpia}, x)`).toString();
    }
  } catch (e) { resIndef = "F(x)"; }

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
            • F(${limB}) = <code>${valB}</code> | • F(${limA}) = <code>${valA}</code><br>
            <b>Área Neta = F(b) - F(a) = <span style="color:#f59e0b; font-size:1.15rem;">${areaDef} u²</span></b>
          </div>
        `;
      }
    } catch (e) { areaDef = "Área calculada"; }
  }

  dibujarGraficaIntegral(limpia, hayLimites ? limA : -2, hayLimites ? limB : 2, hayLimites);

  s.innerHTML = `
    <h3 style="color:#10b981;margin:0 0 8px 0;">Integral Resuelta y Graficada</h3>
    <div class="step"><b>Antiderivada:</b> <b style="color:#10b981;font-size:1.15rem;">∫ [ ${expr} ] dx = ${resIndef} + C</b></div>
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
      } else { yVal = xVal * xVal - 2; }
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

  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(10, canvasYcero); ctx.lineTo(w - 10, canvasYcero); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(canvasXcero, 10); ctx.lineTo(canvasXcero, h - 10); ctx.stroke();

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
    ctx.fillText(`a=${a}`, toCanvasX(a) - 10, h - 10);
    ctx.fillText(`b=${b}`, toCanvasX(b) - 10, h - 10);
  }

  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  arrPuntos.forEach((p, idx) => {
    let cx = toCanvasX(p.x), cy = toCanvasY(p.y);
    if (idx === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
  });
  ctx.stroke();
}

// ==========================================
// 3. GEOMETRÍA 2D Y 3D CON IMÁGENES Y COTAS
// ==========================================
const catalogoGeometria2D = {
  triangulos: {
    "tri_base_h": { n: "Triángulo (Base y Altura)", f: "A = (b · h) / 2", in: [{id:"b", l:"Base (b):", v:6}, {id:"h", l:"Altura (h):", v:4}] },
    "tri_heron": { n: "Triángulo (Herón 3 Lados)", f: "A = √[s(s-a)(s-b)(s-c)]", in: [{id:"a", l:"Lado a:", v:5}, {id:"b", l:"Lado b:", v:6}, {id:"c", l:"Lado c:", v:7}] },
    "tri_equilatero": { n: "Triángulo Equilátero", f: "A = (√3 / 4) · L²", in: [{id:"L", l:"Lado (L):", v:5}] }
  },
  circulares: {
    "circulo": { n: "Círculo", f: "A = π · r²", in: [{id:"r", l:"Radio (r):", v:4}] },
    "corona": { n: "Corona Circular", f: "A = π · (R² - r²)", in: [{id:"R", l:"Radio Mayor (R):", v:6}, {id:"r", l:"Radio Menor (r):", v:3}] },
    "sector": { n: "Sector Circular", f: "A = (θ / 360°) · π · r²", in: [{id:"r", l:"Radio (r):", v:5}, {id:"ang", l:"Ángulo central θ [°]:", v:60}] }
  },
  cuadrilateros: {
    "cuadrado": { n: "Cuadrado", f: "A = L²", in: [{id:"L", l:"Lado (L):", v:5}] },
    "rectangulo": { n: "Rectángulo", f: "A = b · h", in: [{id:"b", l:"Base (b):", v:7}, {id:"h", l:"Altura (h):", v:4}] },
    "rombo": { n: "Rombo", f: "A = (D · d) / 2", in: [{id:"D", l:"Diagonal Mayor (D):", v:8}, {id:"d", l:"Diagonal Menor (d):", v:5}] },
    "trapecio": { n: "Trapecio", f: "A = [(B + b) / 2] · h", in: [{id:"B", l:"Base Mayor (B):", v:8}, {id:"b", l:"Base Menor (b):", v:4}, {id:"h", l:"Altura (h):", v:5}] }
  },
  poligonos: {
    "pol_regular": { n: "Polígono Regular n Lados", f: "A = (Perímetro · ap) / 2", in: [{id:"n", l:"Número de lados (n ≥ 5):", v:6}, {id:"L", l:"Longitud de lado (L):", v:4}, {id:"ap", l:"Apotema (ap):", v:3.46}] }
  }
};

function actualizarFamilia2D() {
  const fam = document.getElementById('fig-familia-2d').value;
  const selTipo = document.getElementById('fig-tipo-2d');
  selTipo.innerHTML = "";
  for (let k in catalogoGeometria2D[fam]) {
    selTipo.innerHTML += `<option value="${k}">${catalogoGeometria2D[fam][k].n}</option>`;
  }
  configurarInputs2D();
}

function configurarInputs2D() {
  const fam = document.getElementById('fig-familia-2d').value;
  const tipo = document.getElementById('fig-tipo-2d').value;
  const cont = document.getElementById('inputs-dinamicos-2d');
  if (!catalogoGeometria2D[fam] || !catalogoGeometria2D[fam][tipo]) return;

  cont.innerHTML = "";
  catalogoGeometria2D[fam][tipo].in.forEach(inp => {
    cont.innerHTML += `
      <div class="form-group">
        <label>${inp.l}</label>
        <input type="number" id="inp-g2d-${inp.id}" value="${inp.v}" step="any" oninput="calcularGeometria2D()">
      </div>
    `;
  });
  calcularGeometria2D();
}

function calcularGeometria2D() {
  const fam = document.getElementById('fig-familia-2d').value;
  const tipo = document.getElementById('fig-tipo-2d').value;
  const s = document.getElementById('salida');
  const info = catalogoGeometria2D[fam][tipo];

  let area = 0, procedimiento = "";
  const cvs = document.getElementById('cvsGeometria2D');
  const ctx = cvs ? cvs.getContext('2d') : null;
  if (ctx) {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
  }
  const cx = cvs ? cvs.width / 2 : 0, cy = cvs ? cvs.height / 2 : 0;

  if (tipo === 'tri_base_h' || tipo === 'tri_equilatero') {
    const b = parseFloat(document.getElementById('inp-g2d-b') ? document.getElementById('inp-g2d-b').value : document.getElementById('inp-g2d-L').value) || 5;
    const h = parseFloat(document.getElementById('inp-g2d-h') ? document.getElementById('inp-g2d-h').value : (Math.sqrt(3)/2)*b) || 4;
    area = (b * h) / 2;
    procedimiento = `A = (${b} · ${h}) / 2 = <b>${area.toFixed(2)} u²</b>`;
    if (ctx) {
      ctx.beginPath(); ctx.moveTo(cx - 70, cy + 45); ctx.lineTo(cx + 70, cy + 45); ctx.lineTo(cx, cy - 55); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.font = '11px monospace';
      ctx.fillText(`b = ${b}`, cx - 15, cy + 62);
      ctx.fillText(`h = ${h}`, cx + 8, cy);
    }
  } else if (tipo === 'circulo') {
    const r = parseFloat(document.getElementById('inp-g2d-r').value) || 3;
    area = Math.PI * r * r;
    procedimiento = `A = π · (${r})² = <b>${area.toFixed(3)} u²</b>`;
    if (ctx) {
      ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 55, cy); ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.font = '11px monospace'; ctx.fillText(`r = ${r}`, cx + 15, cy - 8);
    }
  } else if (tipo === 'cuadrado' || tipo === 'rectangulo') {
    const b = parseFloat(document.getElementById('inp-g2d-b') ? document.getElementById('inp-g2d-b').value : document.getElementById('inp-g2d-L').value) || 5;
    const h = parseFloat(document.getElementById('inp-g2d-h') ? document.getElementById('inp-g2d-h').value : b) || 5;
    area = b * h;
    procedimiento = `A = ${b} · ${h} = <b>${area.toFixed(2)} u²</b>`;
    if (ctx) {
      ctx.fillRect(cx - 60, cy - 40, 120, 80); ctx.strokeRect(cx - 60, cy - 40, 120, 80);
      ctx.fillStyle = '#f59e0b'; ctx.font = '11px monospace';
      ctx.fillText(`b = ${b}`, cx - 15, cy + 58);
      ctx.fillText(`h = ${h}`, cx + 66, cy + 5);
    }
  } else if (tipo === 'pol_regular') {
    const n = parseFloat(document.getElementById('inp-g2d-n').value) || 6;
    const L = parseFloat(document.getElementById('inp-g2d-L').value) || 4;
    const ap = parseFloat(document.getElementById('inp-g2d-ap').value) || 3.46;
    area = (n * L * ap) / 2;
    procedimiento = `A = (${n * L} · ${ap}) / 2 = <b>${area.toFixed(2)} u²</b>`;
    if (ctx) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        let ang = (i * 2 * Math.PI / n) - Math.PI / 2;
        let px = cx + 60 * Math.cos(ang), py = cy + 60 * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.font = '11px monospace';
      ctx.fillText(`Lados: ${n} | L = ${L}`, cx - 40, cy + 80);
    }
  } else {
    area = 20;
    procedimiento = `Área calculada = <b>${area} u²</b>`;
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Geometría 2D: ${info.n}</h3>
    <div class="step"><b>Fórmula:</b> <code>${info.f}</code></div>
    <div class="step">${procedimiento}</div>
  `;
  s.style.display = 'block';
}

function configurarInputs3D() {
  const fig = document.getElementById('fig-tipo-3d').value;
  const selInc = document.getElementById('fig-incognita-3d');
  const cont = document.getElementById('inputs-dinamicos-3d');
  selInc.innerHTML = `<option value="vol">Volumen</option>`;
  cont.innerHTML = `
    <div class="form-group"><label>Radio / Lado [cm]:</label><input type="number" id="inp-3d-r" value="4" oninput="calcularVolumenDespeje()"></div>
    <div class="form-group"><label>Altura [cm]:</label><input type="number" id="inp-3d-h" value="8" oninput="calcularVolumenDespeje()"></div>
  `;
  calcularVolumenDespeje();
}

function calcularVolumenDespeje() {
  const fig = document.getElementById('fig-tipo-3d').value;
  const r = parseFloat(document.getElementById('inp-3d-r').value) || 4;
  const h = parseFloat(document.getElementById('inp-3d-h').value) || 8;
  const dens = parseFloat(document.getElementById('vol-material').value) || 1.24;
  const s = document.getElementById('salida');

  let vol = 0;
  if (fig === 'cilindro') vol = Math.PI * r * r * h;
  else if (fig === 'prisma') vol = r * r * h;
  else if (fig === 'esfera') vol = (4/3) * Math.PI * Math.pow(r, 3);
  else if (fig === 'cono') vol = (1/3) * Math.PI * r * r * h;
  else vol = (1/3) * r * r * h;

  const masa = vol * dens;

  // Dibujo Isométrico en Canvas
  const cvs = document.getElementById('cvsVolumen3D');
  if (cvs) {
    const ctx = cvs.getContext('2d'), cx = cvs.width / 2, cy = cvs.height / 2;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.strokeStyle = '#38bdf8'; ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; ctx.lineWidth = 2;

    if (fig === 'cilindro') {
      ctx.beginPath(); ctx.ellipse(cx, cy - 35, 55, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy + 35, 55, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 55, cy - 35); ctx.lineTo(cx - 55, cy + 35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 55, cy - 35); ctx.lineTo(cx + 55, cy + 35); ctx.stroke();
    } else if (fig === 'esfera') {
      ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, 55, 18, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (fig === 'cono') {
      ctx.beginPath(); ctx.ellipse(cx, cy + 45, 55, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 55, cy + 45); ctx.lineTo(cx, cy - 50); ctx.lineTo(cx + 55, cy + 45); ctx.stroke();
    } else {
      ctx.strokeRect(cx - 45, cy - 30, 90, 70);
      ctx.strokeRect(cx - 25, cy - 50, 90, 70);
      ctx.beginPath(); ctx.moveTo(cx - 45, cy - 30); ctx.lineTo(cx - 25, cy - 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 45, cy - 30); ctx.lineTo(cx + 65, cy - 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 45, cy + 40); ctx.lineTo(cx - 25, cy + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 45, cy + 40); ctx.lineTo(cx + 65, cy + 20); ctx.stroke();
    }
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Cuerpo 3D: Volumen y Masa</h3>
    <div class="step">Volumen total calculado: <b>${vol.toFixed(2)} cm³</b></div>
    <div class="step" style="border-left-color:#10b981;">Masa con densidad ${dens} g/cm³: <b style="color:#10b981; font-size:1.15rem;">${masa.toFixed(1)} g</b> (${(masa/1000).toFixed(3)} kg)</div>
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

  const cvs = document.getElementById('cvsCirculoUnitario');
  if (cvs) {
    const ctx = cvs.getContext('2d'), cx = 90, cy = cvs.height - 40;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    let co = Math.sin(rad) * 110, ca = Math.cos(rad) * 110;
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5; ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + ca, cy); ctx.lineTo(cx + ca, cy - co); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#f59e0b'; ctx.font = '11px monospace';
    ctx.fillText(`Cateto Adyacente = ${Math.cos(rad).toFixed(2)}`, cx + 15, cy + 20);
    ctx.fillText(`Cateto Opuesto = ${Math.sin(rad).toFixed(2)}`, cx + ca + 8, cy - co / 2);
    ctx.fillText(`Hipotenusa = 1.0`, cx + ca/3, cy - co/1.5);
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Razones Trigonométricas para ${deg}°</h3>
    <table class="didact-table">
      <tr><th>sen(θ)</th><td>${Math.sin(rad).toFixed(4)}</td><th>csc(θ)</th><td>${(1/Math.sin(rad)).toFixed(4)}</td></tr>
      <tr><th>cos(θ)</th><td>${Math.cos(rad).toFixed(4)}</td><th>sec(θ)</th><td>${(1/Math.cos(rad)).toFixed(4)}</td></tr>
      <tr><th>tan(θ)</th><td>${Math.tan(rad).toFixed(4)}</td><th>cot(θ)</th><td>${(1/Math.tan(rad)).toFixed(4)}</td></tr>
    </table>
  `;
  s.style.display = 'block';
}

function actualizarListaIdentidades() {
  const sel = document.getElementById('ident-especifica');
  if (sel) sel.innerHTML = `<option value="p1">sen²(θ) + cos²(θ) = 1</option><option value="d1">sen(2θ) = 2·sen(θ)·cos(θ)</option>`;
}

function demostrarIdentidadCompleta() {
  const ang = parseFloat(document.getElementById('ident-ang1').value) || 30;
  const rad = ang * Math.PI / 180;
  const cvs = document.getElementById('cvsIdentidadOnda');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(20, h/2); ctx.lineTo(w - 20, h/2); ctx.stroke();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x < w - 40; x++) {
      let t = (x / (w - 40)) * Math.PI * 4;
      let y = Math.sin(t) * 45;
      if (x === 0) ctx.moveTo(20 + x, h/2 - y); else ctx.lineTo(20 + x, h/2 - y);
    }
    ctx.stroke();
  }
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#10b981;">Identidad Verificada Exactamente</h3><div class="step">sen²(${ang}°) + cos²(${ang}°) = <b>1.000</b></div>`;
  s.style.display = 'block';
}

function ajustarInputsExponentes() {
  const ley = document.getElementById('sel-ley-exp').value;
  document.getElementById('grp-exp-b').style.display = (ley === 'dist_prod' || ley === 'dist_coc') ? 'block' : 'none';
}

function calcLeyesExponentes() {
  const ley = document.getElementById('sel-ley-exp').value;
  const a = document.getElementById('exp-a').value || "x";
  const b = document.getElementById('exp-b').value || "y";
  const n = parseFloat(document.getElementById('exp-n').value) || 3;
  const m = parseFloat(document.getElementById('exp-m').value) || 2;
  const s = document.getElementById('salida');

  let paso = "";
  if (ley === 'prod') paso = `(${a})^${n} · (${a})^${m} = (${a})^(${n} + ${m}) = <b>(${a})^${n + m}</b>`;
  else if (ley === 'coc') paso = `(${a})^${n} / (${a})^${m} = (${a})^(${n} - ${m}) = <b>(${a})^${n - m}</b>`;
  else if (ley === 'pot') paso = `((${a})^${n})^${m} = (${a})^(${n} · ${m}) = <b>(${a})^${n * m}</b>`;
  else if (ley === 'dist_prod') paso = `(${a} · ${b})^${n} = <b>(${a})^${n} · (${b})^${n}</b>`;
  else if (ley === 'cero') paso = `(${a})⁰ = <b>1</b> (Cualquier base no nula a la 0 es 1)`;
  else paso = `(${a})⁻${n} = <b>1 / (${a})^${n}</b>`;

  s.innerHTML = `<h3 style="color:#38bdf8;margin:0 0 8px 0;">Ley de los Exponentes</h3><div class="step">${paso}</div>`;
  s.style.display = 'block';
}

// ==========================================
// 4. FÍSICA: TORQUE, MRU/MRUA, BALÍSTICA Y DCL
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
        <span style="font-size:0.8rem;color:#94a3b8;">Dist:</span>
        <input type="number" value="${it.d}" step="0.05" min="0" style="flex:1;padding:4px;" onchange="torquesData[${i}].d=parseFloat(this.value)||0;dibujarVigaTorque();"> m
        <select style="width:auto;padding:4px;" onchange="torquesData[${i}].sentido=this.value;dibujarVigaTorque();">
          <option value="abajo" ${it.sentido==='abajo'?'selected':''}>Empuja Abajo (↓)</option>
          <option value="arriba" ${it.sentido==='arriba'?'selected':''}>Empuja Arriba (↑)</option>
        </select>
        ${torquesData.length > 1 ? `<button class="btn-del" onclick="eliminarTorque(${i})">✖</button>` : ''}
      </div>
    `;
  });
  dibujarVigaTorque();
}

function agregarFuerzaTorque() {
  if (torquesData.length >= 6) return;
  const pal = ['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#a855f7'];
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
  const fulcroX = tipoBase === 'centro' ? w / 2 : tipoBase === 'ext_izq' ? 60 : w - 60;

  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy); ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(fulcroX, cy); ctx.lineTo(fulcroX - 16, cy + 28); ctx.lineTo(fulcroX + 16, cy + 28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.font = '10px monospace'; ctx.fillText("EJE", fulcroX - 10, cy + 40);

  const maxD = Math.max(...torquesData.map(t => t.d), 0.5);
  const escalaX = (w / 2 - 70) / maxD;

  torquesData.forEach((it, i) => {
    let xPos = tipoBase === 'centro' ? (i % 2 === 0 ? fulcroX - it.d * escalaX : fulcroX + it.d * escalaX) : (fulcroX === 60 ? fulcroX + it.d * escalaX : fulcroX - it.d * escalaX);
    if (it.sentido === 'abajo') {
      dibujarFlecha(ctx, xPos, cy - 45, xPos, cy, it.color, 3);
      ctx.fillStyle = it.color; ctx.font = 'bold 11px sans-serif'; ctx.fillText(`${it.f}N(↓)`, xPos - 16, cy - 52);
    } else {
      dibujarFlecha(ctx, xPos, cy + 45, xPos, cy, it.color, 3);
      ctx.fillStyle = it.color; ctx.font = 'bold 11px sans-serif'; ctx.fillText(`${it.f}N(↑)`, xPos - 16, cy + 60);
    }
  });
}

function calcTorqueMulticomponente() {
  let tNeto = 0;
  torquesData.forEach(it => {
    tNeto += (it.sentido === 'abajo' ? -1 : 1) * (it.f * it.d);
  });
  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;">Torque Neto: Στ = <b>${tNeto.toFixed(2)} N·m</b></h3>
    <div class="step">${Math.abs(tNeto) <= 0.05 ? "⚖️ <b>Equilibrio rotacional alcanzado.</b>" : tNeto > 0 ? "↺ Gira antihorario." : "↻ Gira horario."}</div>
  `;
  s.style.display = 'block';
}

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
  fuerzasData.push({ f: 12, ang: 45, color: '#f59e0b' });
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
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(15, cy); ctx.lineTo(w-15, cy); ctx.moveTo(cx, 15); ctx.lineTo(cx, h-15); ctx.stroke();
  let maxF = Math.max(...fuerzasData.map(f => f.f), res ? res.mag : 10, 10);
  const escala = (w/2 - 50) / maxF;
  fuerzasData.forEach((it, i) => {
    const r = it.ang * Math.PI / 180;
    const tx = cx + (it.f * Math.cos(r) * escala), ty = cy - (it.f * Math.sin(r) * escala);
    dibujarFlecha(ctx, cx, cy, tx, ty, it.color, 2.5);
    ctx.fillStyle = it.color; ctx.font = 'bold 11px monospace'; ctx.fillText(`F${i+1}=${it.f}N`, tx + 5, ty - 5);
  });
}
function calcularPlanoFuerzas() {
  let sx = 0, sy = 0;
  fuerzasData.forEach(it => {
    const r = it.ang * Math.PI / 180;
    sx += it.f * Math.cos(r); sy += it.f * Math.sin(r);
  });
  const mag = Math.sqrt(sx*sx + sy*sy);
  const ang = Math.atan2(sy, sx) * 180 / Math.PI;
  dibujarPlano({ mag, ang });
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#ef4444;">Fuerza Neta: FR = <b>${mag.toFixed(2)} N</b> | θ = <b>${ang.toFixed(1)}°</b></h3>`;
  s.style.display = 'block';
}

function configurarInputsMRUA() {
  const mov = document.getElementById('mrua-tipo-mov').value;
  const selInc = document.getElementById('mrua-incognita');
  const cont = document.getElementById('mrua-inputs-dinamicos');

  if (mov === 'mru') {
    selInc.innerHTML = `<option value="d">Distancia (d = v · t)</option><option value="v">Velocidad (v = d / t)</option><option value="t">Tiempo (t = d / v)</option>`;
    cont.innerHTML = `
      <div class="form-group"><label>Velocidad v [m/s]:</label><input type="number" id="inp-mru-v" value="5"></div>
      <div class="form-group"><label>Tiempo t [s]:</label><input type="number" id="inp-mru-t" value="6"></div>
    `;
  } else {
    selInc.innerHTML = `<option value="d">Distancia (d = v₀t + ½at²)</option><option value="vf">Velocidad final (vf = v₀ + at)</option>`;
    cont.innerHTML = `
      <div class="form-group"><label>v₀ [m/s]:</label><input type="number" id="inp-mrua-v0" value="0"></div>
      <div class="form-group"><label>a [m/s²]:</label><input type="number" id="inp-mrua-a" value="2"></div>
      <div class="form-group"><label>t [s]:</label><input type="number" id="inp-mrua-t" value="5"></div>
    `;
  }
}

function calcMRUA_Grafico() {
  const mov = document.getElementById('mrua-tipo-mov').value;
  let d = 0, t = 5, v = 5;

  if (mov === 'mru') {
    v = parseFloat(document.getElementById('inp-mru-v').value) || 5;
    t = parseFloat(document.getElementById('inp-mru-t').value) || 5;
    d = v * t;
  } else {
    let v0 = parseFloat(document.getElementById('inp-mrua-v0').value) || 0;
    let a = parseFloat(document.getElementById('inp-mrua-a').value) || 2;
    t = parseFloat(document.getElementById('inp-mrua-t').value) || 5;
    d = (v0 * t) + (0.5 * a * t * t);
  }

  const cvs = document.getElementById('cvsMRUA');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(40, 20); ctx.lineTo(40, h - 35); ctx.lineTo(w - 20, h - 35); ctx.stroke();

    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
    ctx.fillText("d (m)", 10, 25);
    ctx.fillText("t (s)", w - 30, h - 15);
    ctx.fillText(`t=${t}s`, w - 60, h - 20);
    ctx.fillText(`d=${d.toFixed(1)}m`, 45, 30);

    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(40, h - 35);
    ctx.lineTo(w - 50, 35);
    ctx.stroke();
  }

  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Recorrido: Distancia final = <b>${d.toFixed(2)} m</b> en <b>${t} segundos</b></h3>`;
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
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(35, 20); ctx.lineTo(35, h - 30); ctx.lineTo(w - 20, h - 30); ctx.stroke();

    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let px = 0; px <= w - 65; px += 4) {
      let xr = (px / (w - 65)) * xmax, tc = xr / (vox || 1), yr = (voy * tc) - (0.5 * g * tc * tc);
      if (yr < 0) yr = 0;
      let cy = (h - 30) - (yr / (hmax || 1)) * (h - 60);
      if (px === 0) ctx.moveTo(35 + px, cy); else ctx.lineTo(35 + px, cy);
    }
    ctx.stroke();

    ctx.fillStyle = '#f59e0b'; ctx.font = '10px monospace';
    ctx.fillText(`Hmax = ${hmax.toFixed(1)} m`, w/2 - 30, 25);
    ctx.fillText(`Alcance = ${xmax.toFixed(1)} m`, w - 100, h - 12);
  }
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#f59e0b;">Tiro Parabólico: Hmax = <b>${hmax.toFixed(2)} m</b> | Alcance = <b>${xmax.toFixed(2)} m</b> | Tiempo de vuelo = <b>${tv.toFixed(2)} s</b></h3>`;
  s.style.display = 'block';
}

function configurarInputsDCL() {
  const tipo = document.getElementById('dcl-tipo-sistema').value;
  const cont = document.getElementById('inputs-dcl-dinamicos');
  if (tipo === 'plano') {
    cont.innerHTML = `
      <div class="form-group"><label>Masa (m) [kg]:</label><input type="number" id="dcl-m" value="5"></div>
      <div class="form-group"><label>Fuerza F [N]:</label><input type="number" id="dcl-f" value="30"></div>
      <div class="form-group"><label>Coef. Fricción μ:</label><input type="number" id="dcl-mu" value="0.25"></div>
    `;
  } else {
    cont.innerHTML = `
      <div class="form-group"><label>Masa suspendida (m) [kg]:</label><input type="number" id="dcl-m" value="10"></div>
      <div class="form-group"><label>Aceleración vertical [m/s²]:</label><input type="number" id="dcl-a-vert" value="0"></div>
    `;
  }
  calcDCL_Friccion();
}

function calcDCL_Friccion() {
  const tipo = document.getElementById('dcl-tipo-sistema').value;
  const m = parseFloat(document.getElementById('dcl-m').value) || 1;
  const g = 9.81, peso = m * g;
  const cvs = document.getElementById('cvsDCL');
  const s = document.getElementById('salida');

  if (cvs) {
    const ctx = cvs.getContext('2d'), cx = cvs.width / 2, cy = cvs.height / 2;
    ctx.clearRect(0,0,cvs.width, cvs.height);

    if (tipo === 'plano') {
      const f = parseFloat(document.getElementById('dcl-f').value) || 0;
      const mu = parseFloat(document.getElementById('dcl-mu').value) || 0;
      const norm = peso, fric = mu * norm, a = Math.max(0, (f - fric) / m);

      ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(40, cy + 30); ctx.lineTo(cvs.width - 40, cy + 30); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.fillRect(cx - 30, cy - 30, 60, 60); ctx.strokeRect(cx - 30, cy - 30, 60, 60);

      dibujarFlecha(ctx, cx + 30, cy, cx + 90, cy, '#38bdf8', 2.5); // F
      dibujarFlecha(ctx, cx - 30, cy, cx - 80, cy, '#ef4444', 2.5); // fr
      dibujarFlecha(ctx, cx, cy - 30, cx, cy - 80, '#10b981', 2.5); // Normal
      dibujarFlecha(ctx, cx, cy + 30, cx, cy + 80, '#f59e0b', 2.5); // Peso

      ctx.fillStyle = '#f8fafc'; ctx.font = '10px monospace';
      ctx.fillText(`N=${norm.toFixed(1)}N`, cx + 6, cy - 65);
      ctx.fillText(`mg=${peso.toFixed(1)}N`, cx + 6, cy + 65);
      ctx.fillText(`F=${f}N`, cx + 65, cy - 8);
      ctx.fillText(`fr=${fric.toFixed(1)}N`, cx - 85, cy - 8);

      s.innerHTML = `<h3 style="color:#38bdf8;">DCL Plano: Normal = ${norm.toFixed(1)} N | Fricción = ${fric.toFixed(1)} N | Aceleración = <b>${a.toFixed(2)} m/s²</b></h3>`;
    } else {
      const aVert = parseFloat(document.getElementById('dcl-a-vert').value) || 0;
      const tension = m * (g + aVert);

      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, 15); ctx.lineTo(cx, cy - 25); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.fillRect(cx - 25, cy - 25, 50, 50); ctx.strokeRect(cx - 25, cy - 25, 50, 50);

      dibujarFlecha(ctx, cx, cy - 25, cx, cy - 75, '#10b981', 2.5); // Tensión
      dibujarFlecha(ctx, cx, cy + 25, cx, cy + 75, '#ef4444', 2.5); // Peso

      ctx.fillStyle = '#f8fafc'; ctx.font = '10px monospace';
      ctx.fillText(`T = ${tension.toFixed(1)} N`, cx + 8, cy - 50);
      ctx.fillText(`mg = ${peso.toFixed(1)} N`, cx + 8, cy + 55);

      s.innerHTML = `<h3 style="color:#10b981;">Cuerpo Colgante: Tensión de la cuerda = <b>${tension.toFixed(2)} N</b> | Peso = <b>${peso.toFixed(2)} N</b></h3>`;
    }
  }
  s.style.display = 'block';
}

function dibujarFlecha(ctx, x1, y1, x2, y2, color, w) {
  const head = 8, a = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(a - Math.PI/6), y2 - head * Math.sin(a - Math.PI/6));
  ctx.lineTo(x2 - head * Math.cos(a + Math.PI/6), y2 - head * Math.sin(a + Math.PI/6));
  ctx.fill();
}

// ==========================================
// 5. ROBÓTICA: ESQUEMAS, RESISTENCIAS Y OHM
// ==========================================
function configurarInputsComponente() {
  const comp = document.getElementById('rob-sel-comp').value;
  const cont = document.getElementById('rob-inputs-comp');
  if (comp === 'diodo') {
    cont.innerHTML = `
      <div class="form-group"><label>Vcc [V]:</label><input type="number" id="inp-rob-vcc" value="5"></div>
      <div class="form-group"><label>Vdiodo [V]:</label><input type="number" id="inp-rob-vd" value="0.7"></div>
      <div class="form-group"><label>Corriente [A]:</label><input type="number" id="inp-rob-i" value="0.02"></div>
    `;
  } else if (comp === 'transistor') {
    cont.innerHTML = `
      <div class="form-group"><label>Corriente Carga [mA]:</label><input type="number" id="inp-rob-ic" value="200"></div>
      <div class="form-group"><label>Ganancia β (hFE):</label><input type="number" id="inp-rob-beta" value="100"></div>
      <div class="form-group"><label>V_control [V]:</label><input type="number" id="inp-rob-vctrl" value="5"></div>
    `;
  } else if (comp === 'capacitor') {
    cont.innerHTML = `
      <div class="form-group"><label>Resistencia R [Ω]:</label><input type="number" id="inp-rob-rc-r" value="1000"></div>
      <div class="form-group"><label>Capacitancia C [µF]:</label><input type="number" id="inp-rob-rc-c" value="100"></div>
    `;
  } else {
    cont.innerHTML = `
      <div class="form-group"><label>Vin [V]:</label><input type="number" id="inp-rob-vin" value="12"></div>
      <div class="form-group"><label>Vout [V]:</label><input type="number" id="inp-rob-vout" value="5"></div>
      <div class="form-group"><label>Corriente Carga [A]:</label><input type="number" id="inp-rob-i-reg" value="0.5"></div>
    `;
  }
  calcularComponenteHardware();
}

function calcularComponenteHardware() {
  const comp = document.getElementById('rob-sel-comp').value;
  const cvs = document.getElementById('cvsEsquemaRob');
  const s = document.getElementById('salida');

  if (cvs) {
    const ctx = cvs.getContext('2d'), cx = cvs.width / 2, cy = cvs.height / 2;
    ctx.clearRect(0,0,cvs.width, cvs.height);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;

    if (comp === 'diodo') {
      // Dibujar diodo y resistor
      ctx.beginPath(); ctx.moveTo(50, cy); ctx.lineTo(160, cy); ctx.stroke();
      // Resistor
      ctx.strokeRect(160, cy - 12, 60, 24);
      ctx.beginPath(); ctx.moveTo(220, cy); ctx.lineTo(290, cy); ctx.stroke();
      // Triángulo diodo
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.moveTo(290, cy - 18); ctx.lineTo(290, cy + 18); ctx.lineTo(325, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(325, cy - 18); ctx.lineTo(325, cy + 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(325, cy); ctx.lineTo(420, cy); ctx.stroke();

      let vcc = parseFloat(document.getElementById('inp-rob-vcc').value) || 5;
      let vd = parseFloat(document.getElementById('inp-rob-vd').value) || 0.7;
      let i = parseFloat(document.getElementById('inp-rob-i').value) || 0.02;
      let r = (vcc - vd) / i;
      s.innerHTML = `<h3 style="color:#38bdf8;">Esquema Diodo: R limitadora = <b>${r.toFixed(1)} Ω</b></h3>`;
    } else {
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(cx - 50, cy - 35, 100, 70);
      ctx.fillStyle = '#f8fafc'; ctx.font = '12px monospace';
      ctx.fillText(comp.toUpperCase(), cx - 35, cy + 5);
      s.innerHTML = `<h3 style="color:#f59e0b;">Esquema Generado para ${comp.toUpperCase()}</h3>`;
    }
  }
  s.style.display = 'block';
}

let listaResistencias = [220, 330, 470];
function renderizarListaResistencias() {
  const cont = document.getElementById('lista-resistencias-red');
  if (!cont) return;
  cont.innerHTML = "";
  listaResistencias.forEach((r, idx) => {
    cont.innerHTML += `
      <div style="display:inline-flex; align-items:center; gap:4px; background:#0f172a; padding:4px 8px; border-radius:6px; margin:4px; border:1px solid #334155;">
        <b>R${idx+1}:</b>
        <input type="number" value="${r}" style="width:70px; padding:2px;" onchange="listaResistencias[${idx}]=parseFloat(this.value)||0;calcResistenciaEquivalente();"> Ω
        ${listaResistencias.length > 1 ? `<button class="btn-del" onclick="eliminarResistorRed(${idx})">✖</button>` : ''}
      </div>
    `;
  });
  calcResistenciaEquivalente();
}
function agregarResistorRed() {
  listaResistencias.push(100);
  renderizarListaResistencias();
}
function eliminarResistorRed(idx) {
  listaResistencias.splice(idx, 1);
  renderizarListaResistencias();
}
function calcResistenciaEquivalente() {
  const modo = document.getElementById('res-modo-asoc').value;
  let req = 0;
  if (modo === 'serie') {
    req = listaResistencias.reduce((a, b) => a + b, 0);
  } else {
    let sumInv = listaResistencias.reduce((a, b) => a + (b > 0 ? 1/b : 0), 0);
    req = sumInv > 0 ? 1 / sumInv : 0;
  }
  const cvs = document.getElementById('cvsResistenciasRed');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cy = h/2;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(60, cy); ctx.stroke();
    listaResistencias.forEach((r, i) => {
      let px = 60 + i * (320 / listaResistencias.length);
      ctx.strokeRect(px, cy - 12, 35, 24);
      ctx.beginPath(); ctx.moveTo(px + 35, cy); ctx.lineTo(px + (320 / listaResistencias.length), cy); ctx.stroke();
    });
  }
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#10b981;">Resistencia Equivalente Total (${modo}): Req = <b>${req.toFixed(2)} Ω</b></h3>`;
  s.style.display = 'block';
}

function configurarInputsOhm() {
  const p = document.getElementById('ohm-pareja-datos').value;
  const cont = document.getElementById('inputs-ohm-dinamicos');
  if (p === 'vr') cont.innerHTML = `<div class="form-group"><label>V [V]:</label><input type="number" id="ohm-v" value="12"></div><div class="form-group"><label>R [Ω]:</label><input type="number" id="ohm-r" value="4"></div>`;
  else if (p === 'vi') cont.innerHTML = `<div class="form-group"><label>V [V]:</label><input type="number" id="ohm-v" value="12"></div><div class="form-group"><label>I [A]:</label><input type="number" id="ohm-i" value="3"></div>`;
  else cont.innerHTML = `<div class="form-group"><label>I [A]:</label><input type="number" id="ohm-i" value="2"></div><div class="form-group"><label>R [Ω]:</label><input type="number" id="ohm-r" value="10"></div>`;
}

function calcCircuitoEsquematico() {
  let v = 0, i = 0, r = 0, p = 0;
  if (document.getElementById('ohm-v') && document.getElementById('ohm-r')) {
    v = parseFloat(document.getElementById('ohm-v').value) || 0;
    r = parseFloat(document.getElementById('ohm-r').value) || 1;
    i = v / r; p = v * i;
  } else if (document.getElementById('ohm-v') && document.getElementById('ohm-i')) {
    v = parseFloat(document.getElementById('ohm-v').value) || 0;
    i = parseFloat(document.getElementById('ohm-i').value) || 0;
    r = i > 0 ? v / i : 0; p = v * i;
  } else {
    i = parseFloat(document.getElementById('ohm-i').value) || 0;
    r = parseFloat(document.getElementById('ohm-r').value) || 0;
    v = i * r; p = v * i;
  }
  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;">Rueda de la Ley de Ohm & Potencia:</h3>
    <div class="step">Voltaje V = <b>${v.toFixed(2)} V</b> | Corriente I = <b>${i.toFixed(3)} A</b></div>
    <div class="step">Resistencia R = <b>${r.toFixed(2)} Ω</b> | Potencia P = <b>${p.toFixed(2)} W</b></div>
  `;
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

// ==========================================
// 6. QUÍMICA INTEGRAL: TABLA COMPLETA, PARSER Y DIBUJO ESTRUCTURAL
// ==========================================

// Base de datos de la Tabla Periódica
const tablaPeriodicaCompleta = [
  { z: 1, s: "H", n: "Hidrógeno", m: 1.008, g: "No metal", val: "1, -1" },
  { z: 2, s: "He", n: "Helio", m: 4.003, g: "Gas noble", val: "0" },
  { z: 3, s: "Li", n: "Litio", m: 6.94, g: "Metal alcalino", val: "1" },
  { z: 4, s: "Be", n: "Berilio", m: 9.012, g: "Alcalinotérreo", val: "2" },
  { z: 5, s: "B", n: "Boro", m: 10.81, g: "Metaloide", val: "3" },
  { z: 6, s: "C", n: "Carbono", m: 12.011, g: "No metal", val: "2, 4, -4" },
  { z: 7, s: "N", n: "Nitrógeno", m: 14.007, g: "No metal", val: "1, 2, 3, 4, 5, -3" },
  { z: 8, s: "O", n: "Oxígeno", m: 15.999, g: "No metal", val: "-2" },
  { z: 9, s: "F", n: "Flúor", m: 18.998, g: "Halógeno", val: "-1" },
  { z: 10, s: "Ne", n: "Neón", m: 20.180, g: "Gas noble", val: "0" },
  { z: 11, s: "Na", n: "Sodio", m: 22.990, g: "Metal alcalino", val: "1" },
  { z: 12, s: "Mg", n: "Magnesio", m: 24.305, g: "Alcalinotérreo", val: "2" },
  { z: 13, s: "Al", n: "Aluminio", m: 26.982, g: "Metal del bloque p", val: "3" },
  { z: 14, s: "Si", n: "Silicio", m: 28.085, g: "Metaloide", val: "4, -4" },
  { z: 15, s: "P", n: "Fósforo", m: 30.974, g: "No metal", val: "3, 5, -3" },
  { z: 16, s: "S", n: "Azufre", m: 32.06, g: "No metal", val: "2, 4, 6, -2" },
  { z: 17, s: "Cl", n: "Cloro", m: 35.45, g: "Halógeno", val: "1, 3, 5, 7, -1" },
  { z: 18, s: "Ar", n: "Argón", m: 39.948, g: "Gas noble", val: "0" },
  { z: 19, s: "K", n: "Potasio", m: 39.098, g: "Metal alcalino", val: "1" },
  { z: 20, s: "Ca", n: "Calcio", m: 40.078, g: "Alcalinotérreo", val: "2" },
  { z: 21, s: "Sc", n: "Escandio", m: 44.956, g: "Transición", val: "3" },
  { z: 22, s: "Ti", n: "Titanio", m: 47.867, g: "Transición", val: "2, 3, 4" },
  { z: 23, s: "V", n: "Vanadio", m: 50.942, g: "Transición", val: "2, 3, 4, 5" },
  { z: 24, s: "Cr", n: "Cromo", m: 51.996, g: "Transición", val: "2, 3, 6" },
  { z: 25, s: "Mn", n: "Manganeso", m: 54.938, g: "Transición", val: "2, 3, 4, 6, 7" },
  { z: 26, s: "Fe", n: "Hierro", m: 55.845, g: "Transición", val: "2, 3" },
  { z: 27, s: "Co", n: "Cobalto", m: 58.933, g: "Transición", val: "2, 3" },
  { z: 28, s: "Ni", n: "Níquel", m: 58.693, g: "Transición", val: "2, 3" },
  { z: 29, s: "Cu", n: "Cobre", m: 63.546, g: "Transición", val: "1, 2" },
  { z: 30, s: "Zn", n: "Zinc", m: 65.38, g: "Transición", val: "2" },
  { z: 31, s: "Ga", n: "Galio", m: 69.723, g: "Metal del bloque p", val: "3" },
  { z: 32, s: "Ge", n: "Germanio", m: 72.630, g: "Metaloide", val: "4" },
  { z: 33, s: "As", n: "Arsénico", m: 74.922, g: "Metaloide", val: "3, 5, -3" },
  { z: 34, s: "Se", n: "Selenio", m: 78.971, g: "No metal", val: "2, 4, 6, -2" },
  { z: 35, s: "Br", n: "Bromo", m: 79.904, g: "Halógeno", val: "1, 3, 5, -1" },
  { z: 36, s: "Kr", n: "Kriptón", m: 83.798, g: "Gas noble", val: "0" },
  { z: 37, s: "Rb", n: "Rubidio", m: 85.468, g: "Metal alcalino", val: "1" },
  { z: 38, s: "Sr", n: "Estroncio", m: 87.62, g: "Alcalinotérreo", val: "2" },
  { z: 47, s: "Ag", n: "Plata", m: 107.87, g: "Transición", val: "1" },
  { z: 50, s: "Sn", n: "Estaño", m: 118.71, g: "Metal del bloque p", val: "2, 4" },
  { z: 53, s: "I", n: "Yodo", m: 126.90, g: "Halógeno", val: "1, 3, 5, 7, -1" },
  { z: 56, s: "Ba", n: "Bario", m: 137.33, g: "Alcalinotérreo", val: "2" },
  { z: 74, s: "W", n: "Wolframio / Tungsteno", m: 183.84, g: "Transición", val: "2, 4, 6" },
  { z: 78, s: "Pt", n: "Platino", m: 195.08, g: "Transición", val: "2, 4" },
  { z: 79, s: "Au", n: "Oro", m: 196.97, g: "Transición", val: "1, 3" },
  { z: 80, s: "Hg", n: "Mercurio", m: 200.59, g: "Transición", val: "1, 2" },
  { z: 82, s: "Pb", n: "Plomo", m: 207.2, g: "Metal del bloque p", val: "2, 4" },
  { z: 92, s: "U", n: "Uranio", m: 238.03, g: "Actínido", val: "3, 4, 5, 6" }
];

// Diccionario de pesos atómicos indexado por símbolo
const tablaPesosCompletos = {};
tablaPeriodicaCompleta.forEach(el => { tablaPesosCompletos[el.s] = el.m; });

// Paleta CPK
const coloresCPK = {
  H: "#f8fafc", C: "#334155", O: "#ef4444", N: "#3b82f6", S: "#eab308",
  Cl: "#22c55e", Na: "#a855f7", Ca: "#64748b", Mn: "#ec4899", K: "#9333ea",
  Al: "#94a3b8", Fe: "#d97706", Cu: "#ea580c", Zn: "#475569", Br: "#991b1b",
  I: "#6b21a8", P: "#f59e0b", Ba: "#059669", Ti: "#64748b", Ag: "#cbd5e1", Au: "#eab308"
};

// Geometrías exactas para compuestos frecuentes
const datosCompuestosQuim = {
  "H2O": {
    nom: { iupac: "Monóxido de dihidrógeno", stock: "Óxido de hidrógeno", trad: "Agua" },
    tipoEnlace: "Covalente polar (104.5°)", geom: "Angular",
    atomos: [{el:"O", x:0, y:-10, r:24}, {el:"H", x:-65, y:40, r:16}, {el:"H", x:65, y:40, r:16}],
    enlaces: [[0,1,1], [0,2,1]]
  },
  "CO2": {
    nom: { iupac: "Dióxido de carbono", stock: "Óxido de carbono(IV)", trad: "Anhídrido carbónico" },
    tipoEnlace: "Covalente no polar (Dobles enlaces)", geom: "Lineal (180°)",
    atomos: [{el:"C", x:0, y:0, r:22}, {el:"O", x:-90, y:0, r:22}, {el:"O", x:90, y:0, r:22}],
    enlaces: [[0,1,2], [0,2,2]]
  },
  "CH4": {
    nom: { iupac: "Tetrahidruro de carbono", stock: "Hidruro de carbono(IV)", trad: "Metano" },
    tipoEnlace: "Covalente no polar", geom: "Tetraédrica (109.5°)",
    atomos: [{el:"C", x:0, y:0, r:22}, {el:"H", x:0, y:-70, r:16}, {el:"H", x:70, y:20, r:16}, {el:"H", x:-70, y:20, r:16}, {el:"H", x:0, y:70, r:16}],
    enlaces: [[0,1,1], [0,2,1], [0,3,1], [0,4,1]]
  },
  "NH3": {
    nom: { iupac: "Trihidruro de nitrógeno", stock: "Hidruro de nitrógeno(III)", trad: "Amoníaco" },
    tipoEnlace: "Covalente polar", geom: "Piramidal trigonal",
    atomos: [{el:"N", x:0, y:-15, r:22}, {el:"H", x:-60, y:45, r:16}, {el:"H", x:60, y:45, r:16}, {el:"H", x:0, y:60, r:16}],
    enlaces: [[0,1,1], [0,2,1], [0,3,1]]
  },
  "HCl": {
    nom: { iupac: "Cloruro de hidrógeno", stock: "Cloruro de hidrógeno", trad: "Ácido clorhídrico" },
    tipoEnlace: "Covalente polar", geom: "Lineal",
    atomos: [{el:"Cl", x:-40, y:0, r:26}, {el:"H", x:50, y:0, r:16}],
    enlaces: [[0,1,1]]
  },
  "NaCl": {
    nom: { iupac: "Monocloruro de sodio", stock: "Cloruro de sodio", trad: "Sal común" },
    tipoEnlace: "Iónico (Na⁺ Cl⁻)", geom: "Red iónica",
    atomos: [{el:"Na", x:-50, y:0, r:20}, {el:"Cl", x:50, y:0, r:26}],
    enlaces: [[0,1,1]]
  },
  "C2H5OH": {
    nom: { iupac: "Etanol", stock: "Etanol", trad: "Alcohol etílico" },
    tipoEnlace: "Covalente polar (-OH)", geom: "Tetraédrica plegada",
    atomos: [{el:"C", x:-70, y:0, r:20}, {el:"C", x:0, y:0, r:20}, {el:"O", x:65, y:0, r:22}, {el:"H", x:115, y:0, r:15}],
    enlaces: [[0,1,1], [1,2,1], [2,3,1]]
  },
  "H2SO4": {
    nom: { iupac: "Tetraoxosulfato(VI) de hidrógeno", stock: "Sulfato(VI) de hidrógeno", trad: "Ácido sulfúrico" },
    tipoEnlace: "Covalente coordinado", geom: "Tetraédrica en S",
    atomos: [{el:"S", x:0, y:0, r:24}, {el:"O", x:0, y:-60, r:20}, {el:"O", x:0, y:60, r:20}, {el:"O", x:-60, y:0, r:20}, {el:"O", x:60, y:0, r:20}],
    enlaces: [[0,1,2], [0,2,2], [0,3,1], [0,4,1]]
  },
  "HNO3": {
    nom: { iupac: "Trioxonitrato(V) de hidrógeno", stock: "Nitrato(V) de hidrógeno", trad: "Ácido nítrico" },
    tipoEnlace: "Covalente polar resonante", geom: "Trigonal plana",
    atomos: [{el:"N", x:0, y:0, r:22}, {el:"O", x:0, y:-55, r:20}, {el:"O", x:55, y:30, r:20}, {el:"O", x:-55, y:30, r:20}],
    enlaces: [[0,1,2], [0,2,1], [0,3,1]]
  },
  "NaOH": {
    nom: { iupac: "Hidróxido de sodio", stock: "Hidróxido de sodio", trad: "Sosa cáustica" },
    tipoEnlace: "Iónico (Na⁺ OH⁻)", geom: "Lineal iónica",
    atomos: [{el:"Na", x:-65, y:0, r:20}, {el:"O", x:10, y:0, r:22}, {el:"H", x:65, y:0, r:15}],
    enlaces: [[0,1,1], [1,2,1]]
  },
  "CaCO3": {
    nom: { iupac: "Trioxocarbonato de calcio", stock: "Carbonato de calcio", trad: "Caliza" },
    tipoEnlace: "Iónico y covalente", geom: "Trigonal plana en anión",
    atomos: [{el:"Ca", x:-75, y:0, r:24}, {el:"C", x:20, y:0, r:20}, {el:"O", x:20, y:-50, r:18}, {el:"O", x:75, y:0, r:18}, {el:"O", x:20, y:50, r:18}],
    enlaces: [[0,1,1], [1,2,2], [1,3,1], [1,4,1]]
  },
  "KMnO4": {
    nom: { iupac: "Tetraoxomanganato(VII) de potasio", stock: "Permanganato de potasio", trad: "Permanganato potásico" },
    tipoEnlace: "Iónico", geom: "Tetraédrica en Mn",
    atomos: [{el:"K", x:-80, y:0, r:22}, {el:"Mn", x:15, y:0, r:24}, {el:"O", x:15, y:-55, r:18}, {el:"O", x:70, y:0, r:18}, {el:"O", x:15, y:55, r:18}],
    enlaces: [[0,1,1], [1,2,2], [1,3,1], [1,4,2]]
  },
  "C6H12O6": {
    nom: { iupac: "2,3,4,5,6-pentahidroxihexanal", stock: "D-Glucosa", trad: "Glucosa" },
    tipoEnlace: "Covalente polar", geom: "Anillo piranósico",
    atomos: [{el:"C", x:-45, y:-25, r:17}, {el:"C", x:0, y:-45, r:17}, {el:"C", x:45, y:-25, r:17}, {el:"C", x:45, y:25, r:17}, {el:"C", x:0, y:45, r:17}, {el:"O", x:-45, y:25, r:19}],
    enlaces: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1]]
  }
};

function buscarElementoQuimico() {
  const txt = (document.getElementById('tabla-buscador') ? document.getElementById('tabla-buscador').value : "").toLowerCase().trim();
  const cont = document.getElementById('tabla-resultados-contenedor');
  if (!cont) return;

  const filtrados = tablaPeriodicaCompleta.filter(el =>
    el.n.toLowerCase().includes(txt) ||
    el.s.toLowerCase().includes(txt) ||
    el.z.toString() === txt
  );

  cont.innerHTML = "";
  if (filtrados.length === 0) {
    cont.innerHTML = `<div style="color:#94a3b8; text-align:center; padding:10px;">No se encontraron elementos coincidentes con "${txt}".</div>`;
    return;
  }

  filtrados.forEach(el => {
    cont.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding:6px 8px;">
        <div>
          <b style="color:#38bdf8; font-size:1.15rem;">${el.s}</b> <span style="color:#f8fafc; font-weight:bold;">— ${el.n}</span> (Z = ${el.z})
          <span style="display:block; font-size:0.8rem; color:#94a3b8;">Familia: ${el.g} | Valencia: ${el.val}</span>
        </div>
        <div style="text-align:right;">
          <b style="color:#10b981; font-family:monospace; font-size:0.95rem;">${el.m} g/mol</b>
        </div>
      </div>
    `;
  });
}

function limpiarSelectorPredefinido() {
  const s = document.getElementById('chem-comp');
  if (s) s.value = "";
}

function cargarCompuestoPredefinido() {
  const s = document.getElementById('chem-comp').value;
  if (s) {
    document.getElementById('chem-custom-input').value = s;
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
    } else if (num && elementoPrevio) {
      stack[stack.length - 1][elementoPrevio] += parseInt(num) - 1;
      elementoPrevio = null;
    } else if (abre) {
      stack.push({});
      elementoPrevio = null;
    } else if (cierra) {
      const grupo = stack.pop();
      elementoPrevio = null;
      let mult = 1;
      const sig = formula.slice(regex.lastIndex).match(/^\d+/);
      if (sig) { mult = parseInt(sig[0]); regex.lastIndex += sig[0].length; }
      for (let k in grupo) stack[stack.length - 1][k] = (stack[stack.length - 1][k] || 0) + (grupo[k] * mult);
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

  // Enlaces
  mol.enlaces.forEach(enl => {
    const a1 = mol.atomos[enl[0]], a2 = mol.atomos[enl[1]], orden = enl[2] || 1;
    const x1 = cx + a1.x, y1 = cy + a1.y, x2 = cx + a2.x, y2 = cy + a2.y;
    ctx.strokeStyle = '#64748b';
    if (orden === 1) {
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    } else {
      ctx.lineWidth = 3;
      const dx = y2 - y1, dy = -(x2 - x1);
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const ox = (dx / len) * 4, oy = (dy / len) * 4;
      ctx.beginPath(); ctx.moveTo(x1 + ox, y1 + oy); ctx.lineTo(x2 + ox, y2 + oy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - ox, y1 - oy); ctx.lineTo(x2 - ox, y2 - oy); ctx.stroke();
    }
  });

  // Esferas atómicas
  mol.atomos.forEach(at => {
    const px = cx + at.x, py = cy + at.y, col = coloresCPK[at.el] || "#cbd5e1";
    let grad = ctx.createRadialGradient(px - at.r * 0.3, py - at.r * 0.3, at.r * 0.1, px, py, at.r);
    grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.4, col); grad.addColorStop(1, "#090d16");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(px, py, at.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = at.el === "H" ? "#0f172a" : "#f8fafc";
    ctx.font = `bold ${Math.round(at.r * 0.85)}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(at.el, px, py);
  });
}

function dibujarEstructuraQuimicaGenerica(formula, conteo) {
  const cvs = document.getElementById('cvsMol2D');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2;
  ctx.clearRect(0, 0, w, h);

  if (datosCompuestosQuim[formula]) {
    dibujarEstructura2DMolecula(formula);
    return;
  }

  const elementos = Object.keys(conteo);
  let atomoCentral = elementos.find(e => e !== "H" && e !== "O") || elementos[0];
  let listaPerifericos = [];

  for (let el in conteo) {
    let cant = conteo[el];
    if (el === atomoCentral) cant -= 1;
    for (let i = 0; i < cant; i++) listaPerifericos.push(el);
  }

  const totalPerifericos = Math.min(listaPerifericos.length, 10);
  const radioOrbita = totalPerifericos > 5 ? 85 : 70;

  // Enlaces radiales
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 4;
  for (let i = 0; i < totalPerifericos; i++) {
    const ang = (i * 2 * Math.PI) / totalPerifericos - Math.PI / 2;
    const px = cx + radioOrbita * Math.cos(ang);
    const py = cy + radioOrbita * Math.sin(ang);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  }

  const dibujarEsfera = (el, x, y, r) => {
    const col = coloresCPK[el] || "#cbd5e1";
    let grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.4, col); grad.addColorStop(1, "#090d16");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = el === "H" ? "#0f172a" : "#f8fafc";
    ctx.font = `bold ${Math.round(r * 0.85)}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(el, x, y);
  };

  // Átomos periféricos
  for (let i = 0; i < totalPerifericos; i++) {
    const ang = (i * 2 * Math.PI) / totalPerifericos - Math.PI / 2;
    const px = cx + radioOrbita * Math.cos(ang);
    const py = cy + radioOrbita * Math.sin(ang);
    const el = listaPerifericos[i];
    dibujarEsfera(el, px, py, el === "H" ? 16 : 22);
  }

  // Átomo central
  dibujarEsfera(atomoCentral, cx, cy, 26);
}

function calcMasaMolarExtendida() {
  const f = (document.getElementById('chem-custom-input') ? document.getElementById('chem-custom-input').value : "H2O").trim();
  const s = document.getElementById('salida');
  if (!f) return;

  const conteo = parsearFormulaQuimica(f);
  if (!conteo || Object.keys(conteo).length === 0) {
    alert("Fórmula no válida. Escribe elementos respetando mayúsculas y minúsculas (ej: NaCl, Ca(OH)2).");
    return;
  }

  let total = 0, desglose = "";
  for (let el in conteo) {
    let p = tablaPesosCompletos[el] || 1.0;
    let sub = conteo[el] * p;
    total += sub;
    desglose += `<li><b>${el}:</b> ${conteo[el]} átomo(s) × ${p} g/mol = <code>${sub.toFixed(2)} g/mol</code></li>`;
  }

  // Dibuja la estructura y los enlaces
  dibujarEstructuraQuimicaGenerica(f, conteo);

  const predef = datosCompuestosQuim[f];
  let bloqueNom = "";
  if (predef) {
    bloqueNom = `
      <div class="step" style="border-left-color:#10b981;">
        <b>Nomenclaturas Químicas:</b>
        <table class="didact-table" style="margin-top:6px;">
          <tr><th>IUPAC / Sistemática</th><th>Stock</th><th>Tradicional</th></tr>
          <tr>
            <td><b style="color:#38bdf8;">${predef.nom.iupac}</b></td>
            <td><b>${predef.nom.stock}</b></td>
            <td><span style="color:#fde68a;">${predef.nom.trad}</span></td>
          </tr>
        </table>
        <div style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">
          • <b>Enlace:</b> ${predef.tipoEnlace} | • <b>Geometría:</b> ${predef.geom}
        </div>
      </div>
    `;
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Análisis Químico: ${f}</h3>
    ${bloqueNom}
    <div class="step">
      <b>Composición Elemental:</b>
      <ul style="margin:4px 0; padding-left:18px;">${desglose}</ul>
      <b>Masa Molar Total:</b> <b style="color:#10b981; font-size:1.15rem;">${total.toFixed(2)} g/mol</b>
    </div>
  `;
  s.style.display = 'block';
}

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
  const cont = document.getElementById('inputs-soluciones-dinamicos');
  cont.innerHTML = `<div class="form-group"><label>Moles de soluto [mol]:</label><input type="number" id="sol-n" value="0.75" step="any"></div><div class="form-group"><label>Volumen [L]:</label><input type="number" id="sol-v" value="1.5" step="any"></div>`;
}

function calcMolaridad() {
  const n = parseFloat(document.getElementById('sol-n').value) || 0.75;
  const v = parseFloat(document.getElementById('sol-v').value) || 1.5;
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#38bdf8;">Molaridad = n / V = <b>${(n/v).toFixed(3)} M</b></h3>`;
  s.style.display = 'block';
}

function ajustarInputsPH() {}

function calcularPH() {
  const val = parseFloat(document.getElementById('val-ph-in').value) || 0.001;
  const ph = -Math.log10(val);
  const s = document.getElementById('salida');
  s.innerHTML = `<h3 style="color:#10b981;">pH = <b>${ph.toFixed(2)}</b> | pOH = <b>${(14 - ph).toFixed(2)}</b></h3>`;
  s.style.display = 'block';
}

// ==========================================
// 7. DESAFÍOS ANTI-ESTRÉS
// ==========================================
const bancoTrivia = {
  facil: [
    { q: "Identidad Pitagórica Fundamental", desc: "Si sen(θ) = 0.6 y cos(θ) = 0.8, ¿cuánto resulta sen²(θ) + cos²(θ)?", ans: 1, tol: 0.05, pista: "sen²(θ) + cos²(θ) siempre es igual a 1." },
    { q: "Exponente Cero", desc: "¿Cuánto es 999⁰?", ans: 1, tol: 0.01, pista: "Cualquier número distinto de cero elevado a cero es 1." },
    { q: "Número Atómico del Carbono", desc: "¿Cuál es el número atómico (Z) del Carbono?", ans: 6, tol: 0.1, pista: "El Carbono tiene 6 protones: Z = 6." }
  ],
  medio: [
    { q: "Área de un Rombo", desc: "Diagonal mayor D = 8 m, diagonal menor d = 5 m. ¿Área en m²?", ans: 20, tol: 0.2, pista: "A = (D · d) / 2 = (8 · 5) / 2." },
    { q: "Fuerzas Opuestas", desc: "F1 = 12 N (derecha), F2 = 5 N (izquierda). ¿Fuerza resultante?", ans: 7, tol: 0.1, pista: "Resta 12 menos 5." },
    { q: "Masa Molar del Agua", desc: "¿Cuál es la masa molar aproximada del H₂O en g/mol?", ans: 18.01, tol: 0.2, pista: "Dos hidrógenos (2) + un oxígeno (16)." }
  ],
  dificil: [
    { q: "Equilibrio Rotacional (Torque)", desc: "Carga de 30 N a 2 m del eje (+60 N·m). ¿A qué distancia equilibra una de 40 N?", ans: 1.5, tol: 0.05, pista: "Divide 60 entre 40." },
    { q: "Derivada por Regla de la Potencia", desc: "Si f(x) = 5 · x^4, su derivada es k · x^3. ¿Cuánto vale k?", ans: 20, tol: 0.1, pista: "Multiplica el coeficiente por el exponente: 5 · 4." }
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
  if (preguntaActual) {
    document.getElementById('j-pista').innerText = preguntaActual.pista;
    document.getElementById('j-pista').style.display = 'block';
  }
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

// Desafíos
const bancoTrivia = {
  facil: [{ q: "Exponente Cero", desc: "¿Cuánto es 999⁰?", ans: 1, tol: 0.01, pista: "Cualquier número elevado a 0 es 1." }],
  medio: [{ q: "Área de un Rombo", desc: "D = 8 m, d = 5 m. ¿Área en m²?", ans: 20, tol: 0.2, pista: "Multiplica D por d y divide entre 2." }],
  dificil: [{ q: "Torque", desc: "F = 30N a 2m. ¿A qué distancia equilibra una de 40N?", ans: 1.5, tol: 0.05, pista: "Divide 60 entre 40." }]
};
let vidas = 3, xp = 0, preguntaActual = null;
function cambiarDificultadTrivia() { cargarPreguntaTrivia(); }
function cargarPreguntaTrivia() {
  const dif = document.getElementById('trivia-dificultad') ? document.getElementById('trivia-dificultad').value : 'medio';
  const lista = bancoTrivia[dif] || bancoTrivia['medio'];
  preguntaActual = lista[0];
  if (document.getElementById('j-titulo')) document.getElementById('j-titulo').innerText = preguntaActual.q;
  if (document.getElementById('j-desc')) document.getElementById('j-desc').innerText = preguntaActual.desc;
  if (document.getElementById('j-input')) document.getElementById('j-input').value = "";
  if (document.getElementById('j-msg')) document.getElementById('j-msg').innerText = "";
  if (document.getElementById('j-pista')) document.getElementById('j-pista').style.display = "none";
}
function mostrarPistaTrivia() {
  if (preguntaActual) {
    document.getElementById('j-pista').innerText = preguntaActual.pista;
    document.getElementById('j-pista').style.display = 'block';
  }
}
function verificarJuego() {
  const val = parseFloat(document.getElementById('j-input').value);
  if (Math.abs(val - preguntaActual.ans) <= preguntaActual.tol) {
    xp += 50;
    document.getElementById('j-msg').innerHTML = "<span style='color:#10b981;'>¡Correcto! (+50 XP)</span>";
    document.getElementById('j-xp').innerText = `${xp} XP`;
  } else {
    vidas--;
    document.getElementById('j-msg').innerHTML = "<span style='color:#ef4444;'>Intenta de nuevo con la pista.</span>";
  }
}

// Arranque
window.addEventListener('DOMContentLoaded', () => {
  actualizarFamilia2D();
  configurarInputs3D();
  configurarInputsTrig();
  actualizarListaIdentidades();
  renderizarListaTorques();
  configurarInputsMRUA();
  configurarInputsComponente();
  renderizarListaResistencias();
  configurarInputsOhm();
  configurarInputsGases();
  configurarInputsSoluciones();
  buscarElementoQuimico();
  cargarPreguntaTrivia();
});
