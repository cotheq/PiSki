/**
 * В этом файле задаётся инстанс CanvasKit для всего проекта
 * (что-то вроде singleton)
 */

import { CanvasKit } from "canvaskit-wasm";
let ck: CanvasKit | null = null;

const getCanvasKitInstance = () => {
  if (ck == null) {
    throw new Error("CanvasKit not initialized");
  }
  return ck;
};

const setCanvasKitInstance = (newInstance: CanvasKit) => {
  if (ck == null) {
    ck = newInstance;
  }
  return ck;
};

export { getCanvasKitInstance, setCanvasKitInstance };
