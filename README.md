# 🧮 Suite Científica, Cálculo & Robótica

Plataforma educativa web diseñada como herramienta interactiva de apoyo para estudiantes de nivel **secundaria y preparatoria**. Combina cálculo simbólico, visualización física balística y vectorial, análisis de circuitos electrónicos y estequiometría química en un entorno interactivo y visual.

🌐 **Sitio en vivo:** [https://UriCarlosUri.github.io/Calculadora/](https://UriCarlosUri.github.io/Calculadora/)

---

## 🚀 Módulos y Funcionalidades

### 📐 Cálculo & Geometría
- **Cálculo Simbólico Abierto (CAS):** Entrada libre de funciones algebraicas y trascendentes para resolución simbólica de derivadas e integrales (indefinidas y definidas con límites).
- **Guía de Cuadriláteros (Áreas 2D):** Análisis geométrico interactivo en Canvas (cuadrado, rectángulo, rombo, romboide y trapecio) con deducción de fórmulas y cotas visuales.
- **Volúmenes 3D & Estimación de Peso:** Cálculo de capacidad volumétrica de cilindros, prismas, esferas y conos, con cálculo de masa según el material (PLA para impresión 3D, acrílico, aluminio, acero).
- **Razones e Identidades Trigonométricas:** Estudio de las 6 razones trigonométricas en triángulos rectángulos y demostración analítica de identidades fundamentales (pitagóricas, cociente, ángulo doble y paridad).
- **Leyes de los Exponentes & Sumas de Riemann:** Demostración de propiedades exponenciales y aproximación visual de áreas bajo la curva con rectángulos dinámicos.

### 🚀 Física & Diagramas Interactivos
- **Torque Multicomponente (Balancín):** Configuración de múltiples fuerzas en vigas con fulcro central para análisis de momentos horarios/antihorarios y condición de equilibrio rotacional ($\sum \tau = 0$).
- **Plano Vectorial 2D Ampliado:** Sumatoria de fuerzas concurrentes con descomposición ortogonal en ejes $X/Y$ y cálculo del vector resultante en tiempo real.
- **Cinemática MRUA:** Despeje de velocidad y posición con trazado de la curva parabólica posición-tiempo.
- **Tiro Parabólico:** Simulación de trayectoria balística con cálculo de altura máxima ($H_{\max}$), tiempo de vuelo y alcance horizontal.
- **Diagrama de Cuerpo Libre (DCL):** Análisis visual de fuerza motriz, normal, peso y fricción dinámica.

### 🤖 Robótica & Circuitos
- **Decodificador de Resistencias (4 y 5 Bandas):** Lectura gráfica de código de colores tanto para resistores estándar de carbón (±5%) como de precisión en película metálica (±1%).
- **Ley de Ohm con Esquema Circuital:** Simulación esquemática de caídas de tensión y corriente circulante en serie para LEDs y actuadores.
- **Servomotores & Control PWM:** Mapeo de ángulos (0° a 180°) a anchos de pulso en microsegundos y código nativo para Arduino IDE.
- **Autonomía de Batería:** Estimación de consumo en paralelo y tiempo de operación continuo para robots móviles.

### 🧪 Química
- **Catálogo de Masa Molar:** Desglose atómico y porcentaje de masa elemental de más de 15 compuestos escolares comunes (ácidos, bases, sales y carbohidratos).
- **Gases Ideales ($P \cdot V = n \cdot R \cdot T$):** Despeje de cantidad de sustancia y variables termodinámicas.
- **Molaridad:** Relación de concentración molar para disoluciones en laboratorio.

### 🏆 Desafíos Anti-Estrés
- Minijuego interactivo con selección de dificultad (**Fácil**, **Medio**, **Difícil**), sistema de vidas y botón de pistas didácticas guiadas para evitar la frustración del estudiante.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica y componentes de interfaz.
- **CSS3:** Diseño responsivo con paleta oscura optimizada para lectura en pantallas.
- **JavaScript (ES6+):** Lógica matemática nativa, manipulación del DOM y renderizado gráfico sobre elementos `<canvas>`.
- **Algebrite CAS:** Motor de álgebra computacional en cliente para cálculo simbólico.
- **GitHub Pages:** Despliegue continuo y alojamiento web estático.

---

## 📂 Estructura del Proyecto

```text
├── index.html        # Estructura principal y maquetado de módulos
├── style.css         # Hojas de estilo y diseño responsivo
├── script.js         # Lógica matemática, motores de cálculo y gráficos en Canvas
└── README.md         # Documentación general del repositorio
