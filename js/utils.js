// ==================== 工具函数 ====================

// 数组随机打乱
export function shuffle(arr) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 获取随机背景颜色
export function getRandomColor() {
  const bgColors = [
    "#FF6B6B", "#FFB347", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DDA0DD", "#F0E68C", "#87CEEB", "#FFA07A",
    "#ffde00",
    "#A8E6CF", "#DCEDC1", "#FFD3B6", "#FFAAA5", "#FF8B94"
  ];
  return bgColors[Math.floor(Math.random() * bgColors.length)];
}

// 辅助函数：绘制圆角矩形
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// 文字自动换行
export function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let currentLine = "";
  for (let i = 0; i < text.length; i++) {
    const testLine = currentLine + text[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = text[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// 绘制随机 Emoji 背景
export function drawEmojiBackground(ctx, x, y, width, height, step = 140) {
  const emojis = [
    "🐱", "🐈", "🐈‍⬛", "😺", "😸", "😹", "😻", "🐾", "🐟", "🍥", "🐠", "🐡", "🍀", "✨"
  ];
  const oldAlpha = ctx.globalAlpha;
  const oldAlign = ctx.textAlign;
  const oldBaseline = ctx.textBaseline;
  
  ctx.save();
  // 限制绘制区域
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  
  ctx.globalAlpha = 0.1;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for (let row = y; row < y + height; row += step) {
    for (let col = x; col < x + width; col += step) {
      const offsetX = (Math.random() - 0.5) * (step * 0.5);
      const offsetY = (Math.random() - 0.5) * (step * 0.5);
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      ctx.font = `${step * 0.4}px sans-serif`;
      ctx.fillText(emoji, col + step / 2 + offsetX, row + step / 2 + offsetY);
    }
  }
  
  ctx.restore();
  ctx.globalAlpha = oldAlpha;
  ctx.textAlign = oldAlign;
  ctx.textBaseline = oldBaseline;
}
