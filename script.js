// ==========================================
// NAVEGACIÓN GENERAL SEGURA
// ==========================================
function verMateria(mat) {
  try {
    document.querySelectorAll('#tabs-nivel-1 .btn-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="sub-"]').forEach(s => s.style.display = 'none');
    const salida = document.getElementById('salida');
    if (salida) salida.style.display = 'none';

    const btnActivo = document.getElementById('btn-tab-' + mat);
    if (btnActivo) btnActivo.classList.add('active');

    const sub = document.getElementById('sub-' + mat);
    if (sub) sub.style.display = 'flex';

    const porDefecto = {
      calculo: 'calc-libre',
      fisica: 'fis-torque',
      robotica: 'rob-resistor',
      quimica: 'quim-molar',
      juego: 'trivia'
    };
    verModulo(mat, porDefecto[mat]);
  } catch (e) { console.error(e); }
}

function verModulo(materia, mod) {
  try {
    const sub = document.getElementById('sub-' + materia);
    if (sub) {
      sub.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
      sub.querySelectorAll('.btn-tab').forEach(btn => {
        const fn = btn.getAttribute('onclick');
        if (fn && fn.includes("'" + mod + "'")) btn.classList.add('active');
      });
    }

    document.querySelectorAll('.mod-content').forEach(m => m.classList.remove('visible'));
    const salida = document.getElementById('salida');
    if (salida) salida.style.display = 'none';

    const target = document.getElementById('mod-' + mod);
    if (target) {
      target.classList.add('visible');
      if (mod === 'calc-cuadri') { ajustarInputsCuadrilatero(); dibujarYCalcularCuadrilatero(); }
      if (mod === 'calc-3d') { ajustarInputsVolumen(); }
      if (mod === 'calc-trig') calcRazonesTrig();
      if (mod === 'fis-torque') renderizarListaTorques();
      if (mod === 'plano-fuerzas') renderizarListaFuerzas();
      if (mod === 'fis-mrua') calcMRUA_Grafico();
      if (mod === 'fis-parabolico') calcParabolico_Grafico();
      if (mod === 'fis-friccion') calcDCL_Friccion();
      if (mod === 'rob-resistor') actualizarBandasColor();
      if (mod === 'rob-esquematico') calcCircuitoEsquematico();
      if (mod === 'cuadritos') dibujarRiemann(document.querySelector('#mod-cuadritos input').value);
      if (mod === 'trivia') cargarPreguntaTrivia();
    }
  } catch (e) { console.error(e); }
}

// ==========================================
// CÁLCULO SIMBÓLICO (ALGEBRITE)
// ==========================================
function resolverCAS(operacion) {
  const rawExpr = document.getElementById('cas-input').value.trim();
  const limA = document.getElementById('cas-lim-a').value.trim();
  const limB = document.getElementById('cas-lim-b').value.trim();
  const s = document.getElementById('salida');

  if (!rawExpr) { alert("Escribe una función."); return; }

  try {
    let limpia = rawExpr.replace(/sen\(/g, "sin(").replace(/(\d)([a-zA-Z])/g, "$1*$2");
    let resultadoSimb = "";
    let explicacion = "";

    if (operacion === 'derivar') {
      resultadoSimb = Algebrite.run(`d(${limpia}, x)`);
      explicacion = `
        <h3 style="color:#38bdf8;margin:0 0 8px 0;">Derivada Simbólica Resuelta</h3>
        <div class="step"><b>Función original:</b> <code>f(x) = ${rawExpr}</code></div>
        <div class="step"><b>Resultado simplificado:</b> <b style="color:#38bdf8;font-size:1.15rem;">f'(x) = ${resultadoSimb}</b></div>
      `;
    } else {
      resultadoSimb = Algebrite.run(`integral(${limpia}, x)`);
      explicacion = `
        <h3 style="color:#10b981;margin:0 0 8px 0;">Integral Simbólica Resuelta</h3>
        <div class="step"><b>Antiderivada:</b> <b style="color:#10b981;font-size:1.15rem;">∫ [ ${rawExpr} ] dx = ${resultadoSimb} + C</b></div>
      `;

      if (limA !== "" && limB !== "") {
        const evalB = Algebrite.run(`subst(${limB}, x, ${resultadoSimb})`);
        const evalA = Algebrite.run(`subst(${limA}, x, ${resultadoSimb})`);
        const areaExacta = Algebrite.run(`float(${evalB} - (${evalA}))`);
        explicacion += `<div class="step"><b>Área Definida [${limA} a ${limB}]:</b> <b>${areaExacta} u²</b></div>`;
      }
    }

    s.innerHTML = explicacion;
    s.style.display = 'block';
  } catch (err) {
    alert("Error de sintaxis matemática. Revisa operadores (ejemplo: 3*x^2 + sin(x)).");
  }
}

// ==========================================
// GEOMETRÍA 2D Y 3D
// ==========================================
function ajustarInputsCuadrilatero() {
  const t = document.getElementById('cuadri-tipo').value;
  const g2 = document.getElementById('grp-cuadri-2'), g3 = document.getElementById('grp-cuadri-3');
  const l1 = document.getElementById('lbl-cuadri-1'), l2 = document.getElementById('lbl-cuadri-2'), l3 = document.getElementById('lbl-cuadri-3');
  if (t === 'cuadrado') { l1.innerText = "Lado (L):"; g2.style.display = 'none'; g3.style.display = 'none'; }
  else if (t === 'rectangulo') { l1.innerText = "Base (b):"; l2.innerText = "Altura (h):"; g2.style.display = 'block'; g3.style.display = 'none'; }
  else if (t === 'rombo') { l1.innerText = "Diagonal Mayor (D):"; l2.innerText = "Diagonal Menor (d):"; g2.style.display = 'block'; g3.style.display = 'none'; }
  else if (t === 'romboide') { l1.innerText = "Base (b):"; l2.innerText = "Altura real (h):"; g2.style.display = 'block'; g3.style.display = 'none'; }
  else { l1.innerText = "Base Mayor (B):"; l2.innerText = "Altura (h):"; l3.innerText = "Base Menor (b):"; g2.style.display = 'block'; g3.style.display = 'block'; }
  dibujarYCalcularCuadrilatero();
}

function dibujarYCalcularCuadrilatero() {
  const t = document.getElementById('cuadri-tipo').value;
  const v1 = parseFloat(document.getElementById('cuadri-val1').value) || 1;
  const v2 = parseFloat(document.getElementById('cuadri-val2').value) || 1;
  const v3 = parseFloat(document.getElementById('cuadri-val3').value) || 1;
  let area = t === 'cuadrado' ? v1*v1 : t === 'rectangulo' ? v1*v2 : t === 'rombo' ? (v1*v2)/2 : t === 'romboide' ? v1*v2 : ((v1+v3)/2)*v2;

  const cvs = document.getElementById('cvsCuadrilatero');
  if (cvs) {
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;

    if (t === 'cuadrado') { ctx.fillRect(cx-45, cy-45, 90, 90); ctx.strokeRect(cx-45, cy-45, 90, 90); }
    else if (t === 'rectangulo') { ctx.fillRect(cx-75, cy-35, 150, 70); ctx.strokeRect(cx-75, cy-35, 150, 70); }
    else if (t === 'rombo') {
      ctx.beginPath(); ctx.moveTo(cx, cy-50); ctx.lineTo(cx+70, cy); ctx.lineTo(cx, cy+50); ctx.lineTo(cx-70, cy); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(cx-60, cy+35); ctx.lineTo(cx+60, cy+35); ctx.lineTo(cx+85, cy-35); ctx.lineTo(cx-35, cy-35); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  }
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Área del Cuadrilátero: <b>${area.toFixed(2)} u²</b></h3>`;
  document.getElementById('salida').style.display = 'block';
}

function ajustarInputsVolumen() {
  const c = document.getElementById('vol-cuerpo').value;
  const l1 = document.getElementById('lbl-v1'), g2 = document.getElementById('grp-v2'), l2 = document.getElementById('lbl-v2'), g3 = document.getElementById('grp-v3');
  if (c === 'esfera') { l1.innerText = "Radio (r) [cm]:"; g2.style.display = 'none'; g3.style.display = 'none'; }
  else if (c === 'cubo') {
    l1.innerText = "Largo (a) [cm]:"; l2.innerText = "Ancho (b) [cm]:";
    document.getElementById('lbl-v3').innerText = "Alto (c) [cm]:";
    g2.style.display = 'block'; g3.style.display = 'block';
  } else {
    l1.innerText = "Radio (r) [cm]:"; l2.innerText = "Altura (h) [cm]:";
    g2.style.display = 'block'; g3.style.display = 'none';
  }
}

function calcularVolumenYPeso() {
  const c = document.getElementById('vol-cuerpo').value;
  const v1 = parseFloat(document.getElementById('vol-val1').value) || 0;
  const v2 = parseFloat(document.getElementById('vol-val2').value) || 0;
  const v3 = parseFloat(document.getElementById('vol-val3').value) || 0;
  const dens = parseFloat(document.getElementById('vol-material').value) || 1.24;

  let vol = 0;
  if (c === 'cilindro') vol = Math.PI * Math.pow(v1, 2) * v2;
  else if (c === 'esfera') vol = (4 / 3) * Math.PI * Math.pow(v1, 3);
  else if (c === 'cubo') vol = v1 * v2 * v3;
  else if (c === 'cono') vol = (1 / 3) * Math.PI * Math.pow(v1, 2) * v2;

  const masaG = vol * dens;
  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Cálculo de Volumen y Masa</h3>
    <div class="step"><b>Volumen Total:</b> <b>${vol.toFixed(2)} cm³</b></div>
    <div class="step"><b>Masa Estimada:</b> <b style="color:#10b981;">${masaG.toFixed(1)} gramos</b> (${(masaG/1000).toFixed(3)} kg)</div>
  `;
  s.style.display = 'block';
}

function calcRazonesTrig() {
  const co = parseFloat(document.getElementById('trig-co').value) || 3, ca = parseFloat(document.getElementById('trig-ca').value) || 4;
  const h = Math.sqrt(co*co + ca*ca);
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Hipotenusa: ${h.toFixed(2)} | sen: ${(co/h).toFixed(4)} | cos: ${(ca/h).toFixed(4)} | tan: ${(co/ca).toFixed(4)}</h3>`;
  document.getElementById('salida').style.display = 'block';
}

function comprobarIdentidad() {
  const deg = parseFloat(document.getElementById('ident-angulo').value) || 30;
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">sen²(${deg}°) + cos²(${deg}°) = <b>1.000</b></h3>`;
  document.getElementById('salida').style.display = 'block';
}

function ajustarInputsExponentes() {
  document.getElementById('grp-exp-m').style.display = (document.getElementById('sel-ley-exp').value === 'neg') ? 'none' : 'block';
}

function calcLeyesExponentes() {
  const l = document.getElementById('sel-ley-exp').value;
  const a = parseFloat(document.getElementById('exp-a').value)||2, n = parseFloat(document.getElementById('exp-n').value)||3, m = parseFloat(document.getElementById('exp-m').value)||2;
  let r = l === 'prod' ? Math.pow(a, n+m) : l === 'coc' ? Math.pow(a, n-m) : l === 'pot' ? Math.pow(a, n*m) : 1/Math.pow(a, n);
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Resultado: ${r}</h3>`;
  document.getElementById('salida').style.display = 'block';
}

function dibujarRiemann(n) {
  document.getElementById('lbl-cuadritos').innerText = n;
  const cvs = document.getElementById('cvsRiemann');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  ctx.clearRect(0,0,w,h);
  const dx = 2 / n; let suma = 0;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; ctx.strokeStyle = '#38bdf8';
  for (let i = 0; i < n; i++) {
    let x = i * dx, y = (x + dx) * (x + dx);
    suma += y * dx;
    ctx.fillRect(30 + (x * 160), (h - 25) - (y * 32), dx * 160, y * 32);
    ctx.strokeRect(30 + (x * 160), (h - 25) - (y * 32), dx * 160, y * 32);
  }
  document.getElementById('areaRiemannText').innerText = `Área aproximada: ${suma.toFixed(3)} u²`;
}

// ==========================================
// FÍSICA: TORQUE, VECTORES, MRUA, TIRO Y DCL
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
  let tAnti = 0, tHor = 0, desglose = "";
  torquesData.forEach((it, i) => {
    const tMag = it.f * it.d;
    if (it.lado === 'izq') {
      tAnti += tMag;
      desglose += `<li><b>F${i+1} (Izq):</b> ${it.f}N · ${it.d}m = <code>+${tMag.toFixed(2)} N·m</code> (↺)</li>`;
    } else {
      tHor += tMag;
      desglose += `<li><b>F${i+1} (Der):</b> ${it.f}N · ${it.d}m = <code>-${tMag.toFixed(2)} N·m</code> (↻)</li>`;
    }
  });

  const tNeto = tAnti - tHor;
  let estado = Math.abs(tNeto) <= 0.05 ? "⚖️ <b style='color:#10b981;'>¡EQUILIBRIO ROTACIONAL! (Στ = 0)</b>" : tNeto > 0 ? "↺ Gira antihorario (" + tNeto.toFixed(2) + " N·m)" : "↻ Gira horario (" + Math.abs(tNeto).toFixed(2) + " N·m)";

  const s = document.getElementById('salida');
  s.innerHTML = `
    <h3 style="color:#38bdf8;margin:0 0 8px 0;">Torque Neto (Στ)</h3>
    <div class="step">Desglose:<ul>${desglose}</ul></div>
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
    <div class="step"><b>Magnitud FR: ${mag.toFixed(2)} N</b> | <b>Dirección θ: ${ang.toFixed(1)}°</b></div>
  `;
  document.getElementById('salida').style.display = 'block';
}

function calcMRUA_Grafico() {
  const v0 = parseFloat(document.getElementById('mrua-v0').value) || 0;
  const a = parseFloat(document.getElementById('mrua-a').value) || 0;
  const t = parseFloat(document.getElementById('mrua-t').value) || 0;
  const vf = v0 + (a * t), d = (v0 * t) + (0.5 * a * t * t);

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
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">MRUA: d = ${d.toFixed(2)} m | Vf = ${vf.toFixed(2)} m/s</h3>`;
  document.getElementById('salida').style.display = 'block';
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
// ROBÓTICA Y QUÍMICA
// ==========================================
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
  const r2 = parseFloat(document.getElementById('cir-r2').value) || 0;
  const i = (r1 + r2) > 0 ? (vcc / (r1 + r2)) : 0;
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Corriente Circulante: ${(i*1000).toFixed(1)} mA</h3>`;
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
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Cantidad: ${((p*v)/(0.0821*(t+273.15))).toFixed(3)} moles</h3>`;
  document.getElementById('salida').style.display = 'block';
}

function calcMolaridad() {
  const n = parseFloat(document.getElementById('sol-n').value)||1, v = parseFloat(document.getElementById('sol-v').value)||1;
  document.getElementById('salida').innerHTML = `<h3 style="color:#38bdf8;">Molaridad: ${(n/v).toFixed(3)} M</h3>`;
  document.getElementById('salida').style.display = 'block';
}

// ==========================================
// DESAFÍOS ANTI-ESTRÉS
// ==========================================
const bancoTrivia = {
  facil: [
    { q: "Identidad Fundamental", desc: "Si sen(θ) = 0.6 y cos(θ) = 0.8, ¿cuánto resulta sen²(θ) + cos²(θ)?", ans: 1, tol: 0.05, pista: "sen² + cos² siempre da exactamente 1 para cualquier ángulo." },
    { q: "Exponente Cero", desc: "¿Cuánto es 999⁰?", ans: 1, tol: 0.01, pista: "Cualquier número distinto de cero elevado a cero es 1." },
    { q: "Área Cuadrada", desc: "Una base de robot cuadrada mide 4 m de lado. ¿Cuál es su área en m²?", ans: 16, tol: 0.1, pista: "Multiplica lado por lado: 4 · 4." }
  ],
  medio: [
    { q: "Área de Rombo", desc: "Un rombo tiene D = 8 m y d = 5 m. ¿Cuál es su área en m²?", ans: 20, tol: 0.2, pista: "A = (D · d) / 2. Multiplica 8 por 5 y divide entre 2." },
    { q: "Fuerzas Opuestas", desc: "F1 = 12 N (derecha) y F2 = 5 N (izquierda). ¿Fuerza resultante neta?", ans: 7, tol: 0.1, pista: "Resta 12 menos 5." },
    { q: "Ley de Ohm", desc: "Voltaje = 5V, Corriente = 0.02 A. ¿Resistencia en Ohms (R = V/I)?", ans: 250, tol: 2, pista: "Divide 5 entre 0.02." }
  ],
  dificil: [
    { q: "Equilibrio de Palanca", desc: "Un peso de 30 N está a 2 m del eje a la izquierda (60 N·m). ¿A qué distancia a la derecha debe colocarse una carga de 40 N para equilibrar?", ans: 1.5, tol: 0.05, pista: "Iguala torques: 60 = 40 · d. Divide 60 entre 40." },
    { q: "Derivada Trigonométrica", desc: "Si f(x) = 5 · sen(4x), su derivada es k · cos(4x). ¿Cuánto vale k?", ans: 20, tol: 0.1, pista: "Multiplica la constante de afuera (5) por la de adentro (4)." }
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

// --- MODAL DE CÓDIGO ---
const snippets = {
  cas: `// Algebrite resuelve simbólicamente:\nlet der = Algebrite.run("d(3*x^2 + sin(x), x)");\nlet int = Algebrite.run("integral(3*x^2 + sin(x), x)");`,
  volumen: `function volCilindro(r, h) { return Math.PI * r * r * h; }`,
  torque: `function torqueNeto(fuerzas) { ... }`,
  vectores: `function sumaVectores(fx, fy) { return Math.sqrt(fx*fx + fy*fy); }`,
  mrua: `function dMRUA(v0, a, t) { return (v0 * t) + (0.5 * a * t * t); }`,
  parabolico: `function hMax(v0, ang) { ... }`,
  dcl: `function fNeta(f, mu, m) { return f - (mu * m * 9.81); }`,
  cuadrilateros: `function areaRombo(D, d) { return (D * d) / 2; }`,
  trig: `function hipotenusa(a, b) { return Math.sqrt(a*a + b*b); }`,
  identidades: `// sen²(θ) + cos²(θ) = 1`,
  exponentes: `function prodBases(a, n, m) { return Math.pow(a, n + m); }`,
  resistor: `function calcR(d1, d2, d3, m) { return ((d1*100) + (d2*10) + d3) * m; }`,
  esquema: `function leyOhm(v, r) { return v / r; }`,
  servo: `function servoPwm(deg) { return 1000 + (deg / 180) * 1000; }`,
  bateria: `function bat(cap, cTot) { return (cap * 0.70) / cTot; }`,
  molar: `function masaH2SO4() { return 98.07; }`,
  gases: `function moles(p, v, tC) { return (p * v) / (0.0821 * (tC + 273.15)); }`,
  molaridad: `function molaridad(n, v) { return n / v; }`
};

function verCodigo(id) {
  const pre = document.getElementById('codeSnippet');
  if (pre) pre.innerText = snippets[id] || "// Código disponible";
  const mod = document.getElementById('codeModal');
  if (mod) mod.style.display = 'flex';
}
function cerrarModal(e) { if (e.target.id === 'codeModal') cerrarModalDirecto(); }
function cerrarModalDirecto() { document.getElementById('codeModal').style.display = 'none'; }

// Arranque seguro
window.addEventListener('DOMContentLoaded', () => {
  poblarSelectoresResistor();
  actualizarBandasColor();
  ajustarInputsVolumen();
  ajustarInputsCuadrilatero();
  dibujarYCalcularCuadrilatero();
  renderizarListaTorques();
  cargarPreguntaTrivia();
});
