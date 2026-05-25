"use client";

import { useEffect, useRef } from "react";

// ── Config ──────────────────────────────────────────────────────────────────
const NODE_COUNT      = 80;
const MAX_DIST        = 220;
const MAX_DIST_SQ     = MAX_DIST * MAX_DIST;
const HUB_CHANCE      = 0.12;
const SPEED           = 0.35;
const MOUSE_RADIUS    = 140;   // repulsion zone radius (px)
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
const REPEL_STRENGTH  = 3.5;   // force multiplier

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  isHub: boolean;
  pulse: number;
  pulseSpeed: number;
}

export function NodeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef  = useRef<Node[]>([]);
  const animRef   = useRef<number>(0);
  const mouse     = useRef({ x: -9999, y: -9999 }); // off-screen default

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Init ────────────────────────────────────────────────────────────────
    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      spawn();
    }

    function spawn() {
      if (!canvas) return;
      nodesRef.current = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const isHub = Math.random() < HUB_CHANCE;
        nodesRef.current.push({
          x:          Math.random() * canvas.width,
          y:          Math.random() * canvas.height,
          vx:         (Math.random() - 0.5) * SPEED,
          vy:         (Math.random() - 0.5) * SPEED,
          r:          isHub ? Math.random() * 3 + 4 : Math.random() * 1.5 + 1,
          isHub,
          pulse:      Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
        });
      }
    }

    // ── Draw ────────────────────────────────────────────────────────────────
    function draw() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = nodesRef.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // ── Cursor aura ───────────────────────────────────────────────────────
      if (mx > 0 && my > 0) {
        const aura = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS);
        aura.addColorStop(0,   "rgba(0, 212, 255, 0.07)");
        aura.addColorStop(0.5, "rgba(0, 180, 255, 0.03)");
        aura.addColorStop(1,   "rgba(0, 100, 200, 0)");
        ctx.beginPath();
        ctx.arc(mx, my, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = aura;
        ctx.fill();
      }

      // ── Connections ───────────────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx     = nodes[i].x - nodes[j].x;
          const dy     = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq >= MAX_DIST_SQ) continue;

          const dist  = Math.sqrt(distSq);
          const t     = 1 - dist / MAX_DIST;
          const boost = (nodes[i].isHub && nodes[j].isHub) ? 1.5 : 1;

          // Brighten lines near cursor
          const midX   = (nodes[i].x + nodes[j].x) * 0.5;
          const midY   = (nodes[i].y + nodes[j].y) * 0.5;
          const mdx    = midX - mx;
          const mdy    = midY - my;
          const mDist  = Math.sqrt(mdx * mdx + mdy * mdy);
          const mBoost = Math.max(0, 1 - mDist / MOUSE_RADIUS) * 1.2 + 1;

          const alpha = Math.min(t * t * 0.75 * boost * mBoost, 1);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(80, 180, 255, ${alpha})`;
          ctx.lineWidth   = t * 1.5 * boost;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      // ── Nodes ─────────────────────────────────────────────────────────────
      nodes.forEach((n) => {
        n.pulse += n.pulseSpeed;
        const pulseFactor = 1 + Math.sin(n.pulse) * 0.3;

        // Extra scale when near cursor
        const ndx      = n.x - mx;
        const ndy      = n.y - my;
        const nDistSq  = ndx * ndx + ndy * ndy;
        const nearMouse = nDistSq < MOUSE_RADIUS_SQ;
        const proximity = nearMouse ? 1 - Math.sqrt(nDistSq) / MOUSE_RADIUS : 0;
        const R = n.r * pulseFactor * (1 + proximity * 0.6);

        const glowR = R * (n.isHub ? 8 : 5) * (1 + proximity * 0.8);
        const grd   = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);

        if (nearMouse) {
          // Boosted cyan glow when under cursor influence
          grd.addColorStop(0,   `rgba(0, 212, 255, ${0.7 + proximity * 0.3})`);
          grd.addColorStop(0.4, `rgba(0, 180, 255, ${0.25 + proximity * 0.2})`);
          grd.addColorStop(1,   "rgba(0, 100, 200, 0)");
        } else {
          grd.addColorStop(0,   n.isHub ? "rgba(120, 210, 255, 0.6)" : "rgba(80, 180, 255, 0.35)");
          grd.addColorStop(0.4, n.isHub ? "rgba(60, 160, 240, 0.2)"  : "rgba(40, 140, 220, 0.1)");
          grd.addColorStop(1,   "rgba(0, 100, 200, 0)");
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        if (n.isHub) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, R + 2, 0, Math.PI * 2);
          ctx.strokeStyle = nearMouse
            ? `rgba(0, 220, 255, ${0.6 + proximity * 0.4})`
            : "rgba(160, 220, 255, 0.5)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
        ctx.fillStyle = nearMouse
          ? `rgba(200, 245, 255, ${0.95 + proximity * 0.05})`
          : n.isHub
            ? "rgba(200, 240, 255, 0.95)"
            : "rgba(130, 200, 255, 0.85)";
        ctx.fill();
      });

      // ── Move + mouse repulsion ────────────────────────────────────────────
      nodes.forEach((n) => {
        const dx      = n.x - mx;
        const dy      = n.y - my;
        const distSq  = dx * dx + dy * dy;

        if (distSq < MOUSE_RADIUS_SQ && distSq > 0.01) {
          const dist  = Math.sqrt(distSq);
          const force = (1 - dist / MOUSE_RADIUS) * REPEL_STRENGTH;
          // Nudge velocity away from cursor (capped so nodes don't fly off)
          n.vx = Math.max(-3, Math.min(3, n.vx + (dx / dist) * force * 0.05));
          n.vy = Math.max(-3, Math.min(3, n.vy + (dy / dist) * force * 0.05));
        } else {
          // Gentle damping back to normal speed when far from cursor
          n.vx += (Math.sign(n.vx) * SPEED - n.vx) * 0.02;
          n.vy += (Math.sign(n.vy) * SPEED - n.vy) * 0.02;
        }

        n.x += n.vx;
        n.y += n.vy;
        if (!canvas) return;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      animRef.current = requestAnimationFrame(draw);
    }

    // ── Mouse tracking ───────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }
    function onMouseLeave() {
      mouse.current = { x: -9999, y: -9999 };
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-15"
      aria-hidden="true"
    />
  );
}
