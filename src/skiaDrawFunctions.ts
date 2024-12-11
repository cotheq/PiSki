import { hexToRgba } from "./helpers";
import * as PIXI from "pixi.js";
import { getCanvasKitInstance } from "./CanvasKitInstance";
import { IDrawFunctionOptions } from "./types";

// Конвертация lineCap из Pixi в Skia
const convertLineCap = (pixiCap: PIXI.LINE_CAP) => {
  const ck = getCanvasKitInstance()

  switch (pixiCap) {
    case PIXI.LINE_CAP.BUTT:
      return ck.StrokeCap.Butt;
    case PIXI.LINE_CAP.ROUND:
      return ck.StrokeCap.Round;
    case PIXI.LINE_CAP.SQUARE:
      return ck.StrokeCap.Square;
    default:
      return ck.StrokeCap.Butt;
  }
};

// Конвертация lineJoin из Pixi в Skia
function convertLineJoin(pixiJoin: PIXI.LINE_JOIN) {
  const ck = getCanvasKitInstance()

  switch (pixiJoin) {
    case PIXI.LINE_JOIN.BEVEL:
      return ck.StrokeJoin.Bevel;
    case PIXI.LINE_JOIN.ROUND:
      return ck.StrokeJoin.Round;
    case PIXI.LINE_JOIN.MITER:
      return ck.StrokeJoin.Miter;
    default:
      return ck.StrokeJoin.Miter;
  }
}

const createPaint = (
  fillStyle: PIXI.FillStyle,
  lineStyle: PIXI.LineStyle,
) => {
  const ck = getCanvasKitInstance()

  const paint = new ck.Paint();

  // Переносим свойства заливки (fillStyle)
  if (fillStyle.visible) {
    const fillColor = fillStyle.color;
    const fillAlpha = fillStyle.alpha;
    const { r, g, b, a } = hexToRgba(fillColor, fillAlpha);

    paint.setStyle(ck.PaintStyle.Fill);
    paint.setColor(ck.Color(r, g, b, a));
  }

  // Переносим свойства обводки (lineStyle)
  if (lineStyle.width > 0) {
    const lineColor = lineStyle.color; // Цвет в формате HEX
    const lineAlpha = lineStyle.alpha; // Прозрачность
    const { r, g, b, a } = hexToRgba(lineColor, lineAlpha);

    paint.setStyle(ck.PaintStyle.Stroke);
    paint.setStrokeWidth(lineStyle.width);
    paint.setColor(ck.Color(r, g, b, a));
    paint.setAntiAlias(true);

    if (lineStyle.miterLimit !== undefined) {
      paint.setStrokeMiter(lineStyle.miterLimit);
    }
    if (lineStyle.cap !== undefined) {
      paint.setStrokeCap(convertLineCap(lineStyle.cap));
    }
    if (lineStyle.join !== undefined) {
      paint.setStrokeJoin(convertLineJoin(lineStyle.join));
    }
  }

  return paint;
};

// const drawSomething = (ck: CanvasKit, canvas: Canvas) => {
//   const paint = new ck.Paint();
//   paint.setColor(ck.Color4f(0.9, 0, 0, 1.0));
//   paint.setStyle(ck.PaintStyle.Stroke);

//   const rr = ck.RRectXY(ck.LTRBRect(10, 60, 210, 260), 25, 15);

//   canvas.clear(ck.BLACK);
//   canvas.drawRRect(rr, paint);
// };

const drawRect = (
  options: IDrawFunctionOptions,
  shape: PIXI.Rectangle
) => {
  const ck = getCanvasKitInstance()

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height } = shape;
  const paint = createPaint(fillStyle, lineStyle);
  const rect = ck.XYWHRect(x, y, width, height);
  canvas.save();
  canvas.concat(matrix);
  canvas.drawRect(rect, paint);
  canvas.restore();
};

const drawPolygon = (
  options: IDrawFunctionOptions,
  shape: PIXI.Polygon
) => {
  const ck = getCanvasKitInstance()

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { points, closeStroke } = shape;
  if (points.length === 0 || points.length % 2 === 1) {
    throw new Error("Wrong points array length in polygon");
  }
  const paint = createPaint(fillStyle, lineStyle);
  const path = new ck.Path();
  canvas.save();
  canvas.concat(matrix);
  path.addPoly(points, closeStroke);
  canvas.drawPath(path, paint);
  canvas.restore();
  path.delete();
};

const drawCircle = (
  options: IDrawFunctionOptions,
  shape: PIXI.Circle
) => {
  const { x, y, radius } = shape;
  const { canvas, matrix, fillStyle, lineStyle } = options;
  const paint = createPaint(fillStyle, lineStyle);
  canvas.save();
  canvas.concat(matrix);
  canvas.drawCircle(x, y, radius, paint);
  canvas.restore();
};

const drawEllipse = (
  options: IDrawFunctionOptions,
  shape: PIXI.Ellipse
) => {
  const ck = getCanvasKitInstance()

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height } = shape;
  const paint = createPaint(fillStyle, lineStyle);
  const rect = ck.XYWHRect(x - width, y - height, width * 2, height * 2); //КОСТЫЛЬ
  canvas.save();
  canvas.concat(matrix);
  canvas.drawOval(rect, paint);
  canvas.restore();
};


export { drawPolygon, drawRect, drawCircle, drawEllipse };
