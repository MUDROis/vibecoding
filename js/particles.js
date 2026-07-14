(function() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const count = 120;
    let mouse = { x: -1000, y: -1000 };
    const colors = [
        { r: 0, g: 255, b: 136 },
        { r: 0, g: 204, b: 255 },
    ];

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        width = canvas.width;
        height = canvas.height;
    }

    class Particle {
        constructor() {
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5 + 1;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        update() {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x += dx / dist * force * 2;
                this.y += dy / dist * force * 2;
            }
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0) { this.x = 0; this.speedX *= -1; }
            if (this.x > width) { this.x = width; this.speedX *= -1; }
            if (this.y < 0) { this.y = 0; this.speedY *= -1; }
            if (this.y > height) { this.y = height; this.speedY *= -1; }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < count; i++) particles.push(new Particle());
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const mix = {
                        r: Math.round((particles[i].color.r + particles[j].color.r) / 2),
                        g: Math.round((particles[i].color.g + particles[j].color.g) / 2),
                        b: Math.round((particles[i].color.b + particles[j].color.b) / 2),
                    };
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${mix.r}, ${mix.g}, ${mix.b}, ${0.12 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            const ddx = particles[i].x - mouse.x;
            const ddy = particles[i].y - mouse.y;
            const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (ddist < 200) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${particles[i].color.r}, ${particles[i].color.g}, ${particles[i].color.b}, ${0.06 * (1 - ddist / 200)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.fill();

        requestAnimationFrame(draw);
    }

    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    window.addEventListener('resize', () => {
        resize();
        particles.forEach(p => p.reset());
    });

    init();
})();
