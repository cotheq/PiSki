import { Canvas, CanvasKit } from "canvaskit-wasm";

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
  matrix: number[]
) => {
  if (points.length === 0 || points.length % 2 === 1) {
    console.log("Wrong points array length");
    return;
  }

  //ДЛЯ ТЕСТА, потом поменять paint
  const paint = new canvasKit.Paint();
  paint.setColor(canvasKit.Color4f(0.9, 0, 0, 1.0));
  paint.setStyle(canvasKit.PaintStyle.Stroke);
  paint.setAntiAlias(true);

  const path = new canvasKit.Path();
  path.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length - 1; i++) {
    path.lineTo(points[i], points[i + 1]);
  }

  if (closeStroke) {
    path.close();
  }
console.log(matrix)
  path.transform(matrix);

  canvas.drawPath(path, paint);
  path.delete();

  if (points.length) canvas.drawPath;
};

export { drawSomething, drawPolygon };
