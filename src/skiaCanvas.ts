import InitCanvasKit, { Canvas, CanvasKit, Surface } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { downloadUint8ArrayAsFile } from "./helpers";
import { getPixiContainer } from "./pixiApplication";
import {
  drawCircle,
  drawEllipse,
  drawPolygon,
  drawRect,
  drawSomething,
} from "./skiaDrawFunctions";

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
      console.log("Fucked up");
      initialized = false;
      throw e;
    });
};

const getObjectsToDrawArray = (pixiContainer: PIXI.Container) => {
  const result: PIXI.Container[] = [];

  const traverseChildren = (pixiContainer: PIXI.Container) => {
    for (let i = 0; i < pixiContainer.children.length; i++) {
      let child = pixiContainer.children[i];
      if (child instanceof PIXI.Container) {
        if (child instanceof PIXI.Graphics || child instanceof PIXI.Sprite) {
          result.push(child);
        }
        traverseChildren(child);
      } else {
        console.log(child);
        return;
      }
    }
  };

  traverseChildren(pixiContainer);

  return result;
};

const drawOnCanvasKit = (
  canvasKit: CanvasKit,
  surface: Surface,
  pixiContainer: PIXI.Container
) => {
  const drawLoop = (canvas: Canvas) => {
    canvas.clear(canvasKit.BLACK);

    const objectsToDraw = getObjectsToDrawArray(pixiContainer);
    console.log(objectsToDraw);

    ///////вынести в отдельную функцию работу с линейным массивом
    for (let i = 0; i < objectsToDraw.length; i++) {
      let obj = objectsToDraw[i];
      const worldTransform: PIXI.Matrix = obj.worldTransform;
      if (obj instanceof PIXI.Graphics) {
        for (let j = 0; j < obj.geometry.graphicsData.length; j++) {
          const graphicsData: PIXI.GraphicsData = obj.geometry.graphicsData[j];
          const { shape, fillStyle, lineStyle } = graphicsData;
          const shapeType = shape.type;
          const matrix = graphicsData.matrix
            ? worldTransform.append(graphicsData.matrix)
            : worldTransform;
          const skiaMatrix = matrix.toArray(false);
          let closeStroke = false;
          if (shape instanceof PIXI.Polygon) {
            closeStroke = shape.closeStroke;
          }

          console.log(matrix);

          const commonOptions = {
            canvasKit,
            canvas,
            matrix: skiaMatrix,
            fillStyle,
            lineStyle,
          };

          switch (shapeType) {
            case PIXI.SHAPES.RECT: {
              const { x, y, width, height } = shape as PIXI.Rectangle;
              drawRect(commonOptions, x, y, width, height);
              break;
            }
            case PIXI.SHAPES.ELIP: {
              const { x, y, width, height } = shape as PIXI.Ellipse;
              console.log('ellipse', commonOptions)
              drawEllipse(commonOptions, x, y, width, height);
              break;
            }
            case PIXI.SHAPES.CIRC: {
              const { x, y, radius } = shape as PIXI.Circle;
              drawCircle(commonOptions, x, y, radius);
              break;
            }
            case PIXI.SHAPES.POLY: {
              if ((shape as PIXI.Polygon).points == null)
                console.log("No points", graphicsData, shape);
              drawPolygon(
                commonOptions,
                (shape as PIXI.Polygon).points,
                closeStroke
              );
              break;
            }
            default: break;
          }
        }
      }
      if (obj instanceof PIXI.Sprite) {
        //TODO ну это как-нибудь потом уже, когда разберёмся с graphics
      }
    }
    ///////////

    //включить потом
    //surface.requestAnimationFrame(drawLoop)
  };

  surface.requestAnimationFrame(drawLoop);

  downloadUint8ArrayAsFile(
    canvasKit.canvasToPDF(640, 360, drawLoop),
    "sample.pdf"
  );
};

export { initSkiaCanvas, isCanvasKitInitialized };
