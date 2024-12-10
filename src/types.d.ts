import { Canvas } from "canvaskit-wasm";

export type DrawCallback = (c: Canvas) => void;

export interface IDrawFunctionOptions {
  canvas: Canvas;
  matrix: Float32Array;
  fillStyle: PIXI.FillStyle;
  lineStyle: PIXI.LineStyle;
}
