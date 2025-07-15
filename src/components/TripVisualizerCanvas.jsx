import React, { useRef, useEffect } from "react";

const TripVisualizerCanvas = ({ from = "Start", to = "Destination" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const startX = 100;
    const startY = canvas.height - 200;
    const endX = canvas.width - 100;
    const endY = 200;
    const controlX = canvas.width / 2;
    const controlY = 100;

    let t = 0;

    const planeImg = new Image();
    planeImg.src = "/plane.svg"; // Add a clean SVG plane in /public

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#0f172a"); // slate-900
      gradient.addColorStop(1, "#1e293b"); // slate-800
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Path
      ctx.strokeStyle = "#38bdf8"; // sky-400
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();

      // Plane position on Bezier curve
      const x =
        (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
      const y =
        (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

      ctx.drawImage(planeImg, x - 20, y - 20, 40, 40);

      // Labels
      ctx.fillStyle = "#f8fafc"; // slate-50
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`From: ${from}`, startX - 30, startY + 30);
      ctx.fillText(`To: ${to}`, endX - 50, endY - 20);

      // Text
      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = "#cbd5e1"; // slate-300
      ctx.fillText(
        "Generating your personalized trip…",
        canvas.width / 2 - 200,
        canvas.height - 60
      );

      // Animate
      t += 0.005;
      if (t > 1) t = 0;

      requestAnimationFrame(animate);
    };

    planeImg.onload = animate;
  }, [from, to]);

  return (
    <div className="fixed inset-0 z-50">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default TripVisualizerCanvas;
