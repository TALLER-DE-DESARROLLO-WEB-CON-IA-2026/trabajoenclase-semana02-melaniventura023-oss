/* ═══════════════════════════════════════════════════════
   ARTE MUNDO — JavaScript
   Archivo: arte-mundo.js
   Contiene:
     1. Canvas animado (fondo con blobs, sparks y mouse)
     2. Cursor personalizado con anillo de seguimiento
     3. Scroll reveal con IntersectionObserver
     4. Tabs de artistas
     5. Parallax en imágenes flotantes del hero
═══════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════
   1. CANVAS — FONDO ANIMADO
   - Gradiente de fondo que cambia de tono lentamente
   - 20 blobs de color que flotan y pulsan
   - Blob reactivo al mouse con retraso suave
   - 100 partículas/chispas que suben hacia arriba
════════════════════════════════════════════════ */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const COLORS = [
  '#ff2d78','#ff6b00','#ffe000','#00e5a0',
  '#00c8ff','#a855f7','#ff4da6','#39ff14',
  '#ff9500','#00ffcc','#7c3aed','#f43f5e',
  '#fb923c','#34d399','#60a5fa','#e879f9'
];

/** Blob: orbe suave que deriva, pulsa y rebota en los bordes */
class Blob {
  constructor(init) { this.reset(init); }

  reset(init) {
    this.x         = Math.random() * canvas.width;
    this.y         = init ? Math.random() * canvas.height : canvas.height + 200;
    this.baseR     = 100 + Math.random() * 220;
    this.color     = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.vx        = (Math.random() - 0.5) * 0.35;
    this.vy        = -(0.15 + Math.random() * 0.45);
    this.alpha     = 0.07 + Math.random() * 0.1;
    this.phase     = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.008 + Math.random() * 0.015;
  }

  step() {
    this.x     += this.vx;
    this.y     += this.vy;
    this.phase += this.pulseSpeed;
    const r = this.baseR * (1 + 0.15 * Math.sin(this.phase));
    if (this.y + r < -100)              this.reset(false);
    if (this.x < -r || this.x > canvas.width + r) this.vx *= -1;
    return r;
  }

  draw() {
    const r   = this.step();
    const hex = Math.round(this.alpha * 255).toString(16).padStart(2, '0');
    const g   = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    g.addColorStop(0,   this.color + hex);
    g.addColorStop(0.5, this.color + Math.round(this.alpha * 0.5 * 255).toString(16).padStart(2, '0'));
    g.addColorStop(1,   '#00000000');
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }
}

/** Spark: partícula pequeña que sube y se desvanece */
class Spark {
  constructor(init) { this.reset(init); }

  reset(init) {
    this.x       = Math.random() * canvas.width;
    this.y       = init ? Math.random() * canvas.height : canvas.height + 5;
    this.size    = 0.8 + Math.random() * 2.5;
    this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.vy      = -(0.4 + Math.random() * 1.5);
    this.vx      = (Math.random() - 0.5) * 0.6;
    this.life    = 0;
    this.maxLife = 150 + Math.random() * 250;
    this.alpha   = 0.4 + Math.random() * 0.5;
  }

  draw() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.y < -10) { this.reset(false); return; }
    const a   = this.alpha * (1 - this.life / this.maxLife);
    const hex = Math.round(a * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + hex;
    ctx.fill();
  }
}

const blobs  = Array.from({ length: 20  }, () => new Blob(true));
const sparks = Array.from({ length: 100 }, () => new Spark(true));

let mouseX = canvas.width  / 2;
let mouseY = canvas.height / 2;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Estado del blob de mouse
let mbX = mouseX, mbY = mouseY, mbPhase = 0;

function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo de gradiente que rota de tono
  const t  = Date.now() / 9000;
  const h1 = (t * 40) % 360;
  const h2 = (h1 + 140) % 360;
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0,   `hsl(${h1},50%,4%)`);
  bg.addColorStop(0.5, `hsl(${(h1 + 60) % 360},40%,3%)`);
  bg.addColorStop(1,   `hsl(${h2},50%,4%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Blobs de color
  blobs.forEach(b => b.draw());

  // Blob reactivo al mouse (sigue con inercia)
  mbX += (mouseX - mbX) * 0.04;
  mbY += (mouseY - mbY) * 0.04;
  mbPhase += 0.025;
  const mbColorIdx = Math.floor(Date.now() / 1800) % COLORS.length;
  const mbR = 200 * (1 + 0.12 * Math.sin(mbPhase));
  const mg  = ctx.createRadialGradient(mbX, mbY, 0, mbX, mbY, mbR);
  mg.addColorStop(0,   COLORS[mbColorIdx] + '2a');
  mg.addColorStop(0.6, COLORS[(mbColorIdx + 3) % COLORS.length] + '10');
  mg.addColorStop(1,   '#00000000');
  ctx.beginPath();
  ctx.arc(mbX, mbY, mbR, 0, Math.PI * 2);
  ctx.fillStyle = mg;
  ctx.fill();

  // Partículas
  sparks.forEach(s => s.draw());

  requestAnimationFrame(frame);
}
frame();


/* ════════════════════════════════════════════════
   2. CURSOR PERSONALIZADO
════════════════════════════════════════════════ */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.transform = `translate(${mx - 7}px, ${my - 7}px)`;
});

(function loopRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  ring.style.transform = `translate(${rx - 22}px, ${ry - 22}px)`;
  requestAnimationFrame(loopRing);
})();


/* ════════════════════════════════════════════════
   3. SCROLL REVEAL
   Cada elemento .reveal se hace visible al entrar
   en el viewport usando IntersectionObserver.
════════════════════════════════════════════════ */
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }),
    { threshold: 0.08 }
  ).observe(el);
});


/* ════════════════════════════════════════════════
   4. TABS DE ARTISTAS
   Muestra/oculta el panel del artista seleccionado.
════════════════════════════════════════════════ */
function showArtist(id, el) {
  document.querySelectorAll('.artist-display').forEach(d => d.classList.remove('active'));
  document.querySelectorAll('.artist-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('a-' + id).classList.add('active');
  el.classList.add('active');
}


/* ════════════════════════════════════════════════
   5. PARALLAX EN IMÁGENES FLOTANTES DEL HERO
   Las tres imágenes se desplazan a velocidades
   distintas al hacer scroll, creando profundidad.
════════════════════════════════════════════════ */
const FLOAT_ANGLES = [3, -5, 2]; // grados de rotación originales

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.float-img').forEach((img, i) => {
    const drift = y * (0.09 + i * 0.04);
    img.style.transform = `translateY(${drift}px) rotate(${FLOAT_ANGLES[i]}deg)`;
  });
});