import InitCanvasKit, { Canvas, CanvasKit, Path, Surface } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { hexToRgba } from "./helpers";
import { getCurrentPixiContainer } from "./pixiApplication";
import { drawCircle, drawEllipse, drawPolygon, drawRect, drawImage, drawRoundedRect } from "./skiaDrawFunctions";
import canvasSettings from "./settings";
import { setCanvasKitInstance } from "./CanvasKitInstance";
import { DrawCallback, IDrawFunctionOptions } from "./types";

let ck: CanvasKit;
let surface: Surface | null;
let drawCallback: DrawCallback;

let canvasElement: HTMLCanvasElement;

const eventTypes = ["pointerdown", "pointerup"];

const initSkiaCanvas = (skCanvasId: string) => {
  if (ck == null) {
    InitCanvasKit({
      locateFile: () => "./canvaskit-with-pdf.wasm",
    })
      .then((newInstance: CanvasKit) => {
        const canvasDOMElement = document.getElementById(skCanvasId);
        if (canvasDOMElement == null || !(canvasDOMElement instanceof HTMLCanvasElement)) {
          throw new Error("No or wrong canvas DOM element");
        }
        canvasElement = canvasDOMElement;
        ck = setCanvasKitInstance(newInstance);
        initSurface(skCanvasId);
        updateDrawCallback();
      })
      .catch((e) => {
        throw e;
      });
  } else {
    initSurface(skCanvasId);
    updateDrawCallback();
  }
};

const initSurface = (skCanvasId: string) => {
  if (surface) {
    surface.delete();
    surface = null;
  }
  if (surface == null) {
    surface = ck.MakeSWCanvasSurface(skCanvasId);
    if (surface == null) {
      throw new Error("CanvasKit Canvas surface not created");
    }
  }
};

const updateDrawCallback = () => {
  if (surface == null) {
    throw new Error("No canvas surface");
  }
  const pixiContainer = getCurrentPixiContainer();
  if (pixiContainer) {
    setDrawCallback(surface, pixiContainer);
  } else {
    throw new Error("No pixi container");
  }
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

const addEventsFromPaths = (objectsToDraw: PIXI.Container[], paths: Array<Array<Path>>) => {
  if (objectsToDraw.length != paths.length) {
    throw new Error("Lengths of objectsToDraw and paths are not equal");
  }
  if (surface == null) {
    throw new Error("No surface");
  }
  for (let i = 0; i < objectsToDraw.length; i++) {
    const { _events, _eventsCount } = objectsToDraw[i] as PIXI.utils.EventEmitter;
    if (_eventsCount != 0) {
      for (const eventType of Object.keys(_events)) {
        if (!eventTypes.includes(eventType)) continue;
        for (const path of paths[i]) {
          addEventToCanvas(canvasElement, path.copy(), eventType, _events[eventType].fn || (() => {}));
        }
      }
    }
  }
};

const addEventToCanvas = (
  canvas: HTMLCanvasElement,
  path: Path,
  eventType: string,
  callback: (...args: any[]) => void,
) => {
  canvas.addEventListener(eventType, (e: Event) => {
    if (path.contains((e as PointerEvent).offsetX, (e as PointerEvent).offsetY)) {
      callback();
    }
  });
};

const setDrawCallback = (surface: Surface, pixiContainer: PIXI.Container) => {
  surface.flush();

  drawCallback = (canvas: Canvas, addEvents = false) => {
    let eventPaths: Array<Array<Path>> = [];
    const { r, g, b } = hexToRgba(canvasSettings.backgroundColor);
    canvas.clear(ck.Color(r, g, b));

    const objectsToDraw = getObjectsToDrawArray(pixiContainer);
    for (let i = 0; i < objectsToDraw.length; i++) {
      let obj = objectsToDraw[i];

      const worldTransform: PIXI.Matrix = obj.worldTransform;
      const graphicsDataPaths: Array<Path> = [];
      if (obj instanceof PIXI.Graphics) {
        for (let gd = 0; gd < obj.geometry.graphicsData.length; gd++) {
          const graphicsData: PIXI.GraphicsData = obj.geometry.graphicsData[gd];
          const { shape, fillStyle, lineStyle } = graphicsData;
          const shapeType = shape.type;
          const matrix = graphicsData.matrix ? worldTransform.append(graphicsData.matrix) : worldTransform;
          const skiaMatrix = matrix.toArray(false);

          const drawFunctionOptions: IDrawFunctionOptions = {
            canvas,
            matrix: skiaMatrix,
            fillStyle,
            lineStyle,
          };

          switch (shapeType) {
            case PIXI.SHAPES.RECT: {
              graphicsDataPaths.push(drawRect(drawFunctionOptions, shape));
              break;
            }
            case PIXI.SHAPES.RREC: {
              graphicsDataPaths.push(drawRoundedRect(drawFunctionOptions, shape));
              break;
            }
            case PIXI.SHAPES.ELIP: {
              graphicsDataPaths.push(drawEllipse(drawFunctionOptions, shape));
              break;
            }
            case PIXI.SHAPES.CIRC: {
              graphicsDataPaths.push(drawCircle(drawFunctionOptions, shape));
              break;
            }
            case PIXI.SHAPES.POLY: {
              graphicsDataPaths.push(drawPolygon(drawFunctionOptions, shape));
              break;
            }
            default:
              console.log("WTF&!");
              break;
          }
        }
        eventPaths.push(graphicsDataPaths);
      }
      if (obj instanceof PIXI.Sprite) {
        const matrix = worldTransform.toArray(false);
        const drawFunctionOptions: IDrawFunctionOptions = {
          canvas,
          matrix,
        };
        const path = drawImage(drawFunctionOptions, obj);
        eventPaths.push([path]);
      }
    }
    if (addEvents) {
      addEventsFromPaths(objectsToDraw, eventPaths);
    }
    for (const arr of eventPaths) {
      for (const path of arr) {
        if (!path.isDeleted()) {
          path.delete();
        }
      }
    }
    surface.requestAnimationFrame(drawCallback);
  };

  surface.requestAnimationFrame((canvas) => {
    drawCallback(canvas, true);
  });
};

export { initSkiaCanvas, drawCallback, updateDrawCallback };
