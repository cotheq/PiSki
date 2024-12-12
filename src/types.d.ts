import { Canvas } from "canvaskit-wasm";

export type DrawCallback = (c: Canvas, savePaths?: boolean) => void;

export interface IDrawFunctionOptions {
  canvas: Canvas;
  matrix: Float32Array;
  fillStyle?: PIXI.FillStyle;
  lineStyle?: PIXI.LineStyle;
}
