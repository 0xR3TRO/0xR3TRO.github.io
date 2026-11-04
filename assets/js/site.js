const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

/* Particle background: paused when the tab is hidden, off with reduced motion. */
(() => {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas || reduceMotion.matches) return;
    const ctx = canvas.getContext("2d");
    const COUNT = 50;
    const LINK = 150;
    const RGB = "108,99,255";
    let particles = [];
    let w = 0;
    let h = 0;
    let frame = 0;

    const resize = () => {
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;
    };
    const create = () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.1,
    });

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p, i) => {
            p.x = (p.x + p.vx + w) % w;
            p.y = (p.y + p.vy + h) % h;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${RGB},${p.alpha})`;
            ctx.fill();
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dist = Math.hypot(p.x - q.x, p.y - q.y);
                if (dist < LINK) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(${RGB},${0.06 * (1 - dist / LINK)})`;
                    ctx.stroke();
                }
            }
        });
        frame = requestAnimationFrame(draw);
    };
    const start = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(draw);
    };

    resize();
    particles = Array.from({ length: COUNT }, create);
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () =>
        document.hidden ? cancelAnimationFrame(frame) : start(),
    );
    reduceMotion.addEventListener("change", (e) => {
        if (e.matches) {
            cancelAnimationFrame(frame);
            ctx.clearRect(0, 0, w, h);
        } else start();
    });
    start();
})();

/* Typing effect. Phrases come from data-phrases (JSON) so each language owns its text.
   With reduced motion the first phrase is shown statically. */
(() => {
    const el = document.getElementById("typingText");
    if (!el) return;
    const phrases = JSON.parse(el.dataset.phrases || "[]");
    if (!phrases.length) return;
    if (reduceMotion.matches) {
        el.textContent = phrases[0];
        return;
    }
    let ti = 0;
    let ci = 0;
    let deleting = false;
    const step = () => {
        const text = phrases[ti];
        if (!deleting) {
            ci++;
            el.textContent = text.slice(0, ci);
            if (ci >= text.length) {
                deleting = true;
                return setTimeout(step, 2000);
            }
            return setTimeout(step, 50 + Math.random() * 40);
        }
        ci--;
        el.textContent = text.slice(0, ci);
        if (ci <= 0) {
            deleting = false;
            ti = (ti + 1) % phrases.length;
            return setTimeout(step, 500);
        }
        setTimeout(step, 25);
    };
    setTimeout(step, 1000);
})();
