import InitCanvasKit, { Canvas, CanvasKit } from "canvaskit-wasm"; // default
let initialized = false;

const isCanvasKitInitialized = () => initialized;

const initSkiaCanvas = (skCanvasId: string) => {
  initialized = true;
  InitCanvasKit({
    locateFile: () => '/node_modules/canvaskit-wasm/bin/canvaskit.wasm',
  }).then((CanvasKit: CanvasKit) => {
    const surface = CanvasKit.MakeWebGLCanvasSurface(skCanvasId);

    if (surface == null) {
      throw new DOMException("CanvasKit Canvas surface not created");
    }

    const paint = new CanvasKit.Paint();
    paint.setColor(CanvasKit.Color4f(0.9, 0, 0, 1.0));
    paint.setStyle(CanvasKit.PaintStyle.Stroke);
    paint.setAntiAlias(true);
    const rr = CanvasKit.RRectXY(CanvasKit.LTRBRect(10, 60, 210, 260), 25, 15);

    function draw(canvas: Canvas) {
      canvas.clear(CanvasKit.BLACK);
      canvas.drawRRect(rr, paint);
    }
    surface.drawOnce(draw);
  }).catch(() => { initialized = false; });
  
}

export {initSkiaCanvas, isCanvasKitInitialized}
