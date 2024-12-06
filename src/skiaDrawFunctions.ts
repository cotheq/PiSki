import { Canvas, CanvasKit } from "canvaskit-wasm";
import { hexToRgba } from "./helpers";
import * as PIXI from "pixi.js"


// Конвертация lineCap из Pixi в Skia
const convertLineCap = (pixiCap: PIXI.LINE_CAP, canvasKit: CanvasKit) => {
  switch (pixiCap) {
    case PIXI.LINE_CAP.BUTT:
      return canvasKit.StrokeCap.Butt;
    case PIXI.LINE_CAP.ROUND:
      return canvasKit.StrokeCap.Round;
    case PIXI.LINE_CAP.SQUARE:
      return canvasKit.StrokeCap.Square;
    default:
      return canvasKit.StrokeCap.Butt;
  }
}

// Конвертация lineJoin из Pixi в Skia
function convertLineJoin(pixiJoin: PIXI.LINE_JOIN, canvasKit: CanvasKit) {
  switch (pixiJoin) {
    case PIXI.LINE_JOIN.BEVEL:
      return canvasKit.StrokeJoin.Bevel;
    case PIXI.LINE_JOIN.ROUND:
      return canvasKit.StrokeJoin.Round;
    case PIXI.LINE_JOIN.MITER:
      return canvasKit.StrokeJoin.Miter;
    default:
      return canvasKit.StrokeJoin.Miter;
  }
}


const transferStylesToPaint = (
  fillStyle: PIXI.FillStyle,
  lineStyle: PIXI.LineStyle,
  canvasKit: CanvasKit
) => {
  const paint = new canvasKit.Paint();

  // Переносим свойства заливки (fillStyle)
  if (fillStyle.visible) {
    const fillColor = fillStyle.color; // Цвет в формате HEX
    const fillAlpha = fillStyle.alpha; // Прозрачность
    const {r, g, b, a} = hexToRgba(fillColor, fillAlpha);

    paint.setStyle(canvasKit.PaintStyle.Fill);
    paint.setColor(canvasKit.Color(r, g, b, a));
  }

  // Переносим свойства обводки (lineStyle)
  if (lineStyle.width > 0) {
    const lineColor = lineStyle.color; // Цвет в формате HEX
    const lineAlpha = lineStyle.alpha; // Прозрачность
    const { r, g, b, a } = hexToRgba(lineColor, lineAlpha);

    paint.setStyle(canvasKit.PaintStyle.Stroke);
    paint.setStrokeWidth(lineStyle.width);
    paint.setColor(canvasKit.Color(r, g, b, a));

    // Опционально: переносим настройки обводки
    if (lineStyle.alignment !== undefined) {
      // Skia не имеет прямого аналога alignment, но можно попытаться смоделировать
      console.warn("Alignment is not directly supported in CanvasKit.");
    }
    if (lineStyle.miterLimit !== undefined) {
      paint.setStrokeMiter(lineStyle.miterLimit);
    }
    if (lineStyle.cap !== undefined) {
      paint.setStrokeCap(convertLineCap(lineStyle.cap, canvasKit));
    }
    if (lineStyle.join !== undefined) {
      paint.setStrokeJoin(convertLineJoin(lineStyle.join, canvasKit));
    }
  }

  return paint;
};

const drawSomething = (canvasKit: CanvasKit, canvas: Canvas) => {
  const paint = new canvasKit.Paint();
  paint.setColor(canvasKit.Color4f(0.9, 0, 0, 1.0));
  paint.setStyle(canvasKit.PaintStyle.Stroke);
  paint.setAntiAlias(true);
  const rr = canvasKit.RRectXY(canvasKit.LTRBRect(10, 60, 210, 260), 25, 15);

  canvas.clear(canvasKit.BLACK);
  canvas.drawRRect(rr, paint);
};

const drawPolygon = (
  canvasKit: CanvasKit,
  canvas: Canvas,
  points: number[],
  closeStroke: boolean,
  matrix: number[],
  fillStyle: PIXI.FillStyle,
  lineStyle: PIXI.LineStyle
) => {
  if (points.length === 0 || points.length % 2 === 1) {
    console.log("Wrong points array length");
    return;
  }

  const paint = transferStylesToPaint(fillStyle, lineStyle, canvasKit);
  paint.setAntiAlias(true);

  const path = new canvasKit.Path();
  // path.moveTo(points[0], points[1]);
  // for (let i = 2; i < points.length - 1; i++) {
  //   path.lineTo(points[i], points[i + 1]);
  // }

  // if (closeStroke) {
  //   path.close();
  // }

  path.addPoly(points, closeStroke);

  path.transform(matrix);

  canvas.drawPath(path, paint);
  canvas.draw;
  path.delete();
};

export { drawSomething, drawPolygon };
