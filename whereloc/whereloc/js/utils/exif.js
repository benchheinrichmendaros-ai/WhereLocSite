// ==========================================================================
// js/utils/exif.js
// Re-encodes an image through <canvas> before upload. Canvas export never
// carries over EXIF metadata, which is what we want: it silently strips
// GPS coordinates and any other metadata embedded by the photographer's
// camera/phone, without needing a third-party library.
//
// `imageOrientation: "from-image"` makes the browser apply the original
// EXIF rotation before stripping it, so photos still look right-side-up.
// ==========================================================================

const MAX_DIMENSION = 1920; // caps upload size; also a free compression win

export async function stripExifAndCompress(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85)
  );

  // Keep a recognizable filename, but force a clean extension.
  const cleanName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], cleanName, { type: "image/jpeg" });
}
