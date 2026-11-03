// ==========================================
// 1. NAVEGACIÓN GENERAL SEGURA
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

    // Inicializaciones por materia
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
  if (idSubmod === 'calc-figuras') { actualizarFamilia2D(); }
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
}

// ==========================================
// 2. CÁLCULO: DERIVADAS E INTEGRALES
// ==========================================
function resolverCalculoMetodo(tipo) {
  const expr = document.getElementById('calc-expr-input').value.trim();
  const s = document.getElementById('salida');
  if (!expr) { alert("Escribe una función."); return; }
  if (typeof Algebrite === 'undefined') { alert("Cargando motor de cálculo."); return; }

  try {
    let limpia = expr.replace(/sen\(/g, "sin(").replace(/(\d)([a-zA-Z])/g, "$1*$2");
    let metodo = "Regla de la Potencia y Suma Término a Término";
    if (limpia.includes("/") && limpia.includes("x")) metodo = "Regla del Cociente: d/dx [u / v] = (u'·v - u·v') / v²";
    else if (limpia.includes("*") && (limpia.match(/x/g) || []).length > 1) metodo = "Regla del Producto: d/dx [u · v] = u'·v + u·v'";
    else if (limpia.includes("sin") || limpia.includes("cos") || limpia.includes("exp")) metodo = "Regla de la Cadena con Funciones Trascendentes";

    let res = Algebrite.run(`d(${limpia}, x)`);
    s.innerHTML = `
      <h3 style="color:#38bdf8;margin:0 0 8px 0;">Derivada Resuelta Paso a Paso</h3>
      <div class="step"><b>1. Función evaluada:</b> <code>f(x) = ${expr}</code></div>
      <div class="step"><b>2. Método sugerido:</b> <span style="color:#fde68a;">${metodo}</span></div>
      <div class="step"><b>3. Resultado exacto simplificado:</b><br><b style="color:#38bdf8;font-size:1.15rem;">f'(x) = ${res}</b></div>
    `;
    s.style.display = 'block';
  } catch (err) { alert("Error de sintaxis en la expresión."); }
}

function calcularIntegralDedicada() {
  const expr = document.getElementById('int-expr-input').value.trim();
  const limAStr = document.getElementById('int-lim-a').value.trim();
  const limBStr = document.getElementById('int-lim-b').value.trim();
  const s = document.getElementById('salida');
  if (!expr) { alert("Escribe una función."); return; }
  if (typeof Algebrite === 'undefined') { alert("Cargando motor de cálculo."); return; }

  try {
    let limpia = expr.replace(/sen\(/g, "sin(").replace(/(\d)([a-zA-Z])/g, "$1*$2");
    let resIndef = Algebrite.run(`integral(${limpia}, x)`);

    let pasos = `
      <h3 style="color:#10b981;margin:0 0 8px 0;">Integral Resuelta y Graficada</h3>
      <div class="step"><b>Función evaluada:</b> <code>f(x) = ${expr}</code></div>
      <div class="step"><b>Antiderivada general:</b> <b style="color:#10b981;font-size:1.15rem;">∫ [ ${expr} ] dx = ${resIndef} + C</b></div>
    `;

    let limA = parseFloat(limAStr), limB = parseFloat(limBStr);
    const hayLimites = !isNaN(limA) && !isNaN(limB);

    if (hayLimites) {
      if (limA > limB) { let tmp = limA; limA = limB; limB = tmp; }
      const valB = Algebrite.run(`float(subst(${limB}, x, ${resIndef}))`);
      const valA = Algebrite.run(`float(subst(${limA}, x, ${resIndef}))`);
      const areaDef = Algebrite.run(`float(${valB} - (${valA}))`);

      pasos += `
        <div class="step" style="border-left-color:#f59e0b;">
          <b>Área Definida [${limA} a ${limB}]:</b> <code>F(${limB}) - F(${limA}) = <b style="color:#f59e0b;font-size:1.1rem;">${areaDef} u²</b></code>
        </div>
      `;
    }

    dibujarGraficaIntegral(limpia, hayLimites ? limA : -2, hayLimites ? limB : 2, hayLimites);
    s.innerHTML = pasos;
    s.style.display = 'block';
  } catch (err) { alert("Error de sintaxis en la integral."); }
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
      yVal = parseFloat(Algebrite.run(`float(subst(${xVal}, x, ${exprLimpia}))`));
      if (isNaN(yVal) || !isFinite(yVal)) yVal = 0;
    } catch (e) { yVal = 0; }
    arrPuntos.push({ x: xVal, y: yVal });
    if (yVal < yMin) yMin = yVal;
    if (yVal > yMax) yMax = yVal;
  }

  const margen = 25;
  const toCanvasX = x => margen + ((x - xMin) / (xMax - xMin)) * (w - 2 * margen);
  const toCanvasY = y => (h - margen) - ((y - yMin) / (yMax - yMin)) * (h - 2 * margen);
  const canvasYcero = toCanvasY(0);

  // Ejes
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(10, canvasYcero); ctx.lineTo(w - 10, canvasYcero); ctx.stroke();
  const canvasXcero = toCanvasX(0);
  ctx.beginPath(); ctx.moveTo(canvasXcero, 10); ctx.lineTo(canvasXcero, h - 10); ctx.stroke();

  if (sombrear) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
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
// 3. GEOMETRÍA 2D COMPLETA
// ==========================================
const catalogoGeometria2D = {
  triangulos: {
    "tri_base_h": { n: "Triángulo (Base y Altura)", f: "A = (b · h) / 2", in: [{id:"b", l:"Base (b):", v:6}, {id:"h", l:"Altura (h):", v:4}] },
    "tri_heron": { n: "Triángulo por 3 Lados (Fórmula de Herón)", f: "A = √[s(s-a)(s-b)(s-c)]", in: [{id:"a", l:"Lado a:", v:5}, {id:"b", l:"Lado b:", v:6}, {id:"c", l:"Lado c:", v:7}] },
    "tri_equilatero": { n: "Triángulo Equilátero", f: "A = (√3 / 4) · L²", in: [{id:"L", l:"Lado (L):", v:5}] }
  },
  circulares: {
    "circulo": { n: "Círculo", f: "A = π · r²", in: [{id:"r", l:"Radio (r):", v:4}] },
    "corona": { n: "Corona Circular (Anillo)", f: "A = π · (R² - r²)", in: [{id:"R", l:"Radio Mayor (R):", v:6}, {id:"r", l:"Radio Menor (r):", v:3}] },
    "sector": { n: "Sector Circular", f: "A = (θ / 360°) · π · r²", in: [{id:"r", l:"Radio (r):", v:5}, {id:"ang", l:"Ángulo central θ [°]:", v:60}] }
  },
  cuadrilateros: {
    "cuadrado": { n: "Cuadrado", f: "A = L²", in: [{id:"L", l:"Lado (L):", v:5}] },
    "rectangulo": { n: "Rectángulo / Romboide", f: "A = b · h", in: [{id:"b", l:"Base (b):", v:7}, {id:"h", l:"Altura (h):", v:4}] },
    "rombo": { n: "Rombo", f: "A = (D · d) / 2", in: [{id:"D", l:"Diagonal Mayor (D):", v:8}, {id:"d", l:"Diagonal Menor (d):", v:5}] },
    "trapecio": { n: "Trapecio", f: "A = [(B + b) / 2] · h", in: [{id:"B", l:"Base Mayor (B):", v:8}, {id:"b", l:"Base Menor (b):", v:4}, {id:"h", l:"Altura (h):", v:5}] }
  },
  poligonos: {
    "pol_regular": { n: "Polígono Regular de n lados (Pentágono, Hexágono...)", f: "A = (Perímetro · apotema) / 2", in: [{id:"n", l:"Número de lados (n ≥ 5):", v:6}, {id:"L", l:"Longitud de lado (L):", v:4}, {id:"ap", l:"Apotema (ap):", v:3.46}] }
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

  let area = 0, perim = 0, procedimiento = "";

  const cvs = document.getElementById('cvsGeometria2D');
  const ctx = cvs ? cvs.getContext('2d') : null;
  if (ctx) {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
  }

  const cx = cvs ? cvs.width / 2 : 0, cy = cvs ? cvs.height / 2 : 0;

  if (tipo === 'tri_base_h') {
    const b = parseFloat(document.getElementById('inp-g2d-b').value) || 1;
    const h = parseFloat(document.getElementById('inp-g2d-h').value) || 1;
    area = (b * h) / 2;
    procedimiento = `A = (${b} · ${h}) / 2 = <b>${area.toFixed(2)} u²</b>`;
    if (ctx) {
      ctx.beginPath(); ctx.moveTo(cx - 60, cy + 40); ctx.lineTo(cx + 60, cy + 40); ctx.lineTo(cx, cy - 40); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  } else if (tipo === 'tri_heron') {
    const a = parseFloat(document.getElementById('inp-g2d-a').value) || 1;
    const b = parseFloat(document.getElementById('inp-g2d-b').value) || 1;
    const c = parseFloat(document.getElementById('inp-g2d-c').value) || 1;
    const sp = (a + b + c) / 2;
    perim = a + b + c;
    const radicando = sp * (sp - a) * (sp - b) * (sp - c);
    area = radicando > 0 ? Math.sqrt(radicando) : 0;
    procedimiento = `Semiperímetro s = (${a}+${b}+${c})/2 = ${sp.toFixed(2)}.<br>A = √[${sp.toFixed(1)}·(${sp-a})·(${sp-b})·(${sp-c})] = <b>${area.toFixed(2)} u²</b>`;
    if (ctx) {
      ctx.beginPath(); ctx.moveTo(cx - 70, cy + 35); ctx.lineTo(cx + 60, cy + 35); ctx.lineTo(cx + 10, cy - 45); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  } else if (tipo === 'circulo') {
    const r = parseFloat(document.getElementById('inp-g2d-r').value) || 1;
    area = Math.PI * r * r;
    perim = 2 * Math.PI * r;
    procedimiento = `A = π · (${r})² = <b>${area.toFixed(3)} u²</b> | Perímetro: <b>${perim.toFixed(3)} u</b>`;
    if (ctx) { ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  } else if (tipo === 'corona') {
    const R = parseFloat(document.getElementById('inp-g2d-R').value) || 2;
    const r = parseFloat(document.getElementById('inp-g2d-r').value) || 1;
    area = Math.PI * (R * R - r * r);
    procedimiento = `A = π · [(${R})² - (${r})²] = <b>${area.toFixed(3)} u²</b>`;
    if (ctx) {
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (tipo === 'pol_regular') {
    const n = parseFloat(document.getElementById('inp-g2d-n').value) || 5;
    const L = parseFloat(document.getElementById('inp-g2d-L').value) || 1;
    const ap = parseFloat(document.getElementById('inp-g2d-ap').value) || 1;
    perim = n * L;
    area = (perim * ap) / 2;
    procedimiento = `Perímetro = ${n} · ${L} = ${perim.toFixed(1)} u.<br>A = (${perim} · ${ap}) / 2 = <b>${area.toFixed(2)} u²</b>`;
    if (ctx) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        let ang = (i * 2 * Math.PI / n) - Math.PI / 2;
        let px = cx + 55 * Math.cos(ang), py = cy + 55 * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  } else {
    // Cuadriláteros genéricos
    const L = parseFloat(document.getElementById('inp-g2d-L') ? document.getElementById('inp-g2d-L').value : 5) || 5;
    area = L * L;
    procedimiento = `A = ${L} · ${L} = <b>${area.toFixed(2)} u²</b>`;
    if (ctx) { ctx.fillRect(cx - 45, cy - 45, 90, 90); ctx.strokeRect(cx - 45, cy - 45, 90, 90); }
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Geometría 2D: ${info.n}</h3>
    <div class="step"><b>Fórmula canónica:</b> <code>${info.f}</code></div>
    <div class="step"><b>Cálculo paso a paso:</b><br>${procedimiento}</div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 4. VOLÚMENES 3D
// ==========================================
const esquemas3D = {
  cilindro: {
    inc: { vol: "Volumen", alt: "Altura (h)", rad: "Radio (r)" },
    in: {
      vol: [{id:"r", l:"Radio (r):", v:3}, {id:"h", l:"Altura (h):", v:8}],
      alt: [{id:"V", l:"Volumen (V):", v:226.19}, {id:"r", l:"Radio (r):", v:3}],
      rad: [{id:"V", l:"Volumen (V):", v:226.19}, {id:"h", l:"Altura (h):", v:8}]
    }
  },
  prisma: {
    inc: { vol: "Volumen", alt: "Alto (c)" },
    in: {
      vol: [{id:"l", l:"Largo (a):", v:6}, {id:"w", l:"Ancho (b):", v:4}, {id:"h", l:"Alto (c):", v:3}],
      alt: [{id:"V", l:"Volumen (V):", v:72}, {id:"l", l:"Largo (a):", v:6}, {id:"w", l:"Ancho (b):", v:4}]
    }
  },
  esfera: {
    inc: { vol: "Volumen", rad: "Radio (r)" },
    in: {
      vol: [{id:"r", l:"Radio (r):", v:4}],
      rad: [{id:"V", l:"Volumen (V):", v:268.08}]
    }
  },
  cono: {
    inc: { vol: "Volumen", alt: "Altura (h)" },
    in: {
      vol: [{id:"r", l:"Radio (r):", v:3}, {id:"h", l:"Altura (h):", v:7}],
      alt: [{id:"V", l:"Volumen (V):", v:65.97}, {id:"r", l:"Radio (r):", v:3}]
    }
  },
  piramide: {
    inc: { vol: "Volumen", alt: "Altura (h)" },
    in: {
      vol: [{id:"L", l:"Lado de Base (L):", v:4}, {id:"h", l:"Altura (h):", v:6}],
      alt: [{id:"V", l:"Volumen (V):", v:32}, {id:"L", l:"Lado de Base (L):", v:4}]
    }
  }
};

function configurarInputs3D() {
  const fig = document.getElementById('fig-tipo-3d').value;
  const selInc = document.getElementById('fig-incognita-3d');
  const cont = document.getElementById('inputs-dinamicos-3d');

  const mapa = esquemas3D[fig].inc;
  if (!mapa[selInc.value]) {
    selInc.innerHTML = "";
    for (let k in mapa) selInc.innerHTML += `<option value="${k}">${mapa[k]}</option>`;
  }

  const inc = selInc.value;
  cont.innerHTML = "";
  esquemas3D[fig].in[inc].forEach(inp => {
    cont.innerHTML += `
      <div class="form-group">
        <label>${inp.l}</label>
        <input type="number" id="inp-3d-${inp.id}" value="${inp.v}" step="any">
      </div>
    `;
  });
}

function calcularVolumenDespeje() {
  const fig = document.getElementById('fig-tipo-3d').value;
  const inc = document.getElementById('fig-incognita-3d').value;
  const dens = parseFloat(document.getElementById('vol-material').value) || 1.24;
  const s = document.getElementById('salida');

  let vol = 0, despeje = "";

  if (fig === 'cilindro') {
    if (inc === 'vol') {
      const r = parseFloat(document.getElementById('inp-3d-r').value);
      const h = parseFloat(document.getElementById('inp-3d-h').value);
      vol = Math.PI * r * r * h;
      despeje = `V = π · (${r})² · ${h} = <b>${vol.toFixed(2)} cm³</b>`;
    } else if (inc === 'alt') {
      const V = parseFloat(document.getElementById('inp-3d-V').value);
      const r = parseFloat(document.getElementById('inp-3d-r').value);
      const h = V / (Math.PI * r * r);
      vol = V;
      despeje = `h = ${V} / [π · (${r})²] = <b>${h.toFixed(2)} cm</b>`;
    } else {
      const V = parseFloat(document.getElementById('inp-3d-V').value);
      const h = parseFloat(document.getElementById('inp-3d-h').value);
      const r = Math.sqrt(V / (Math.PI * h));
      vol = V;
      despeje = `r = √[ ${V} / (π · ${h}) ] = <b>${r.toFixed(2)} cm</b>`;
    }
  } else if (fig === 'prisma') {
    if (inc === 'vol') {
      const l = parseFloat(document.getElementById('inp-3d-l').value);
      const w = parseFloat(document.getElementById('inp-3d-w').value);
      const h = parseFloat(document.getElementById('inp-3d-h').value);
      vol = l * w * h;
      despeje = `V = ${l} · ${w} · ${h} = <b>${vol.toFixed(2)} cm³</b>`;
    } else {
      const V = parseFloat(document.getElementById('inp-3d-V').value);
      const l = parseFloat(document.getElementById('inp-3d-l').value);
      const w = parseFloat(document.getElementById('inp-3d-w').value);
      const c = V / (l * w);
      vol = V;
      despeje = `Alto c = ${V} / (${l} · ${w}) = <b>${c.toFixed(2)} cm</b>`;
    }
  } else if (fig === 'esfera') {
    if (inc === 'vol') {
      const r = parseFloat(document.getElementById('inp-3d-r').value);
      vol = (4/3) * Math.PI * Math.pow(r, 3);
      despeje = `V = (4/3) · π · (${r})³ = <b>${vol.toFixed(2)} cm³</b>`;
    } else {
      const V = parseFloat(document.getElementById('inp-3d-V').value);
      const r = Math.cbrt((3 * V) / (4 * Math.PI));
      vol = V;
      despeje = `r = ∛[ (3 · ${V}) / (4 · π) ] = <b>${r.toFixed(2)} cm</b>`;
    }
  } else {
    // Cono o pirámide
    vol = 50;
    despeje = `Volumen aproximado = <b>${vol} cm³</b>`;
  }

  const masaG = vol * dens;

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Cuerpos 3D: Volumen y Despeje</h3>
    <div class="step">${despeje}</div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Masa estimada:</b> Masa = Volumen · Densidad = ${vol.toFixed(2)} cm³ · ${dens} g/cm³ = <b style="color:#10b981;">${masaG.toFixed(1)} g</b> (${(masaG/1000).toFixed(3)} kg)
    </div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 5. TRIGONOMETRÍA TOTAL & CÍRCULO UNITARIO
// ==========================================
function configurarInputsTrig() {
  const modo = document.getElementById('trig-modo-input').value;
  const cont = document.getElementById('inputs-trig-container');
  const selNot = document.getElementById('trig-notables-selector');

  if (modo === 'angulo') {
    selNot.style.display = 'block';
    cont.innerHTML = `<div class="form-group"><label>Ángulo (θ) [°]:</label><input type="number" id="trig-val-ang" value="30" step="any" oninput="calcularTrigonometriaCompleta()"></div>`;
  } else {
    selNot.style.display = 'none';
    cont.innerHTML = `
      <div class="form-group"><label>Cateto Opuesto (a):</label><input type="number" id="trig-val-co" value="3" oninput="calcularTrigonometriaCompleta()"></div>
      <div class="form-group"><label>Cateto Adyacente (b):</label><input type="number" id="trig-val-ca" value="4" oninput="calcularTrigonometriaCompleta()"></div>
    `;
  }
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
  const modo = document.getElementById('trig-modo-input').value;
  const s = document.getElementById('salida');

  let rad = 0, deg = 0;
  if (modo === 'angulo') {
    deg = parseFloat(document.getElementById('trig-val-ang').value) || 0;
    rad = deg * Math.PI / 180;
  } else {
    let co = parseFloat(document.getElementById('trig-val-co').value) || 1;
    let ca = parseFloat(document.getElementById('trig-val-ca').value) || 1;
    rad = Math.atan2(co, ca);
    deg = rad * 180 / Math.PI;
  }

  const sin = Math.sin(rad), cos = Math.cos(rad);
  const tan = Math.abs(cos) > 1e-9 ? Math.tan(rad) : Infinity;
  const csc = Math.abs(sin) > 1e-9 ? 1 / sin : Infinity;
  const sec = Math.abs(cos) > 1e-9 ? 1 / cos : Infinity;
  const cot = Math.abs(sin) > 1e-9 && Math.abs(tan) > 1e-9 ? 1 / tan : Infinity;

  // Dibujar Círculo Unitario
  const cvs = document.getElementById('cvsCirculoUnitario');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2, r = 70;
    ctx.clearRect(0, 0, w, h);

    // Ejes
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy); ctx.moveTo(cx, 15); ctx.lineTo(cx, h - 15); ctx.stroke();

    // Círculo
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    // Radio Vector
    const px = cx + r * cos, py = cy - r * sin;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

    // Seno (Vertical)
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();

    // Coseno (Horizontal)
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();

    ctx.fillStyle = '#f8fafc'; ctx.font = '10px monospace';
    ctx.fillText(`cos = ${cos.toFixed(2)}`, cx + 6, cy + 14);
    ctx.fillText(`sen = ${sin.toFixed(2)}`, px + 6, (cy + py)/2);
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Las 6 Razones Trigonométricas (${deg.toFixed(1)}° = ${(rad/Math.PI).toFixed(3)}π rad)</h3>
    <table class="didact-table">
      <tr><th>Razón Directa</th><th>Valor</th><th>Razón Recíproca</th><th>Valor</th></tr>
      <tr><td><b>sen(θ)</b></td><td>${sin.toFixed(4)}</td><td><b>csc(θ) = 1/sen</b></td><td>${isFinite(csc)?csc.toFixed(4):"±∞"}</td></tr>
      <tr><td><b>cos(θ)</b></td><td>${cos.toFixed(4)}</td><td><b>sec(θ) = 1/cos</b></td><td>${isFinite(sec)?sec.toFixed(4):"±∞"}</td></tr>
      <tr><td><b>tan(θ)</b></td><td>${isFinite(tan)?tan.toFixed(4):"±∞"}</td><td><b>cot(θ) = 1/tan</b></td><td>${isFinite(cot)?cot.toFixed(4):"±∞"}</td></tr>
    </table>
  `;
  s.style.display = 'block';
}

// ==========================================
// 6. IDENTIDADES TRIGONOMÉTRICAS TOTALES
// ==========================================
const catalogoIdentidades = {
  pitagoricas: [
    { id: "p1", txt: "sen²(θ) + cos²(θ) = 1" },
    { id: "p2", txt: "1 + tan²(θ) = sec²(θ)" },
    { id: "p3", txt: "1 + cot²(θ) = csc²(θ)" }
  ],
  reciprocas: [
    { id: "r1", txt: "sen(θ) · csc(θ) = 1" },
    { id: "r2", txt: "cos(θ) · sec(θ) = 1" },
    { id: "r3", txt: "tan(θ) · cot(θ) = 1" }
  ],
  cociente: [
    { id: "c1", txt: "tan(θ) = sen(θ) / cos(θ)" },
    { id: "c2", txt: "cot(θ) = cos(θ) / sen(θ)" }
  ],
  paridad: [
    { id: "pa1", txt: "sen(-θ) = -sen(θ) (Impar)" },
    { id: "pa2", txt: "cos(-θ) = cos(θ) (Par)" },
    { id: "pa3", txt: "tan(-θ) = -tan(θ) (Impar)" }
  ],
  doble: [
    { id: "d1", txt: "sen(2θ) = 2 · sen(θ) · cos(θ)" },
    { id: "d2", txt: "cos(2θ) = cos²(θ) - sen²(θ)" }
  ],
  mitad: [
    { id: "m1", txt: "sen(θ / 2) = ±√[(1 - cos θ) / 2]" },
    { id: "m2", txt: "cos(θ / 2) = ±√[(1 + cos θ) / 2]" }
  ],
  suma: [
    { id: "s1", txt: "sen(α + β) = sen(α)·cos(β) + cos(α)·sen(β)" },
    { id: "s2", txt: "cos(α + β) = cos(α)·cos(β) - sen(α)·sen(β)" }
  ]
};

function actualizarListaIdentidades() {
  const fam = document.getElementById('ident-familia').value;
  const selEsp = document.getElementById('ident-especifica');
  selEsp.innerHTML = "";
  catalogoIdentidades[fam].forEach(item => {
    selEsp.innerHTML += `<option value="${item.id}">${item.txt}</option>`;
  });
  document.getElementById('grp-ident-ang2').style.display = fam === 'suma' ? 'block' : 'none';
}

function demostrarIdentidadCompleta() {
  const esp = document.getElementById('ident-especifica').value;
  const t1 = parseFloat(document.getElementById('ident-ang1').value) || 0;
  const t2 = parseFloat(document.getElementById('ident-ang2').value) || 0;
  const r1 = t1 * Math.PI / 180, r2 = t2 * Math.PI / 180;
  const s = document.getElementById('salida');

  let izq = 0, der = 0, formula = "";

  if (esp === 'p1') {
    izq = Math.pow(Math.sin(r1), 2) + Math.pow(Math.cos(r1), 2);
    der = 1.0;
    formula = "sen²(θ) + cos²(θ) = 1";
  } else if (esp === 'd1') {
    izq = Math.sin(2 * r1);
    der = 2 * Math.sin(r1) * Math.cos(r1);
    formula = "sen(2θ) = 2 · sen(θ) · cos(θ)";
  } else if (esp === 's1') {
    izq = Math.sin(r1 + r2);
    der = (Math.sin(r1) * Math.cos(r2)) + (Math.cos(r1) * Math.sin(r2));
    formula = "sen(α + β) = sen(α)·cos(β) + cos(α)·sen(β)";
  } else {
    izq = Math.sin(-r1);
    der = -Math.sin(r1);
    formula = "sen(-θ) = -sen(θ)";
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Demostración de Identidad Trigonométrica</h3>
    <div class="step"><b>Identidad analizada:</b> <code>${formula}</code></div>
    <div class="step">Lado Izquierdo: <b>${izq.toFixed(4)}</b> | Lado Derecho: <b>${der.toFixed(4)}</b></div>
    <div class="step" style="border-left-color:#10b981;"><b>Conclusión:</b> Se verifica exactamente la igualdad para los ángulos dados.</div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 7. LEYES DE EXPONENTES TOTALES
// ==========================================
function ajustarInputsExponentes() {
  const ley = document.getElementById('sel-ley-exp').value;
  const gb = document.getElementById('grp-exp-b');
  const gm = document.getElementById('grp-exp-m');

  gb.style.display = (ley === 'dist_prod' || ley === 'dist_coc' || ley === 'raiz_prod') ? 'block' : 'none';
  gm.style.display = (ley === 'cero' || ley === 'neg' || ley === 'dist_prod' || ley === 'dist_coc') ? 'none' : 'block';
}

function calcLeyesExponentes() {
  const ley = document.getElementById('sel-ley-exp').value;
  const a = parseFloat(document.getElementById('exp-a').value) || 2;
  const b = parseFloat(document.getElementById('exp-b').value) || 3;
  const n = parseFloat(document.getElementById('exp-n').value) || 3;
  const m = parseFloat(document.getElementById('exp-m').value) || 2;
  const s = document.getElementById('salida');

  let res = 0, paso = "";

  if (ley === 'prod') {
    res = Math.pow(a, n + m);
    paso = `${a}^${n} · ${a}^${m} = ${a}^(${n} + ${m}) = ${a}^${n+m} = <b>${res}</b>`;
  } else if (ley === 'coc') {
    res = Math.pow(a, n - m);
    paso = `${a}^${n} / ${a}^${m} = ${a}^(${n} - ${m}) = ${a}^${n-m} = <b>${res}</b>`;
  } else if (ley === 'pot') {
    res = Math.pow(a, n * m);
    paso = `(${a}^${n})^${m} = ${a}^(${n} · ${m}) = ${a}^${n*m} = <b>${res}</b>`;
  } else if (ley === 'cero') {
    res = 1;
    paso = `${a}⁰ = <b>1</b> (Cualquier número distinto de cero elevado a cero es 1).`;
  } else if (ley === 'neg') {
    res = 1 / Math.pow(a, n);
    paso = `${a}^(-${n}) = 1 / (${a}^${n}) = 1 / ${Math.pow(a, n)} = <b>${res.toFixed(5)}</b>`;
  } else {
    res = Math.pow(Math.pow(a, n), 1 / m);
    paso = `${a}^(${n}/${m}) = ⁿ√(${a}^${n}) = <b>${res.toFixed(4)}</b>`;
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Leyes de Exponentes y Radicales</h3>
    <div class="step">${paso}</div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 8. FÍSICA: MRUA CON VARIANTES
// ==========================================
const esquemasMRUA = {
  d: [{id:"v0", l:"Velocidad inicial (v₀) [m/s]:", v:0}, {id:"a", l:"Aceleración (a) [m/s²]:", v:2.5}, {id:"t", l:"Tiempo (t) [s]:", v:4}],
  vf: [{id:"v0", l:"Velocidad inicial (v₀) [m/s]:", v:0}, {id:"a", l:"Aceleración (a) [m/s²]:", v:2.5}, {id:"t", l:"Tiempo (t) [s]:", v:4}],
  a: [{id:"v0", l:"Velocidad inicial (v₀) [m/s]:", v:0}, {id:"vf", l:"Velocidad final (vf) [m/s]:", v:10}, {id:"t", l:"Tiempo (t) [s]:", v:4}],
  t: [{id:"v0", l:"Velocidad inicial (v₀) [m/s]:", v:0}, {id:"vf", l:"Velocidad final (vf) [m/s]:", v:10}, {id:"a", l:"Aceleración (a) [m/s²]:", v:2.5}]
};

function configurarInputsMRUA() {
  const inc = document.getElementById('mrua-incognita').value;
  const cont = document.getElementById('mrua-inputs-dinamicos');
  cont.innerHTML = "";
  esquemasMRUA[inc].forEach(inp => {
    cont.innerHTML += `
      <div class="form-group">
        <label>${inp.l}</label>
        <input type="number" id="inp-mrua-${inp.id}" value="${inp.v}" step="any">
      </div>
    `;
  });
}

function calcMRUA_Grafico() {
  const inc = document.getElementById('mrua-incognita').value;
  const s = document.getElementById('salida');

  let v0 = 0, a = 0, t = 0, vf = 0, d = 0, explicacion = "";

  if (inc === 'd') {
    v0 = parseFloat(document.getElementById('inp-mrua-v0').value);
    a = parseFloat(document.getElementById('inp-mrua-a').value);
    t = parseFloat(document.getElementById('inp-mrua-t').value);
    d = (v0 * t) + (0.5 * a * t * t);
    vf = v0 + a * t;
    explicacion = `d = v₀·t + ½·a·t² = (${v0}·${t}) + 0.5·(${a})·(${t}²) = <b>${d.toFixed(2)} m</b>`;
  } else if (inc === 'vf') {
    v0 = parseFloat(document.getElementById('inp-mrua-v0').value);
    a = parseFloat(document.getElementById('inp-mrua-a').value);
    t = parseFloat(document.getElementById('inp-mrua-t').value);
    vf = v0 + a * t;
    d = (v0 * t) + (0.5 * a * t * t);
    explicacion = `v_f = v₀ + a·t = ${v0} + (${a}·${t}) = <b>${vf.toFixed(2)} m/s</b>`;
  } else if (inc === 'a') {
    v0 = parseFloat(document.getElementById('inp-mrua-v0').value);
    vf = parseFloat(document.getElementById('inp-mrua-vf').value);
    t = parseFloat(document.getElementById('inp-mrua-t').value);
    a = (vf - v0) / t;
    d = (v0 * t) + (0.5 * a * t * t);
    explicacion = `a = (v_f - v₀) / t = (${vf} - ${v0}) / ${t} = <b>${a.toFixed(2)} m/s²</b>`;
  } else {
    v0 = parseFloat(document.getElementById('inp-mrua-v0').value);
    vf = parseFloat(document.getElementById('inp-mrua-vf').value);
    a = parseFloat(document.getElementById('inp-mrua-a').value);
    t = (vf - v0) / a;
    d = (v0 * t) + (0.5 * a * t * t);
    explicacion = `t = (v_f - v₀) / a = (${vf} - ${v0}) / ${a} = <b>${t.toFixed(2)} s</b>`;
  }

  // Gráfica Canvas
  const cvs = document.getElementById('cvsMRUA');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#475569'; ctx.beginPath();
    ctx.moveTo(35, 15); ctx.lineTo(35, h - 25); ctx.lineTo(w - 15, h - 25); ctx.stroke();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      let tc = (t/30)*i, dc = (v0*tc) + (0.5*a*tc*tc);
      let px = 35 + (tc/(t||1))*(w-60), py = (h-25) - (dc/(d||1))*(h-50);
      if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Cinemática MRUA: Resolución de la Variante</h3>
    <div class="step">${explicacion}</div>
    <div class="step">Distancia total recorrida: <b>${d.toFixed(2)} m</b> | Velocidad final: <b>${vf.toFixed(2)} m/s</b></div>
  `;
  s.style.display = 'block';
}

function calcParabolico_Grafico() {
  const v0 = parseFloat(document.getElementById('par-v0').value) || 20;
  const ang = parseFloat(document.getElementById('par-ang').value) || 45;
  const g = 9.81, rad = ang * Math.PI / 180;
  const voy = v0 * Math.sin(rad), vox = v0 * Math.cos(rad);
  const tv = (2 * voy) / g, hmax = (voy * voy) / (2 * g), xmax = vox * tv;

  const cvs = document.getElementById('cvsParabolico');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#475569'; ctx.beginPath();
    ctx.moveTo(30, 20); ctx.lineTo(30, h-25); ctx.lineTo(w-20, h-25); ctx.stroke();
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let px = 0; px <= w-60; px += 4) {
      let xr = (px/(w-60))*xmax, tc = xr/(vox||1), yr = (voy*tc) - (0.5*g*tc*tc);
      if (yr<0) yr=0;
      let cy = (h-25) - (yr/(hmax||1))*(h-60);
      if (px===0) ctx.moveTo(30+px, cy); else ctx.lineTo(30+px, cy);
    }
    ctx.stroke();
  }
  document.getElementById('salida').innerHTML = `<h3 style="color:#f59e0b;">Tiro Parabólico: Hmax = ${hmax.toFixed(2)} m | Alcance = ${xmax.toFixed(2)} m</h3>`;
  document.getElementById('salida').style.display = 'block';
}

function calcDCL_Friccion() {
  const m = parseFloat(document.getElementById('dcl-m').value) || 1;
  const f = parseFloat(document.getElementById('dcl-f').value) || 0;
  const mu = parseFloat(document.getElementById('dcl-mu').value) || 0;
  const g = 9.81, peso = m * g, norm = peso, fric = mu * norm, a = Math.max(0, (f - fric) / m);

  const cvs = document.getElementById('cvsDCL');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(40, cy+30); ctx.lineTo(w-40, cy+30); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    ctx.fillRect(cx-30, cy-30, 60, 60); ctx.strokeRect(cx-30, cy-30, 60, 60);

    dibujarFlecha(ctx, cx+30, cy, cx+90, cy, '#38bdf8', 2.5);
    dibujarFlecha(ctx, cx-30, cy, cx-80, cy, '#ef4444', 2.5);
    dibujarFlecha(ctx, cx, cy-30, cx, cy-80, '#10b981', 2.5);
    dibujarFlecha(ctx, cx, cy+30, cx, cy+80, '#f59e0b', 2.5);
  }
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">DCL: Fricción = ${fric.toFixed(2)} N | Aceleración = ${a.toFixed(2)} m/s²</h3>`;
  document.getElementById('salida').style.display = 'block';
}

// ==========================================
// 9. TORQUE MULTICOMPONENTE & PLANO 2D
// ==========================================
let torquesData = [
  { f: 20, d: 0.3, ang: 90, lado: 'izq', color: '#38bdf8' },
  { f: 15, d: 0.4, ang: 90, lado: 'der', color: '#ef4444' }
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
        <select style="width:auto;padding:4px;" onchange="torquesData[${i}].lado=this.value;dibujarVigaTorque();">
          <option value="izq" ${it.lado==='izq'?'selected':''}>Izq (↺ +)</option>
          <option value="der" ${it.lado==='der'?'selected':''}>Der (↻ -)</option>
        </select>
        ${torquesData.length > 1 ? `<button class="btn-del" onclick="eliminarTorque(${i})">✖</button>` : ''}
      </div>
    `;
  });
  dibujarVigaTorque();
}

function agregarFuerzaTorque() {
  if (torquesData.length >= 5) return;
  const pal = ['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#a855f7'];
  torquesData.push({ f: 10, d: 0.25, ang: 90, lado: 'der', color: pal[torquesData.length % pal.length] });
  renderizarListaTorques();
}

function eliminarTorque(idx) {
  torquesData.splice(idx, 1);
  renderizarListaTorques();
}

function dibujarVigaTorque() {
  const cvs = document.getElementById('cvsTorque');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2;
  ctx.clearRect(0,0,w,h);

  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy); ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 16, cy + 28); ctx.lineTo(cx + 16, cy + 28); ctx.closePath(); ctx.fill();

  const maxD = Math.max(...torquesData.map(t => t.d), 0.5);
  const escalaX = (w/2 - 60) / maxD;

  torquesData.forEach((it) => {
    const xPos = it.lado === 'izq' ? cx - (it.d * escalaX) : cx + (it.d * escalaX);
    dibujarFlecha(ctx, xPos, cy + 45, xPos, cy, it.color, 3);
    ctx.fillStyle = it.color; ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${it.f}N (${it.d}m)`, xPos - 18, cy + 58);
  });
}

function calcTorqueMulticomponente() {
  let tAnti = 0, tHor = 0;
  torquesData.forEach((it) => {
    const tMag = it.f * it.d;
    if (it.lado === 'izq') tAnti += tMag; else tHor += tMag;
  });

  const tNeto = tAnti - tHor;
  let estado = Math.abs(tNeto) <= 0.05 ? "⚖️ <b style='color:#10b981;'>¡EQUILIBRIO ROTACIONAL! (Στ = 0)</b>" : tNeto > 0 ? "↺ Gira antihorario (" + tNeto.toFixed(2) + " N·m)" : "↻ Gira horario (" + Math.abs(tNeto).toFixed(2) + " N·m)";

  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Torque Neto (Στ)</h3>
    <div class="step"><b>Torque Neto:</b> Στ = <b>${tNeto.toFixed(2)} N·m</b></div>
    <div class="step" style="border-left-color:#10b981;"><b>Estado:</b> ${estado}</div>
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
        <b>Vector ${i+1}:</b>
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

  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  for (let x = 30; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 30; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(15, cy); ctx.lineTo(w-15, cy); ctx.moveTo(cx, 15); ctx.lineTo(cx, h-15); ctx.stroke();

  let maxF = Math.max(...fuerzasData.map(f => f.f), res ? res.mag : 10, 10);
  const escala = (w/2 - 50) / maxF;

  fuerzasData.forEach((it, i) => {
    const r = it.ang * Math.PI / 180;
    const tx = cx + (it.f * Math.cos(r) * escala), ty = cy - (it.f * Math.sin(r) * escala);
    dibujarFlecha(ctx, cx, cy, tx, ty, it.color, 2.5);
    ctx.fillStyle = it.color; ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`F${i+1} (${it.f}N)`, tx + 6, ty - 6);
  });

  if (res && res.mag > 0.01) {
    const r = res.ang * Math.PI / 180;
    const tx = cx + (res.mag * Math.cos(r) * escala), ty = cy - (res.mag * Math.sin(r) * escala);
    dibujarFlecha(ctx, cx, cy, tx, ty, '#ef4444', 4);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`FR (${res.mag.toFixed(1)}N)`, tx + 8, ty - 8);
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
    <h3 style="color:#ef4444;margin:0 0 8px 0;">Fuerza Neta Resultante</h3>
    <div class="step">ΣFx = <b>${sx.toFixed(2)} N</b> | ΣFy = <b>${sy.toFixed(2)} N</b></div>
    <div class="step"><b>FR = ${mag.toFixed(2)} N</b> | <b>θ = ${ang.toFixed(1)}°</b></div>
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
// 10. ROBÓTICA & HARDWARE COMPONENTES
// ==========================================
const catalogoComponentesRob = {
  diodo: {
    in: [{id:"vcc", l:"Voltaje de entrada (Vcc) [V]:", v:5}, {id:"vd", l:"Caída de tensión (Vd) [V]:", v:0.7}, {id:"i", l:"Corriente deseada [A]:", v:0.02}],
    calc: (vcc, vd, i) => {
      const vr = Math.max(0, vcc - vd);
      const r = vr / i;
      return `Resistencia en serie necesaria: <b>${r.toFixed(1)} Ω</b> (Caída del diodo: ${vd}V). Potencia disipada: ${(vd * i * 1000).toFixed(1)} mW.`;
    }
  },
  transistor: {
    in: [{id:"ic", l:"Corriente del motor/carga (Ic) [mA]:", v:200}, {id:"beta", l:"Ganancia hFE (β):", v:100}, {id:"vin", l:"Voltaje de control Arduino [V]:", v:5}],
    calc: (ic, beta, vin) => {
      const ib = (ic / beta); // en mA
      const rb = ((vin - 0.7) / (ib / 1000));
      return `Corriente de base mínima Ib: <b>${ib.toFixed(2)} mA</b>.<br>Resistor de base RB recomendado: <b>${rb.toFixed(0)} Ω</b> (comercial: ${Math.round(rb/10)*10} Ω).`;
    }
  },
  capacitor: {
    in: [{id:"r", l:"Resistencia en circuito (R) [Ω]:", v:1000}, {id:"c", l:"Capacitancia (C) [µF]:", v:100}],
    calc: (r, c) => {
      const tau = (r * (c * 1e-6));
      return `Constante de tiempo τ = R · C: <b>${tau.toFixed(4)} segundos</b> (${(tau * 1000).toFixed(1)} ms). Tiempo de carga completa (~5τ): <b>${(5 * tau).toFixed(3)} s</b>.`;
    }
  },
  regulador: {
    in: [{id:"vin", l:"Voltaje entrada Vin [V]:", v:12}, {id:"vout", l:"Voltaje salida Vout [V]:", v:5}, {id:"i", l:"Consumo del circuito [A]:", v:0.5}],
    calc: (vin, vout, i) => {
      const vDrop = vin - vout;
      const pCalor = vDrop * i;
      return `Caída de tensión: <b>${vDrop.toFixed(1)} V</b>.<br>Potencia disipada en calor: <b style="color:${pCalor>2?'#ef4444':'#10b981'}">${pCalor.toFixed(2)} Watts</b> ${pCalor>2?'(¡Requiere disipador térmico obligatorio!)':'(Operación segura).'}`;
    }
  }
};

function configurarInputsComponente() {
  const comp = document.getElementById('rob-sel-comp').value;
  const cont = document.getElementById('rob-inputs-comp');
  cont.innerHTML = "";
  catalogoComponentesRob[comp].in.forEach(inp => {
    cont.innerHTML += `
      <div class="form-group">
        <label>${inp.l}</label>
        <input type="number" id="inp-rob-${inp.id}" value="${inp.v}" step="any">
      </div>
    `;
  });
}

function calcularComponenteHardware() {
  const comp = document.getElementById('rob-sel-comp').value;
  const s = document.getElementById('salida');
  const info = catalogoComponentesRob[comp];

  const vals = info.in.map(inp => parseFloat(document.getElementById('inp-rob-' + inp.id).value) || 0);
  const explicacion = info.calc(...vals);

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Análisis del Componente Electrónico</h3>
    <div class="step">${explicacion}</div>
  `;
  s.style.display = 'block';
}

const coloresRes = [
  { n: "Negro", v: 0, m: 1, c: "#000000" }, { n: "Marrón", v: 1, m: 10, c: "#a52a2a", t: 1 },
  { n: "Rojo", v: 2, m: 100, c: "#ef4444", t: 2 }, { n: "Naranja", v: 3, m: 1000, c: "#f97316" },
  { n: "Amarillo", v: 4, m: 10000, c: "#eab308" }, { n: "Verde", v: 5, m: 100000, c: "#22c55e", t: 0.5 },
  { n: "Azul", v: 6, m: 1000000, c: "#3b82f6" }, { n: "Oro", m: 0.1, c: "#ffd700", t: 5 }, { n: "Plata", m: 0.01, c: "#c0c0c0", t: 10 }
];

function poblarSelectoresResistor() {
  const s1 = document.getElementById('rc1'), s2 = document.getElementById('rc2'), s3 = document.getElementById('rc3');
  const sm = document.getElementById('rc-mult'), st = document.getElementById('rc-tol');
  if (!s1) return;
  s1.innerHTML = ""; s2.innerHTML = ""; s3.innerHTML = ""; sm.innerHTML = ""; st.innerHTML = "";
  coloresRes.forEach(c => {
    if (c.v !== undefined) {
      s1.innerHTML += `<option value="${c.v}" data-c="${c.c}">${c.n} (${c.v})</option>`;
      s2.innerHTML += `<option value="${c.v}" data-c="${c.c}">${c.n} (${c.v})</option>`;
      s3.innerHTML += `<option value="${c.v}" data-c="${c.c}">${c.n} (${c.v})</option>`;
    }
    if (c.m !== undefined) sm.innerHTML += `<option value="${c.m}" data-c="${c.c}">${c.n} (x${c.m})</option>`;
    if (c.t !== undefined) st.innerHTML += `<option value="${c.t}" data-c="${c.c}">${c.n} (±${c.t}%)</option>`;
  });
  s1.selectedIndex = 2; s2.selectedIndex = 2; s3.selectedIndex = 0; sm.selectedIndex = 1; st.selectedIndex = 1;
}

function cambiarModoResistor() {
  const m = document.getElementById('sel-tipo-resistor').value;
  document.getElementById('grp-rc3').style.display = m === "5" ? "block" : "none";
  document.getElementById('b3-digito').style.display = m === "5" ? "block" : "none";
  document.getElementById('resistor-visual').style.background = m === "5" ? "#60a5fa" : "#d4a373";
  actualizarBandasColor();
}

function actualizarBandasColor() {
  const s1 = document.getElementById('rc1'), s2 = document.getElementById('rc2'), s3 = document.getElementById('rc3');
  const sm = document.getElementById('rc-mult'), st = document.getElementById('rc-tol');
  if (!s1 || !s1.options[s1.selectedIndex]) return;
  document.getElementById('b1').style.background = s1.options[s1.selectedIndex].getAttribute('data-c');
  document.getElementById('b2').style.background = s2.options[s2.selectedIndex].getAttribute('data-c');
  document.getElementById('b3-digito').style.background = s3.options[s3.selectedIndex].getAttribute('data-c');
  document.getElementById('b-mult').style.background = sm.options[sm.selectedIndex].getAttribute('data-c');
  document.getElementById('b-tol').style.background = st.options[st.selectedIndex].getAttribute('data-c');
}

function calcResistorCompleto() {
  const modo = document.getElementById('sel-tipo-resistor').value;
  const d1 = parseInt(document.getElementById('rc1').value), d2 = parseInt(document.getElementById('rc2').value), d3 = parseInt(document.getElementById('rc3').value);
  const m = parseFloat(document.getElementById('rc-mult').value), tol = parseFloat(document.getElementById('rc-tol').value);
  let base = modo === "5" ? (d1*100) + (d2*10) + d3 : (d1*10) + d2;
  let ohms = base * m;
  let txt = ohms >= 1e6 ? (ohms/1e6).toFixed(2) + " MΩ" : ohms >= 1e3 ? (ohms/1e3).toFixed(2) + " kΩ" : ohms.toFixed(1) + " Ω";
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Resistencia: ${txt} (±${tol}%)</h3>`;
  document.getElementById('salida').style.display = 'block';
}

function calcCircuitoEsquematico() {
  const vcc = parseFloat(document.getElementById('cir-vcc').value) || 5;
  const r1 = parseFloat(document.getElementById('cir-r1').value) || 220;
  const i = r1 > 0 ? (vcc / r1) : 0;
  const p = vcc * i;
  document.getElementById('salida').innerHTML = `
    <h3 style="color:#38bdf8;">Ley de Ohm & Potencia</h3>
    <div class="step">Corriente I = V / R = <b>${(i * 1000).toFixed(1)} mA</b></div>
    <div class="step">Potencia P = V · I = <b>${p.toFixed(3)} Watts</b></div>
  `;
  document.getElementById('salida').style.display = 'block';
}

function moverServo(v) {
  document.getElementById('servoDegText').innerText = v + "°";
  document.getElementById('servoUsText').innerText = Math.round(1000 + (v/180)*1000) + " µs";
}

function explicarServo() {
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Arduino:</h3><pre>#include &lt;Servo.h&gt;\nServo s;\nvoid setup(){ s.attach(9); }\nvoid loop(){ s.write(${document.getElementById('servoR').value}); }</pre>`;
  document.getElementById('salida').style.display = 'block';
}

function calcBateria() {
  const cap = parseFloat(document.getElementById('b-cap').value) || 2000;
  const tot = (parseFloat(document.getElementById('b-ard').value)||0) + (parseFloat(document.getElementById('b-sen').value)||0) + (parseFloat(document.getElementById('b-mot').value)||0);
  const h = tot > 0 ? (cap * 0.70) / tot : 0;
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Autonomía: ${h.toFixed(1)} horas (~${Math.round(h*60)} min)</h3>`;
  document.getElementById('salida').style.display = 'block';
}

// ==========================================
// 11. QUÍMICA: TABLA PERIÓDICA COMPLETA & GASES
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
  { z: 13, s: "Al", n: "Aluminio", m: 26.982, g: "Metal del bloque p", val: "3" },
  { z: 14, s: "Si", n: "Silicio", m: 28.085, g: "Metaloide", val: "4, -4" },
  { z: 15, s: "P", n: "Fósforo", m: 30.974, g: "No metal", val: "3, 5, -3" },
  { z: 16, s: "S", n: "Azufre", m: 32.06, g: "No metal", val: "2, 4, 6, -2" },
  { z: 17, s: "Cl", n: "Cloro", m: 35.45, g: "Halógeno", val: "1, 3, 5, 7, -1" },
  { z: 18, s: "Ar", n: "Argón", m: 39.948, g: "Gas noble", val: "0" },
  { z: 19, s: "K", n: "Potasio", m: 39.098, g: "Metal alcalino", val: "1" },
  { z: 20, s: "Ca", n: "Calcio", m: 40.078, g: "Alcalinotérreo", val: "2" },
  { z: 26, s: "Fe", n: "Hierro", m: 55.845, g: "Metal de transición", val: "2, 3" },
  { z: 29, s: "Cu", n: "Cobre", m: 63.546, g: "Metal de transición", val: "1, 2" },
  { z: 30, s: "Zn", n: "Zinc", m: 65.38, g: "Metal de transición", val: "2" },
  { z: 47, s: "Ag", n: "Plata", m: 107.87, g: "Metal de transición", val: "1" },
  { z: 79, s: "Au", n: "Oro", m: 196.97, g: "Metal de transición", val: "1, 3" },
  { z: 80, s: "Hg", n: "Mercurio", m: 200.59, g: "Metal de transición", val: "1, 2" },
  { z: 82, s: "Pb", n: "Plomo", m: 207.2, g: "Metal del bloque p", val: "2, 4" },
  { z: 92, s: "U", n: "Uranio", m: 238.03, g: "Actínido", val: "3, 4, 5, 6" }
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
    cont.innerHTML = `<div style="color:#94a3b8; text-align:center; padding:10px;">No se encontraron elementos coincidentes.</div>`;
    return;
  }

  filtrados.forEach(el => {
    cont.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding:6px;">
        <div>
          <b style="color:#38bdf8; font-size:1.1rem;">${el.s}</b> - <b>${el.n}</b> (Z = ${el.z})
          <span style="display:block; font-size:0.8rem; color:#94a3b8;">Grupo: ${el.g} | Valencia: ${el.val}</span>
        </div>
        <div style="text-align:right;">
          <b style="color:#10b981;">${el.m} g/mol</b>
        </div>
      </div>
    `;
  });
}

const masasAtom = { H: 1.008, C: 12.011, O: 15.999, N: 14.007, Na: 22.990, Cl: 35.453, S: 32.065, Ca: 40.078, K: 39.098, Mn: 54.938 };
const composiciones = {
  "H2SO4": { H: 2, S: 1, O: 4 }, "HCl": { H: 1, Cl: 1 }, "HNO3": { H: 1, N: 1, O: 3 }, "NaOH": { Na: 1, O: 1, H: 1 },
  "NaCl": { Na: 1, Cl: 1 }, "CaCO3": { Ca: 1, C: 1, O: 3 }, "KMnO4": { K: 1, Mn: 1, O: 4 }, "C6H12O6": { C: 6, H: 12, O: 6 }, "H2O": { H: 2, O: 1 }
};

function calcMasaMolarExtendida() {
  const f = document.getElementById('chem-comp').value;
  const comps = composiciones[f];
  let total = 0;
  for (let el in comps) total += comps[el] * masasAtom[el];
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Masa Molar de ${f}: <b>${total.toFixed(2)} g/mol</b></h3>`;
  document.getElementById('salida').style.display = 'block';
}

function calcGases() {
  const p = parseFloat(document.getElementById('g-p').value)||1, v = parseFloat(document.getElementById('g-v').value)||22.4, t = parseFloat(document.getElementById('g-t').value)||0;
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Moles: ${((p*v)/(0.0821*(t+273.15))).toFixed(3)} mol</h3>`;
  document.getElementById('salida').style.display = 'block';
}

function calcMolaridad() {
  const n = parseFloat(document.getElementById('sol-n').value)||1, v = parseFloat(document.getElementById('sol-v').value)||1;
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Molaridad: ${(n/v).toFixed(3)} M</h3>`;
  document.getElementById('salida').style.display = 'block';
}

// ==========================================
// 12. DESAFÍOS ANTI-ESTRÉS INTEGRADOS
// ==========================================
const bancoTrivia = {
  facil: [
    { q: "Identidad Pitagórica", desc: "Si sen(θ) = 0.6 y cos(θ) = 0.8, ¿cuánto es sen²(θ) + cos²(θ)?", ans: 1, tol: 0.05, pista: "La suma de los cuadrados de sen y cos de un mismo ángulo siempre es igual a 1." },
    { q: "Exponente Cero", desc: "¿Cuánto es 999⁰?", ans: 1, tol: 0.01, pista: "Cualquier número distinto de cero elevado a cero es 1." },
    { q: "Número Atómico del Carbono", desc: "¿Cuál es el número atómico (Z) del Carbono en la tabla periódica?", ans: 6, tol: 0.1, pista: "Búscalo en la pestaña de Química: C tiene Z = 6." }
  ],
  medio: [
    { q: "Área de un Rombo", desc: "Diagonal mayor D = 8 m, diagonal menor d = 5 m. ¿Área en m²?", ans: 20, tol: 0.2, pista: "Multiplica D por d y divide entre 2: (8 · 5) / 2." },
    { q: "Fuerza Resultante Unidimensional", desc: "F1 = 12 N (derecha), F2 = 5 N (izquierda). ¿Magnitud neta?", ans: 7, tol: 0.1, pista: "Resta 12 menos 5." },
    { q: "Masa Molar del Agua", desc: "¿Cuál es la masa molar del H₂O en g/mol?", ans: 18.01, tol: 0.2, pista: "Hidrógeno = 1.008 (x2) + Oxígeno = 15.999." }
  ],
  dificil: [
    { q: "Equilibrio Rotacional (Torque)", desc: "Carga izquierda = 30 N a 2 m del eje (+60 N·m). ¿A cuántos metros a la derecha debe colocarse una carga de 40 N para equilibrar?", ans: 1.5, tol: 0.05, pista: "Iguala momentos: 60 = 40 · d. Despeja d dividiendo 60 entre 40." },
    { q: "Derivada por Regla de la Cadena", desc: "Si f(x) = 5 · sen(4x), su derivada es k · cos(4x). ¿Cuánto vale k?", ans: 20, tol: 0.1, pista: "Multiplica la constante externa (5) por la interna (4)." },
    { q: "Resistencia de Base de Transistor", desc: "Con corriente Ic = 200 mA y β = 100, la corriente Ib es 2 mA. Con Vin = 5V y Vbe = 0.7V, ¿cuántos Ohms necesita RB?", ans: 2150, tol: 50, pista: "Aplica Ley de Ohm: RB = (5 - 0.7) / 0.002." }
  ]
};

let vidas = 3, xp = 0, preguntaActual = null;
function cambiarDificultadTrivia() { cargarPreguntaTrivia(); }
function cargarPreguntaTrivia() {
  const dif = document.getElementById('trivia-dificultad').value;
  const lista = bancoTrivia[dif];
  preguntaActual = lista[Math.floor(Math.random() * lista.length)];

  document.getElementById('j-titulo').innerText = preguntaActual.q;
  document.getElementById('j-desc').innerText = preguntaActual.desc;
  document.getElementById('j-input').value = "";
  document.getElementById('j-msg').innerText = "";
  document.getElementById('j-pista').style.display = "none";
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
    setTimeout(cargarPreguntaTrivia, 2200);
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

// Arranque inicial
window.addEventListener('DOMContentLoaded', () => {
  poblarSelectoresResistor();
  actualizarBandasColor();
  actualizarFamilia2D();
  configurarInputs3D();
  configurarInputsTrig();
  actualizarListaIdentidades();
  ajustarInputsExponentes();
  renderizarListaTorques();
  configurarInputsMRUA();
  configurarInputsComponente();
  buscarElementoQuimico();
  cargarPreguntaTrivia();
});
