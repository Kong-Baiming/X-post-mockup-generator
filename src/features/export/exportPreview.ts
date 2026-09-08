type Scale = 1 | 2 | 3 | 4
type Renderer = (node: HTMLElement, options: Record<string, unknown>) => Promise<Blob | null>

export interface ExportPreviewOptions {
  scale: Scale
  timeoutMs?: number
  renderer?: Renderer
}

export interface ExportPreviewResult {
  blob: Blob
  width: number
  height: number
}

const MAX_SIDE = 16_384
const MAX_PIXELS = 64_000_000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function waitForImages(root: HTMLElement): Promise<void> {
  await Promise.all(
    Array.from(root.querySelectorAll('img')).map(async (image) => {
      if (!image.complete)
        await new Promise<void>((resolve, reject) => {
          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => reject(new Error(`图片加载失败：${image.alt || '未命名图片'}`)), {
            once: true,
          })
        })
      if (image.naturalWidth === 0) throw new Error(`图片加载失败：${image.alt || '未命名图片'}`)
      await image.decode().catch(() => undefined)
    }),
  )
}

function waitForStableLayout(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

export async function exportPreview(source: HTMLElement, options: ExportPreviewOptions): Promise<ExportPreviewResult> {
  const timeoutMs = options.timeoutMs ?? 15_000
  const host = document.createElement('div')
  const clone = source.cloneNode(true) as HTMLElement
  host.dataset.exportHost = 'true'
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    width: `${source.dataset.canvasWidth || 600}px`,
    zIndex: '-1',
    pointerEvents: 'none',
  })
  Object.assign(clone.style, { display: 'block', visibility: 'visible', transform: 'none', zoom: '1' })
  clone.dataset.exportClone = 'true'
  host.append(clone)
  document.body.append(host)

  try {
    const renderer = options.renderer ?? (await import('modern-screenshot')).domToBlob
    await withTimeout(
      Promise.all([document.fonts.ready, waitForImages(clone)]).then(() => undefined),
      timeoutMs,
      '等待字体或图片超时，请检查媒体文件。',
    )
    await withTimeout(waitForStableLayout(), timeoutMs, '等待预览布局稳定超时。')
    const width = clone.offsetWidth
    const height = clone.offsetHeight
    if (!width || !height) throw new Error('预览尺寸无效，无法生成 PNG。')
    const outputWidth = width * options.scale
    const outputHeight = height * options.scale
    if (outputWidth > MAX_SIDE || outputHeight > MAX_SIDE || outputWidth * outputHeight > MAX_PIXELS)
      throw new Error('导出尺寸超过浏览器上限，请降低倍率或缩短内容。')
    const blob = await withTimeout(
      renderer(clone, {
        width,
        height,
        scale: options.scale,
        backgroundColor: getComputedStyle(clone).backgroundColor,
      }),
      timeoutMs,
      'PNG 生成超时，请降低倍率后重试。',
    )
    if (!blob) throw new Error('PNG 生成失败，请降低导出倍率后重试。')
    return { blob, width: outputWidth, height: outputHeight }
  } finally {
    host.remove()
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
