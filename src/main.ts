import { initPixiApplication } from './pixiContainer';

import './style.css'

const mainElement = document.querySelector<HTMLDivElement>('#app')!;
const pixiViewID = "pixiView";


const observer = new MutationObserver((mutationsList, observer) => {
  //console.log(mutationsList);
  const pixiViewElement = document.querySelector(`#${pixiViewID}`) as HTMLCanvasElement;
  if (!pixiViewElement) {
    throw new DOMException("No view element for PIXI")
  }
  initPixiApplication(pixiViewElement).then(() => console.log("PIXI view initialized"));
});

observer.observe(mainElement, { characterData: false, childList: true, attributes: false });

mainElement.innerHTML = `
<div id="test">
  <canvas id="${pixiViewID}"></canvas>
</div>
`