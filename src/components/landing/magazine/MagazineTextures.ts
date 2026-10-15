/**
 * Utility to generate high-DPI procedural textures for the 3D DuoKarma Magazine.
 * Rendered using HTML5 Canvas for zero external network overhead and crisp typography.
 */
import * as THREE from 'three';

export function createCoverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  // Background - Deep Obsidian Black
  ctx.fillStyle = '#0A0A09';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle luxury border frame
  ctx.strokeStyle = '#292720';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  ctx.strokeStyle = '#C5A46D';
  ctx.lineWidth = 1;
  ctx.strokeRect(65, 65, canvas.width - 130, canvas.height - 130);

  // Top header label
  ctx.fillStyle = '#C5A46D';
  ctx.font = '600 24px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '0.3em';
  ctx.fillText('VOL. I // 2026 MONOGRAPH', canvas.width / 2, 130);

  // Center Emblem / Motif
  const centerX = canvas.width / 2;
  const centerY = 480;

  ctx.save();
  ctx.strokeStyle = '#C5A46D';
  ctx.lineWidth = 2.5;

  // Diamond geometric mark
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 110);
  ctx.lineTo(centerX + 110, centerY);
  ctx.lineTo(centerX, centerY + 110);
  ctx.lineTo(centerX - 110, centerY);
  ctx.closePath();
  ctx.stroke();

  // Inner diamond
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 75);
  ctx.lineTo(centerX + 75, centerY);
  ctx.lineTo(centerX, centerY + 75);
  ctx.lineTo(centerX - 75, centerY);
  ctx.closePath();
  ctx.stroke();

  // Concentric ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
  ctx.stroke();

  // Letter D & K initials
  ctx.fillStyle = '#F2EEE6';
  ctx.font = 'italic 500 36px "Fraunces", "Playfair Display", serif';
  ctx.fillText('DK', centerX, centerY + 13);
  ctx.restore();

  // Main Title: DUOKARMA
  ctx.fillStyle = '#F2EEE6';
  ctx.font = '700 96px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '0.12em';
  ctx.fillText('DUOKARMA', centerX, 730);

  // Divider line
  ctx.strokeStyle = '#C5A46D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 120, 770);
  ctx.lineTo(centerX + 120, 770);
  ctx.stroke();

  // Supporting Headline
  ctx.fillStyle = '#C5A46D';
  ctx.font = '400 32px "Fraunces", "Playfair Display", serif';
  ctx.fillText('Two Founders. One Standard. Exceptional Software.', centerX, 840);

  // Subtitle
  ctx.fillStyle = '#A6A197';
  ctx.font = '300 24px "Inter", sans-serif';
  ctx.letterSpacing = '0.04em';
  ctx.fillText('A curated collection of bespoke systems, architecture, and production engineering.', centerX, 895);

  // Founders Featured Prominently
  ctx.fillStyle = '#F2EEE6';
  ctx.font = '600 36px "Inter", sans-serif';
  ctx.letterSpacing = '0.08em';
  ctx.fillText('MOIZ DHEELA & HATIM', centerX, 1140);

  ctx.fillStyle = '#C5A46D';
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.letterSpacing = '0.2em';
  ctx.fillText('FOUNDERS & PRINCIPAL SOFTWARE ENGINEERS', centerX, 1190);

  // Footer metadata
  ctx.fillStyle = '#77736B';
  ctx.font = '400 18px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('EDITION: STUDIO FOLIO', 85, 1480);

  ctx.textAlign = 'right';
  ctx.fillText('MUMBAI • GLOBAL', canvas.width - 85, 1480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

export function createSpineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0F0E0C';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#292720';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);

  ctx.fillStyle = '#C5A46D';
  ctx.font = '600 24px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '0.2em';
  ctx.fillText('DUOKARMA — MOIZ DHEELA & HATIM — 2026', 0, 8);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createBackCoverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0A0A09';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#292720';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  const centerX = canvas.width / 2;

  // Header Motto
  ctx.fillStyle = '#F2EEE6';
  ctx.font = '400 36px "Fraunces", "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText('"Build the software a business will still run in five years."', centerX, 400);

  ctx.fillStyle = '#C5A46D';
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.letterSpacing = '0.15em';
  ctx.fillText('— DUOKARMA ENGINEERING PRACTICE', centerX, 460);

  // 4 Core Principles
  const principles = [
    'NO MIDDLEMEN',
    'BUSINESS FIRST',
    'BUILT PROPERLY',
    'TOTAL VISIBILITY',
  ];

  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.letterSpacing = '0.18em';
  principles.forEach((p, i) => {
    ctx.fillStyle = '#C5A46D';
    ctx.fillText(`0${i + 1} //`, centerX - 140, 640 + i * 80);
    ctx.fillStyle = '#F2EEE6';
    ctx.textAlign = 'left';
    ctx.fillText(p, centerX - 80, 640 + i * 80);
    ctx.textAlign = 'center';
  });

  // Simulated Barcode
  const barcodeY = 1200;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(centerX - 160, barcodeY, 320, 100);

  ctx.fillStyle = '#000000';
  for (let x = centerX - 140; x < centerX + 140; x += 6) {
    const w = ((x * 13) % 4) + 1;
    ctx.fillRect(x, barcodeY + 10, w, 70);
  }

  ctx.font = '500 14px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ISBN 978-0-998877-01-2', centerX, barcodeY + 92);

  ctx.fillStyle = '#77736B';
  ctx.font = '400 18px "Inter", sans-serif';
  ctx.fillText('duokarma54@gmail.com • Mumbai, India', centerX, 1420);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createPageEdgesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Warm cream paper edge with fine paper lines and champagne gold gilt
  ctx.fillStyle = '#EBE5D8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#D5CCBA';
  ctx.lineWidth = 1;
  for (let y = 0; y < canvas.height; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Subtle gold dusting along edge
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'rgba(197, 164, 109, 0.4)');
  gradient.addColorStop(0.5, 'rgba(215, 188, 140, 0.2)');
  gradient.addColorStop(1, 'rgba(197, 164, 109, 0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
