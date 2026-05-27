import React, { useEffect, useRef } from 'react';

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

    const offscreen = document.createElement('canvas');
    offscreen.width  = size;
    offscreen.height = size;
    const octx = offscreen.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Land_ocean_ice_cloud_hires.jpg/2048px-Land_ocean_ice_cloud_hires.jpg';
    img.onload = () => {
      texCanvas = document.createElement('canvas');
      texCanvas.width  = img.naturalWidth;
      texCanvas.height = img.naturalHeight;
      const tCtx = texCanvas.getContext('2d');

      // Draw base image
      tCtx.drawImage(img, 0, 0);

      // Apply strong contrast to separate land and water clearly
      // Using multiple passes for vivid, crisp result
      tCtx.globalCompositeOperation = 'multiply';
      tCtx.filter = 'saturate(3.8) contrast(1.9) brightness(0.80)';
      tCtx.drawImage(img, 0, 0);

      // Boost ocean blues by overlaying a subtle blue tint on dark areas
      tCtx.globalCompositeOperation = 'source-over';
      tCtx.filter = 'none';

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

        octx.clearRect(0, 0, size, size);
        const normOff = (rotAngle / (Math.PI * 2)) % 1;
        const srcXBase = normOff * texW;
        const remX    = texW - srcXBase;

        for (let py = 1; py < size - 1; py += 2) {
          const ny = Math.max(-0.9998, Math.min(0.9998, 1 - 2 * py / size));
          const lat    = Math.asin(ny);
          const cosLat = Math.cos(lat);
          const scanW  = size * cosLat;
          if (scanW < 1) continue;

          const scanX = R - scanW / 2;
          const srcY  = (0.5 - lat / Math.PI) * texH;
          const sw1   = scanW * (remX / texW);

          octx.drawImage(texCanvas, srcXBase, srcY, remX, 1, scanX, py, sw1, 2);
          if (srcXBase > 0.5) {
            octx.drawImage(texCanvas, 0, srcY, srcXBase, 1, scanX + sw1, py, scanW - sw1, 2);
          }
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(R, R, R - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(offscreen, 0, 0);

        // Deep ocean overlay — boosts the water's blue/navy tone
        const ocean = ctx.createRadialGradient(R * 0.42, R * 0.52, 0, R, R, R * 1.05);
        ocean.addColorStop(0,   'rgba(0,30,90,0.0)');
        ocean.addColorStop(0.5, 'rgba(0,20,70,0.08)');
        ocean.addColorStop(1,   'rgba(0,10,50,0.18)');
        ctx.fillStyle = ocean;
        ctx.fillRect(0, 0, size, size);

        // Pole darkening
        const pole = ctx.createLinearGradient(0, 0, 0, size);
        pole.addColorStop(0,    'rgba(0,0,24,0.65)');
        pole.addColorStop(0.07, 'rgba(0,0,14,0.22)');
        pole.addColorStop(0.5,  'rgba(0,0,0,0)');
        pole.addColorStop(0.93, 'rgba(0,0,14,0.22)');
        pole.addColorStop(1,    'rgba(0,0,24,0.68)');
        ctx.fillStyle = pole;
        ctx.fillRect(0, 0, size, size);

        // Edge limb darkening — makes it feel truly spherical
        const edge = ctx.createRadialGradient(R, R, R * 0.36, R, R, R);
        edge.addColorStop(0,    'rgba(0,0,0,0)');
        edge.addColorStop(0.52, 'rgba(0,0,0,0)');
        edge.addColorStop(0.72, 'rgba(0,0,30,0.40)');
        edge.addColorStop(0.88, 'rgba(0,5,40,0.68)');
        edge.addColorStop(1,    'rgba(0,10,50,0.95)');
        ctx.fillStyle = edge;
        ctx.fillRect(0, 0, size, size);

        // Subtle day/night gradient (light left, slight shadow right)
        const term = ctx.createLinearGradient(0, 0, size, 0);
        term.addColorStop(0,    'rgba(255,252,240,0.04)');
        term.addColorStop(0.55, 'rgba(0,0,0,0)');
        term.addColorStop(0.80, 'rgba(0,5,30,0.20)');
        term.addColorStop(1,    'rgba(0,10,50,0.42)');
        ctx.fillStyle = term;
        ctx.fillRect(0, 0, size, size);

        // Sun highlight (top-left warm glow)
        const sun = ctx.createRadialGradient(R * 0.32, R * 0.26, 0, R * 0.32, R * 0.26, R * 0.92);
        sun.addColorStop(0,    'rgba(255,250,220,0.42)');
        sun.addColorStop(0.16, 'rgba(255,245,200,0.20)');
        sun.addColorStop(0.45, 'rgba(255,240,185,0.06)');
        sun.addColorStop(1,    'rgba(255,240,185,0)');
        ctx.fillStyle = sun;
        ctx.fillRect(0, 0, size, size);

        // Ocean specular glint
        const glint = ctx.createRadialGradient(R * 0.30, R * 0.24, 0, R * 0.30, R * 0.24, R * 0.13);
        glint.addColorStop(0,    'rgba(255,255,255,0.82)');
        glint.addColorStop(0.20, 'rgba(255,255,255,0.36)');
        glint.addColorStop(0.60, 'rgba(255,255,255,0.08)');
        glint.addColorStop(1,    'rgba(255,255,255,0)');
        ctx.fillStyle = glint;
        ctx.fillRect(0, 0, size, size);

        ctx.restore();

      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(R, R, R - 1, 0, Math.PI * 2);
        ctx.clip();
        const ph = ctx.createRadialGradient(R * 0.65, R * 0.55, 0, R, R, R);
        ph.addColorStop(0,    '#3A8ED4');
        ph.addColorStop(0.45, '#1A5FA8');
        ph.addColorStop(0.80, '#0E3D78');
        ph.addColorStop(1,    '#061D44');
        ctx.fillStyle = ph;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();
      }

      // Atmosphere glow ring
      const atm = ctx.createRadialGradient(R, R, R - 3, R, R, R + 38);
      atm.addColorStop(0,    'rgba(80,190,255,0.95)');
      atm.addColorStop(0.12, 'rgba(60,160,255,0.60)');
      atm.addColorStop(0.35, 'rgba(40,130,255,0.28)');
      atm.addColorStop(0.65, 'rgba(30,110,240,0.10)');
      atm.addColorStop(1,    'rgba(30,110,240,0)');
      ctx.beginPath();
      ctx.arc(R, R, R + 38, 0, Math.PI * 2);
      ctx.fillStyle = atm;
      ctx.fill();

      // Bright rim
      ctx.beginPath();
      ctx.arc(R, R, R - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(130,220,255,0.95)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner soft rim
      ctx.beginPath();
      ctx.arc(R, R, R - 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,245,255,0.32)';
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
      width: size + 44,
      height: size + 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Outer glow pulse */}
      <div style={{
        position: 'absolute',
        width: size + 40,
        height: size + 40,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(40,140,255,0.18) 60%, transparent 100%)',
        animation: 'globePulse 4s ease-in-out infinite',
      }} />
      {/* Drop shadow ring */}
      <div style={{
        position: 'absolute',
        width: size + 22,
        height: size + 22,
        borderRadius: '50%',
        boxShadow: '0 0 50px rgba(40,140,255,0.50), 0 0 100px rgba(20,100,220,0.25)',
      }} />
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ borderRadius: '50%', display: 'block', position: 'relative', zIndex: 1 }}
      />
      <style>{`
        @keyframes globePulse {
          0%,100% { opacity: 0.65; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.032); }
        }
      `}</style>
    </div>
  );
};

export default Globe3D;
