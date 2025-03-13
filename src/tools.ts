import { Tool } from "./types";

export const TOOLS: Tool[] = [
  {
    title: "Image Converter",
    slug: "image-converter",
    description: "Convert images to different formats",
    icon: "🖼️",
    enabled: false,
  },
  {
    title: "OCR Labeling Tool",
    slug: "ocr-labeling-tool",
    description: "Label characters for Tesseract OCR",
    icon: "🔤",
    enabled: true,
  },
];

// for (var i = 0; i < 20; i++) {
//   TOOLS.push({
//     title: "Test Tool " + i,
//     slug: "test-tool-" + i,
//     description: "Test tool description",
//     icon: "🧪",
//   });
// }
