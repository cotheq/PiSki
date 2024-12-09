import InitCanvasKit, { Canvas, CanvasKit, Surface } from "canvaskit-wasm";
import * as PIXI from "pixi.js";
import { downloadUint8ArrayAsFile } from "./helpers";
import { getPixiContainer } from "./pixiApplication";
import { drawPolygon, drawSomething } from "./skiaDrawFunctions";

let initialized = false;

const isCanvasKitInitialized = () => initialized;

const initSkiaCanvas = (skCanvasId: string) => {
  initialized = true;
  InitCanvasKit({
    locateFile: () => "./canvaskit-with-pdf.wasm",
  })
    .then((canvasKit: CanvasKit) => {
      const surface = canvasKit.MakeSWCanvasSurface(skCanvasId);
      if (surface == null) {
        throw new Error("CanvasKit Canvas surface not created");
      }
      console.log("Surface created");
      const pixiContainer = getPixiContainer();
      if (pixiContainer) {
        drawOnCanvasKit(canvasKit, surface, pixiContainer);
      } else {
        console.log("No pixi container");
      }
    })
    .catch((e) => {
      console.log("Fucked up")
      initialized = false;
      throw e;
    });
};

const drawOnCanvasKit = (
  canvasKit: CanvasKit,
  surface: Surface,
  pixiContainer: PIXI.Container
) => {
  const drawLoop = (canvas: Canvas) => {
    canvas.clear(canvasKit.BLACK);

    /////// вынести в отдельную функцию
    const graphicsToDraw: PIXI.Container[] = [];
    const traverseChildren = (container: PIXI.Container) => {
      for (let i = 0; i < container.children.length; i++) {
        let child = container.children[i];
        if (child instanceof PIXI.Container) {
          if (child instanceof PIXI.Graphics || child instanceof PIXI.Sprite) {
            graphicsToDraw.push(child);
          }

          traverseChildren(child);
        } else {
          console.log(child);
          return;
        }
      }
    };
    ///////

    traverseChildren(pixiContainer);
    console.log(graphicsToDraw);

    ///////вынести в отдельную функцию работу с линейным массивом
    for (let i = 0; i < graphicsToDraw.length; i++) {
      let graphics = graphicsToDraw[i];
      const worldTransform: PIXI.Matrix = graphics.worldTransform;
      if (graphics instanceof PIXI.Graphics) {
        for (let j = 0; j < graphics.geometry.graphicsData.length; j++) {
          const graphicsData: PIXI.GraphicsData =
            graphics.geometry.graphicsData[j];
          const { points, fillStyle, lineStyle } = graphicsData;
          const shapeType = graphicsData.shape.type;
          const matrix = graphicsData.matrix
            ? worldTransform.append(graphicsData.matrix)
            : worldTransform;
          const skiaMatrix = [...matrix.toArray(false), 0, 0, 1];
          let closeStroke = false;
          if (graphicsData.shape instanceof PIXI.Polygon) {
            closeStroke = graphicsData.shape.closeStroke;
          }

          console.log(matrix);

          switch (shapeType) {
            //case PIXI.SHAPES.RECT: continue; //Draw rect
            //case PIXI.SHAPES.ELIP: continue; //Draw rect
            default:
              drawPolygon(
                canvasKit,
                canvas,
                points,
                closeStroke,
                skiaMatrix,
                fillStyle,
                lineStyle
              );
          }
        }
      }
      if (graphics instanceof PIXI.Sprite) {
        //TODO ну это как-нибудь потом уже, когда разберёмся с graphics
      }
    }
    ///////////

    //включить потом
    //surface.requestAnimationFrame(drawLoop)
  };

  surface.requestAnimationFrame(drawLoop);

  window.ck = canvasKit;
  window.cn = surface.getCanvas();

  downloadUint8ArrayAsFile(canvasKit.canvasToPDF(640, 360, drawLoop), 'sample.pdf')
  
};

export { initSkiaCanvas, isCanvasKitInitialized };
