import * as PIXI from "pixi.js-legacy";

let initialized = false;
let currentPixiContainer: PIXI.Container | null = null;

const getPixiContainer = () => currentPixiContainer;

const createPixiContainer = () => {
  //This is an example
  const mainContainer = new PIXI.Container();
  const subContainer = new PIXI.Container();
  const g1 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
  const g2 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
  const g3 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
  const g4 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
  const g5 = new PIXI.Graphics();
  const g6 = new PIXI.Graphics();

  g1.eventMode = "static";
  g2.eventMode = "static";

  g1.beginFill("#ff0000").drawEllipse(0, 0, 100, 60).endFill();
  g1.position.set(100, 60);

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
  g3.lineStyle({
    width: 10,
    color: "#ffffff",
    alpha: 1,
    cap: PIXI.LINE_CAP.ROUND,
  })
    .moveTo(-0, -0)
    .lineTo(150, 100);
  g3.angle = -20;
  g4.lineStyle({
    width: 15,
    color: "#00ff00",
    alpha: 0.7,
    cap: PIXI.LINE_CAP.ROUND,
    join: PIXI.LINE_JOIN.ROUND,
  })
    .moveTo(-100, 0)
    .lineTo(150, -30)
    .lineTo(200, -100)
    .lineTo(150, -100);
  g4.angle = 70;
  g5.beginFill("#666666", 0.5).drawCircle(200, 200, 70).endFill();
  g5.position.set(0, 0);
  g6.beginFill("#999999", 0.7).drawEllipse(100, 100, 100, 100).endFill();
  g6.angle = -45;
  subContainer.position.set(300, 200);
  subContainer.addChild(g3, g4, g6);
  mainContainer.addChild(subContainer, g1, g2, g5);
  return mainContainer;
};

const initPixiApplication = (
  view: HTMLCanvasElement,
  width: number,
  height: number,
  backgroundColor?: PIXI.ColorSource
) => {
  if (initialized) {
    console.log("Pixi application already initialized");
    return;
  }

  const app = new PIXI.Application({
    view,
    width,
    height,
    forceCanvas: true,
    backgroundColor,
  });
  currentPixiContainer = createPixiContainer();
  
  //TODO: Добавить возможность менять PIXI контейнеры
  app.stage.addChild(currentPixiContainer);

  initialized = true;
};

export { initPixiApplication, getPixiContainer };
