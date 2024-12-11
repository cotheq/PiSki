import { hexToRgba } from "./helpers";
import * as PIXI from "pixi.js";
import { getCanvasKitInstance } from "./CanvasKitInstance";
import { IDrawFunctionOptions } from "./types";
import { Paint } from "canvaskit-wasm";

const convertLineCap = (pixiCap: PIXI.LINE_CAP) => {
  const ck = getCanvasKitInstance();
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

function convertLineJoin(pixiJoin: PIXI.LINE_JOIN) {
  const ck = getCanvasKitInstance();
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

const drawWithFillAndStroke = (
  fillStyle: PIXI.FillStyle,
  lineStyle: PIXI.LineStyle,
  callback: (paint: Paint) => void
) => {
  const fillStylePaint = createPaint(fillStyle);
  const lineStylePaint = createPaint(lineStyle);
  callback(fillStylePaint);
  callback(lineStylePaint);
  fillStylePaint.delete();
  lineStylePaint.delete();
};

const createPaint = (style: PIXI.FillStyle | PIXI.LineStyle) => {
  const ck = getCanvasKitInstance();

  const paint = new ck.Paint();
  paint.setAntiAlias(true);

  if (style instanceof PIXI.FillStyle) {
    const fillColor = style.color;
    const fillAlpha = style.visible ? style.alpha : 0;
    const { r, g, b, a } = hexToRgba(fillColor, fillAlpha);
    paint.setStyle(ck.PaintStyle.Fill);
    paint.setColor(ck.Color(r, g, b, a));
    paint.setStrokeWidth(0);
  }

  if (style instanceof PIXI.LineStyle) {
    const lineColor = style.color;
    const lineAlpha = style.width > 0 ? style.alpha : 0;
    const { r, g, b, a } = hexToRgba(lineColor, lineAlpha);
    paint.setStyle(ck.PaintStyle.Stroke);
    paint.setStrokeWidth(style.width);
    paint.setColor(ck.Color(r, g, b, a));

    if (style.miterLimit !== undefined) {
      paint.setStrokeMiter(style.miterLimit);
    }
    if (style.cap !== undefined) {
      paint.setStrokeCap(convertLineCap(style.cap));
    }
    if (style.join !== undefined) {
      paint.setStrokeJoin(convertLineJoin(style.join));
    }
  }

  return paint;
};

const drawRect = (options: IDrawFunctionOptions, shape: PIXI.Rectangle) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height } = shape;
  const rect = ck.XYWHRect(x, y, width, height);
  canvas.save();
  canvas.concat(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawRect(rect, paint);
  });
  canvas.restore();
};

const drawRoundedRect = (
  options: IDrawFunctionOptions,
  shape: PIXI.RoundedRectangle
) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height, radius } = shape;
  const roundedRect = ck.RRectXY(
    ck.XYWHRect(x, y, width, height),
    radius,
    radius
  );
  canvas.save();
  canvas.concat(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawRRect(roundedRect, paint);
  });
  canvas.restore();
};

const drawPolygon = (options: IDrawFunctionOptions, shape: PIXI.Polygon) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { points, closeStroke } = shape;
  if (points.length === 0 || points.length % 2 === 1) {
    throw new Error("Wrong points array length in polygon");
  }
  const path = new ck.Path();
  canvas.save();
  canvas.concat(matrix);
  path.addPoly(points, closeStroke);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawPath(path, paint);
  });
  canvas.restore();
  path.delete();
};

const drawCircle = (options: IDrawFunctionOptions, shape: PIXI.Circle) => {
  const { x, y, radius } = shape;
  const { canvas, matrix, fillStyle, lineStyle } = options;
  canvas.save();
  canvas.concat(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawCircle(x, y, radius, paint);
  });
  canvas.restore();
};

const drawEllipse = (options: IDrawFunctionOptions, shape: PIXI.Ellipse) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height } = shape;
  const rect = ck.XYWHRect(x - width, y - height, width * 2, height * 2); //КОСТЫЛЬ - так рисуются правильные координаты для овала / эллипса вместо x, y, width, height
  canvas.save();
  canvas.concat(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawOval(rect, paint);
  });
  canvas.restore();
};

const drawImage = (options: IDrawFunctionOptions, sprite: PIXI.Sprite) => {
  const { canvas, matrix } = options;
  const pixiImageResource = sprite.texture.baseTexture.resource;
  if (!(pixiImageResource instanceof PIXI.ImageResource)) {
    throw new Error("Only image resources supported");
  }
  const source = pixiImageResource.source;
  if (source instanceof HTMLImageElement) {
    const ck = getCanvasKitInstance();
    const image = ck.MakeImageFromCanvasImageSource(source);
    canvas.save();
    canvas.concat(matrix);
    canvas.drawImage(image, 0, 0);
    canvas.restore();
  }
};

export {
  drawPolygon,
  drawRect,
  drawCircle,
  drawEllipse,
  drawImage,
  drawRoundedRect,
};
