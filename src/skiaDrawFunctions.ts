/**
 * В этом файле содержатся функции для рисования фигур и картинок с помощью Skia.
 * Также содержатся некоторые вспомогательные функции для функций рисования.
 * 
 * Каждая функция, которая что-то рисует, возвращает Canvas.Path, необходимый для
 * последующего добавления события на DOM-элемент канваса и проверки по методу Path.contains
 */

import * as PIXI from "pixi.js";
import { Paint } from "canvaskit-wasm";
import { hexToRgba } from "./helpers";
import { getCanvasKitInstance } from "./CanvasKitInstance";
import { IDrawFunctionOptions } from "./types";

/**
 * Функция устанавливает вид конца рисуемой линии (переносит из PIXI)
 */
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

/**
 * Функция устанавливает вид соединения рисуемой линии (переносит из PIXI)
 */
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

/**
 * Функция создаёт 2 объекта CanvasKit.Paint: один для заливки, другой для обводки
 * @param fillStyle Стиль заливки
 * @param lineStyle Стиль обводки
 * @param callback Коллбэк, как правило что-то рисует
 */
const drawWithFillAndStroke = (
  fillStyle: PIXI.FillStyle,
  lineStyle: PIXI.LineStyle,
  callback: (paint: Paint) => void,
) => {
  const fillStylePaint = createPaint(fillStyle);
  const lineStylePaint = createPaint(lineStyle);
  callback(fillStylePaint);
  callback(lineStylePaint);
  fillStylePaint.delete();
  lineStylePaint.delete();
};

/**
 * Функция создаёт CanvasKit.Paint.
 * Используется для одного из двух, в зависимости от принимаемого стиля: заливка или обводка
 * @param style стиль заливки (обводки)
 * @returns Объект CanvasKit.Paint
 */
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

/**
 * Функция рисует прямоугольник
 */
const drawRect = (options: IDrawFunctionOptions, shape: PIXI.Rectangle) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height } = shape;
  const rect = ck.XYWHRect(x, y, width, height);
  const path = new ck.Path();
  path.addRect(rect);
  path.transform(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawPath(path, paint);
  });

  return path;
};

/**
 * Функция рисует скругленный прямоугольник
 */
const drawRoundedRect = (options: IDrawFunctionOptions, shape: PIXI.RoundedRectangle) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height, radius } = shape;
  const roundedRect = ck.RRectXY(ck.XYWHRect(x, y, width, height), radius, radius);

  const path = new ck.Path();
  path.addRRect(roundedRect);
  path.transform(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawPath(path, paint);
  });
  return path;
};

/**
 * Функция рисует многоугольник или линию по точкам
 */
const drawPolygon = (options: IDrawFunctionOptions, shape: PIXI.Polygon) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { points, closeStroke } = shape;
  if (points.length === 0 || points.length % 2 === 1) {
    throw new Error("Wrong points array length in polygon");
  }
  const path = new ck.Path();
  path.addPoly(points, closeStroke);
  path.transform(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawPath(path, paint);
  });
  return path;
};

/**
 * Функция рисует круг
 */
const drawCircle = (options: IDrawFunctionOptions, shape: PIXI.Circle) => {
  const ck = getCanvasKitInstance();

  const { x, y, radius } = shape;
  const { canvas, matrix, fillStyle, lineStyle } = options;
  const path = new ck.Path();
  path.addCircle(x, y, radius);
  path.transform(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawPath(path, paint);
  });
  return path;
};

/**
 * Функция рисует эллипс (овал).
 * Эллипс в PIXI и овал в Skia могут слегка отличаться
 */
const drawEllipse = (options: IDrawFunctionOptions, shape: PIXI.Ellipse) => {
  const ck = getCanvasKitInstance();

  const { canvas, matrix, fillStyle, lineStyle } = options;
  const { x, y, width, height } = shape;
  const rect = ck.XYWHRect(x - width, y - height, width * 2, height * 2); //КОСТЫЛЬ - так рисуются правильные координаты для овала / эллипса вместо x, y, width, height

  const path = new ck.Path();
  path.addOval(rect);
  path.transform(matrix);
  drawWithFillAndStroke(fillStyle, lineStyle, (paint) => {
    canvas.drawPath(path, paint);
  });
  return path;
};

/**
 * Функция рисует картинку из спрайта PIXI.Sprite
 */
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

    const path = new ck.Path();
    const rect = ck.XYWHRect(0, 0, image.width(), image.height());
    path.addRect(rect);
    path.transform(matrix);
    return path;
  } else {
    throw new Error("No image source");
  }
};

export { drawPolygon, drawRect, drawCircle, drawEllipse, drawImage, drawRoundedRect };
