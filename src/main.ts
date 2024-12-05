import { getPixiContainer, initPixiApplication } from "./pixiContainer";

import "./style.css";

const mainElement = document.querySelector<HTMLDivElement>("#app")!;
const pixiCanvasID = "pixiCanvas";

const observer = new MutationObserver(() => {
  if (getPixiContainer() == null) {
    const pixiViewElement = document.querySelector(
      `#${pixiCanvasID}`
    ) as HTMLCanvasElement;
    if (!pixiViewElement) {
      throw new DOMException("No view element for PIXI");
    }
    initPixiApplication(pixiViewElement);
  }
});

observer.observe(mainElement, {
  characterData: false,
  childList: true,
  attributes: false,
});

mainElement.innerHTML = `
<div id="test">
  <canvas id="${pixiCanvasID}"></canvas>
</div>
`;
