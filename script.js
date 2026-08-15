const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const colors = [
  "#ff2c45",
  "#2f7dff",
  "#39ff6c",
  "#ffe44d",
  "#41e8ff",
  "#ff42f5",
  "#ff8a31",
  "#ff6fae"
];

let width = 0;
let height = 0;
let dpr = 1;
let centerX = 0;
let centerY = 0;
let scale = 1;
let points = [];
let index = 0;
let lastDraw = 0;
let pausedAfterComplete = false;

function resizeCanvas() {
  dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  centerX = width * 0.46;
  centerY = height * 0.49;
  scale = Math.min(width / 41, height / 34);

  buildPoints();
  restart();
}

function buildPoints() {
  points = [];

  // Start near the top notch and travel around the heart clockwise,
  // matching the progressive drawing shown in the reference video.
  const total = 170;
  for (let i = 0; i < total; i += 1) {
    const t = (Math.PI * 2 * i) / total;

    // Classic parametric heart curve.
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    points.push({
      x: centerX + x * scale,
      y: centerY - y * scale,
      color: colors[i % colors.length]
    });
  }
}

function clear() {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function sparkle(x, y, color) {
  const length = Math.max(2.5, scale * 0.18);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = Math.max(0.8, scale * 0.025);

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * length, y + Math.sin(a) * length);
    ctx.stroke();
  }

  ctx.restore();
}

function drawOne(point) {
  const originX = centerX;
  const originY = centerY + scale * 1.7;

  ctx.save();
  ctx.strokeStyle = point.color;
  ctx.globalAlpha = 0.62;
  ctx.lineWidth = Math.max(0.75, scale * 0.02);

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.restore();

  sparkle(point.x, point.y, point.color);
}

function restart() {
  clear();
  index = 0;
  lastDraw = 0;
  pausedAfterComplete = false;
}

function animate(timestamp) {
  if (!lastDraw) lastDraw = timestamp;

  const interval = 44;

  if (!pausedAfterComplete && timestamp - lastDraw >= interval) {
    const batch = Math.max(1, Math.floor((timestamp - lastDraw) / interval));
    lastDraw = timestamp;

    for (let i = 0; i < batch && index < points.length; i += 1) {
      drawOne(points[index]);
      index += 1;
    }

    if (index >= points.length) {
      pausedAfterComplete = true;
      setTimeout(restart, 1800);
    }
  }

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(animate);
