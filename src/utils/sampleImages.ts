
export async function generateSampleImages(): Promise<File[]> {
  const samples = [
    {
      name: 'hero-banner-tokyo-night.jpg',
      type: 'image/jpeg',
      width: 1920,
      height: 1080,
      draw: (ctx: CanvasRenderingContext2D) => {
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#312e81');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          const x = (i * 137.5) % 1920;
          const y = (i * 83.2) % 1080;
          const r = 20 + (i % 5) * 25;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(236, 72, 153, 0.2)';
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = 'bold 72px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('BATCH IMAGE STUDIO', 120, 480);
        ctx.font = '36px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Sample Hero Banner (High-Res 1920x1080)', 120, 560);
      },
    },
    {
      name: 'ec-product-sneaker-transparent.png',
      type: 'image/png',
      width: 1200,
      height: 1200,
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, 1200, 1200);

        ctx.beginPath();
        ctx.ellipse(600, 850, 400, 70, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(350, 450, 500, 320, 40);
        ctx.fillStyle = '#f97316';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(520, 520, 50, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.font = 'bold 44px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText('Pro Runner V2 (Transparent PNG)', 280, 380);
      },
    },
    {
      name: 'blog-travel-sunset.webp',
      type: 'image/webp',
      width: 1600,
      height: 900,
      draw: (ctx: CanvasRenderingContext2D) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 900);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.4, '#ef4444');
        grad.addColorStop(0.8, '#831843');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1600, 900);

        ctx.beginPath();
        ctx.arc(800, 550, 180, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();

        ctx.font = 'bold 52px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Golden Sunset over Horizons', 100, 200);
        ctx.font = '28px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('Original 1600x900 Landscape Photo', 100, 260);
      },
    },
  ];

  const files: File[] = [];

  for (const sample of samples) {
    const canvas = document.createElement('canvas');
    canvas.width = sample.width;
    canvas.height = sample.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    sample.draw(ctx);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, sample.type, 0.95)
    );

    if (blob) {
      files.push(new File([blob], sample.name, { type: sample.type }));
    }
  }

  return files;
}
