const RASTER_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_DIMENSION = 4096;
const MAX_IMAGE_INPUT_BYTES = 20 * 1024 * 1024;

const OUTPUT_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
};

const PASSTHROUGH_MEDIA_TYPES = new Set([
  'video/mp4', 'video/webm', 'video/ogg',
  'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm',
]);

function bytesEqual(bytes, expected, offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function asciiAt(bytes, value, offset) {
  return bytesEqual(bytes, Array.from(value, character => character.charCodeAt(0)), offset);
}

async function hasExpectedSignature(file) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  switch (file.type) {
    case 'image/jpeg': return bytesEqual(bytes, [0xff, 0xd8, 0xff]);
    case 'image/png': return bytesEqual(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/gif': return asciiAt(bytes, 'GIF8', 0);
    case 'image/webp': return asciiAt(bytes, 'RIFF', 0) && asciiAt(bytes, 'WEBP', 8);
    case 'video/mp4': return asciiAt(bytes, 'ftyp', 4);
    case 'video/webm':
    case 'audio/webm': return bytesEqual(bytes, [0x1a, 0x45, 0xdf, 0xa3]);
    case 'video/ogg':
    case 'audio/ogg': return asciiAt(bytes, 'OggS', 0);
    case 'audio/wav': return asciiAt(bytes, 'RIFF', 0) && asciiAt(bytes, 'WAVE', 8);
    case 'audio/mpeg': return asciiAt(bytes, 'ID3', 0) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
    default: return false;
  }
}

function safeFilename(file, type) {
  const basename = file.name.replace(/\.[^.]+$/, '') || 'media';
  return `${basename}.${OUTPUT_EXTENSION[type]}`;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('The image could not be prepared safely.')),
      type,
      quality,
    );
  });
}

async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(file);
  if (typeof document === 'undefined' || typeof Image === 'undefined' || typeof URL === 'undefined') {
    throw new Error('Your browser cannot safely prepare this image. Try a current browser.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = objectUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('The selected image could not be decoded safely.'));
    });
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      image,
      close() {},
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Re-encode browser-decodable images before public upload. Drawing pixels onto a
 * fresh canvas removes EXIF/GPS and other embedded metadata. GIF uploads become
 * a static PNG so their metadata and active animation are not retained.
 */
export async function sanitizeUploadFile(file) {
  if (!file || (!RASTER_IMAGE_TYPES.has(file.type) && !PASSTHROUGH_MEDIA_TYPES.has(file.type))) {
    throw new Error('This file format cannot be prepared safely for upload.');
  }
  if (!(await hasExpectedSignature(file))) {
    throw new Error('The file contents do not match the selected file type.');
  }
  if (!file.type.startsWith('image/')) {
    return new File([file], safeFilename(file, file.type), {
      type: file.type,
      lastModified: file.lastModified,
    });
  }
  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    throw new Error('Images must be 20 MB or smaller.');
  }
  if (typeof document === 'undefined') {
    throw new Error('Your browser cannot safely prepare this image. Try a current browser.');
  }

  const bitmap = await decodeImage(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: file.type !== 'image/jpeg' });
    if (!context) throw new Error('The image could not be prepared safely.');
    context.drawImage(bitmap.image || bitmap, 0, 0, width, height);

    const outputType = file.type === 'image/gif' ? 'image/png' : file.type;
    const blob = await canvasToBlob(canvas, outputType, outputType === 'image/jpeg' ? 0.9 : undefined);
    return new File([blob], safeFilename(file, outputType), {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
