import { getPixiContainer, initPixiApplication } from "./pixiApplication";
import { isCanvasKitInitialized, initSkiaCanvas } from "./skiaTest"
import "./style.css";

const mainElement = document.querySelector<HTMLDivElement>("#app")!;
const pixiCanvasId = "pixiCanvas";
const skiaCanvasId = "skiaCanvas";

const canvasWidth = 640;
const canvasHeight = 360;


const observer = new MutationObserver(() => {
  if (getPixiContainer() == null) {
    const pixiViewElement = document.querySelector(
      `#${pixiCanvasId}`
    ) as HTMLCanvasElement;
    if (!pixiViewElement) {
      throw new DOMException("No view element for PIXI");
    }
    initPixiApplication(pixiViewElement, canvasWidth, canvasHeight);
  }

  if (!isCanvasKitInitialized()) {
    initSkiaCanvas(skiaCanvasId);
  }

});

observer.observe(mainElement, {
  characterData: false,
  childList: true,
  attributes: false,
});

mainElement.innerHTML = `
<div id="test">
  <canvas id="${pixiCanvasId}" width="${canvasWidth}" height="${canvasHeight}"></canvas>
  <canvas id="${skiaCanvasId}" width="${canvasWidth}" height="${canvasHeight}"></canvas>
</div>
`;
