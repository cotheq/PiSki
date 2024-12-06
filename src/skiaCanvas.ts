import InitCanvasKit, { Canvas, CanvasKit, Surface } from "canvaskit-wasm";
import * as PIXI from "pixi.js";
import { getPixiContainer } from "./pixiApplication";
import { drawPolygon, drawSomething } from "./skiaDrawFunctions";

let initialized = false;

const isCanvasKitInitialized = () => initialized;

const initSkiaCanvas = (skCanvasId: string) => {
  initialized = true;
  InitCanvasKit({
    locateFile: () => '/node_modules/canvaskit-wasm/bin/canvaskit.wasm',
  }).then((canvasKit: CanvasKit) => {
    const surface = canvasKit.MakeWebGLCanvasSurface(skCanvasId);
      if (surface == null) {
        throw new Error("CanvasKit Canvas surface not created");
      }
      console.log("Surface created")
    const pixiContainer = getPixiContainer()
    if (pixiContainer) {
      drawOnCanvasKit(canvasKit, surface, pixiContainer);
    } else {
      console.log("No pixi container")
    }
  }).catch(() => { initialized = false; });
  
}




const drawOnCanvasKit = (
  canvasKit: CanvasKit,
  surface: Surface,
  pixiContainer: PIXI.Container
) => {

  const drawLoop = ((canvas: Canvas) => {
    canvas.clear(canvasKit.BLACK)
    
    /////// вынести в отдельную функцию
    const graphicsToDraw: PIXI.Container[] = [];
    const traverseChildren = (container: PIXI.Container) => {
      for (let i = 0; i < (container.children).length; i++) {
        let child = container.children[i];
        if (child instanceof PIXI.Container) {

          if (child instanceof PIXI.Graphics || child instanceof PIXI.Sprite) {
            graphicsToDraw.push(child)
          }
          
          traverseChildren(child);
        } else {
          console.log(child)
          return;
        }
      }
    }
    ///////

    traverseChildren(pixiContainer);
    console.log(graphicsToDraw);
    
    ///////вынести в отдельную функцию работу с линейным массивом
    for (let i = 0; i < graphicsToDraw.length; i++) {
      let g = graphicsToDraw[i];
      const worldTransform: PIXI.Matrix = g.worldTransform;
      if (g instanceof PIXI.Graphics) {
        for (let j = 0; j < g.geometry.graphicsData.length; j++) {
          const gd: PIXI.GraphicsData = g.geometry.graphicsData[j];
          const {points, fillStyle, lineStyle} = gd;
          const shapeType = gd.shape.type;
          const matrix = gd.matrix ? worldTransform.append(gd.matrix) : worldTransform;
          const skiaMatrix = [...matrix.toArray(false), 0, 0, 1]
          let closeStroke = false;
          if (gd.shape instanceof PIXI.Polygon) {
            closeStroke = gd.shape.closeStroke
          }

          console.log(matrix)

          switch(shapeType) {
            case PIXI.SHAPES.RECT: continue; //Draw rect
            case PIXI.SHAPES.ELIP: continue; //Draw rect
            default: drawPolygon(canvasKit, canvas, points, closeStroke, skiaMatrix);
          }
          
        }
      }
      if (g instanceof PIXI.Sprite) {
        //TODO ну это как-нибудь потом уже, когда разберёмся с graphics
      }
    }
    ///////////
    
    
    







    //включить потом
    //surface.requestAnimationFrame(drawLoop)
  });

  surface.requestAnimationFrame(drawLoop)

};







export {initSkiaCanvas, isCanvasKitInitialized}

