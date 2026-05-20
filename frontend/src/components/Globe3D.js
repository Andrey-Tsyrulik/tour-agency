import React, { useEffect, useRef } from 'react';

// True sphere projection using per-scanline rendering.
// Each latitude row is drawn with cos(lat) width — this correctly
// compresses the poles, unlike the old cylindrical scroll approach.

const Globe3D = ({ size = 340 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const R = size / 2;
    let rotAngle = 0;
    let frameId;
    let imgLoaded = false;
    let texCanvas = null;

    // Offscreen canvas reused every frame (no GC pressure)
    const offscreen = document.createElement('canvas');
    offscreen.width  = size;
    offscreen.height = size;
    const octx = offscreen.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Land_ocean_ice_cloud_hires.jpg/2048px-Land_ocean_ice_cloud_hires.jpg';
    img.onload = () => {
      // Bake vivid colour filters into a pre-processed texture canvas
      texCanvas = document.createElement('canvas');
      texCanvas.width  = img.naturalWidth;
      texCanvas.height = img.naturalHeight;
      const tCtx = texCanvas.getContext('2d');
      tCtx.filter = 'saturate(5.0) contrast(1.50) brightness(0.95)';
      tCtx.drawImage(img, 0, 0);
      imgLoaded = true;
    };
    img.onerror = () => {
      img.src = 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg';
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      if (imgLoaded && texCanvas) {
        const texW = texCanvas.width;
        const texH = texCanvas.height;

        // ── Sphere-projection scanlines ──────────────────────────────────
        octx.clearRect(0, 0, size, size);
        const normOff = (rotAngle / (Math.PI * 2)) % 1;
        const srcXBase = normOff * texW;
        const remX    = texW - srcXBase;

        // Step 2: every other row keeps call count ~170 while still smooth
        for (let py = 1; py < size - 1; py += 2) {
          const ny = Math.max(-0.9998, Math.min(0.9998, 1 - 2 * py / size));
          const lat      = Math.asin(ny);
          const cosLat   = Math.cos(lat);
          const scanW    = size * cosLat;
          if (scanW < 1) continue;

          const scanX  = R - scanW / 2;
          const srcY   = (0.5 - lat / Math.PI) * texH;
          const sw1    = scanW * (remX / texW);

          octx.drawImage(texCanvas, srcXBase, srcY, remX, 1, scanX, py, sw1, 2);
          if (srcXBase > 0.5) {
            octx.drawImage(texCanvas, 0, srcY, srcXBase, 1, scanX + sw1, py, scanW - sw1, 2);
          }
        }

        // ── Composite onto main canvas with circle clip ──────────────────
        ctx.save();
        ctx.beginPath();
        ctx.arc(R, R, R - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(offscreen, 0, 0);

        // Pole darkening (latitude compression shadow)
        const pole = ctx.createLinearGradient(0, 0, 0, size);
        pole.addColorStop(0,    'rgba(0,0,18,0.50)');
        pole.addColorStop(0.09, 'rgba(0,0,10,0.15)');
        pole.addColorStop(0.5,  'rgba(0,0,0,0)');
        pole.addColorStop(0.91, 'rgba(0,0,10,0.15)');
        pole.addColorStop(1,    'rgba(0,0,18,0.52)');
        ctx.fillStyle = pole;
        ctx.fillRect(0, 0, size, size);

        // Spherical edge falloff (dark limb)
        const edge = ctx.createRadialGradient(R, R, R * 0.40, R, R, R);
        edge.addColorStop(0,    'rgba(0,0,0,0)');
        edge.addColorStop(0.58, 'rgba(0,0,0,0)');
        edge.addColorStop(0.78, 'rgba(0,0,20,0.35)');
        edge.addColorStop(1,    'rgba(0,0,30,0.92)');
        ctx.fillStyle = edge;
        ctx.fillRect(0, 0, size, size);

        // Day/night terminator — right side fades to night
        const term = ctx.createRadialGradient(R * 1.68, R * 0.88, 0, R * 0.18, R * 1.12, R * 1.58);
        term.addColorStop(0,    'rgba(0,0,0,0)');
        term.addColorStop(0.36, 'rgba(0,0,0,0)');
        term.addColorStop(0.64, 'rgba(0,6,32,0.24)');
        term.addColorStop(1,    'rgba(0,12,52,0.70)');
        ctx.fillStyle = term;
        ctx.fillRect(0, 0, size, size);

        // Sun highlight (top-left warm glow)
        const sun = ctx.createRadialGradient(R * 0.35, R * 0.29, 0, R * 0.35, R * 0.29, R * 0.96);
        sun.addColorStop(0,    'rgba(255,248,210,0.34)');
        sun.addColorStop(0.18, 'rgba(255,242,195,0.15)');
        sun.addColorStop(0.48, 'rgba(255,238,185,0.04)');
        sun.addColorStop(1,    'rgba(255,238,185,0)');
        ctx.fillStyle = sun;
        ctx.fillRect(0, 0, size, size);

        // Specular ocean glint
        const glint = ctx.createRadialGradient(R * 0.32, R * 0.26, 0, R * 0.32, R * 0.26, R * 0.15);
        glint.addColorStop(0,    'rgba(255,255,255,0.76)');
        glint.addColorStop(0.22, 'rgba(255,255,255,0.30)');
        glint.addColorStop(0.65, 'rgba(255,255,255,0.06)');
        glint.addColorStop(1,    'rgba(255,255,255,0)');
        ctx.fillStyle = glint;
        ctx.fillRect(0, 0, size, size);

        ctx.restore();

      } else {
        // Placeholder while texture loads
        ctx.save();
        ctx.beginPath();
        ctx.arc(R, R, R - 1, 0, Math.PI * 2);
        ctx.clip();
        const ph = ctx.createRadialGradient(R * 0.65, R * 0.55, 0, R, R, R);
        ph.addColorStop(0,    '#5DADE2');
        ph.addColorStop(0.45, '#2E86C1');
        ph.addColorStop(0.80, '#1A5276');
        ph.addColorStop(1,    '#0B2D44');
        ctx.fillStyle = ph;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();
      }

      // ── Atmosphere glow ─────────────────────────────────────────────────
      const atm = ctx.createRadialGradient(R, R, R - 3, R, R, R + 34);
      atm.addColorStop(0,    'rgba(100,205,255,0.90)');
      atm.addColorStop(0.13, 'rgba(80,172,255,0.56)');
      atm.addColorStop(0.38, 'rgba(60,142,255,0.24)');
      atm.addColorStop(0.70, 'rgba(50,122,242,0.08)');
      atm.addColorStop(1,    'rgba(50,122,242,0)');
      ctx.beginPath();
      ctx.arc(R, R, R + 34, 0, Math.PI * 2);
      ctx.fillStyle = atm;
      ctx.fill();

      // Bright atmosphere rim
      ctx.beginPath();
      ctx.arc(R, R, R - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(162,228,255,0.90)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Soft inner rim
      ctx.beginPath();
      ctx.arc(R, R, R - 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(205,242,255,0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const loop = () => {
      rotAngle = (rotAngle + 0.00040) % (Math.PI * 2);
      draw();
      frameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(frameId);
  }, [size]);

  return (
    <div style={{
      position: 'relative',
      width: size + 40,
      height: size + 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute',
        width: size + 36,
        height: size + 36,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(80,160,255,0.22) 60%, transparent 100%)',
        animation: 'globePulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: size + 20,
        height: size + 20,
        borderRadius: '50%',
        boxShadow: '0 0 55px rgba(80,162,255,0.55), 0 0 110px rgba(40,122,242,0.28)',
      }} />
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ borderRadius: '50%', display: 'block', position: 'relative', zIndex: 1 }}
      />
      <style>{`
        @keyframes globePulse {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.035); }
        }
      `}</style>
    </div>
  );
};

export default Globe3D;
