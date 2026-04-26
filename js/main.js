import { bank, IEBank, NSBank, FTBank, PJBank } from './quizBank.js';
import { catMap } from './catMap.js';
import { STAMP_BLACK_URL, STAMP_WHITE_URL } from './stamp.js';
import { shuffle, getRandomColor, roundRect, wrapText, drawEmojiBackground } from './utils.js';

// ==================== 手机端下沉效果 ====================
document.addEventListener(
  "touchstart",
  function (e) {
    const btn = e.target.closest(".primary-btn, .nav-btn, .option-btn");
    if (btn) btn.classList.add("pressed");
  },
  { passive: true },
);
document.addEventListener(
  "touchend",
  function (e) {
    const btn = e.target.closest(".primary-btn, .nav-btn, .option-btn");
    if (btn) btn.classList.remove("pressed");
  },
  { passive: true },
);
document.addEventListener("mousedown", function (e) {
  const btn = e.target.closest(".primary-btn, .nav-btn, .option-btn");
  if (btn) btn.classList.add("pressed");
});
document.addEventListener("mouseup", function (e) {
  const btn = e.target.closest(".primary-btn, .nav-btn, .option-btn");
  if (btn) btn.classList.remove("pressed");
});

// ==================== 音乐 ====================
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const musicHint = document.querySelector(".music-hint");
let musicOn = true;
bgMusic.volume = 0.2;
bgMusic.loop = true;

// 尝试播放音乐
bgMusic
  .play()
  .then(() => {
    musicOn = true;
    musicBtn.textContent = "🎵";
  })
  .catch(() => {
    musicOn = false;
    musicBtn.textContent = "🔇";
  });

function toggleBGM() {
  if (musicOn) {
    bgMusic.pause();
    musicBtn.textContent = "🔇";
    musicOn = false;
    musicHint.textContent = "🔇 小猫休息中";
  } else {
    bgMusic.play().catch(() => {});
    musicBtn.textContent = "🎵";
    musicOn = true;
    musicHint.textContent = "🎵 打开听小猫唱歌";
  }
}

// 绑定音乐按钮点击事件
musicBtn.addEventListener('click', toggleBGM);

const totalBankLen = 12;

let curQ = [],
  ans = [],
  idx = 0,
  scores = { I: 0, E: 0, N: 0, S: 0, F: 0, T: 0, P: 0, J: 0 },
  currentCat = null;

function reset() {
  curQ = [];
  [IEBank, NSBank, FTBank, PJBank].forEach((itemBank) => {
    shuffle(itemBank)
      .slice(0, totalBankLen / 4)
      .forEach((q) => {
        const idxs = shuffle([0, 1, 2, 3]);
        curQ.push({
          ...q,
          options: idxs.map((i) => q.options[i]),
        });
      });
  });
  ans = new Array(totalBankLen).fill(null);
  idx = 0;
  scores = { I: 0, E: 0, N: 0, S: 0, F: 0, T: 0, P: 0, J: 0 };
}

function calculateScores() {
  const newScores = { I: 0, E: 0, N: 0, S: 0, F: 0, T: 0, P: 0, J: 0 };
  ans.forEach((selected, qIndex) => {
    if (selected === null) return;
    const q = curQ[qIndex];
    const scoreKey = q.options[selected]?.s;
    if (scoreKey && Object.prototype.hasOwnProperty.call(newScores, scoreKey)) {
      newScores[scoreKey]++;
    }
  });
  return newScores;
}

function renderDots() {
  let h = "";
  for (let i = 0; i < totalBankLen; i++)
    h += `<div class="progress-dot ${ans[i] !== null ? "done" : ""}">${
      i + 1
    }</div>`;
  document.getElementById("dotsContainer").innerHTML = h;
}

function renderQ() {
  const q = curQ[idx];
  document.getElementById("questionText").textContent = q.text;
  document.getElementById("currentQNumber").textContent = idx + 1;
  let o = "";
  q.options.forEach((opt, i) => {
    o += `<div class="option-btn" data-opt="${i}"><span class="option-letter">${String.fromCharCode(
      65 + i,
    )}</span> ${opt.t}</div>`;
  });
  document.getElementById("optionsContainer").innerHTML = o;
  document.querySelectorAll(".option-btn").forEach((b) =>
    b.addEventListener("click", (e) => {
      selectOpt(parseInt(b.dataset.opt));
    }),
  );
  
  renderDots();
  
  const catRow = document.querySelector(".cat-row");
  const dots = document.querySelectorAll(".progress-dot");
  if (dots && dots[idx] && catRow) {
    const dot = dots[idx];
    const rowRect = catRow.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    const dotCenterX = dotRect.left - rowRect.left + dotRect.width / 2;
    document.getElementById("walkingCat").style.left = dotCenterX + "px";
    document.getElementById("pawLeft").style.width = dotCenterX + "px";
  }
  
  document.getElementById("prevBtn").style.visibility =
    idx === 0 ? "hidden" : "visible";
}

function selectOpt(opt) {
  ans[idx] = opt;
  scores = calculateScores();
  if (idx === curQ.length - 1) {
    document.getElementById("transitionView").classList.remove("hidden");
    document.getElementById("quizView").classList.add("hidden");
  } else {
    idx++;
    renderQ();
  }
}

function calcMBTI() {
  return `${scores.I >= scores.E ? "I" : "E"}${
    scores.N >= scores.S ? "N" : "S"
  }${scores.F >= scores.T ? "F" : "T"}${
    scores.P >= scores.J ? "P" : "J"
  }`;
}

function showResult() {
  const m = calcMBTI();
  currentCat = catMap[m] || catMap.INFP;
  let b = "";
  const d = [
    ["I", "E"],
    ["N", "S"],
    ["F", "T"],
    ["P", "J"],
  ];
  d.forEach((d) => {
    let l = scores[d[0]] || 0,
      r = scores[d[1]] || 0,
      t = l + r || 1,
      lp = Math.round((l / t) * 100),
      rp = 100 - lp;
    if (r === 0 && l === 0) {
      lp = rp = 50;
    }
    b += `<div><div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:#f9b953;">${d[0]} ${lp}%</span><span style="color:#c9a87c;">${rp}% ${d[1]}</span></div><div class="stat-bar"><div class="stat-left" style="width:${lp}%;"></div><div class="stat-right" style="width:${rp}%;"></div></div></div>`;
  });
  const portraitHtml = currentCat.url
    ? `<img class="cat-photo-big" src="${currentCat.url}" alt="${currentCat.name}">`
    : `<span style="font-size:56px;">${currentCat.emoji}</span>`;
  document.getElementById("shareArea").innerHTML = `<div style="text-align:center;"><div class="guide-text">✨ 经过选择，你的猫分身是 ✨</div>${portraitHtml}<h2>${currentCat.name}</h2><span class="mbti-tag" style="white-space: nowrap; margin-top: 4px;">${currentCat.mbti}</span></div><div style="margin:12px 0;"><p style="font-weight:800;font-size:17px;">${currentCat.tag}</p><p style="font-size:13px;">${currentCat.desc}</p><p style="font-size:12px;opacity:0.8;margin-top:4px;">${currentCat.info}</p></div>${b}<p style="text-align:center;font-size:12px;opacity:0.7;margin-top:8px;">🐾 猫猫世界大分身 · 江湖闯荡猫 🐾</p>`;
  const portraitBlock = currentCat.url
    ? `<img class="cat-photo-big" src="${currentCat.url}" alt="${currentCat.name}">`
    : `<span style="font-size:48px; white-space: nowrap;">${currentCat.emoji}</span>`;
  const infoBlock = `<div style="background:#2F231A;border-radius:20px;padding:14px;margin:14px 0;border-left:5px solid #DBAF7C;"><p style="font-size:14px;font-weight:700;">🎮 江湖路远·有缘猫相助</p><p style="margin-top:6px;font-size:13px;">${currentCat.info}</p><p style="margin-top:4px;font-size:13px;">江湖闯荡猫是其他玩家耗尽幸运值选择的【独行侠客】分身。投喂·目送·带它回家。</p></div><p style="text-align:center;font-weight:800;font-size:15px;">✦ 流浪不是选择，是出生点重置 ✦</p><div class="copyright" style="color:#F7E1BE;opacity:0.6;"><span>© 小起司爱cheese</span><span>💕</span><span>🐾</span></div>`;
  document.getElementById("easterArea").innerHTML = `<div class="title-bar" style="margin-bottom:14px;">📋 江湖通告 · 隐藏任务</div><div style="display:flex;gap:12px;align-items:center;">${portraitBlock}<div><h3>${currentCat.name}</h3><span class="mbti-tag" style="font-size:11px;white-space: nowrap;">${currentCat.mbti} · ${currentCat.tag}</span><p style="opacity:0.8;font-size:13px;margin-top:4px;">江湖闯荡猫 · 分身</p></div></div>${infoBlock}`;
  document.getElementById("resultView").classList.remove("hidden");
  document.getElementById("photoContainer").innerHTML = "";
  document.getElementById("easterPhotoContainer").innerHTML = "";
}

async function drawStamp(ctx, canvasWidth, canvasHeight, isE) {
  return new Promise((resolve) => {
    const stampImg = new Image();
    stampImg.crossOrigin = "anonymous";
    stampImg.src = isE ? STAMP_WHITE_URL : STAMP_BLACK_URL;
    stampImg.onload = () => {
      const stampW = 380;
      const stampH = 380;
      const stampX = canvasWidth - stampW - 60;
      const stampY = canvasHeight - stampH - 110;

      ctx.save();
      ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
      const angle = ((Math.random() - 0.5) * 16 * Math.PI) / 180;
      ctx.rotate(angle);
      ctx.globalAlpha = 0.75;
      ctx.drawImage(stampImg, -stampW / 2, -stampH / 2, stampW, stampH);
      ctx.restore();
      resolve();
    };
    stampImg.onerror = () => resolve();
  });
}

function createSaveHint(container, isE) {
  const h = document.createElement("p");
  h.className = "save-hint";
  h.textContent = "📱 长按上方照片保存到相册";
  h.style.color = isE ? "#F7E1BE" : "#8B6A4A";
  container.appendChild(h);
}

async function genPolaroid(cid, isE) {
  const c = document.getElementById(cid);
  const w = document.createElement("div");
  w.className = "polaroid-photo";
  w.innerHTML =
    '<div style="font-size:40px;text-align:center;padding:30px;">🖨️ 出片中...</div>';
  c.innerHTML = "";
  c.appendChild(w);
  w.offsetHeight;
  w.classList.add("show");

  const cv = document.createElement("canvas");
  const contentW = 948;
  const contentH = 1308;
  const padding = 40;
  const bottomPad = 80;

  cv.width = contentW + padding * 2;
  cv.height = contentH + padding * 2 + bottomPad;
  const x = cv.getContext("2d");
  
  // 显式清除画布以确保透明度
  x.clearRect(0, 0, cv.width, cv.height);

  x.fillStyle = "rgba(0,0,0,0.15)";
  x.fillRect(6, 8, cv.width - 12, cv.height - 12);
  
  if (isE) {
    x.fillStyle = "#FFFFFF";
  } else {
    x.fillStyle = getRandomColor();
  }
  x.fillRect(0, 0, cv.width, cv.height);
  roundRect(x, 0, 0, cv.width, cv.height, 12);
  x.clip();

  x.fillStyle = isE ? "#1E1610" : "#FFFAF0";
  x.fillRect(padding, padding, contentW, contentH);

  drawEmojiBackground(x, padding, padding, contentW, contentH);

  x.fillStyle = isE ? "#F7E1BE" : "#4A2E1C";
  x.strokeStyle = isE ? "#DBAF7C" : "#E0C090";
  x.textAlign = "center";

  const cx = cv.width / 2;
  if (isE) {
    x.font = "bold 54px PingFang SC";
    x.fillText("📋 江湖通告", cx, padding + 120);
    x.font = "bold 42px PingFang SC";
    x.fillText(
      currentCat.name + " · " + currentCat.mbti,
      cx,
      padding + 210,
    );
    x.font = "36px PingFang SC";
    x.fillText(currentCat.tag, cx, padding + 270);
    x.fillText("「品种故事」", cx, padding + 360);
    x.font = "30px PingFang SC";
    const sl = currentCat.story.match(/.{1,18}/g) || [currentCat.story];
    sl.forEach((ln, i) => x.fillText(ln, cx, padding + 410 + i * 45));
    x.fillText("「个性解读」", cx, padding + 530 + (sl.length - 1) * 45);
    const pl = currentCat.personality.match(/.{1,18}/g) || [
      currentCat.personality,
    ];
    pl.forEach((ln, i) =>
      x.fillText(ln, cx, padding + 580 + (sl.length - 1) * 45 + i * 45),
    );
    const yb = padding + 580 + (sl.length + pl.length - 1) * 45 + 60;
    x.fillText("✦ 流浪不是选择，是出生点重置 ✦", cx, yb);
  } else {
    const imgScale = 2.5;
    const imgW = 140 * imgScale;
    const imgH = 100 * imgScale;
    const emojiCX = 390;
    const emojiCY = padding + 300;

    if (currentCat.url) {
      const catImg = new Image();
      catImg.src = currentCat.url;
      catImg.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        catImg.onload = () => {
          const imgX = emojiCX - imgW / 2 - 80;
          const imgY = emojiCY - imgH / 2 - 40;
          x.drawImage(catImg, imgX, imgY, imgW, imgH);
          resolve();
        };
        catImg.onerror = () => {
          x.font = "144px sans-serif";
          x.fillText(currentCat.emoji, emojiCX, emojiCY);
          resolve();
        };
      });
    } else {
      x.font = "144px sans-serif";
      x.fillText(currentCat.emoji, emojiCX, emojiCY);
    }
    x.font = "144px sans-serif";
    x.fillText("✌️😺", 660, padding + 300);
    x.font = "78px sans-serif";
    x.fillText("💕", cx, padding + 300);
    x.font = "bold 60px PingFang SC";
    x.fillText(currentCat.name, cx, padding + 460);
    x.font = "45px PingFang SC";
    x.fillText(
      currentCat.mbti + " · " + currentCat.tag,
      cx,
      padding + 540,
    );
    x.font = "39px PingFang SC";
    const infoLines = wrapText(x, currentCat.info, 700);
    const infoStartY = padding + 620;
    infoLines.forEach((ln, i) => {
      x.fillText(ln, cx, infoStartY + i * 48);
    });
    x.font = "36px PingFang SC";
    const nextY = infoStartY + infoLines.length * 48 + 60;
    x.fillText("🐾 猫猫世界大分身 · 江湖闯荡猫 🐾", cx, nextY);
  }

  x.font = "bold 32px PingFang SC";
  x.fillStyle = "#4A2E1C";
  x.fillText(
    currentCat.name + (isE ? " · 品种故事" : " · 江湖闯荡猫"),
    cx,
    padding + contentH + 45,
  );

  x.font = "24px PingFang SC";
  x.fillStyle = "#8B6A4A";
  x.fillText("© 小起司爱cheese 💕🐾", cx, cv.height - 20);

  await drawStamp(x, cv.width, cv.height, isE);

  const img = document.createElement("img");
  img.src = cv.toDataURL("image/png");
  img.alt = "合影";
  img.style.width = "100%";
  img.style.borderRadius = "8px";
  img.onload = () => {
    w.innerHTML = "";
    w.appendChild(img);
    w.style.padding = "0";
    w.style.background = "transparent";
    w.style.borderRadius = "0";
    w.style.boxShadow = "none";
    createSaveHint(c, false);
  };
}

async function genCard(containerId, elementId, scale = 4) {
  const container = document.getElementById(containerId);
  
  const w = document.createElement("div");
  w.className = "polaroid-photo";
  w.style.background = "transparent"; // 确保初始即透明
  w.style.boxShadow = "none";
  w.innerHTML =
    '<div style="font-size:40px;text-align:center;padding:30px;background:rgba(255,255,255,0.8);border-radius:12px;">🃏 进化中...</div>';
  container.innerHTML = "";
  container.appendChild(w);
  w.offsetHeight;
  w.classList.add("show");

  try {
    const baseW = 350;
    const baseH = 490;
    const cv = document.createElement("canvas");
    cv.width = baseW * scale;
    cv.height = baseH * scale;
    const ctx = cv.getContext("2d");
    ctx.scale(scale, scale);

    // 显式清除画布以确保透明度
    ctx.clearRect(0, 0, baseW, baseH);

    ctx.fillStyle = getRandomColor();
    roundRect(ctx, 0, 0, baseW, baseH, 15);
    ctx.fill();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    const margin = 12;
    const innerW = baseW - margin * 2;
    const innerH = baseH - margin * 2;
    
    const bgGrad = ctx.createLinearGradient(margin, margin, baseW - margin, baseH - margin);
    bgGrad.addColorStop(0, '#f8f8f8');
    bgGrad.addColorStop(1, '#e2e2e2');
    ctx.fillStyle = bgGrad;
    roundRect(ctx, margin, margin, innerW, innerH, 8);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px "Arial", sans-serif';
    ctx.fillText(currentCat.name, margin + 15, margin + 35);

    const hpValue = 100 + Math.floor(Math.random() * 11) * 10;
    ctx.textAlign = 'right';
    ctx.font = 'bold 12px "Arial", sans-serif';
    ctx.fillText(hpValue + ' HP', baseW - margin - 12, margin + 33);

    const imgMargin = 25;
    const imgW = baseW - imgMargin * 2;
    const imgH = 185; // 高度缩小一点，原为 200
    const imgX = imgMargin;
    const imgY = margin + 50;

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.strokeRect(imgX, imgY, imgW, imgH);
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(imgX, imgY, imgW, imgH);
    
    ctx.save();
    // 裁剪区域确保不溢出
    ctx.beginPath();
    roundRect(ctx, imgX, imgY, imgW, imgH, 4);
    ctx.clip();
    
    drawEmojiBackground(ctx, imgX, imgY, imgW, imgH, 60);

    if (currentCat.url) {
      const img = new Image();
      img.src = currentCat.url;
      img.crossOrigin = 'anonymous';
      await new Promise(resolve => {
        img.onload = () => {
          // 保持比例模式：Fit/Contain
          const imgRatio = img.width / img.height;
          const targetRatio = imgW / imgH;
          let drawW, drawH;
          if (imgRatio > targetRatio) {
            drawW = imgW;
            drawH = imgW / imgRatio;
          } else {
            drawH = imgH;
            drawW = drawH * imgRatio;
          }
          const dx = imgX + (imgW - drawW) / 2;
          const dy = imgY + (imgH - drawH) / 2;
          ctx.drawImage(img, dx, dy, drawW, drawH);
          resolve();
        };
        img.onerror = () => {
          ctx.font = '72px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(currentCat.emoji, imgX + imgW/2, imgY + imgH/2 + 25);
          resolve();
        };
      });
    } else {
      ctx.font = '72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentCat.emoji, imgX + imgW/2, imgY + imgH/2 + 25);
    }
    ctx.restore(); // 统一恢复状态

    ctx.fillStyle = '#ffde00';
    ctx.fillRect(imgX + 10, imgY + imgH - 5, imgW - 20, 15);
    ctx.fillStyle = '#333';
    ctx.font = 'italic 10px "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`NO. ${currentCat.mbti}  ${currentCat.tag}`, imgX + imgW/2, imgY + imgH + 6);

    let skillY = imgY + imgH + 35;
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#d31';
    ctx.font = 'bold 14px "Arial", sans-serif';
    ctx.fillText('技能: ' + currentCat.tag.replace(/[「」]/g, ''), imgX + 10, skillY);
    
    ctx.fillStyle = '#333';
    ctx.font = '10px "Arial", sans-serif';
    const abilityLines = wrapText(ctx, currentCat.desc, imgW - 20);
    abilityLines.forEach((line, i) => {
      ctx.fillText(line, imgX + 10, skillY + 15 + i * 12);
    });

    skillY += 50;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px "Arial", sans-serif';
    ctx.fillText(currentCat.mbti + ' 能量', imgX + 10, skillY);
    ctx.textAlign = 'right';
    ctx.fillText('50+', imgX + imgW - 10, skillY);
    
    ctx.textAlign = 'left';
    ctx.font = '10px "Arial", sans-serif';
    const attackLines = wrapText(ctx, currentCat.info, imgW - 20);
    attackLines.forEach((line, i) => {
      ctx.fillText(line, imgX + 10, skillY + 18 + i * 12);
    });

    const bottomY = baseH - margin - 65;
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin + 10, bottomY);
    ctx.lineTo(baseW - margin - 10, bottomY);
    ctx.stroke();

    ctx.fillStyle = '#444';
    ctx.font = 'italic 8px "Arial", sans-serif';
    const flavorLines = wrapText(ctx, currentCat.story, imgW - 20);
    flavorLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, imgX + 10, bottomY + 26 + i * 10);
    });

    const catKeys = Object.keys(catMap);
    const catIdx = catKeys.indexOf(currentCat.mbti) + 1;
    const catTotal = catKeys.length;
    const serialStr = `${catIdx.toString().padStart(3, '0')}/${catTotal.toString().padStart(3, '0')} ★`;

    ctx.font = 'bold 8px "Arial", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(serialStr, baseW - margin - 15, baseH - margin - 5);
    ctx.textAlign = 'left';
    ctx.font = '7px "Arial", sans-serif';
    ctx.fillText('© 小起司爱cheese 💕🐾', margin + 15, baseH - margin - 5);

    const finalImg = document.createElement("img");
    finalImg.src = cv.toDataURL("image/png");
    finalImg.crossOrigin = "Anonymous";
    finalImg.alt = "Pokemon Card";
    finalImg.style.width = "100%";

    finalImg.onload = () => {
      w.innerHTML = "";
      w.style.padding = "0";
      w.style.background = "transparent";
      w.style.borderRadius = "0";
      w.style.boxShadow = "none";
      w.style.filter = "drop-shadow(0 12px 20px rgba(0,0,0,0.35))"; // 使用 drop-shadow 替代 box-shadow
      w.appendChild(finalImg);
      createSaveHint(container, false);
    };
  } catch (e) {
    console.error('genCard error:', e);
    w.innerHTML = '<div style="text-align:center;padding:20px;">进化失败... 🐾</div>';
  }
}

document.getElementById("enterGameBtn").onclick = () => {
  document.getElementById("welcomeView").classList.add("hidden");
  document.getElementById("homeView").classList.remove("hidden");
};
document.getElementById("startBtn").onclick = () => {
  reset();
  document.getElementById("homeView").classList.add("hidden");
  document.getElementById("quizView").classList.remove("hidden");
  renderQ();
};
document.getElementById("prevBtn").onclick = () => {
  if (idx > 0) {
    idx--;
    renderQ();
  }
};
document.getElementById("continueToResult").onclick = () => {
  document.getElementById("transitionView").classList.add("hidden");
  showResult();
};
document.getElementById("genPhotoBtn").onclick = () =>
  genPolaroid("photoContainer", false);
document.getElementById("genEasterBtn").onclick = () =>
  genPolaroid("easterPhotoContainer", true);
document.getElementById("toEasterBtn").onclick = () => {
  document.getElementById("resultView").classList.add("hidden");
  document.getElementById("easterView").classList.remove("hidden");
};
document.getElementById("backToResult").onclick = () => {
  document.getElementById("easterView").classList.add("hidden");
  document.getElementById("resultView").classList.remove("hidden");
};
document.getElementById("restartFromResult").onclick = () => {
  reset();
  document.getElementById("resultView").classList.add("hidden");
  document.getElementById("quizView").classList.remove("hidden");
  renderQ();
};
document.getElementById("restartBtn").onclick = () => {
  reset();
  document.getElementById("easterView").classList.add("hidden");
  document.getElementById("quizView").classList.remove("hidden");
  renderQ();
};
document.getElementById("genCardBtnResult").onclick = () => {
  genCard("cardPhotoContainer", "easterArea");
};
