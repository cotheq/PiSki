const hexToRgba = (hex: number, a: number = 1) => {
  const r = (hex >> 16) & 0xff; // Извлекаем красный канал
  const g = (hex >> 8) & 0xff; // Извлекаем зелёный канал
  const b = hex & 0xff; // Извлекаем синий канал
  return { r, g, b, a }; // Возвращаем массив RGBA
}







export {hexToRgba as hexToRgba}