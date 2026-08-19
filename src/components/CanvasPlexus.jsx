import { useEffect, useRef } from 'react';

export default function CanvasPlexus({ theme }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        // Fetch CSS variables dynamically from Root to map plexus canvas colors
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--primary-rgb').trim() || '59, 130, 246';
        const secondaryColor = computedStyle.getPropertyValue('--secondary-rgb').trim() || '139, 92, 246';

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 1;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.glowSize = this.size * 4;
                this.usePrimary = Math.random() > 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x -= dx * force * 0.03;
                        this.y -= dy * force * 0.03;
                    }
                }
            }

            draw() {
                const color = this.usePrimary ? primaryColor : secondaryColor;
                
                // Neon glow effect
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.glowSize
                );
                gradient.addColorStop(0, `rgba(${color}, 0.6)`);
                gradient.addColorStop(0.4, `rgba(${color}, 0.2)`);
                gradient.addColorStop(1, `rgba(${color}, 0)`);
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Core bright dot
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, 0.9)`;
                ctx.fill();
            }
        }

        const setupParticles = () => {
            particles = [];
            const number = Math.min(120, Math.floor(window.innerWidth / 10));
            for (let i = 0; i < number; i++) {
                particles.push(new Particle());
            }
        };

        setupParticles();
        window.addEventListener('resize', setupParticles);

        const connectParticles = () => {
            let opacity = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        opacity = 1 - (dist / 120);
                        const lineColor = (a % 2 === 0) ? primaryColor : secondaryColor;
                        ctx.strokeStyle = `rgba(${lineColor}, ${opacity * 0.25})`;
                        ctx.lineWidth = 1.5;
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = `rgba(${lineColor}, 0.3)`;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }
        };

        let animationFrameId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw();
            });
            connectParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('resize', setupParticles);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return <canvas id="plexus-canvas" ref={canvasRef}></canvas>;
}
