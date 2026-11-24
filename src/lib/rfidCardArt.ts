import type { Employee } from "./types";

export const CARD_INK = "#0b2239";
const CARD_NAVY = "#071b2b";
const CARD_NAVY_2 = "#0f3a51";
const CARD_TEAL = "#0891a8";
const CARD_MUTED = "#65788a";
const CARD_HAIRLINE = "#d7e3eb";
const ART_RADIUS = 58;

const DISPLAY = '"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif';
const UI = '"Inter", ui-sans-serif, system-ui, sans-serif';

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function withCardClip(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
  draw: () => void,
) {
  ctx.save();
  roundedRectPath(ctx, 0, 0, width, height, radius);
  ctx.clip();
  draw();
  ctx.restore();
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: "left" | "center" | "right" = "left",
) {
  const glyphs = [...text];
  const widths = glyphs.map((glyph) => ctx.measureText(glyph).width);
  const total = widths.reduce((sum, value) => sum + value, 0) + tracking * (glyphs.length - 1);
  let cursor = x;
  if (align === "center") cursor -= total / 2;
  if (align === "right") cursor -= total;
  ctx.save();
  ctx.textAlign = "left";
  for (let index = 0; index < glyphs.length; index += 1) {
    ctx.fillText(glyphs[index], cursor, y);
    cursor += widths[index] + tracking;
  }
  ctx.restore();
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
  weight: number,
  family: string,
  minimum = 18,
) {
  let fontSize = size;
  while (fontSize > minimum) {
    ctx.font = `${weight} ${fontSize}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return fontSize;
    fontSize -= 1;
  }
  return minimum;
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  opacity = 1,
) {
  const imageWidth = logo.naturalWidth || logo.width;
  const imageHeight = logo.naturalHeight || logo.height;
  if (!imageWidth || !imageHeight) return;
  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(logo, x, y, imageWidth * scale, imageHeight * scale);
  ctx.restore();
}

function drawContactless(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = 5.2 * scale;
  for (let index = 0; index < 4; index += 1) {
    const radius = (15 + index * 12) * scale;
    ctx.globalAlpha = 1 - index * 0.12;
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, 4.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGuilloche(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(8, 145, 168, 0.045)";
  ctx.lineWidth = 1;
  for (let line = 0; line < 17; line += 1) {
    ctx.beginPath();
    for (let x = -20; x <= width + 20; x += 10) {
      const y =
        height * 0.58 +
        line * 2.4 +
        Math.sin(x * 0.012 + line * 0.42) * 17 +
        Math.sin(x * 0.004 - line * 0.2) * 24;
      if (x === -20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(8, 145, 168, 0.035)";
  for (let ring = 0; ring < 7; ring += 1) {
    ctx.beginPath();
    ctx.arc(width * 0.92, height * 0.2, 90 + ring * 34, Math.PI * 0.45, Math.PI * 1.25);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPaperGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = "rgba(11, 34, 57, 0.05)";
  for (let index = 0; index < 760; index += 1) {
    const x = (index * 137) % width;
    const y = (index * 313) % height;
    ctx.fillRect(x, y, 1.1, 1.1);
  }
  ctx.restore();
}

function drawCardBase(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  withCardClip(ctx, width, height, ART_RADIUS, () => {
    const paper = ctx.createLinearGradient(0, 0, width * 0.72, height);
    paper.addColorStop(0, "#ffffff");
    paper.addColorStop(0.5, "#f9fbfd");
    paper.addColorStop(1, "#eef4f8");
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);

    const sheen = ctx.createLinearGradient(0, 0, width, height * 0.7);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.45, "rgba(255,255,255,0.55)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);
  });
  withCardClip(ctx, width, height, ART_RADIUS, () => {
    drawPaperGrain(ctx, width, height);
    drawGuilloche(ctx, width, height);
  });

  roundedRectPath(ctx, 11, 11, width - 22, height - 22, ART_RADIUS - 10);
  ctx.strokeStyle = "rgba(11, 34, 57, 0.14)";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundedRectPath(ctx, 16, 16, width - 32, height - 32, ART_RADIUS - 15);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawDarkCardBase(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  withCardClip(ctx, width, height, ART_RADIUS, () => {
    const base = ctx.createLinearGradient(0, 0, width * 0.9, height);
    base.addColorStop(0, "#030f1a");
    base.addColorStop(0.42, "#072237");
    base.addColorStop(0.78, "#0a3047");
    base.addColorStop(1, "#08263a");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const topGlow = ctx.createRadialGradient(width * 0.86, -40, 0, width * 0.86, -40, 620);
    topGlow.addColorStop(0, "rgba(45, 212, 232, 0.3)");
    topGlow.addColorStop(0.55, "rgba(45, 212, 232, 0.07)");
    topGlow.addColorStop(1, "rgba(45, 212, 232, 0)");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    const bottomGlow = ctx.createRadialGradient(width * 0.12, height * 0.92, 0, width * 0.12, height * 0.92, 560);
    bottomGlow.addColorStop(0, "rgba(8, 145, 168, 0.22)");
    bottomGlow.addColorStop(1, "rgba(8, 145, 168, 0)");
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.055)";
    for (let dotY = 26; dotY < height; dotY += 24) {
      for (let dotX = 26; dotX < width; dotX += 24) {
        ctx.beginPath();
        ctx.arc(dotX, dotY, 1.05, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = "rgba(103, 232, 249, 0.06)";
    ctx.lineWidth = 1;
    for (let line = 0; line < 19; line += 1) {
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 10) {
        const y =
          height * 0.6 +
          line * 2.6 +
          Math.sin(x * 0.013 + line * 0.4) * 18 +
          Math.sin(x * 0.0045 - line * 0.22) * 27;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(103, 232, 249, 0.07)";
    for (let ring = 0; ring < 10; ring += 1) {
      ctx.beginPath();
      ctx.arc(width * 0.98, height * 0.22, 150 + ring * 46, Math.PI * 0.4, Math.PI * 1.3);
      ctx.stroke();
    }

    const sheen = ctx.createLinearGradient(0, 0, width, height * 0.62);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.38, "rgba(255,255,255,0.055)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.12)");
    sheen.addColorStop(0.63, "rgba(255,255,255,0.04)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    const footShade = ctx.createLinearGradient(0, height - 260, 0, height);
    footShade.addColorStop(0, "rgba(2, 8, 14, 0)");
    footShade.addColorStop(1, "rgba(2, 8, 14, 0.42)");
    ctx.fillStyle = footShade;
    ctx.fillRect(0, height - 260, width, 260);
  });

  roundedRectPath(ctx, 11, 11, width - 22, height - 22, ART_RADIUS - 10);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundedRectPath(ctx, 17, 17, width - 34, height - 34, ART_RADIUS - 16);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function drawMicrotextRule(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  size = 8,
  color = "rgba(11, 34, 57, 0.16)",
) {
  ctx.save();
  ctx.font = `500 ${size}px ${UI}`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  const unit = `${text}   `;
  const step = ctx.measureText(unit).width;
  let cursor = x;
  while (cursor < x + width) {
    ctx.fillText(unit, cursor, y);
    cursor += step;
  }
  ctx.restore();
}

function drawHoloFoil(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  ctx.save();
  roundedRectPath(ctx, x, y, size, size, 12);
  ctx.clip();

  const foil = ctx.createConicGradient(0.35, centerX, centerY);
  foil.addColorStop(0, "#8fd8f2");
  foil.addColorStop(0.18, "#c7b6fb");
  foil.addColorStop(0.36, "#f3b8e6");
  foil.addColorStop(0.52, "#fde9a8");
  foil.addColorStop(0.68, "#a7f0cf");
  foil.addColorStop(0.84, "#81e2f4");
  foil.addColorStop(1, "#8fd8f2");
  ctx.fillStyle = foil;
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1;
  for (let offset = -size; offset < size * 2; offset += 9) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y);
    ctx.lineTo(x + offset + size, y + size);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `600 ${Math.round(size * 0.2)}px ${DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CT", centerX, centerY + 1);

  ctx.fillStyle = "rgba(11,34,57,0.24)";
  ctx.font = `600 ${Math.round(size * 0.095)}px ${UI}`;
  ctx.fillText("SECURE", centerX, centerY + size * 0.27);
  ctx.restore();

  roundedRectPath(ctx, x, y, size, size, 12);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawIdentityTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  employee: Employee,
) {
  const registered = employee.registered;
  const accent = registered ? CARD_TEAL : "#7c8fa1";
  ctx.save();
  ctx.shadowColor = registered ? "rgba(45, 212, 232, 0.42)" : "rgba(148, 163, 184, 0.22)";
  ctx.shadowBlur = 34;
  roundedRectPath(ctx, x, y, width, height, 26);
  const tile = ctx.createLinearGradient(x, y, x + width * 0.95, y + height);
  tile.addColorStop(0, "#ffffff");
  tile.addColorStop(0.52, "#f4f9fc");
  tile.addColorStop(1, "#e2edf4");
  ctx.fillStyle = tile;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.clip();

  const wash = ctx.createRadialGradient(
    x + width * 0.85,
    y + height * 0.14,
    0,
    x + width * 0.85,
    y + height * 0.14,
    width * 0.85,
  );
  wash.addColorStop(0, "rgba(45, 212, 232, 0.18)");
  wash.addColorStop(1, "rgba(45, 212, 232, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "rgba(8, 145, 168, 0.1)";
  for (let dotY = y + 28; dotY < y + height - 24; dotY += 19) {
    for (let dotX = x + 26; dotX < x + width - 20; dotX += 19) {
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = "rgba(8, 145, 168, 0.12)";
  ctx.lineWidth = 1.4;
  for (let ring = 0; ring < 9; ring += 1) {
    ctx.beginPath();
    ctx.arc(x - width * 0.05, y + height * 0.95, 80 + ring * 32, -Math.PI * 0.65, Math.PI * 0.15);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(8, 145, 168, 0.09)";
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width, y);
  ctx.stroke();

  ctx.fillStyle = CARD_INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(width * 0.38)}px ${DISPLAY}`;
  ctx.fillText(employee.initials, x + width / 2, y + height / 2 - 18);

  ctx.fillStyle = accent;
  ctx.fillRect(x + width / 2 - 22, y + height / 2 + 56, 44, 3);

  ctx.fillStyle = "#65788a";
  ctx.font = `600 13px ${UI}`;
  drawTrackedText(ctx, "EMPLOYEE IDENTITY", x + width / 2, y + height - 34, 4.5, "center");

  ctx.strokeStyle = "rgba(11, 34, 57, 0.18)";
  ctx.lineWidth = 2;
  const inset = 18;
  const arm = 22;
  for (const [cornerX, cornerY, dx, dy] of [
    [x + inset, y + inset, 1, 1],
    [x + width - inset, y + inset, -1, 1],
    [x + inset, y + height - inset, 1, -1],
    [x + width - inset, y + height - inset, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(cornerX + dx * arm, cornerY);
    ctx.lineTo(cornerX, cornerY);
    ctx.lineTo(cornerX, cornerY + dy * arm);
    ctx.stroke();
  }

  ctx.fillStyle = accent;
  ctx.fillRect(x, y + 26, 4, height - 52);
  ctx.restore();

  roundedRectPath(ctx, x, y, width, height, 26);
  ctx.strokeStyle = registered ? "rgba(126, 238, 250, 0.72)" : "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawCardFront(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  employee: Employee,
  logoOnDark: HTMLImageElement,
) {
  drawDarkCardBase(ctx, width, height);

  drawLogo(ctx, logoOnDark, 62, 40, 306, 148);
  ctx.fillStyle = "rgba(255,255,255,0.56)";
  ctx.font = `600 16px ${UI}`;
  drawTrackedText(ctx, "EMPLOYEE ACCESS", width - 64, 96, 4.2, "right");

  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.font = `500 10px ${UI}`;
  drawTrackedText(ctx, "SECURE IDENTITY · CLAMOTAG", 64, 214, 2.6, "left");

  ctx.strokeStyle = "rgba(255,255,255,0.13)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(64, 246);
  ctx.lineTo(width - 64, 246);
  ctx.stroke();
  const rule = ctx.createLinearGradient(64, 0, width - 64, 0);
  rule.addColorStop(0, "rgba(45, 212, 232, 0)");
  rule.addColorStop(0.5, "rgba(45, 212, 232, 0.6)");
  rule.addColorStop(1, "rgba(45, 212, 232, 0)");
  ctx.fillStyle = rule;
  ctx.fillRect(64, 245.4, width - 128, 1.6);

  const tileWidth = 468;
  const tileHeight = 500;
  const tileX = (width - tileWidth) / 2;
  const tileY = 338;
  drawIdentityTile(ctx, tileX, tileY, tileWidth, tileHeight, employee);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.44)";
  ctx.font = `600 14px ${UI}`;
  drawTrackedText(ctx, "CARDHOLDER", width / 2, 936, 5, "center");

  ctx.textAlign = "center";
  const nameSize = fitFont(ctx, employee.name, width - 190, 64, 600, DISPLAY);
  ctx.font = `600 ${nameSize}px ${DISPLAY}`;
  ctx.fillStyle = "#f7fbfd";
  ctx.fillText(employee.name, width / 2, 1004);

  ctx.fillStyle = employee.registered ? "#67e8f9" : "#94a3b8";
  ctx.font = `600 28px ${UI}`;
  drawTrackedText(ctx, employee.department.toUpperCase(), width / 2, 1066, 2.6, "center");

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(196, 1114);
  ctx.lineTo(width - 196, 1114);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.44)";
  ctx.font = `600 13px ${UI}`;
  drawTrackedText(ctx, "EMPLOYEE ID", width / 2, 1178, 5, "center");

  ctx.fillStyle = "#f7fbfd";
  ctx.font = `600 54px ${DISPLAY}`;
  ctx.fillText(employee.id, width / 2, 1242);

  drawContactless(ctx, width / 2 - 138, 1338, 0.95, employee.registered ? "#67e8f9" : "#94a3b8");
  ctx.fillStyle = "rgba(255,255,255,0.56)";
  ctx.font = `600 14px ${UI}`;
  drawTrackedText(ctx, "CONTACTLESS · 13.56 MHZ", width / 2 - 84, 1344, 2.2, "left");

  drawHoloFoil(ctx, width - 182, 1214, 82);

  const footerY = height - 168;
  withCardClip(ctx, width, height, ART_RADIUS, () => {
    const footer = ctx.createLinearGradient(0, footerY, 0, height);
    footer.addColorStop(0, "rgba(2, 9, 16, 0)");
    footer.addColorStop(1, "rgba(2, 9, 16, 0.42)");
    ctx.fillStyle = footer;
    ctx.fillRect(0, footerY, width, height - footerY);
  });
  ctx.strokeStyle = "rgba(255,255,255,0.13)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();
  const footerRule = ctx.createLinearGradient(0, 0, width, 0);
  footerRule.addColorStop(0, "rgba(8, 145, 168, 0)");
  footerRule.addColorStop(0.35, "rgba(45, 212, 232, 0.9)");
  footerRule.addColorStop(1, "rgba(8, 145, 168, 0)");
  ctx.fillStyle = footerRule;
  ctx.fillRect(0, footerY, width, 2);

  drawMicrotextRule(
    ctx,
    "CLAMOTAG · SECURE IDENTITY",
    64,
    footerY + 28,
    width - 300,
    8,
    "rgba(255,255,255,0.18)",
  );

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 30px ${DISPLAY}`;
  ctx.fillText("CLAMOTAG", 64, height - 62);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `500 11px ${UI}`;
  drawTrackedText(ctx, "SECURE EMPLOYEE ACCESS", 64, height - 34, 2.6, "left");

  drawContactless(ctx, width - 262, height - 66, 0.82, "#7fe7f2");
  ctx.fillStyle = "rgba(255,255,255,0.66)";
  ctx.font = `600 11px ${UI}`;
  drawTrackedText(ctx, "CONTACTLESS", width - 222, height - 62, 2.2, "left");

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.font = `500 7px ${UI}`;
  drawTrackedText(
    ctx,
    "CLAMOTAG · SECURE IDENTITY · 13.56 MHZ · ISO/IEC 14443-A",
    width / 2,
    height - 13,
    1.2,
    "center",
  );
}

function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function drawCardBack(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  employee: Employee,
  logoOnDark: HTMLImageElement,
) {
  drawCardBase(ctx, width, height);

  // RFID inlay suggestion, printed very faintly under the artwork.
  ctx.save();
  for (let inset = 34; inset <= 66; inset += 16) {
    roundedRectPath(ctx, inset, inset, width - inset * 2, height - inset * 2, 24);
    ctx.strokeStyle = "rgba(8, 145, 168, 0.055)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();

  const bandHeight = 168;
  withCardClip(ctx, width, height, ART_RADIUS, () => {
    const band = ctx.createLinearGradient(0, 0, width, bandHeight);
    band.addColorStop(0, CARD_NAVY);
    band.addColorStop(1, CARD_NAVY_2);
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, width, bandHeight);

    const glow = ctx.createRadialGradient(width * 0.82, bandHeight, 0, width * 0.82, bandHeight, 400);
    glow.addColorStop(0, "rgba(45,212,232,0.16)");
    glow.addColorStop(1, "rgba(45,212,232,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, bandHeight);
  });

  drawLogo(ctx, logoOnDark, 62, 30, 260, 118);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `600 14px ${UI}`;
  drawTrackedText(ctx, "RFID ACCESS CARD", width - 64, 96, 3.6, "right");

  withCardClip(ctx, width, height, ART_RADIUS, () => {
    const stripe = ctx.createLinearGradient(0, 248, 0, 372);
    stripe.addColorStop(0, "#080d12");
    stripe.addColorStop(0.22, "#1b2630");
    stripe.addColorStop(0.48, "#0b1117");
    stripe.addColorStop(0.72, "#202c36");
    stripe.addColorStop(1, "#080d12");
    ctx.fillStyle = stripe;
    ctx.fillRect(0, 248, width, 124);
  });
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(0, 250, width, 1.5);
  ctx.fillRect(0, 368, width, 1.5);

  ctx.textAlign = "center";
  drawContactless(ctx, 366, 506, 1.45, CARD_TEAL);
  ctx.fillStyle = CARD_INK;
  ctx.font = `600 20px ${UI}`;
  drawTrackedText(ctx, "CONTACTLESS ACCESS", 462, 512, 3.8, "left");

  ctx.fillStyle = CARD_MUTED;
  ctx.font = `500 13px ${UI}`;
  drawTrackedText(ctx, "13.56 MHZ · ISO/IEC 14443-A", width / 2, 638, 2.2, "center");

  ctx.strokeStyle = CARD_HAIRLINE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(196, 692);
  ctx.lineTo(width - 196, 692);
  ctx.stroke();

  ctx.fillStyle = CARD_INK;
  ctx.font = `600 26px ${DISPLAY}`;
  drawTrackedText(ctx, "PRESENT CARD TO READER", width / 2, 762, 1.2, "center");

  ctx.fillStyle = CARD_MUTED;
  ctx.font = `400 17px ${UI}`;
  const legal =
    "This card is the property of CLAMOTAG and is issued for authorized employee access only. If found, return it to the nearest CLAMOTAG facility. Unauthorized use is prohibited.";
  const lines = wrapParagraph(ctx, legal, 820);
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, 824 + index * 28);
  });

  const panelWidth = 548;
  const panelHeight = 138;
  const panelX = (width - panelWidth) / 2;
  const panelY = 1004;
  roundedRectPath(ctx, panelX, panelY, panelWidth, panelHeight, 18);
  ctx.fillStyle = "rgba(8, 145, 168, 0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(8, 145, 168, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = CARD_MUTED;
  ctx.font = `600 13px ${UI}`;
  drawTrackedText(ctx, "CARD ID", width / 2, panelY + 44, 4.5, "center");

  ctx.fillStyle = CARD_INK;
  ctx.font = `600 34px ${DISPLAY}`;
  ctx.fillText(employee.id, width / 2, panelY + 94);

  ctx.fillStyle = CARD_MUTED;
  ctx.font = `500 11px ${UI}`;
  drawTrackedText(ctx, "EMPLOYEE ACCESS CREDENTIAL", width / 2, panelY + 120, 2.6, "center");

  drawHoloFoil(ctx, width - 188, 1020, 92);

  drawMicrotextRule(
    ctx,
    "CLAMOTAG · SECURE IDENTITY · RFID ACCESS",
    120,
    1204,
    width - 240,
    8,
  );

  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = CARD_INK;
  ctx.font = `600 104px ${DISPLAY}`;
  drawTrackedText(ctx, "CLAMOTAG", width / 2, 1322, 18, "center");
  ctx.restore();

  ctx.strokeStyle = "rgba(8, 145, 168, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, 1360);
  ctx.lineTo(width / 2 + 90, 1360);
  ctx.stroke();

  const footerY = height - 162;
  withCardClip(ctx, width, height, ART_RADIUS, () => {
    const footer = ctx.createLinearGradient(0, footerY, width, height);
    footer.addColorStop(0, CARD_NAVY);
    footer.addColorStop(0.65, "#0a2a3e");
    footer.addColorStop(1, CARD_NAVY_2);
    ctx.fillStyle = footer;
    ctx.fillRect(0, footerY, width, height - footerY);
    ctx.fillStyle = CARD_TEAL;
    ctx.fillRect(0, footerY, width, 3);
  });

  ctx.fillStyle = "#ffffff";
  ctx.font = `600 27px ${DISPLAY}`;
  ctx.textAlign = "left";
  ctx.fillText("CLAMOTAG", 64, height - 64);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `500 11px ${UI}`;
  drawTrackedText(ctx, "PROPERTY OF CLAMOTAG", width - 64, height - 62, 2.4, "right");
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = `500 7px ${UI}`;
  drawTrackedText(
    ctx,
    "THIS CARD REMAINS THE PROPERTY OF CLAMOTAG · UNAUTHORIZED USE IS PROHIBITED",
    width / 2,
    height - 14,
    1.2,
    "center",
  );
}
