import * as PIXI from "pixi.js";

type InteractiveGraphics = PIXI.Graphics & PIXI.utils.EventEmitter;

let initialized = false;
let pixiContainer: PIXI.Container | null = null;

const getPixiContainer = () => pixiContainer;

const createPixiContainer = () => {
  const mainContainer = new PIXI.Container();
  const subContainer = new PIXI.Container();
  const g1: InteractiveGraphics = new PIXI.Graphics();
  const g2: InteractiveGraphics = new PIXI.Graphics();
  const g3: InteractiveGraphics = new PIXI.Graphics();
  const g4: InteractiveGraphics = new PIXI.Graphics();

  g1.eventMode = "static";
  g2.eventMode = "static";


  g1.beginFill("#ff0000").drawEllipse(0, 0, 100, 60).endFill();
  g1.position.set(200, 100);
  g1.angle = 90;
  g2.beginFill("#0000ff").drawRect(0, 0, 100, 100).endFill();
  g2.position.set(120, 60);
  g2.angle = 30;
  g2.scale.set(2, 1);
  g1.on("pointerdown", () => {
    console.log("g1 pointerdown!");
  });
  g2.on("pointerup", () => {
    console.log("g2 pointerup!");
  });
  g3.lineStyle({width: 10, color: "#ffffff", alpha: 1, cap: PIXI.LINE_CAP.ROUND}).moveTo(-0, -0).lineTo(150, 100);
  g3.angle = -20;
  g4.lineStyle({width: 15, color: "#00ff00", alpha: 0.7, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND}).moveTo(-100, 0).lineTo(150, -30).lineTo(200, -100).lineTo(150, -100);
  g4.angle = 70;
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
