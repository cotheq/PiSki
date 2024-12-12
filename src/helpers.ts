/**
 * В этом файле содержатся вспомогательные функции (хелперы) для проекта
 */

import { getCanvasKitInstance } from "./CanvasKitInstance";
import { DrawCallback } from "./types";

const hexToRgba = (hex: number, a: number = 1) => {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return { r, g, b, a };
};

/**
 * Преобразует Uint8Array в файл и инициирует скачивание.
 * @param data - Данные в формате Uint8Array.
 * @param fileName - Имя файла для скачивания.
 * @param mimeType - MIME-тип файла
 */
const downloadUint8ArrayAsFile = (
  data: Uint8Array,
  fileName: string,
  mimeType: string = "application/octet-stream",
) => {
  const blob = new Blob([data], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Функция вызывает метод canvasToPDF, реализованный в WASM-сборке Skia,
 * и отправляет полученный файл на скачивание
 * @param canvasWidth Ширина канваса
 * @param canvasHeight Высота канваса
 * @param drawCallback Функция для рисования на канвасе
 * @param fileName Имя файла
 */
const canvasToPDF = (
  canvasWidth: number,
  canvasHeight: number,
  drawCallback: DrawCallback,
  fileName = "canvas.pdf",
) => {
  const ck = getCanvasKitInstance();
  downloadUint8ArrayAsFile(
    //@ts-ignore
    ck.canvasToPDF(canvasWidth, canvasHeight, drawCallback),
    fileName,
  );
};

export { hexToRgba, canvasToPDF };
