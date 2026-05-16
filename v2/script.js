(function() {
  // ---- Canvas fondo animado ----
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Partículas de chispa
  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.6 ? '#D4AC0D' : '#C0392B',
    };
  }

  function initParticles(n) {
    particles = Array.from({length: n}, makeParticle);
  }

  // Ondas musicales de fondo
  let waveT = 0;

  function drawWaves() {
    const scroll = window.scrollY;
    ctx.save();
    for (let w = 0; w < 4; w++) {
      ctx.beginPath();
      const amp  = 40 + w * 15;
      const freq = 0.003 + w * 0.001;
      const yBase = H * 0.3 + w * H * 0.15 + scroll * 0.06;
      const phase = waveT * (0.3 + w * 0.1);
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= W; x += 4) {
        const y = yBase + Math.sin(x * freq + phase) * amp;
        ctx.lineTo(x, y);
      }
      const alpha = 0.025 - w * 0.004;
      ctx.strokeStyle = w % 2 === 0
        ? `rgba(192,57,43,${alpha})`
        : `rgba(212,172,13,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
  }

  // Conexiones entre partículas cercanas
  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < maxDist) {
          const alpha = (1 - dist/maxDist) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(192,57,43,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    waveT += 0.01;
    drawWaves();
    drawConnections();
    drawParticles();
    requestAnimationFrame(loop);
  }

  resize();
  initParticles(90);
  window.addEventListener('resize', resize);
  loop();

  // ---- Reveal on scroll ----
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));
})();
