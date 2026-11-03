# 🧮 Suite Científica, Cálculo & Robótica Didáctica

Plataforma educativa web diseñada como una suite de herramientas interactivas para estudiantes de **secundaria y preparatoria**. Combina cálculo simbólico asistido por motor CAS, simulación gráfica de curvas e integrales, análisis balístico y de momentos en física, diseño de hardware electrónico para robótica y estequiometría química.

🌐 **Sitio en vivo:** [https://UriCarlosUri.github.io/Calculadora/](https://UriCarlosUri.github.io/Calculadora/)

---

## 🚀 Módulos y Funcionalidades

### 📐 Cálculo & Geometría
- **Derivadas por Métodos Analíticos:** Entrada libre de funciones $f(x)$ para obtener su derivada simbólica simplificada paso a paso, reconociendo Regla de la Cadena, Regla del Producto ($u \cdot v$), Regla del Cociente ($u/v$) y derivadas inmediatas.
- **Integrales con Trazado Cartesiano:** Cálculo simbólico de antiderivadas (integrales indefinidas) y resolución definida mediante la Regla de Barrow $[a, b]$, graficando en tiempo real la función en Canvas y sombreando el área bajo la curva resultante.
- **Geometría 2D Completa:** Catálogo de figuras planas con cálculo de área y despeje de incógnitas:
  - *Triángulos:* Base y altura, fórmula de Herón (3 lados) y triángulo equilátero.
  - *Círculos:* Círculo estándar, corona circular (anillo) y sector circular.
  - *Cuadriláteros:* Cuadrado, rectángulo, rombo (diagonales) y trapecio con cotas gráficas.
  - *Polígonos Regulares:* Pentágonos, hexágonos y polígonos de $n$ lados ($n \ge 5$) mediante perímetro y apotema.
- **Volúmenes 3D & Estimación de Masa:** Cálculo de capacidad volumétrica y despeje de variables (cilindro, prisma rectangular, esfera, cono, pirámide) con cálculo automático de peso de la pieza según el material (filamento PLA para impresión 3D, acrílico, aluminio o acero).
- **Razones Trigonométricas & Círculo Unitario:** Cálculo de las 6 razones trigonométricas directas y recíprocas ($\sin, \cos, \tan, \csc, \sec, \cot$), selector de ángulos notables en radianes y proyección animada en el círculo unitario.
- **Compendio Total de Identidades Trigonométricas:** Demostración con comprobación de igualdad numérica para identidades pitagóricas, recíprocas, por cociente, paridad/negativos, ángulo doble, ángulo mitad y suma/resta de ángulos.
- **Leyes de Exponentes y Radicales:** Demostración paso a paso de las 9 leyes algebraicas (producto, cociente, potencia de potencia, distributivas, exponente cero, negativos y exponentes fraccionarios/raíces).

---

### 🚀 Física & Diagramas Interactivos
- **Torque Multicomponente (Balancín):** Configuración dinámica de múltiples fuerzas y cargas a lo largo de una viga con fulcro central, calculando momentos horarios ($-$), antihorarios ($+$), torque neto ($\sum \tau$) y verificación de equilibrio rotacional.
- **Plano Vectorial 2D Ampliado:** Sumatoria de fuerzas concurrentes con descomposición ortogonal en ejes $X/Y$, graficado a escala en Canvas y cálculo de la magnitud y dirección del vector resultante.
- **Cinemática MRUA con Despeje de Variantes:** Resolución analítica seleccionando la incógnita requerida ($d, v_f, a, t$) con trazado simultáneo de la parábola de posición vs. tiempo.
- **Tiro Parabólico Balístico:** Descomposición vectorial del disparo en $v_{0x}$ y $v_{0y}$, tiempo en el aire, altura máxima ($H_{\max}$) y alcance horizontal total con simulación de trayectoria.
- **Diagrama de Cuerpo Libre (DCL):** Bloque interactivo con vectores ortogonales de Normal, Peso gravitatorio ($mg$), Fuerza motriz y Fuerza de fricción dinámica opuesta ($f_r = \mu \cdot N$).

---

### 🤖 Robótica & Hardware
- **Componentes Electrónicos Fundamentales:**
  - *Diodos:* Cálculo de resistencia limitadora y caída de tensión.
  - *Transistores BJT (NPN):* Cálculo de corriente de base $I_b$ y resistor $R_B$ para conmutación de motores.
  - *Capacitores:* Constante de tiempo $\tau = R \cdot C$ y tiempo de carga de filtrado.
  - *Reguladores de Voltaje (7805):* Caída de tensión y advertencia de potencia térmica disipada en Watts.
- **Decodificador de Resistencias (4 y 5 Bandas):** Lectura gráfica de bandas de color con selector de modo para resistores de carbón al 5% o resistores de precisión azul al 1%.
- **Ley de Ohm:** Cálculo de corriente circulante y potencia eléctrica ($P = V \cdot I$) en circuitos de corriente directa.
- **Servomotores & PWM:** Conversión de grados (0° a 180°) a ancho de pulso en microsegundos ($\mu\text{s}$) y generación del código nativo en C++ para Arduino IDE (`Servo.h`).
- **Autonomía de Batería:** Estimación de consumo en paralelo y tiempo de operación continuo del robot considerando un factor de descarga seguro del 70%.

---

### 🧪 Química & Elementos
- **Buscador de la Tabla Periódica Completa:** Motor de búsqueda interactivo por nombre, símbolo o número atómico ($Z$), desplegando masa atómica, grupo/familia y números de valencia sin saturar la pantalla.
- **Catálogo de Masa Molar:** Desglose atómico y porcentaje de masa elemental de compuestos comunes (ácidos, bases, sales, carbohidratos y solventes).
- **Gases Ideales ($P \cdot V = n \cdot R \cdot T$):** Relación de variables termodinámicas de presión, volumen, temperatura y moles de gas.
- **Molaridad & Disoluciones:** Relación de concentración molar ($M = n / V$) para reactivos de laboratorio.

---

### 🏆 Desafíos Anti-Estrés
- Minijuego interactivo con preguntas generadas de todas las materias.
- **Selector de dificultad:** *Fácil* (conceptos directos), *Medio* (un despeje algebraico) y *Difícil* (ejercicios avanzados de preparatoria).
- **Botón de Pistas Didácticas:** Explicación conceptual guiada para desbloquear al estudiante sin regalarle la respuesta numérica.
- Sistema de vidas y acumulador de experiencia (XP).

---

## 📂 Arquitectura del Proyecto

El desarrollo sigue una estructura modular limpia separada en tres archivos independientes para facilitar su mantenimiento:

```text
├── index.html        # Estructura semántica, menús y formularios de entrada
├── style.css         # Diseño visual responsivo y paleta oscura tipo consola
├── script.js         # Lógica matemática, graficación en Canvas y motor Algebrite
└── README.md         # Documentación técnica y guía de usuario
