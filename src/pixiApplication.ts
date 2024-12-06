import * as PIXI from "pixi.js";

let initialized = false;
let pixiContainer: PIXI.Container | null = null;

const getPixiContainer = () => pixiContainer;

const createPixiContainer = () => {
  const mainContainer = new PIXI.Container();
  const subContainer = new PIXI.Container();
  const g1 = new PIXI.Graphics();
  const g2 = new PIXI.Graphics();
  const g3 = new PIXI.Graphics();
  const g4 = new PIXI.Graphics();

  g1.eventMode = "static";
  g2.eventMode = "static";

  g1.beginFill("#ff0000").drawEllipse(0, 0, 200, 100).endFill();
  g1.position.set(200, 100);
  g1.angle = 30;
  g2.beginFill("#0000ff").drawRect(-50, -75, 100, 150).endFill();
  g2.position.set(120, 60);
  g2.angle = 15;
  g2.scale.set(1.5, 1.7);
  g1.on("pointerdown", () => {
    console.log("g1 pointerdown!");
  });
  g2.on("pointerup", () => {
    console.log("g2 pointerup!");
  });
  g3.lineStyle(10, "#ffffff", 1).moveTo(0, 0).lineTo(150, 100);
  g3.angle = -20;
  g4.lineStyle(10, "#ffff00", 1).moveTo(0, 70).lineTo(150, -30);
  g4.angle = 20;
  subContainer.position.set(300, 200);
  subContainer.addChild(g3, g4);
  mainContainer.addChild(subContainer, g1, g2);
  return mainContainer;
};

const initPixiApplication = (view: HTMLCanvasElement, width: number, height: number) => {
  if (initialized) {
    console.log("Pixi application already initialized")
    return
  };
  
  const app = new PIXI.Application({ view, width, height });
  pixiContainer = createPixiContainer();
  app.stage.addChild(pixiContainer);

  initialized = true;
};

export { initPixiApplication, getPixiContainer };
