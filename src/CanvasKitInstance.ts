import { CanvasKit } from "canvaskit-wasm";
let ck: CanvasKit | null = null;

const getCanvasKitInstance = () => {
  if (ck == null) {
    throw new Error("CanvasKit not initialized");
  }
  return ck;
};

const setCanvasKitInstance = (newInstance: CanvasKit) => {
  if (ck == null && newInstance != null) {
    ck = newInstance;
    return ck;
  } else {
    throw new Error("CanvasKit already initialized");
  }
};

export { getCanvasKitInstance, setCanvasKitInstance };
