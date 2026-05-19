import React, { useEffect, useRef } from 'react';

// Canvas 2D globe — renders a real Earth texture as a spinning sphere
// Works without WebGL by scrolling the equirectangular texture across a canvas
// and painting sphere-distortion + lighting on top.

const Globe3D = ({ size = 340 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const R = size / 2;          // sphere radius
    let offset = 0;              // horizontal scroll position of texture (px)
    let frameId;
    let img = null;
    let imgLoaded = false;

    // ── Load Earth texture ────────────────────────────────────────
    img = new Image();
    img.crossOrigin = 'anonymous';
    // NASA Blue Marble 2048×1024 equirectangular via Wikimedia
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Land_ocean_ice_cloud_hires.jpg/2048px-Land_ocean_ice_cloud_hires.jpg';
    img.onload  = () => { imgLoaded = true; };
    img.onerror = () => {
      // fallback: a second public mirror
      img.src = 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg';
    };

    // ── Draw one frame ────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // 1. Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(R, R, R - 1, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (imgLoaded) {
        const texW = img.naturalWidth;
        const texH = img.naturalHeight;

        // 2. Draw the equirectangular texture scrolled by `offset`
        //    Enhanced saturation + brightness for vivid, realistic look
        const scaledH = size;
        const scaledW = texW * (scaledH / texH);  // keep aspect
        const x = -(offset % scaledW);
        ctx.filter = 'saturate(1.65) brightness(1.08) contrast(1.05)';
        ctx.drawImage(img, x,          0, scaledW, scaledH);
        ctx.drawImage(img, x + scaledW, 0, scaledW, scaledH);
        ctx.filter = 'none';

        // 3. Sphere curvature darkening at poles (simulate latitude compression)
        const pole = ctx.createLinearGradient(0, 0, 0, size);
        pole.addColorStop(0,    'rgba(0,0,20,0.55)');
        pole.addColorStop(0.10, 'rgba(0,0,10,0.15)');
        pole.addColorStop(0.5,  'rgba(0,0,0,0)');
        pole.addColorStop(0.90, 'rgba(0,0,10,0.15)');
        pole.addColorStop(1,    'rgba(0,0,20,0.58)');
        ctx.fillStyle = pole;
        ctx.fillRect(0, 0, size, size);

        // 4. Side-edge darkening (simulate spherical falloff)
        const edge = ctx.createRadialGradient(R, R, R * 0.5, R, R, R);
        edge.addColorStop(0,    'rgba(0,0,0,0)');
        edge.addColorStop(0.65, 'rgba(0,0,0,0)');
        edge.addColorStop(0.84, 'rgba(0,0,20,0.30)');
        edge.addColorStop(1,    'rgba(0,0,30,0.82)');
        ctx.fillStyle = edge;
        ctx.fillRect(0, 0, size, size);

        // 4b. Subtle ocean blue tint overlay
        const oceanTint = ctx.createRadialGradient(R * 1.1, R * 1.0, 0, R, R, R);
        oceanTint.addColorStop(0,   'rgba(20,60,140,0)');
        oceanTint.addColorStop(0.5, 'rgba(20,60,140,0)');
        oceanTint.addColorStop(1,   'rgba(10,30,90,0.12)');
        ctx.fillStyle = oceanTint;
        ctx.fillRect(0, 0, size, size);

        // 5. Sun highlight (top-left, warm)
        const sun = ctx.createRadialGradient(R * 0.42, R * 0.35, 0, R * 0.42, R * 0.35, R * 0.95);
        sun.addColorStop(0,    'rgba(255,248,220,0.28)');
        sun.addColorStop(0.25, 'rgba(255,242,200,0.10)');
        sun.addColorStop(0.5,  'rgba(255,240,190,0.03)');
        sun.addColorStop(1,    'rgba(255,240,190,0)');
        ctx.fillStyle = sun;
        ctx.fillRect(0, 0, size, size);

        // 6. Specular glint (shiny ocean reflection)
        const glint = ctx.createRadialGradient(R * 0.38, R * 0.30, 0, R * 0.38, R * 0.30, R * 0.22);
        glint.addColorStop(0,   'rgba(255,255,255,0.55)');
        glint.addColorStop(0.3, 'rgba(255,255,255,0.18)');
        glint.addColorStop(0.7, 'rgba(255,255,255,0.04)');
        glint.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = glint;
        ctx.fillRect(0, 0, size, size);

      } else {
        // Placeholder while texture loads
        const ph = ctx.createRadialGradient(R * 0.65, R * 0.55, 0, R, R, R);
        ph.addColorStop(0,    '#5DADE2');
        ph.addColorStop(0.45, '#2E86C1');
        ph.addColorStop(0.80, '#1A5276');
        ph.addColorStop(1,    '#0B2D44');
        ctx.fillStyle = ph;
        ctx.fillRect(0, 0, size, size);
      }

      ctx.restore();

      // 7. Atmosphere glow (outside the clip so it bleeds beyond the circle)
      const atm = ctx.createRadialGradient(R, R, R - 3, R, R, R + 30);
      atm.addColorStop(0,    'rgba(100,200,255,0.80)');
      atm.addColorStop(0.18, 'rgba(80,170,255,0.45)');
      atm.addColorStop(0.45, 'rgba(60,140,255,0.18)');
      atm.addColorStop(0.75, 'rgba(50,120,240,0.06)');
      atm.addColorStop(1,    'rgba(50,120,240,0)');
      ctx.beginPath();
      ctx.arc(R, R, R + 30, 0, Math.PI * 2);
      ctx.fillStyle = atm;
      ctx.fill();

      // 8. Bright atmosphere rim (limb glow)
      ctx.beginPath();
      ctx.arc(R, R, R - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160,225,255,0.80)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // 9. Inner rim highlight (brighter edge on lit side)
      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,240,255,0.22)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // ── Animation loop ────────────────────────────────────────────
    const texH = 1024;                // nominal texture height
    const texW = 2048;                // nominal texture width
    const pxPerFrame = 0.13;         // rotation speed (slow, realistic)

    const loop = () => {
      if (imgLoaded) {
        const scaledW = texW * (size / texH);
        offset = (offset + pxPerFrame) % scaledW;
      }
      draw();
      frameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(frameId);
  }, [size]);

  return (
    <div style={{
      position: 'relative',
      width: size + 36,
      height: size + 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Outer glow rings */}
      <div style={{
        position: 'absolute',
        width: size + 32,
        height: size + 32,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(80,160,255,0.18) 60%, transparent 100%)',
        animation: 'globePulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: size + 18,
        height: size + 18,
        borderRadius: '50%',
        boxShadow: '0 0 40px rgba(80,160,255,0.45), 0 0 80px rgba(40,120,240,0.22)',
      }} />
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          borderRadius: '50%',
          display: 'block',
          position: 'relative',
          zIndex: 1,
        }}
      />
      <style>{`
        @keyframes globePulse {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.025); }
        }
      `}</style>
    </div>
  );
};

export default Globe3D;
