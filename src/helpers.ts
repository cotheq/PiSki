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
 * @param mimeType - MIME-тип файла (по умолчанию application/octet-stream).
 */
const downloadUint8ArrayAsFile = (
  data: Uint8Array,
  fileName: string,
  mimeType: string = "application/octet-stream"
) => {
  // Создаем Blob из Uint8Array
  const blob = new Blob([data], { type: mimeType });

  // Создаем временную ссылку для скачивания
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  // Добавляем ссылку в документ, кликаем по ней и удаляем
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Очищаем временный URL
  URL.revokeObjectURL(link.href);
};

const canvasToPDF = (
  canvasWidth: number,
  canvasHeight: number,
  drawCallback: DrawCallback,
  fileName = "canvas.pdf"
) => {
  const ck = getCanvasKitInstance();
  downloadUint8ArrayAsFile(
    //@ts-ignore
    ck.canvasToPDF(canvasWidth, canvasHeight, drawCallback),
    fileName
  );
};

export { hexToRgba, canvasToPDF };
