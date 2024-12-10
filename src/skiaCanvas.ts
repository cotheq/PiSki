import InitCanvasKit, { Canvas, CanvasKit, Surface } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { canvasToPDF, hexToRgba } from "./helpers";
import { getPixiContainer } from "./pixiApplication";
import {
  drawCircle,
  drawEllipse,
  drawPolygon,
  drawRect,
} from "./skiaDrawFunctions";
import canvasSettings from "./settings";
import { setCanvasKitInstance } from "./CanvasKitInstance";
import { DrawCallback, IDrawFunctionOptions } from "./types";

let ck: CanvasKit;
let drawCallback: DrawCallback;

const initSkiaCanvas = (skCanvasId: string) => {
  InitCanvasKit({
    locateFile: () => "./canvaskit-with-pdf.wasm",
  })
    .then((newInstance: CanvasKit) => {
      ck = setCanvasKitInstance(newInstance);
      const surface = ck.MakeSWCanvasSurface(skCanvasId);
      if (surface == null) {
        throw new Error("CanvasKit Canvas surface not created");
      }

      //TODO: сделать возможность менять контейнеры
      const pixiContainer = getPixiContainer();
      if (pixiContainer) {
        setDrawCallback(surface, pixiContainer);
      } else {
        throw new Error("No pixi container");
      }
    })
    .catch((e) => {
      throw e;
    });
};

const getObjectsToDrawArray = (pixiContainer: PIXI.Container) => {
  const result: PIXI.Container[] = [];
  const traverseChildren = (container: PIXI.Container) => {
    for (let i = 0; i < container.children.length; i++) {
      let child = container.children[i];
      if (child instanceof PIXI.Container) {
        if (child instanceof PIXI.Graphics || child instanceof PIXI.Sprite) {
          result.push(child);
        }
        traverseChildren(child);
      } else {
        return;
      }
    }
  };
  traverseChildren(pixiContainer);
  return result;
};

const setDrawCallback = (surface: Surface, pixiContainer: PIXI.Container) => {
  drawCallback = (canvas: Canvas) => {
    const { r, g, b } = hexToRgba(canvasSettings.backgroundColor);
    canvas.clear(ck.Color(r, g, b));

    const objectsToDraw = getObjectsToDrawArray(pixiContainer);

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

          const drawFunctionOptions: IDrawFunctionOptions = {
            canvas,
            matrix: skiaMatrix,
            fillStyle,
            lineStyle,
          };

          switch (shapeType) {
            case PIXI.SHAPES.RECT: {
              drawRect(drawFunctionOptions, shape);
              break;
            }
            case PIXI.SHAPES.ELIP: {
              drawEllipse(drawFunctionOptions, shape);
              break;
            }
            case PIXI.SHAPES.CIRC: {
              drawCircle(drawFunctionOptions, shape);
              break;
            }
            case PIXI.SHAPES.POLY: {
              drawPolygon(drawFunctionOptions, shape);
              break;
            }
            default:
              break;
          }
        }
      }
      if (obj instanceof PIXI.Sprite) {
        //TODO ну это как-нибудь потом уже, когда разберёмся с graphics
      }
    }
    surface.requestAnimationFrame(drawCallback);
  };

  surface.requestAnimationFrame(drawCallback);
};

export { initSkiaCanvas, drawCallback };
