const rgbPartToHex = (part) => {
  const number = Number.parseInt(part, 10);
  const hex = number.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

const rgbToHex = (rgb) => {
  const csv = rgb.split("(")[1].split(")")[0];
  const split = csv.split(",");
  const [r, g, b] = [split[0].trim(), split[1].trim(), split[2].trim()];
  return `#${rgbPartToHex(r)}${rgbPartToHex(g)}${rgbPartToHex(b)}`;
};

const hexToRgb = (hex) => {
  const numberPart = hex.split("#")[1];
  const number = parseInt(numberPart, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
};

export { rgbPartToHex, rgbToHex, hexToRgb };
