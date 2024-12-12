/**
 * Файл - точка входа. Здесь рисуется HTML и происходит инициализация всего
 */

import { changeContainer, initPixiApplication } from "./pixiApplication";
import { initSkiaCanvas, drawCallback, updateDrawCallback } from "./skiaCanvas";
import "./style.css";
import canvasSettings from "./settings";
import { canvasToPDF } from "./helpers";

const mainElement = document.querySelector<HTMLDivElement>("#app")!;

const {
  pixiCanvasId,
  skiaCanvasId,
  canvasWidth,
  canvasHeight,
  backgroundColor,
} = canvasSettings;

const observer = new MutationObserver(() => {
  const pixiViewElement = document.querySelector(
    `#${pixiCanvasId}`
  ) as HTMLCanvasElement;
  if (!pixiViewElement) {
    throw new Error("No view element for PIXI");
  }
  initPixiApplication(
    pixiViewElement,
    canvasWidth,
    canvasHeight,
    backgroundColor
  );

  initSkiaCanvas(skiaCanvasId);

  document
    .querySelector<HTMLElement>("#exportToPDF")!
    .addEventListener("click", () => {
      canvasToPDF(canvasWidth, canvasHeight, drawCallback, "canvas.pdf");
    });

  document
    .querySelector<HTMLElement>("#changeContainer")!
    .addEventListener("click", () => {
      changeContainer();
      updateDrawCallback();
    });
});

observer.observe(mainElement, {
  characterData: false,
  childList: true,
  attributes: false,
});

mainElement.innerHTML = `
<div class="canvas-container" style="width: ${canvasWidth}px;">
    <canvas id="${pixiCanvasId}" width="${canvasWidth}" height="${canvasHeight}"></canvas>
    <canvas id="${skiaCanvasId}" width="${canvasWidth}" height="${canvasHeight}"></canvas>
</div>
<button id="exportToPDF">Export to PDF</button>
<button id="changeContainer">Change container</button>
`;
