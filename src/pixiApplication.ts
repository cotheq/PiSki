import * as PIXI from "pixi.js-legacy";
import { containers } from "./pixiContainers";

let initialized = false;
let app: PIXI.Application;
let currentPixiContainer: PIXI.Container | null = null;
let containerIndex = 0;

const defaultContainer = containers[0]; //new PIXI.Container();

const getCurrentPixiContainer = () => currentPixiContainer;
const pixiAppInitialized = () => initialized;

const initPixiApplication = (
  view: HTMLCanvasElement,
  width: number,
  height: number,
  backgroundColor?: PIXI.ColorSource
) => {
  if (!initialized) {
    app = new PIXI.Application({
      view,
      width,
      height,
      forceCanvas: true,
      backgroundColor,
    });
    setCurrentPixiContainer(defaultContainer);
    initialized = true;
  }
};

const setCurrentPixiContainer = (newContainer: PIXI.Container) => {
  currentPixiContainer = newContainer;
  app.stage.removeChildren(0);
  app.stage.addChild(currentPixiContainer);
};

const changeContainer = () => {
  setCurrentPixiContainer(containers[++containerIndex % containers.length]);
};

export {
  initPixiApplication,
  getCurrentPixiContainer,
  setCurrentPixiContainer,
  pixiAppInitialized,
  changeContainer,
};
