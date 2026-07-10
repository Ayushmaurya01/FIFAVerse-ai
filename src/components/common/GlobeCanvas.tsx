import React, { useEffect, useRef } from 'react';

interface CityNode {
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const HOST_CITIES: CityNode[] = [
  { name: 'Vancouver', lat: 49.2827, lng: -123.1207, color: '#00F2FE' },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321, color: '#00F2FE' },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, color: '#00F2FE' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, color: '#FF1744' },
  { name: 'Guadalajara', lat: 20.6597, lng: -103.3496, color: '#F59E0B' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, color: '#F59E0B' },
  { name: 'Monterrey', lat: 25.6866, lng: -100.3161, color: '#F59E0B' },
  { name: 'Houston', lat: 29.7604, lng: -95.3698, color: '#00F2FE' },
  { name: 'Dallas', lat: 32.7767, lng: -96.7970, color: '#00F2FE' },
  { name: 'Kansas City', lat: 39.0997, lng: -94.5786, color: '#00F2FE' },
  { name: 'Atlanta', lat: 33.7490, lng: -84.3880, color: '#00F2FE' },
  { name: 'Miami', lat: 25.7617, lng: -80.1918, color: '#FF1744' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, color: '#EC4899' },
  { name: 'Boston', lat: 42.3601, lng: -71.0589, color: '#EC4899' },
  { name: 'Philadelphia', lat: 39.9526, lng: -75.1652, color: '#00F2FE' },
  { name: 'New York/NJ', lat: 40.7128, lng: -74.0060, color: '#EC4899' },
];

const GlobeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let angleY = 0; // Rotation angle
    const radius = Math.min(width, height) * 0.45;
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate globe grid points (latitudes and longitudes)
    const points: { x: number; y: number; z: number }[] = [];
    const numLat = 10;
    const numLng = 16;

    for (let i = 0; i < numLat; i++) {
      const lat = (Math.PI * i) / numLat - Math.PI / 2;
      for (let j = 0; j < numLng; j++) {
        const lng = (2 * Math.PI * j) / numLng - Math.PI;
        const x = radius * Math.cos(lat) * Math.sin(lng);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.cos(lng);
        points.push({ x, y, z });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Rotate points and draw
      const radY = angleY;
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      // Render wireframe grid dots (background dots)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      points.forEach((p) => {
        // Rotate around Y axis
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;

        // Perspective scale
        const fov = 400;
        const scale = fov / (fov + rz);
        const sx = centerX + rx * scale;
        const sy = centerY + p.y * scale;

        // Fade based on depth (z coordinate)
        const alpha = Math.max(0.05, (radius - rz) / (2 * radius));
        ctx.fillStyle = `rgba(147, 51, 234, ${alpha * 0.5})`; // Purple dots

        if (rz < radius) {
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2 * scale, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Render Host Cities Hotspots
      HOST_CITIES.forEach((city) => {
        // Convert Lat/Lng to 3D Cartesian coordinates
        const phi = (90 - city.lat) * (Math.PI / 180);
        const theta = (city.lng + 180) * (Math.PI / 180);

        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = -radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);

        // Rotate around Y axis
        const rx = x * cosY - z * sinY;
        const rz = x * sinY + z * cosY;

        const fov = 400;
        const scale = fov / (fov + rz);
        const sx = centerX + rx * scale;
        const sy = centerY + y * scale;

        // If the city is on the facing side of the globe
        if (rz < radius * 0.5) {
          // Draw connecting signal lines to neighboring nodes
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
          ctx.lineWidth = 0.5;
          HOST_CITIES.forEach((otherCity) => {
            const dPhi = Math.abs(city.lat - otherCity.lat);
            const dLng = Math.abs(city.lng - otherCity.lng);
            if (otherCity !== city && dPhi < 25 && dLng < 25) {
              const otherPhi = (90 - otherCity.lat) * (Math.PI / 180);
              const otherTheta = (otherCity.lng + 180) * (Math.PI / 180);
              const ox = radius * Math.sin(otherPhi) * Math.sin(otherTheta);
              const oy = -radius * Math.cos(otherPhi);
              const oz = radius * Math.sin(otherPhi) * Math.cos(otherTheta);

              const orx = ox * cosY - oz * sinY;
              const orz = ox * sinY + oz * cosY;
              const oScale = fov / (fov + orz);
              
              if (orz < radius * 0.5) {
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(centerX + orx * oScale, centerY + oy * oScale);
                ctx.stroke();
              }
            }
          });

          // Draw Glowing Target Node
          ctx.shadowBlur = 12;
          ctx.shadowColor = city.color;
          ctx.fillStyle = city.color;

          ctx.beginPath();
          ctx.arc(sx, sy, 4.5 * scale, 0, 2 * Math.PI);
          ctx.fill();

          // Reset shadows
          ctx.shadowBlur = 0;

          // Draw ping ripple effect
          const rippleRadius = (3.5 + (Date.now() % 1500) / 150) * scale;
          ctx.strokeStyle = city.color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(sx, sy, rippleRadius, 0, 2 * Math.PI);
          ctx.stroke();

          // Text label
          ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
          ctx.font = `bold ${Math.round(8.5 * scale)}px Inter`;
          ctx.textAlign = 'center';
          ctx.fillText(city.name, sx, sy - 8 * scale);
        }
      });

      // Auto rotation velocity
      angleY += 0.0016;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Handle Resize
    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] md:h-[450px] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
};

export default GlobeCanvas;
