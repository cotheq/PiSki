import { Canvas, CanvasKit } from "canvaskit-wasm";
import { hexToRgba } from "./helpers";
import * as PIXI from "pixi.js";

interface IDrawFunctionOptions {
  canvasKit: CanvasKit;
  canvas: Canvas;
  matrix: Float32Array;
  fillStyle: PIXI.FillStyle;
  lineStyle: PIXI.LineStyle;
}

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
};

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

const createPaint = (
  fillStyle: PIXI.FillStyle,
  lineStyle: PIXI.LineStyle,
  canvasKit: CanvasKit,
) => {
  const paint = new canvasKit.Paint();

  // Переносим свойства заливки (fillStyle)
  if (fillStyle.visible) {
    const fillColor = fillStyle.color;
    const fillAlpha = fillStyle.alpha;
    const { r, g, b, a } = hexToRgba(fillColor, fillAlpha);

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
    paint.setAntiAlias(true);

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

// const drawSomething = (canvasKit: CanvasKit, canvas: Canvas) => {
//   const paint = new canvasKit.Paint();
//   paint.setColor(canvasKit.Color4f(0.9, 0, 0, 1.0));
//   paint.setStyle(canvasKit.PaintStyle.Stroke);

//   const rr = canvasKit.RRectXY(canvasKit.LTRBRect(10, 60, 210, 260), 25, 15);

//   canvas.clear(canvasKit.BLACK);
//   canvas.drawRRect(rr, paint);
// };

const drawRect = (
  options: IDrawFunctionOptions,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const { canvasKit, canvas, matrix, fillStyle, lineStyle } = options;
  const paint = createPaint(fillStyle, lineStyle, canvasKit);
  const rect = canvasKit.XYWHRect(x, y, width, height);
  canvas.save();
  canvas.concat(matrix);
  canvas.drawRect(rect, paint);
  canvas.restore();
};

const drawPolygon = (
  options: IDrawFunctionOptions,
  points: number[],
  closeStroke: boolean
) => {
  const { canvasKit, canvas, matrix, fillStyle, lineStyle } = options;
  if (points.length === 0 || points.length % 2 === 1) {
    throw new Error("Wrong points array length in polygon");
  }
  const paint = createPaint(fillStyle, lineStyle, canvasKit);
  const path = new canvasKit.Path();
  canvas.save();
  canvas.concat(matrix);
  path.addPoly(points, closeStroke);
  canvas.drawPath(path, paint);
  canvas.restore();
  path.delete();
};

const drawCircle = (
  options: IDrawFunctionOptions,
  x: number,
  y: number,
  radius: number
) => {
  const { canvasKit, canvas, matrix, fillStyle, lineStyle } = options;
  const paint = createPaint(fillStyle, lineStyle, canvasKit);
  canvas.save();
  canvas.concat(matrix);
  canvas.drawCircle(x, y, radius, paint);
  canvas.restore();
};

const drawEllipse = (
  options: IDrawFunctionOptions,
  x: number,
  y: number,
  width: number,
  height: number
) => {

  
  const { canvasKit, canvas, matrix, fillStyle, lineStyle } = options;
  const paint = createPaint(fillStyle, lineStyle, canvasKit);
  //КОСТЫЛЬ
  const rect = canvasKit.XYWHRect(x - width, y - height, width * 2, height * 2);
  canvas.save();
  canvas.concat(matrix);
  canvas.drawOval(rect, paint);
  canvas.restore();
};


export { drawPolygon, drawRect, drawCircle, drawEllipse };
