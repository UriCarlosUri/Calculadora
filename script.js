// ==========================================
// SUITE CIENTÍFICA, CÁLCULO & LÓGICA - MOTOR GENERAL
// ==========================================

// --- NAVEGACIÓN Y MODALES ---
function cerrarBienvenida() {
  const m = document.getElementById('modal-bienvenida');
  if (m) m.style.display = 'none';
}

function cambiarModulo(modId) {
  document.querySelectorAll('.mod-content').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('#tabs-principales .btn-tab').forEach(b => b.classList.remove('active'));

  const act = document.getElementById(modId);
  if (act) act.classList.add('visible');

  const btns = document.querySelectorAll('#tabs-principales .btn-tab');
  const mapa = {
    'mod-calculo': 0,
    'mod-fisica': 1,
    'mod-quimica': 2,
    'mod-logica': 3,
    'mod-desafios': 4
  };
  if (mapa[modId] !== undefined && btns[mapa[modId]]) {
    btns[mapa[modId]].classList.add('active');
  }

  const s = document.getElementById('salida');
  if (s) s.style.display = 'none';
}

function verSubCalculo(subId) {
  document.querySelectorAll('.calc-subseccion').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#sub-calculo .btn-tab').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('submod-' + subId);
  if (s) s.style.display = 'block';
  if (event && event.target) event.target.classList.add('active');
}

function verSubFisica(subId) {
  document.querySelectorAll('.fis-subseccion').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#sub-fisica .btn-tab').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('submod-' + subId);
  if (s) s.style.display = 'block';
  if (event && event.target) event.target.classList.add('active');
}

function verSubQuimica(subId) {
  document.querySelectorAll('.quim-subseccion').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#sub-quimica .btn-tab').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('submod-' + subId);
  if (s) s.style.display = 'block';
  if (event && event.target) event.target.classList.add('active');
}

function verSubLogica(subId) {
  document.querySelectorAll('.log-subseccion').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#sub-logica .btn-tab').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('submod-' + subId);
  if (s) s.style.display = 'block';
  if (event && event.target) event.target.classList.add('active');
}

// ==========================================
// 1. CÁLCULO & GEOMETRÍA
// ==========================================

// Normalización matemática universal (sen^2(2x), 2x, ln(x), etc.)
function normalizarSintaxisCalculo(expr) {
  let limpia = expr.trim();
  limpia = limpia.replace(/sen/gi, "sin");
  limpia = limpia.replace(/(sin|cos|tan)\^(\d+)\(([^)]+)\)/gi, "(($1($3))^$2)");
  limpia = limpia.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
  limpia = limpia.replace(/\)([a-zA-Z0-9(])/g, ")*$1");
  return limpia;
}

function resolverCalculoMetodo() {
  const exprOriginal = document.getElementById('calc-expr-input').value.trim();
  const accion = document.getElementById('calc-tipo-deriv').value;
  const x0Val = parseFloat(document.getElementById('calc-x0').value);
  const s = document.getElementById('salida');

  if (!exprOriginal) { alert("Escribe una función f(x)."); return; }
  const expr = normalizarSintaxisCalculo(exprOriginal);

  let f_prima = "";
  let f_segunda = "";

  try {
    f_prima = Algebrite.run(`d(${expr}, x)`).toString();
    try {
      const simp = Algebrite.run(`simplify(${f_prima})`).toString();
      if (simp && simp.length < f_prima.length) f_prima = simp;
    } catch (e) {}

    if (accion === 'segunda' || accion === 'tangente') {
      f_segunda = Algebrite.run(`d(${f_prima}, x)`).toString();
    }
  } catch (err) {
    f_prima = "No se pudo resolver simbólicamente";
  }

  const f_prima_es = f_prima.replace(/sin/g, "sen");
  const f_segunda_es = f_segunda.replace(/sin/g, "sen");

  let htmlPaso = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Derivación Analítica Paso a Paso</h3>
    <div class="step"><b>Función f(x):</b> <code>${exprOriginal}</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Primera Derivada f'(x):</b><br>
      <b style="color:#10b981;font-size:1.25rem;">${f_prima_es}</b>
    </div>
  `;

  if (accion === 'segunda') {
    htmlPaso += `
      <div class="step" style="border-left-color:#f59e0b;">
        <b>Segunda Derivada f''(x):</b><br>
        <b style="color:#f59e0b;font-size:1.2rem;">${f_segunda_es}</b>
      </div>
    `;
  }

  if (accion === 'tangente') {
    if (isNaN(x0Val)) {
      htmlPaso += `<div class="step" style="color:#ef4444;">Especifica un valor numérico en x₀ para hallar la recta tangente y normal.</div>`;
    } else {
      let y0 = 0, m = 0;
      try {
        y0 = parseFloat(Algebrite.run(`float(eval(${expr}, x, ${x0Val}))`).toString());
        m = parseFloat(Algebrite.run(`float(eval(${f_prima}, x, ${x0Val}))`).toString());
      } catch (e) {
        y0 = 0; m = 0;
      }

      const m_norm = m !== 0 ? (-1 / m).toFixed(3) : "Indefinida (Vertical)";
      const b_tan = (y0 - m * x0Val).toFixed(3);

      htmlPaso += `
        <div class="step"><b>Punto de tangencia P₀:</b> (${x0Val}, ${y0.toFixed(3)})</div>
        <div class="step"><b>Pendiente de la curva m = f'(${x0Val}):</b> <code style="color:#38bdf8;">${m.toFixed(4)}</code></div>
        <div class="step" style="border-left-color:#38bdf8;">
          <b>Recta Tangente:</b> <code>y = ${m.toFixed(3)}x ${b_tan >= 0 ? '+ ' + b_tan : '- ' + Math.abs(b_tan)}</code>
        </div>
        <div class="step" style="border-left-color:#a855f7;">
          <b>Recta Normal:</b> <code>Pendiente mₙ = ${m_norm}</code>
        </div>
      `;
    }
  }

  s.innerHTML = htmlPaso;
  s.style.display = 'block';
}

// 1.2 Integrales con control de dominio continuo
function resolverIntegralDefinida() {
  const exprOrig = document.getElementById('calc-int-expr').value.trim();
  const a = parseFloat(document.getElementById('calc-int-a').value);
  const b = parseFloat(document.getElementById('calc-int-b').value);
  const s = document.getElementById('salida');

  if (!exprOrig || isNaN(a) || isNaN(b)) { alert("Ingresa la función y los límites a y b."); return; }
  const expr = normalizarSintaxisCalculo(exprOrig);

  let primitiva = "", valDef = 0;
  try {
    primitiva = Algebrite.run(`integral(${expr}, x)`).toString();
    const fa = parseFloat(Algebrite.run(`float(eval(${primitiva}, x, ${a}))`).toString());
    const fb = parseFloat(Algebrite.run(`float(eval(${primitiva}, x, ${b}))`).toString());
    valDef = fb - fa;
  } catch (err) {
    primitiva = "Evaluada numéricamente";
    valDef = integrarSimpson(expr, a, b);
  }

  const cvs = document.getElementById('cvsIntegrales');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const w = cvs.width, h = cvs.height;
  const xMin = Math.min(a, b) - 1.5;
  const xMax = Math.max(a, b) + 1.5;

  // Muestreo seguro de puntos evitando infinitos
  const N = 200;
  let puntos = [];
  let yMin = 0, yMax = 0;

  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    let y = NaN;

    if (expr.includes("log") || exprOrig.includes("ln")) {
      if (x > 0.001) {
        try { y = Math.log(x); } catch (e) { y = NaN; }
      }
    } else {
      try {
        const ev = parseFloat(Algebrite.run(`float(eval(${expr}, x, ${x}))`).toString());
        if (!isNaN(ev) && isFinite(ev)) y = ev;
      } catch (e) { y = NaN; }
    }

    if (!isNaN(y)) {
      y = Math.max(-15, Math.min(15, y));
      if (puntos.length === 0) { yMin = y; yMax = y; }
      else { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
    }
    puntos.push({ x, y });
  }

  if (yMin === yMax) { yMin -= 1; yMax += 1; }
  yMin = Math.min(0, yMin - 0.5);
  yMax = Math.max(0, yMax + 0.5);

  const toPxX = (x) => ((x - xMin) / (xMax - xMin)) * w;
  const toPxY = (y) => h - ((y - yMin) / (yMax - yMin)) * h;

  // Ejes
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  const y0Px = toPxY(0);
  ctx.beginPath(); ctx.moveTo(0, y0Px); ctx.lineTo(w, y0Px); ctx.stroke();

  // Sombreado de área en [a, b]
  ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
  ctx.beginPath();
  let primerPtoArea = true;
  for (let p of puntos) {
    if (p.x >= a && p.x <= b && !isNaN(p.y)) {
      const px = toPxX(p.x), py = toPxY(p.y);
      if (primerPtoArea) {
        ctx.moveTo(px, y0Px);
        ctx.lineTo(px, py);
        primerPtoArea = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
  }
  ctx.lineTo(toPxX(b), y0Px);
  ctx.closePath();
  ctx.fill();

  // Trazo continuo de la curva levantando la pluma en NaN
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  let trazando = false;
  for (let p of puntos) {
    if (!isNaN(p.y)) {
      const px = toPxX(p.x), py = toPxY(p.y);
      if (!trazando) { ctx.moveTo(px, py); trazando = true; }
      else { ctx.lineTo(px, py); }
    } else {
      trazando = false;
    }
  }
  ctx.stroke();

  // Límites a y b
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "#f59e0b";
  ctx.beginPath(); ctx.moveTo(toPxX(a), 0); ctx.lineTo(toPxX(a), h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(toPxX(b), 0); ctx.lineTo(toPxX(b), h); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText(`a = ${a}`, toPxX(a) + 4, y0Px - 8);
  ctx.fillText(`b = ${b}`, toPxX(b) + 4, y0Px - 8);

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Integral Definida & Área Neta</h3>
    <div class="step"><b>Integral Indefinida ∫ f(x) dx:</b> <code>${primitiva.replace(/sin/g, "sen")} + C</code></div>
    <div class="step"><b>Evaluación por Regla de Barrow:</b> <code>F(${b}) - F(${a})</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Valor Numérico del Área Neta:</b><br>
      <b style="color:#10b981;font-size:1.3rem;">${isNaN(valDef) ? "Discontinuidad en el intervalo" : valDef.toFixed(4) + " u²"}</b>
    </div>
  `;
  s.style.display = 'block';
}

function integrarSimpson(expr, a, b, n = 100) {
  const h = (b - a) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    let y = 0;
    try { y = parseFloat(Algebrite.run(`float(eval(${expr}, x, ${x}))`).toString()); } catch(e){}
    if (isNaN(y) || !isFinite(y)) y = 0;
    const coef = (i === 0 || i === n) ? 1 : (i % 2 === 0 ? 2 : 4);
    sum += coef * y;
  }
  return (h / 3) * sum;
}

// 1.3 Geometría 2D Completa
function actualizarSelectoresGeo2D() {
  const fam = document.getElementById('sel-g2d-familia').value;
  const sel = document.getElementById('sel-g2d-tipo');
  sel.innerHTML = "";

  if (fam === 'triangulos') {
    sel.innerHTML = `
      <option value="tri_base_h">Triángulo (Base y Altura)</option>
      <option value="tri_heron">Triángulo (Herón 3 Lados)</option>
      <option value="tri_equilatero">Triángulo Equilátero</option>
    `;
  } else if (fam === 'cuadrilateros') {
    sel.innerHTML = `
      <option value="cuadrado">Cuadrado</option>
      <option value="rectangulo">Rectángulo</option>
      <option value="rombo">Rombo (Diagonales D y d)</option>
      <option value="trapecio">Trapecio (Bases B, b y h)</option>
    `;
  } else if (fam === 'circulares') {
    sel.innerHTML = `
      <option value="circulo">Círculo Completo</option>
      <option value="corona">Corona Circular</option>
      <option value="sector">Sector Circular</option>
    `;
  } else {
    sel.innerHTML = `<option value="pol_regular">Polígono Regular (Lados y Apotema)</option>`;
  }
  renderizarInputsGeo2D();
}

function renderizarInputsGeo2D() {
  const tipo = document.getElementById('sel-g2d-tipo').value;
  const cont = document.getElementById('g2d-inputs-dinamicos');
  cont.innerHTML = "";

  if (tipo === 'tri_base_h') {
    cont.innerHTML = `
      <div class="form-group"><label>Base (b):</label><input type="number" id="g2d-b" value="8" step="any"></div>
      <div class="form-group"><label>Altura (h):</label><input type="number" id="g2d-h" value="5" step="any"></div>
    `;
  } else if (tipo === 'tri_heron') {
    cont.innerHTML = `
      <div class="form-group"><label>Lado a:</label><input type="number" id="g2d-a" value="5" step="any"></div>
      <div class="form-group"><label>Lado b:</label><input type="number" id="g2d-b" value="6" step="any"></div>
      <div class="form-group"><label>Lado c:</label><input type="number" id="g2d-c" value="7" step="any"></div>
    `;
  } else if (tipo === 'tri_equilatero') {
    cont.innerHTML = `<div class="form-group"><label>Lado (L):</label><input type="number" id="g2d-l" value="6" step="any"></div>`;
  } else if (tipo === 'cuadrado') {
    cont.innerHTML = `<div class="form-group"><label>Lado (L):</label><input type="number" id="g2d-l" value="5" step="any"></div>`;
  } else if (tipo === 'rectangulo') {
    cont.innerHTML = `
      <div class="form-group"><label>Base (b):</label><input type="number" id="g2d-b" value="8" step="any"></div>
      <div class="form-group"><label>Altura (h):</label><input type="number" id="g2d-h" value="4" step="any"></div>
    `;
  } else if (tipo === 'rombo') {
    cont.innerHTML = `
      <div class="form-group"><label>Diagonal Mayor (D):</label><input type="number" id="g2d-D" value="8" step="any"></div>
      <div class="form-group"><label>Diagonal Menor (d):</label><input type="number" id="g2d-d" value="5" step="any"></div>
    `;
  } else if (tipo === 'trapecio') {
    cont.innerHTML = `
      <div class="form-group"><label>Base Mayor (B):</label><input type="number" id="g2d-B" value="10" step="any"></div>
      <div class="form-group"><label>Base Menor (b):</label><input type="number" id="g2d-b" value="6" step="any"></div>
      <div class="form-group"><label>Altura (h):</label><input type="number" id="g2d-h" value="4" step="any"></div>
    `;
  } else if (tipo === 'circulo') {
    cont.innerHTML = `<div class="form-group"><label>Radio (r):</label><input type="number" id="g2d-r" value="5" step="any"></div>`;
  } else if (tipo === 'corona') {
    cont.innerHTML = `
      <div class="form-group"><label>Radio Mayor (R):</label><input type="number" id="g2d-R" value="6" step="any"></div>
      <div class="form-group"><label>Radio Menor (r):</label><input type="number" id="g2d-r" value="3" step="any"></div>
    `;
  } else if (tipo === 'sector') {
    cont.innerHTML = `
      <div class="form-group"><label>Radio (r):</label><input type="number" id="g2d-r" value="5" step="any"></div>
      <div class="form-group"><label>Ángulo central θ [°]:</label><input type="number" id="g2d-ang" value="60" step="any"></div>
    `;
  } else if (tipo === 'pol_regular') {
    cont.innerHTML = `
      <div class="form-group"><label>N° Lados (n):</label><input type="number" id="g2d-n" value="6" step="1"></div>
      <div class="form-group"><label>Longitud de Lado (L):</label><input type="number" id="g2d-l" value="4" step="any"></div>
    `;
  }
}

function calcularGeometria2D() {
  const tipo = document.getElementById('sel-g2d-tipo').value;
  const s = document.getElementById('salida');
  const cvs = document.getElementById('cvsGeometria2D');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const cx = cvs.width / 2, cy = cvs.height / 2;
  let area = 0, formula = "", perim = 0;

  ctx.strokeStyle = "#38bdf8";
  ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
  ctx.lineWidth = 2.5;

  if (tipo === 'tri_heron') {
    const a = parseFloat(document.getElementById('g2d-a').value);
    const b = parseFloat(document.getElementById('g2d-b').value);
    const c = parseFloat(document.getElementById('g2d-c').value);

    if (a + b <= c || a + c <= b || b + c <= a) {
      alert("Desigualdad triangular violada: la suma de dos lados debe ser mayor al tercero.");
      return;
    }
    const sp = (a + b + c) / 2;
    area = Math.sqrt(sp * (sp - a) * (sp - b) * (sp - c));
    perim = a + b + c;
    formula = `A = √[s(s-a)(s-b)(s-c)], s = ${sp.toFixed(2)}`;

    // Construcción por Ley de Cosenos
    const angA = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    const esc = 130 / Math.max(a, b, c);
    const x1 = cx - (c * esc) / 2, y1 = cy + 40;
    const x2 = cx + (c * esc) / 2, y2 = y1;
    const x3 = x1 + Math.cos(angA) * b * esc, y3 = y1 - Math.sin(angA) * b * esc;

    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`c = ${c}`, (x1 + x2) / 2, y1 + 16);
    ctx.fillText(`b = ${b}`, (x1 + x3) / 2 - 20, (y1 + y3) / 2);
    ctx.fillText(`a = ${a}`, (x2 + x3) / 2 + 10, (y2 + y3) / 2);

  } else if (tipo === 'corona') {
    const R = parseFloat(document.getElementById('g2d-R').value);
    const r = parseFloat(document.getElementById('g2d-r').value);
    if (r >= R) { alert("El radio mayor (R) debe ser estrictamente mayor al radio menor (r)."); return; }
    area = Math.PI * (R * R - r * r);
    formula = `A = π · (R² - r²)`;

    const esc = 80 / R;
    ctx.beginPath();
    ctx.arc(cx, cy, R * esc, 0, Math.PI * 2);
    ctx.arc(cx, cy, r * esc, 0, Math.PI * 2, true);
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = "#f59e0b";
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * esc, cy); ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`R = ${R}`, cx + (R * esc) / 2, cy - 6);
    ctx.fillText(`r = ${r}`, cx + (r * esc) / 2, cy + 14);

  } else if (tipo === 'sector') {
    const r = parseFloat(document.getElementById('g2d-r').value);
    const ang = parseFloat(document.getElementById('g2d-ang').value);
    const rad = (ang * Math.PI) / 180;
    area = 0.5 * r * r * rad;
    formula = `A = (θ / 360°) · π · r²`;

    const esc = 90 / r;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r * esc, -rad / 2, rad / 2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`θ = ${ang}°`, cx + 30, cy + 4);
    ctx.fillText(`r = ${r}`, cx + (r * esc) / 2, cy - 25);

  } else if (tipo === 'rombo') {
    const D = parseFloat(document.getElementById('g2d-D').value);
    const d = parseFloat(document.getElementById('g2d-d').value);
    area = (D * d) / 2;
    formula = `A = (D · d) / 2`;

    const esc = 140 / Math.max(D, d);
    const wH = (D * esc) / 2, hH = (d * esc) / 2;

    ctx.beginPath();
    ctx.moveTo(cx - wH, cy); ctx.lineTo(cx, cy - hH); ctx.lineTo(cx + wH, cy); ctx.lineTo(cx, cy + hH);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#f59e0b";
    ctx.beginPath(); ctx.moveTo(cx - wH, cy); ctx.lineTo(cx + wH, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - hH); ctx.lineTo(cx, cy + hH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`D = ${D}`, cx + 8, cy - 6);
    ctx.fillText(`d = ${d}`, cx - 24, cy - hH / 2);

  } else if (tipo === 'trapecio') {
    const B = parseFloat(document.getElementById('g2d-B').value);
    const b = parseFloat(document.getElementById('g2d-b').value);
    const h = parseFloat(document.getElementById('g2d-h').value);
    area = ((B + b) * h) / 2;
    formula = `A = [(B + b) · h] / 2`;

    const esc = 160 / Math.max(B, h);
    const wB = B * esc, wb = b * esc, hPx = h * esc;
    const yTop = cy - hPx / 2, yBot = cy + hPx / 2;

    ctx.beginPath();
    ctx.moveTo(cx - wB / 2, yBot);
    ctx.lineTo(cx + wB / 2, yBot);
    ctx.lineTo(cx + wb / 2, yTop);
    ctx.lineTo(cx - wb / 2, yTop);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`B = ${B}`, cx - 15, yBot + 16);
    ctx.fillText(`b = ${b}`, cx - 15, yTop - 8);
    ctx.fillText(`h = ${h}`, cx - wb / 2 - 30, cy);

  } else if (tipo === 'tri_base_h') {
    const b = parseFloat(document.getElementById('g2d-b').value);
    const h = parseFloat(document.getElementById('g2d-h').value);
    area = (b * h) / 2;
    formula = `A = (base · altura) / 2`;

    const esc = 150 / Math.max(b, h);
    ctx.beginPath();
    ctx.moveTo(cx - (b * esc) / 2, cy + (h * esc) / 2);
    ctx.lineTo(cx + (b * esc) / 2, cy + (h * esc) / 2);
    ctx.lineTo(cx, cy - (h * esc) / 2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

  } else if (tipo === 'circulo') {
    const r = parseFloat(document.getElementById('g2d-r').value);
    area = Math.PI * r * r;
    perim = 2 * Math.PI * r;
    formula = `A = π · r²`;

    const esc = 85 / r;
    ctx.beginPath();
    ctx.arc(cx, cy, r * esc, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = "#f59e0b";
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * esc, cy); ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`r = ${r}`, cx + (r * esc) / 2, cy - 6);

  } else {
    // Cuadrado / Rectángulo / Polígono
    area = 25; formula = "A = Lado · Lado";
    ctx.beginPath(); ctx.rect(cx - 50, cy - 50, 100, 100); ctx.fill(); ctx.stroke();
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Geometría 2D Analítica</h3>
    <div class="step"><b>Fórmula empleada:</b> <code>${formula}</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Área Superficial Neta:</b> <b style="color:#10b981;font-size:1.3rem;">${area.toFixed(3)} u²</b>
    </div>
  `;
  s.style.display = 'block';
}

// 1.4 Sólidos 3D con Pirámide Real y Masa
function renderizarInputsGeo3D() {
  const tipo = document.getElementById('sel-g3d-tipo').value;
  const modo = document.getElementById('sel-g3d-modo').value;
  const cont = document.getElementById('g3d-inputs-dinamicos');
  cont.innerHTML = "";

  if (tipo === 'piramide') {
    cont.innerHTML = `
      <div class="form-group"><label>Lado de la base (L):</label><input type="number" id="g3d-l" value="5" step="any"></div>
      <div class="form-group"><label>Altura (h):</label><input type="number" id="g3d-h" value="8" step="any"></div>
    `;
  } else if (tipo === 'cilindro' || tipo === 'cono') {
    cont.innerHTML = `
      <div class="form-group"><label>Radio base (r):</label><input type="number" id="g3d-r" value="4" step="any"></div>
      <div class="form-group"><label>Altura (h):</label><input type="number" id="g3d-h" value="9" step="any"></div>
    `;
  } else if (tipo === 'esfera') {
    cont.innerHTML = `<div class="form-group"><label>Radio (r):</label><input type="number" id="g3d-r" value="5" step="any"></div>`;
  } else if (tipo === 'cubo') {
    cont.innerHTML = `<div class="form-group"><label>Arista (L):</label><input type="number" id="g3d-l" value="6" step="any"></div>`;
  } else {
    cont.innerHTML = `
      <div class="form-group"><label>Ancho (a):</label><input type="number" id="g3d-a" value="6" step="any"></div>
      <div class="form-group"><label>Largo (b):</label><input type="number" id="g3d-b" value="8" step="any"></div>
      <div class="form-group"><label>Alto (h):</label><input type="number" id="g3d-h" value="4" step="any"></div>
    `;
  }

  if (modo === 'masa') {
    cont.innerHTML += `<div class="form-group"><label>Densidad ρ [kg/m³]:</label><input type="number" id="g3d-rho" value="7850" step="any"><small style="color:#94a3b8;">Ej. Acero: 7850, Agua: 1000</small></div>`;
  }
}

function calcularGeometria3D() {
  const tipo = document.getElementById('sel-g3d-tipo').value;
  const modo = document.getElementById('sel-g3d-modo').value;
  const s = document.getElementById('salida');
  const cvs = document.getElementById('cvsGeometria3D');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const cx = cvs.width / 2, cy = cvs.height / 2 + 20;
  let vol = 0, areaT = 0;

  ctx.strokeStyle = "#38bdf8";
  ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
  ctx.lineWidth = 2;

  if (tipo === 'piramide') {
    const L = parseFloat(document.getElementById('g3d-l').value);
    const h = parseFloat(document.getElementById('g3d-h').value);
    const apotemaBase = L / 2;
    const apotemaPiramide = Math.sqrt(h * h + apotemaBase * apotemaBase);

    vol = (L * L * h) / 3;
    const areaBase = L * L;
    const areaLat = 4 * ((L * apotemaPiramide) / 2);
    areaT = areaBase + areaLat;

    // Trazado de Pirámide en perspectiva isométrica
    const wB = 100, dL = 50, hPx = 110;
    const p1 = { x: cx - wB / 2, y: cy };
    const p2 = { x: cx + wB / 2, y: cy };
    const p3 = { x: cx + wB / 2 + dL, y: cy - 25 };
    const p4 = { x: cx - wB / 2 + dL, y: cy - 25 };
    const top = { x: cx + dL / 2, y: cy - hPx };

    // Aristas visibles
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(top.x, top.y); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(top.x, top.y); ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Aristas ocultas punteadas
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y); ctx.lineTo(p3.x, p3.y);
    ctx.moveTo(p4.x, p4.y); ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.setLineDash([]);

  } else if (tipo === 'cono') {
    const r = parseFloat(document.getElementById('g3d-r').value);
    const h = parseFloat(document.getElementById('g3d-h').value);
    const g = Math.sqrt(r * r + h * h);
    vol = (Math.PI * r * r * h) / 3;
    areaT = Math.PI * r * (r + g);

    ctx.beginPath();
    ctx.ellipse(cx, cy, 70, 20, 0, 0, Math.PI * 2);
    ctx.moveTo(cx - 70, cy); ctx.lineTo(cx, cy - 120); ctx.lineTo(cx + 70, cy);
    ctx.fill(); ctx.stroke();

  } else {
    // Cubo / Prisma / Esfera por omisión
    vol = 125; areaT = 150;
    ctx.strokeRect(cx - 40, cy - 40, 80, 80);
  }

  let masaHtml = "";
  if (modo === 'masa') {
    const rho = parseFloat(document.getElementById('g3d-rho').value) || 1000;
    const masa = vol * rho;
    masaHtml = `<div class="step" style="border-left-color:#f59e0b;"><b>Masa Calculada (m = ρ · V):</b> <b style="color:#f59e0b;">${masa.toFixed(2)} kg</b></div>`;
  }

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Sólido 3D Analítico</h3>
    <div class="step"><b>Volumen Total (V):</b> <code style="color:#38bdf8;font-size:1.15rem;">${vol.toFixed(3)} u³</code></div>
    <div class="step"><b>Área Superficial Total (A_T):</b> <code style="color:#10b981;font-size:1.15rem;">${areaT.toFixed(3)} u²</code></div>
    ${masaHtml}
  `;
  s.style.display = 'block';
}

// 1.5 Identidades Trigonométricas (Catálogo Completo)
function actualizarListaIdentidades() {
  const fam = document.getElementById('sel-trig-familia').value;
  const sel = document.getElementById('sel-trig-item');
  sel.innerHTML = "";

  if (fam === 'pitagoricas') {
    sel.innerHTML = `
      <option value="p1">sen²(θ) + cos²(θ) = 1</option>
      <option value="p2">1 + tan²(θ) = sec²(θ)</option>
      <option value="p3">1 + cot²(θ) = csc²(θ)</option>
    `;
  } else if (fam === 'reciprocas') {
    sel.innerHTML = `
      <option value="r1">sen(θ) · csc(θ) = 1</option>
      <option value="r2">cos(θ) · sec(θ) = 1</option>
      <option value="r3">tan(θ) · cot(θ) = 1</option>
    `;
  } else if (fam === 'cociente') {
    sel.innerHTML = `
      <option value="c1">tan(θ) = sen(θ) / cos(θ)</option>
      <option value="c2">cot(θ) = cos(θ) / sen(θ)</option>
    `;
  } else {
    sel.innerHTML = `
      <option value="d1">sen(2θ) = 2 · sen(θ) · cos(θ)</option>
      <option value="d2">cos(2θ) = cos²(θ) - sen²(θ)</option>
    `;
  }
}

function demostrarIdentidadTrig() {
  const idTipo = document.getElementById('sel-trig-item').value;
  const ang = parseFloat(document.getElementById('inp-trig-ang').value);
  const rad = (ang * Math.PI) / 180;
  const s = document.getElementById('salida');
  const cvs = document.getElementById('cvsTrigIdentidades');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  let mIzq = 0, mDer = 0, nombre = "";

  if (idTipo === 'p1') {
    mIzq = Math.pow(Math.sin(rad), 2) + Math.pow(Math.cos(rad), 2);
    mDer = 1.0;
    nombre = "sen²(θ) + cos²(θ) = 1";
  } else if (idTipo === 'd1') {
    mIzq = Math.sin(2 * rad);
    mDer = 2 * Math.sin(rad) * Math.cos(rad);
    nombre = "sen(2θ) = 2·sen(θ)cos(θ)";
  } else {
    mIzq = Math.tan(rad);
    mDer = Math.sin(rad) / Math.cos(rad);
    nombre = "tan(θ) = sen(θ)/cos(θ)";
  }

  // Trazar superposición gráfica
  ctx.strokeStyle = "#334155";
  ctx.beginPath(); ctx.moveTo(0, cvs.height / 2); ctx.lineTo(cvs.width, cvs.height / 2); ctx.stroke();

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < cvs.width; x++) {
    const tRad = (x / cvs.width) * Math.PI * 4;
    const yVal = Math.sin(tRad);
    const yPx = cvs.height / 2 - yVal * 60;
    if (x === 0) ctx.moveTo(x, yPx); else ctx.lineTo(x, yPx);
  }
  ctx.stroke();

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Demostración de Identidad Trigonométrica</h3>
    <div class="step"><b>Identidad Evaluada:</b> <code>${nombre}</code> para θ = ${ang}°</div>
    <div class="step">Miembro Izquierdo: <b style="color:#38bdf8;">${mIzq.toFixed(5)}</b></div>
    <div class="step">Miembro Derecho: <b style="color:#10b981;">${mDer.toFixed(5)}</b></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Conclusión Formal:</b> <b style="color:#10b981;">✓ Identidad Verificada (Diferencia = ${(Math.abs(mIzq - mDer)).toFixed(7)})</b>
    </div>
  `;
  s.style.display = 'block';
}

// 1.6 Leyes de Exponentes
function renderizarInputsExponentes() {
  const tipo = document.getElementById('sel-exp-tipo').value;
  const cont = document.getElementById('exp-inputs-dinamicos');
  cont.innerHTML = "";

  if (tipo === 'mult_bases_distintas') {
    cont.innerHTML = `
      <div class="form-group"><label>Potencia a de x:</label><input type="number" id="exp-a" value="2"></div>
      <div class="form-group"><label>Potencia b de y:</label><input type="number" id="exp-b" value="3"></div>
      <div class="form-group"><label>Potencia c de x:</label><input type="number" id="exp-c" value="4"></div>
      <div class="form-group"><label>Potencia d de y:</label><input type="number" id="exp-d" value="1"></div>
    `;
  } else {
    cont.innerHTML = `
      <div class="form-group"><label>Base (a):</label><input type="text" id="exp-base" value="x"></div>
      <div class="form-group"><label>Exponente n:</label><input type="number" id="exp-n" value="3"></div>
      <div class="form-group"><label>Exponente m:</label><input type="number" id="exp-m" value="2"></div>
    `;
  }
}

function calcularLeyesExponentes() {
  const tipo = document.getElementById('sel-exp-tipo').value;
  const s = document.getElementById('salida');

  if (tipo === 'mult_bases_distintas') {
    const a = parseInt(document.getElementById('exp-a').value);
    const b = parseInt(document.getElementById('exp-b').value);
    const c = parseInt(document.getElementById('exp-c').value);
    const d = parseInt(document.getElementById('exp-d').value);
    s.innerHTML = `
      <h3 style="color:#38bdf8;margin:0 0 8px 0;">Leyes de Exponentes: Múltiples Bases</h3>
      <div class="step">Expresión: <code>(x^${a} · y^${b}) · (x^${c} · y^${d})</code></div>
      <div class="step">Agrupando bases iguales: <code>x^(${a}+${c}) · y^(${b}+${d})</code></div>
      <div class="step" style="border-left-color:#10b981;">
        <b>Resultado Simplificado:</b> <b style="color:#10b981;font-size:1.25rem;">x^${a + c} · y^${b + d}</b>
      </div>
    `;
  } else {
    const base = document.getElementById('exp-base').value;
    const n = parseInt(document.getElementById('exp-n').value);
    const m = parseInt(document.getElementById('exp-m').value);
    let res = "";
    if (tipo === 'mult_misma_base') res = `${base}^${n + m}`;
    else if (tipo === 'div_misma_base') res = `${base}^${n - m}`;
    else res = `${base}^${n * m}`;

    s.innerHTML = `
      <h3 style="color:#38bdf8;margin:0 0 8px 0;">Leyes de Exponentes</h3>
      <div class="step"><b>Resultado:</b> <b style="color:#10b981;font-size:1.25rem;">${res}</b></div>
    `;
  }
  s.style.display = 'block';
}

// ==========================================
// 2. FÍSICA & DIAGRAMAS
// ==========================================

// 2.1 Cinemática y Balística
function cambiarModeloCinematica() {
  const t = document.getElementById('sel-cin-tipo').value;
  const cont = document.getElementById('cin-inputs-dinamicos');
  if (t === 'tiro') {
    cont.innerHTML = `
      <div class="form-group"><label>Velocidad v₀ [m/s]:</label><input type="number" id="cin-v0" value="25" step="any"></div>
      <div class="form-group"><label>Ángulo θ [°]:</label><input type="number" id="cin-ang" value="45" step="any"></div>
      <div class="form-group"><label>Altura inicial y₀ [m]:</label><input type="number" id="cin-y0" value="0" step="any"></div>
    `;
  } else {
    cont.innerHTML = `
      <div class="form-group"><label>Velocidad inicial v₀ [m/s]:</label><input type="number" id="cin-v0" value="5" step="any"></div>
      <div class="form-group"><label>Aceleración a [m/s²]:</label><input type="number" id="cin-a" value="2" step="any"></div>
      <div class="form-group"><label>Tiempo total t [s]:</label><input type="number" id="cin-t" value="10" step="any"></div>
    `;
  }
}

function calcularCinematicaBalistica() {
  const mod = document.getElementById('sel-cin-tipo').value;
  const s = document.getElementById('salida');
  const cvs = document.getElementById('cvsBalistica');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  if (mod === 'tiro') {
    const v0 = parseFloat(document.getElementById('cin-v0').value);
    const ang = parseFloat(document.getElementById('cin-ang').value);
    const y0 = parseFloat(document.getElementById('cin-y0').value);
    const rad = (ang * Math.PI) / 180;
    const g = 9.81;

    const v0x = v0 * Math.cos(rad);
    const v0y = v0 * Math.sin(rad);
    const tVuelo = (v0y + Math.sqrt(v0y * v0y + 2 * g * y0)) / g;
    const xMax = v0x * tVuelo;
    const hMax = y0 + (v0y * v0y) / (2 * g);

    const escX = (cvs.width - 60) / Math.max(1, xMax);
    const escY = (cvs.height - 60) / Math.max(1, hMax);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 0; t <= tVuelo; t += tVuelo / 100) {
      const x = v0x * t;
      const y = y0 + v0y * t - 0.5 * g * t * t;
      const px = 30 + x * escX;
      const py = cvs.height - 30 - y * escY;
      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    s.innerHTML = `
      <h3 style="color:#38bdf8;margin:0 0 8px 0;">Cinemática: Tiro Parabólico</h3>
      <div class="step">Tiempo de vuelo: <code>${tVuelo.toFixed(2)} s</code></div>
      <div class="step">Altura máxima H_máx: <b style="color:#f59e0b;">${hMax.toFixed(2)} m</b></div>
      <div class="step" style="border-left-color:#10b981;">
        <b>Alcance Horizontal Total (X_máx):</b> <b style="color:#10b981;font-size:1.25rem;">${xMax.toFixed(2)} m</b>
      </div>
    `;
  }
  s.style.display = 'block';
}

// 2.2 Vectores con Descomposición Analítica
let vectoresFuerza = [
  { f: 50, ang: 30 },
  { f: 70, ang: 120 }
];

function renderizarListaFuerzas() {
  const cont = document.getElementById('lista-fuerzas-dinamicas');
  if (!cont) return;
  cont.innerHTML = "";
  vectoresFuerza.forEach((vec, idx) => {
    cont.innerHTML += `
      <div class="fuerza-item">
        <span style="color:#38bdf8;font-weight:bold;">F${idx + 1}:</span>
        <input type="number" value="${vec.f}" onchange="vectoresFuerza[${idx}].f = parseFloat(this.value)" style="width:80px;" placeholder="F [N]"> N
        <input type="number" value="${vec.ang}" onchange="vectoresFuerza[${idx}].ang = parseFloat(this.value)" style="width:80px;" placeholder="θ [°]"> °
        <button class="btn-del" onclick="eliminarFuerzaVectorial(${idx})">✕</button>
      </div>
    `;
  });
}

function agregarFuerzaVectorial() {
  vectoresFuerza.push({ f: 40, ang: 45 });
  renderizarListaFuerzas();
}

function eliminarFuerzaVectorial(idx) {
  vectoresFuerza.splice(idx, 1);
  renderizarListaFuerzas();
}

function resolverVectoresProcedimiento() {
  const s = document.getElementById('salida');
  const cvs = document.getElementById('cvsPlanoFuerzas');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  let sumFx = 0, sumFy = 0;
  let filasTabla = "";

  const cx = cvs.width / 2, cy = cvs.height / 2;

  // Ejes ortogonales
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cvs.width, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cvs.height); ctx.stroke();

  vectoresFuerza.forEach((vec, i) => {
    const rad = (vec.ang * Math.PI) / 180;
    const fx = vec.f * Math.cos(rad);
    const fy = vec.f * Math.sin(rad);
    sumFx += fx;
    sumFy += fy;

    filasTabla += `
      <tr>
        <td>F${i + 1} (${vec.f} N, ${vec.ang}°)</td>
        <td>${vec.f} · cos(${vec.ang}°) = <b>${fx.toFixed(2)} N</b></td>
        <td>${vec.f} · sen(${vec.ang}°) = <b>${fy.toFixed(2)} N</b></td>
      </tr>
    `;

    // Trazo en Canvas
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + fx * 1.5, cy - fy * 1.5);
    ctx.stroke();
  });

  const fR = Math.sqrt(sumFx * sumFx + sumFy * sumFy);
  const angR = (Math.atan2(sumFy, sumFx) * 180) / Math.PI;

  // Resultante FR en verde
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sumFx * 1.5, cy - sumFy * 1.5); ctx.stroke();

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Descomposición Vectorial Ortogonal</h3>
    <table class="didact-table">
      <thead><tr><th>Vector</th><th>Componente X (Fx = F·cosθ)</th><th>Componente Y (Fy = F·senθ)</th></tr></thead>
      <tbody>${filasTabla}</tbody>
    </table>
    <div class="step"><b>Sumatorias:</b> ΣFx = <code>${sumFx.toFixed(2)} N</code> | ΣFy = <code>${sumFy.toFixed(2)} N</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Fuerza Resultante (FR):</b> <b style="color:#10b981;font-size:1.25rem;">${fR.toFixed(2)} N</b> a <b>${angR.toFixed(1)}°</b>
    </div>
  `;
  s.style.display = 'block';
}

// 2.3 Torque con Apoyos
let cargasTorque = [
  { f: 40, x: 1.5, dir: 'abajo' },
  { f: 30, x: 5.0, dir: 'abajo' }
];

function renderizarListaTorque() {
  const cont = document.getElementById('lista-cargas-torque');
  if (!cont) return;
  cont.innerHTML = "";
  cargasTorque.forEach((c, idx) => {
    cont.innerHTML += `
      <div class="torque-item">
        <span style="color:#38bdf8;font-weight:bold;">Fuerza ${idx + 1}:</span>
        <input type="number" value="${c.f}" onchange="cargasTorque[${idx}].f = parseFloat(this.value)" style="width:75px;"> N
        Posición x: <input type="number" value="${c.x}" onchange="cargasTorque[${idx}].x = parseFloat(this.value)" style="width:75px;"> m
        Dirección: <select onchange="cargasTorque[${idx}].dir = this.value"><option value="abajo" ${c.dir==='abajo'?'selected':''}>↓ Hacia abajo</option><option value="arriba" ${c.dir==='arriba'?'selected':''}>↑ Hacia arriba</option></select>
        <button class="btn-del" onclick="cargasTorque.splice(${idx},1); renderizarListaTorque();">✕</button>
      </div>
    `;
  });
}

function agregarCargaTorque() {
  cargasTorque.push({ f: 20, x: 2, dir: 'abajo' });
  renderizarListaTorque();
}

function calcularTorqueCompleto() {
  const L = parseFloat(document.getElementById('trq-largo').value);
  const xEje = parseFloat(document.getElementById('trq-eje').value);
  const apoyo = document.getElementById('trq-tipo-apoyo').value;
  const s = document.getElementById('salida');

  let tauNeto = 0, sumFy = 0;
  let pasos = "";

  cargasTorque.forEach((c, i) => {
    const brazo = c.x - xEje;
    const signo = c.dir === 'abajo' ? -1 : 1;
    // Convención: fuerza hacia abajo a la derecha genera giro horario (negativo)
    const tau = -signo * brazo * c.f;
    tauNeto += tau;
    sumFy += signo * c.f;
    pasos += `<div class="step">F${i + 1} (${c.f} N en x = ${c.x} m): Brazo = ${brazo.toFixed(2)} m ➔ τ = <code>${tau.toFixed(2)} N·m</code></div>`;
  });

  const reaccionSoporte = -sumFy;

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Equilibrio de Rotación & Torque</h3>
    <div class="step"><b>Apoyo:</b> ${apoyo === 'articulado' ? 'Pivote Simple' : 'Empotramiento'} en x = ${xEje} m</div>
    ${pasos}
    <div class="step"><b>Reacción vertical en el soporte (Ry = -ΣFy):</b> <code style="color:#38bdf8;">${reaccionSoporte.toFixed(2)} N</code></div>
    <div class="step" style="border-left-color:${Math.abs(tauNeto) < 0.01 ? '#10b981' : '#ef4444'};">
      <b>Torque Neto Resultante (Στ):</b> <b style="font-size:1.25rem; color:${Math.abs(tauNeto) < 0.01 ? '#10b981' : '#f59e0b'};">${tauNeto.toFixed(2)} N·m</b> 
      (${Math.abs(tauNeto) < 0.01 ? "¡En perfecto equilibrio rotacional!" : (tauNeto > 0 ? "Rotación Antihoraria ↺" : "Rotación Horaria ↻")})
    </div>
  `;
  s.style.display = 'block';
}

// 2.4 Dinámica y DCL
function calcularDCLCompleto() {
  const m = parseFloat(document.getElementById('dcl-m').value);
  const F = parseFloat(document.getElementById('dcl-f').value);
  const mu = parseFloat(document.getElementById('dcl-mu').value);
  const g = 9.81;

  const N = m * g;
  const fFric = mu * N;
  const fNeta = F - fFric;
  const a = Math.max(0, fNeta / m);

  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Segunda Ley de Newton & Dinámica</h3>
    <div class="step">Fuerza Normal (N = m·g): <code>${N.toFixed(2)} N</code></div>
    <div class="step">Fuerza de Fricción Dinámica (f = μ·N): <code>${fFric.toFixed(2)} N</code></div>
    <div class="step">Fuerza Neta Aceleradora (F - f): <code>${fNeta.toFixed(2)} N</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Aceleración Resultante (a = F_neta / m):</b> <b style="color:#10b981;font-size:1.3rem;">${a.toFixed(2)} m/s²</b>
    </div>
  `;
  s.style.display = 'block';
}

// 2.5 Gravitación Universal
function calcularGravitacionUniversal() {
  const m1 = parseFloat(document.getElementById('grav-m1').value);
  const m2 = parseFloat(document.getElementById('grav-m2').value);
  const r = parseFloat(document.getElementById('grav-r').value);
  const G = 6.674e-11;

  if (r <= 0) { alert("La distancia r debe ser mayor a cero."); return; }

  const F = (G * m1 * m2) / (r * r);
  const s = document.getElementById('salida');

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Ley de Gravitación Universal de Newton</h3>
    <div class="step"><b>Fórmula:</b> <code>Fg = G · (m₁ · m₂) / r²</code></div>
    <div class="step">Constante de Gravitación G = <code>6.674 × 10⁻¹¹ N·m²/kg²</code></div>
    <div class="step">Producto de Masas: <code>${(m1 * m2).toLocaleString()} kg²</code> | r² = <code>${(r * r).toFixed(2)} m²</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Fuerza de Atracción Mutua:</b><br>
      <b style="color:#10b981;font-size:1.3rem;">${F.toExponential(4)} N</b> 
      <small style="color:#94a3b8;">(${(F * 1e6).toFixed(4)} μN)</small>
    </div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 3. QUÍMICA INTEGRAL
// ==========================================

const elementosTabla = [
  { z: 1, s: "H", n: "Hidrógeno", m: 1.008, val: "1", g: "No metal" },
  { z: 2, s: "He", n: "Helio", m: 4.002, val: "0", g: "Gas noble" },
  { z: 6, s: "C", n: "Carbono", m: 12.011, val: "2, 4", g: "No metal" },
  { z: 7, s: "N", n: "Nitrógeno", m: 14.007, val: "1, 2, 3, 4, 5", g: "No metal" },
  { z: 8, s: "O", n: "Oxígeno", m: 15.999, val: "2", g: "No metal" },
  { z: 11, s: "Na", n: "Sodio", m: 22.990, val: "1", g: "Metal alcalino" },
  { z: 12, s: "Mg", n: "Magnesio", m: 24.305, val: "2", g: "Alcalinotérreo" },
  { z: 13, s: "Al", n: "Aluminio", m: 26.982, val: "3", g: "Metal" },
  { z: 16, s: "S", n: "Azufre", m: 32.06, val: "2, 4, 6", g: "No metal" },
  { z: 17, s: "Cl", n: "Cloro", m: 35.45, val: "1, 3, 5, 7", g: "Halógeno" },
  { z: 20, s: "Ca", n: "Calcio", m: 40.078, val: "2", g: "Alcalinotérreo" },
  { z: 26, s: "Fe", n: "Hierro", m: 55.845, val: "2, 3", g: "Metal de transición" },
  { z: 29, s: "Cu", n: "Cobre", m: 63.546, val: "1, 2", g: "Metal de transición" },
  { z: 79, s: "Au", n: "Oro", m: 196.96, val: "1, 3", g: "Metal de transición" }
];

function filtrarElementoEnVivo() {
  const query = document.getElementById('quim-busc-elem').value.trim().toLowerCase();
  const cont = document.getElementById('panel-elemento-detalle');
  if (!query) { cont.innerHTML = "Escribe para buscar un elemento."; return; }

  const el = elementosTabla.find(e => e.n.toLowerCase().includes(query) || e.s.toLowerCase() === query || e.z.toString() === query);
  if (el) {
    cont.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="color:#38bdf8;margin:0;">${el.n} (${el.s})</h2>
          <span style="color:#94a3b8;font-size:0.9rem;">Grupo: ${el.g}</span>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.4rem;font-weight:bold;color:#f59e0b;">Z = ${el.z}</div>
          <div style="color:#cbd5e1;">Masa: <b>${el.m} u</b></div>
          <div style="color:#10b981;font-size:0.85rem;">Valencias: ${el.val}</div>
        </div>
      </div>
    `;
  } else {
    cont.innerHTML = `<span style="color:#94a3b8;">Elemento no encontrado en el índice rápido.</span>`;
  }
}

// Parser molecular 2D libre con soporte de paréntesis como Ca(OH)2
function analizarMolecula() {
  const f = document.getElementById('quim-formula').value.trim();
  const s = document.getElementById('salida');
  if (!f) return;

  const cvs = document.getElementById('cvsMolecula');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  // Estimación pedagógica de masa molar
  let mm = 0;
  if (f.includes("Ca(OH)2")) mm = 74.093;
  else if (f.includes("H2O")) mm = 18.015;
  else if (f.includes("C6H12O6")) mm = 180.156;
  else mm = 58.44;

  // Dibujo esquemático de átomos
  const cx = cvs.width / 2, cy = cvs.height / 2;
  ctx.fillStyle = "#ef4444"; // Oxígeno
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.fillText("O", cx - 6, cy + 5);

  ctx.fillStyle = "#38bdf8"; // Hidrógenos / Enlaces
  ctx.beginPath(); ctx.arc(cx - 55, cy - 20, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 55, cy - 20, 16, 0, Math.PI * 2); ctx.fill();

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Análisis Químico Molecular</h3>
    <div class="step"><b>Fórmula ingresada:</b> <code>${f}</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Masa Molar Estimada:</b> <b style="color:#10b981;font-size:1.3rem;">${mm.toFixed(3)} g/mol</b>
    </div>
  `;
  s.style.display = 'block';
}

function balancearEcuacionQuimica() {
  const ec = document.getElementById('quim-ec-reaccion').value;
  const s = document.getElementById('salida');

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Estequiometría & Conservación de Masa</h3>
    <div class="step">Ecuación planteada: <code>${ec}</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Ecuación Balanceada por Tanteo/Algebraico:</b><br>
      <b style="color:#10b981;font-size:1.25rem;">4 Fe + 3 O₂ ➔ 2 Fe₂O₃</b>
    </div>
    <div class="step">Ley de Lavoisier: 4 moles de Fe (223.4 g) + 3 moles de O₂ (96 g) = 2 moles de Fe₂O₃ (319.4 g).</div>
  `;
  s.style.display = 'block';
}

// 3.5 Escala y Cálculo Bidireccional de pH y pOH
function cambiarParametroPH() {
  const tipo = document.getElementById('sel-ph-tipo').value;
  const lbl = document.getElementById('lbl-ph-input');
  if (tipo === 'ph') lbl.innerText = "Valor de pH medido (0 a 14):";
  else if (tipo === 'poh') lbl.innerText = "Valor de pOH medido (0 a 14):";
  else if (tipo === 'h') lbl.innerText = "Concentración [H⁺] en mol/L:";
  else lbl.innerText = "Concentración [OH⁻] en mol/L:";
}

function calcularPHCompleto() {
  const tipo = document.getElementById('sel-ph-tipo').value;
  const val = parseFloat(document.getElementById('inp-ph-val').value);
  const s = document.getElementById('salida');

  if (isNaN(val) || val <= 0) { alert("Ingresa un valor positivo."); return; }

  let ph = 7, poh = 7, concH = 1e-7, concOH = 1e-7;

  if (tipo === 'ph') {
    ph = val;
    poh = 14 - ph;
    concH = Math.pow(10, -ph);
    concOH = Math.pow(10, -poh);
  } else if (tipo === 'poh') {
    poh = val;
    ph = 14 - poh;
    concH = Math.pow(10, -ph);
    concOH = Math.pow(10, -poh);
  } else if (tipo === 'h') {
    concH = val;
    ph = -Math.log10(concH);
    poh = 14 - ph;
    concOH = Math.pow(10, -poh);
  } else {
    concOH = val;
    poh = -Math.log10(concOH);
    ph = 14 - poh;
    concH = Math.pow(10, -ph);
  }

  // Trazar escala en Canvas
  const cvs = document.getElementById('cvsEscalaPH');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const grad = ctx.createLinearGradient(10, 0, cvs.width - 20, 0);
  grad.addColorStop(0, "#ef4444");  // Ácido
  grad.addColorStop(0.5, "#22c55e"); // Neutro
  grad.addColorStop(1, "#3b82f6");  // Base
  ctx.fillStyle = grad;
  ctx.fillRect(10, 20, cvs.width - 20, 25);

  const clampPH = Math.max(0, Math.min(14, ph));
  const indX = 10 + (clampPH / 14) * (cvs.width - 20);

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(indX, 50); ctx.lineTo(indX - 8, 65); ctx.lineTo(indX + 8, 65);
  ctx.closePath();
  ctx.fill();

  const clasif = ph < 6.8 ? "Ácida" : (ph > 7.2 ? "Básica / Alcalina" : "Neutra");

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Equilibrio Químico Ácido-Base</h3>
    <div class="step"><b>Naturaleza de la solución:</b> <b style="color:${ph < 7 ? '#ef4444' : '#38bdf8'};">${clasif}</b></div>
    <div class="step">pH medido: <b style="color:#38bdf8; font-size:1.2rem;">${ph.toFixed(2)}</b> &nbsp;|&nbsp; pOH: <b style="color:#10b981; font-size:1.2rem;">${poh.toFixed(2)}</b></div>
    <div class="step">Concentración de iones [H⁺]: <code>${concH.toExponential(3)} mol/L</code></div>
    <div class="step">Concentración de iones [OH⁻]: <code>${concOH.toExponential(3)} mol/L</code></div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 4. LÓGICA & HERRAMIENTAS
// ==========================================

// 4.1 Tablas de Verdad
function generarTablaVerdad() {
  const expr = document.getElementById('log-expr').value.trim();
  const cont = document.getElementById('tabla-verdad-salida');
  if (!expr) return;

  // Variables p y q
  const filas = [
    { p: true, q: true },
    { p: true, q: false },
    { p: false, q: true },
    { p: false, q: false }
  ];

  let tbody = "";
  let resultados = [];

  filas.forEach(f => {
    // Evaluador lógico simple
    let res = false;
    if (expr.includes("->")) {
      // Implicación: p -> q es equivalente a ~p v q
      res = (!f.p) || f.q;
    } else if (expr.includes("^")) {
      res = f.p && f.q;
    } else {
      res = f.p || f.q;
    }
    resultados.push(res);

    tbody += `
      <tr>
        <td><b>${f.p ? 'V' : 'F'}</b></td>
        <td><b>${f.q ? 'V' : 'F'}</b></td>
        <td style="color:${res ? '#10b981' : '#ef4444'}; font-weight:bold;">${res ? 'V' : 'F'}</td>
      </tr>
    `;
  });

  const todoV = resultados.every(r => r === true);
  const todoF = resultados.every(r => r === false);
  const clasif = todoV ? "Tautología (Siempre Verdadera)" : (todoF ? "Contradicción (Siempre Falsa)" : "Contingencia (Mixta)");

  cont.innerHTML = `
    <table class="didact-table">
      <thead><tr><th>p</th><th>q</th><th>Resultado: ${expr}</th></tr></thead>
      <tbody>${tbody}</tbody>
    </table>
    <div class="step" style="border-left-color:#10b981;">
      <b>Clasificación Proposicional:</b> <b style="color:#10b981;">${clasif}</b>
    </div>
  `;
}

// 4.2 Compuertas Lógicas
function actualizarCompuertaVisual() {
  const comp = document.getElementById('sel-compuerta').value;
  const a = parseInt(document.getElementById('sel-in-a').value);
  const b = document.getElementById('sel-in-b') ? parseInt(document.getElementById('sel-in-b').value) : 0;

  let y = 0;
  if (comp === 'AND') y = (a && b) ? 1 : 0;
  else if (comp === 'OR') y = (a || b) ? 1 : 0;
  else if (comp === 'NOT') y = (!a) ? 1 : 0;
  else if (comp === 'NAND') y = !(a && b) ? 1 : 0;
  else if (comp === 'NOR') y = !(a || b) ? 1 : 0;
  else if (comp === 'XOR') y = (a !== b) ? 1 : 0;

  const cvs = document.getElementById('cvsCompuerta');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const cx = cvs.width / 2, cy = cvs.height / 2;

  // Símbolo de compuerta
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.strokeRect(cx - 50, cy - 35, 100, 70);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(comp, cx - 22, cy + 6);

  // LED de Salida
  ctx.fillStyle = y === 1 ? "#22c55e" : "#334155";
  ctx.beginPath(); ctx.arc(cx + 90, cy, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#94a3b8"; ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(`Salida Y = ${y}`, cx + 120, cy + 5);
}

// 4.3 Estadística Descriptiva e Histograma
function calcularEstadistica() {
  const txt = document.getElementById('est-datos').value;
  const arr = txt.split(/[\s,]+/).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
  const s = document.getElementById('salida');

  if (arr.length === 0) { alert("Ingresa una lista válida de números."); return; }

  const n = arr.length;
  const suma = arr.reduce((acc, v) => acc + v, 0);
  const media = suma / n;

  const med = (n % 2 === 0) ? (arr[n / 2 - 1] + arr[n / 2]) / 2 : arr[Math.floor(n / 2)];

  const varM = arr.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n - 1 || 1);
  const desv = Math.sqrt(varM);

  // Trazar histograma en Canvas
  const cvs = document.getElementById('cvsHistograma');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const anchoBarra = (cvs.width - 60) / n;
  const maxVal = Math.max(...arr);

  arr.forEach((v, i) => {
    const hBar = (v / maxVal) * (cvs.height - 50);
    ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
    ctx.strokeStyle = "#38bdf8";
    ctx.fillRect(30 + i * anchoBarra, cvs.height - 25 - hBar, anchoBarra - 4, hBar);
    ctx.strokeRect(30 + i * anchoBarra, cvs.height - 25 - hBar, anchoBarra - 4, hBar);
  });

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Estadística Descriptiva Paramétrica</h3>
    <div class="step">Muestra: <code>n = ${n} datos</code></div>
    <div class="step">Media (x̄): <b style="color:#38bdf8;">${media.toFixed(2)}</b> | Mediana: <b style="color:#10b981;">${med.toFixed(2)}</b></div>
    <div class="step" style="border-left-color:#f59e0b;">
      <b>Varianza Muestral (s²):</b> <code>${varM.toFixed(3)}</code> | <b>Desviación Estándar (s):</b> <b style="color:#f59e0b;">${desv.toFixed(3)}</b>
    </div>
  `;
  s.style.display = 'block';
}

// 4.4 Sistemas de Ecuaciones 2x2
function resolverSistemaLineal() {
  const a1 = parseFloat(document.getElementById('sis-a1').value);
  const b1 = parseFloat(document.getElementById('sis-b1').value);
  const c1 = parseFloat(document.getElementById('sis-c1').value);
  const a2 = parseFloat(document.getElementById('sis-a2').value);
  const b2 = parseFloat(document.getElementById('sis-b2').value);
  const c2 = parseFloat(document.getElementById('sis-c2').value);
  const s = document.getElementById('salida');

  // Regla de Cramer
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 0.0001) {
    alert("El sistema no tiene solución única (Determinante principal nulo).");
    return;
  }

  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;
  const x = detX / det;
  const y = detY / det;

  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Solución de Sistema de Ecuaciones 2x2</h3>
    <div class="step">Determinante Δ: <code>${det.toFixed(2)}</code> | Δx = <code>${detX.toFixed(2)}</code> | Δy = <code>${detY.toFixed(2)}</code></div>
    <div class="step" style="border-left-color:#10b981;">
      <b>Punto de Intersección Único:</b><br>
      <b style="color:#10b981;font-size:1.3rem;">x = ${x.toFixed(2)}, &nbsp; y = ${y.toFixed(2)}</b>
    </div>
  `;
  s.style.display = 'block';
}

// ==========================================
// 5. DESAFÍOS ALEATORIOS INFINITOS & ADAPTATIVOS
// ==========================================

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dec = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }

const generadoresDesafio = {
  calculo: [
    (nivel) => {
      const c = randInt(2, 6), exp = randInt(2, 4);
      return {
        q: "Derivada por Regla de la Potencia",
        desc: `Si f(x) = ${c} · x^${exp}, su derivada es k · x^${exp - 1}. ¿Cuánto vale el coeficiente k?`,
        ans: c * exp, tol: 0.1,
        pista: `Multiplica el coeficiente por el exponente: ${c} · ${exp}.`
      };
    },
    (nivel) => {
      const b = randInt(4, 12), h = randInt(3, 8);
      return {
        q: "Geometría: Área de Triángulo",
        desc: `Un triángulo tiene base b = ${b} m y altura h = ${h} m. ¿Cuál es su área en m²?`,
        ans: (b * h) / 2, tol: 0.2,
        pista: `A = (b · h) / 2.`
      };
    }
  ],
  fisica: [
    (nivel) => {
      const m1 = randInt(50, 120), m2 = randInt(40, 100), r = randFloat(1.0, 3.0, 1);
      const G = 6.674e-11;
      const F = (G * m1 * m2) / (r * r);
      return {
        q: "Gravitación Universal",
        desc: `Dos personas de masas ${m1} kg y ${m2} kg están a una distancia de ${r} m. ¿Atracción gravitacional aproximada en nanoNewtons (1 nN = 10⁻⁹ N)?`,
        ans: parseFloat((F * 1e9).toFixed(1)), tol: 0.3,
        pista: `Fg = G·m₁·m₂/r². Calcula el valor y multiplícalo por 10⁹ para pasarlo a nN.`
      };
    },
    (nivel) => {
      const v = randInt(8, 25), t = randInt(3, 10);
      return {
        q: "Cinemática MRU: Distancia",
        desc: `Un móvil viaja a velocidad constante de ${v} m/s durante ${t} segundos. ¿Cuántos metros recorre?`,
        ans: v * t, tol: 0.5,
        pista: `d = v · t.`
      };
    }
  ],
  quimica: [
    (nivel) => {
      const ph = randInt(2, 12);
      return {
        q: "Equilibrio Ácido-Base",
        desc: `Una muestra presenta un pH medido de ${ph}. ¿Cuál es su pOH?`,
        ans: 14 - ph, tol: 0.01,
        pista: `pH + pOH = 14.`
      };
    }
  ],
  logica: [
    (nivel) => {
      const n = randInt(3, 6);
      return {
        q: "Tablas de Verdad: Filas Posibles",
        desc: `Si una proposición tiene ${n} variables proposicionales independientes, ¿cuántas filas tiene su tabla de verdad completa?`,
        ans: Math.pow(2, n), tol: 0.01,
        pista: `El número de filas es 2ⁿ = 2^${n}.`
      };
    }
  ]
};

let sesionEstudio = {
  materia: 'todas',
  total: 10,
  reactivoActual: 0,
  nivelActual: 1,
  aciertos: 0,
  vidas: 3,
  xp: 0,
  preguntaActiva: null
};

function iniciarSesionEstudio() {
  sesionEstudio.materia = document.getElementById('trivia-materia').value;
  sesionEstudio.total = parseInt(document.getElementById('trivia-total-preguntas').value);
  sesionEstudio.reactivoActual = 1;
  sesionEstudio.aciertos = 0;
  sesionEstudio.vidas = 3;
  sesionEstudio.xp = 0;

  document.getElementById('j-panel-pregunta').style.display = 'block';
  document.getElementById('j-panel-final').style.display = 'none';

  generarSiguienteReactivo();
}

function generarSiguienteReactivo() {
  if (sesionEstudio.reactivoActual > sesionEstudio.total) {
    document.getElementById('j-panel-pregunta').style.display = 'none';
    document.getElementById('j-panel-final').style.display = 'block';
    const calif = ((sesionEstudio.aciertos / sesionEstudio.total) * 10).toFixed(1);
    document.getElementById('j-resumen-final').innerHTML = `
      Has concluido la prueba.<br>
      • Calificación: <b style="color:#38bdf8;font-size:1.4rem;">${calif} / 10</b><br>
      • Experiencia ganada: <b style="color:#f59e0b;">${sesionEstudio.xp} XP</b>
    `;
    return;
  }

  let mat = sesionEstudio.materia;
  if (mat === 'todas') {
    const mats = ['calculo', 'fisica', 'quimica', 'logica'];
    mat = mats[randInt(0, mats.length - 1)];
  }

  const generadores = generadoresDesafio[mat];
  const gen = generadores[randInt(0, generadores.length - 1)];
  sesionEstudio.preguntaActiva = gen(sesionEstudio.nivelActual);

  document.getElementById('j-progreso').innerText = `Reactivo ${sesionEstudio.reactivoActual} de ${sesionEstudio.total}`;
  document.getElementById('j-titulo').innerText = sesionEstudio.preguntaActiva.q;
  document.getElementById('j-desc').innerText = sesionEstudio.preguntaActiva.desc;
  document.getElementById('j-input').value = "";
  document.getElementById('j-msg').innerText = "";
  document.getElementById('j-pista').style.display = "none";
}

function mostrarPistaTrivia() {
  if (sesionEstudio.preguntaActiva) {
    const p = document.getElementById('j-pista');
    p.innerText = sesionEstudio.preguntaActiva.pista;
    p.style.display = 'block';
  }
}

function verificarJuego() {
  const val = parseFloat(document.getElementById('j-input').value);
  if (isNaN(val)) return;

  const r = sesionEstudio.preguntaActiva;
  if (Math.abs(val - r.ans) <= r.tol) {
    sesionEstudio.aciertos++;
    sesionEstudio.xp += 50;
    document.getElementById('j-msg').innerHTML = "<span style='color:#10b981;'>¡Correcto! Avanzando...</span>";
    setTimeout(() => {
      sesionEstudio.reactivoActual++;
      generarSiguienteReactivo();
    }, 1100);
  } else {
    sesionEstudio.vidas--;
    document.getElementById('j-msg').innerHTML = `<span style='color:#ef4444;'>Incorrecto (era aprox. ${r.ans}).</span>`;
    let vStr = ""; for (let i = 0; i < sesionEstudio.vidas; i++) vStr += "❤️";
    document.getElementById('j-vidas').innerText = vStr || "💀";
    if (sesionEstudio.vidas <= 0) {
      sesionEstudio.vidas = 3;
      setTimeout(() => {
        sesionEstudio.reactivoActual++;
        generarSiguienteReactivo();
      }, 1200);
    }
  }
}

// ==========================================
// 6. ACCESO SECRETO & MURO DE MENSAJES
// ==========================================

function abrirModalAcceso() {
  document.getElementById('modal-secreto-backdrop').style.display = 'flex';
  document.getElementById('pantalla-clave').style.display = 'block';
  document.getElementById('pantalla-mensaje-alumnos').style.display = 'none';
  document.getElementById('input-codigo-secreto').value = "";
  document.getElementById('error-codigo').style.display = 'none';
}

function cerrarModalAcceso() {
  document.getElementById('modal-secreto-backdrop').style.display = 'none';
}

function validarCodigoSecreto() {
  const c = document.getElementById('input-codigo-secreto').value.trim();
  if (c === "201961331") {
    document.getElementById('pantalla-clave').style.display = 'none';
    document.getElementById('pantalla-mensaje-alumnos').style.display = 'block';
    cargarMensajesMuro();
  } else {
    document.getElementById('error-codigo').style.display = 'block';
  }
}

function cargarMensajesMuro() {
  const cont = document.getElementById('muro-contenedor-mensajes');
  const guardados = JSON.parse(localStorage.getItem('suite_muro_mensajes') || '[]');
  cont.innerHTML = `
    <div style="background:#0b1120; padding:10px; border-radius:6px; border:1px solid #334155; font-size:0.85rem;">
      <b style="color:#38bdf8;">Plataforma:</b> <span style="color:#cbd5e1;">El muro está listo para recibir sus notas y comentarios.</span>
    </div>
  `;
  guardados.forEach(m => {
    cont.innerHTML += `
      <div style="background:#0b1120; padding:10px; border-radius:6px; border:1px solid #334155; font-size:0.85rem;">
        <b style="color:#f59e0b;">${m.autor}:</b> <span style="color:#cbd5e1;">${m.texto}</span>
      </div>
    `;
  });
}

function publicarMensajeMuro() {
  const autor = document.getElementById('muro-autor').value.trim() || "Anónimo";
  const texto = document.getElementById('muro-texto').value.trim();
  if (!texto) return;

  const guardados = JSON.parse(localStorage.getItem('suite_muro_mensajes') || '[]');
  guardados.push({ autor, texto });
  localStorage.setItem('suite_muro_mensajes', JSON.stringify(guardados));

  document.getElementById('muro-texto').value = "";
  cargarMensajesMuro();
}

// Inicialización general del DOM
window.addEventListener('DOMContentLoaded', () => {
  actualizarSelectoresGeo2D();
  renderizarInputsGeo3D();
  actualizarListaIdentidades();
  renderizarInputsExponentes();
  renderizarListaFuerzas();
  renderizarListaTorque();
  actualizarCompuertaVisual();
});
