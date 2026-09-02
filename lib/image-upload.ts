/**
 * Client-side image preparation for admin uploads.
 *
 * The catalog is photographed on phones, so a single product shot routinely
 * arrives as a 4–8 MB, 4000px JPEG. Sending that unchanged is what made adding
 * images feel slow: on a typical Pakistani upstream link a 6 MB file is ~40
 * seconds, and the admin sat watching a frozen form for every single product.
 *
 * Resizing to catalog dimensions in the browser first turns that into roughly
 * 150–300 KB — commonly a 20–40x reduction, so the same upload finishes in
 * about a second. It also spares the server the decode/resize work and keeps
 * the media directory from filling with originals nobody displays at full size.
 *
 * Nothing here is destructive: the file on the admin's disk is untouched, and
 * anything that cannot be processed (an unusual codec, a browser without
 * canvas) falls through to the original file rather than failing the upload.
 */

/** Longest edge, in CSS pixels, that the storefront ever renders. */
const MAX_EDGE = 1600
const QUALITY = 0.85
/** Below this, re-encoding tends to cost more bytes than it saves. */
const SKIP_UNDER_BYTES = 200 * 1024

export type PreparedImage = {
  file: File
  /** Bytes before processing, for the "saved X%" readout. */
  originalSize: number
  /** True when the original was sent unchanged. */
  passthrough: boolean
}

function loadBitmap(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')) }
    img.src = url
  })
}

function canvasToFile(
  canvas: HTMLCanvasElement, name: string, type: string,
): Promise<File | null> {
  return new Promise(resolve => {
    canvas.toBlob(
      blob => resolve(blob ? new File([blob], name, { type: blob.type }) : null),
      type,
      QUALITY,
    )
  })
}

/**
 * Downscale and re-encode one image for upload.
 *
 * Always resolves — on any failure the original file is returned, because a
 * slightly slow upload beats a lost one.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const originalSize = file.size
  const passthrough = { file, originalSize, passthrough: true }

  // SVGs are vectors (resizing them rasterises and ruins them), GIFs may be
  // animated (canvas keeps only the first frame), and small files gain nothing.
  if (
    typeof document === 'undefined' ||
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif' ||
    file.size < SKIP_UNDER_BYTES
  ) {
    return passthrough
  }

  try {
    const img = await loadBitmap(file)
    const longest = Math.max(img.naturalWidth, img.naturalHeight)
    const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1

    const width = Math.round(img.naturalWidth * scale)
    const height = Math.round(img.naturalHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return passthrough
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // PNGs are kept as PNG so logos and cut-outs keep their transparency; a
    // white JPEG box behind a transparent product shot looks broken on a card.
    const keepAlpha = file.type === 'image/png' || file.type === 'image/webp'
    if (!keepAlpha) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
    }
    ctx.drawImage(img, 0, 0, width, height)

    const outType = keepAlpha ? 'image/webp' : 'image/jpeg'
    const ext = keepAlpha ? 'webp' : 'jpg'
    const base = file.name.replace(/\.[^.]+$/, '') || 'image'
    const out = await canvasToFile(canvas, `${base}.${ext}`, outType)

    // Only keep the result if it is actually smaller — an already-optimised
    // file can come out bigger after a round trip through canvas.
    if (!out || out.size >= originalSize) return passthrough
    return { file: out, originalSize, passthrough: false }
  } catch {
    return passthrough
  }
}

/** Human-readable byte size, e.g. "4.2 MB". */
export function formatBytes(bytes: number): string {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Run async tasks with a bounded number in flight.
 *
 * Firing 200 uploads at once does not make them finish sooner — the browser
 * caps connections per host anyway, and the ones queued behind stall the whole
 * batch. A small pool keeps the link saturated while progress stays smooth and
 * a failure only affects its own item.
 */
export async function runPooled<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0

  const runner = async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await worker(items[index], index)
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, runner),
  )
  return results
}

/**
 * Normalise a value for filename matching: lowercase, alphanumerics only.
 *
 * Catalog numbers are written inconsistently — "NXB-63 1P 16A", "nxb63_1p16a",
 * "NXB 63/1P/16A" all mean the same breaker — so comparing raw strings matches
 * almost nothing. Stripping the separators is what makes a dropped folder of
 * photos actually land on the right products.
 */
export function matchKey(value: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Filename without its extension or a trailing "-1" / "(2)" style suffix. */
export function fileStem(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_ ]*\(?\d{1,2}\)?$/, '')
    .trim()
}
