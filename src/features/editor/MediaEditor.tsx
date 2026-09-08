import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import type { ImageMediaItem, MediaLayout, TweetMedia } from '../../domain/tweet/types'
import { formatVideoRemaining, formatVideoTime } from '../../shared/lib/format'
import { ACCEPTED_IMAGE_TYPES, createMediaId, readImage } from '../../shared/lib/imageFiles'
import { CheckIcon, MoveLeftIcon, MoveRightIcon, ReplaceIcon, TrashIcon } from './EditorIcons'
import { ImageIcon } from '../../vendor/x/XIcons'
import { PanelSelect } from './PanelSelect'
import { DeferredNumberInput } from './EditorControls'
import styles from './EditorSidebar.module.css'

function normalizeSeconds(value: string | number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
}

export function MediaEditor({
  media,
  onChange,
  onError,
}: {
  media: TweetMedia
  onChange: (media: TweetMedia, historyGroup?: string) => void
  onError: (message: string) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const frameRef = useRef<number | null>(null)
  const pendingRef = useRef<ImageMediaItem | null>(null)
  const selected =
    media.kind === 'images' ? media.items[Math.min(selectedIndex, Math.max(0, media.items.length - 1))] : undefined
  const imageCount = media.kind === 'images' ? media.items.length : 0

  useEffect(() => {
    if (media.kind === 'images') setSelectedIndex((current) => Math.max(0, Math.min(current, imageCount - 1)))
  }, [media.kind, imageCount])

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    },
    [],
  )

  const setKind = (kind: string) => {
    if (kind === 'video') {
      const source = media.kind === 'images' ? media.items[0] : undefined
      onChange({
        kind: 'video',
        coverUrl: source?.src ?? '',
        durationSeconds: 30,
        currentTimeSeconds: 0,
        width: source?.width ?? 1600,
        height: source?.height ?? 900,
      })
      return
    }
    const source =
      media.kind === 'video' && media.coverUrl
        ? [
            {
              id: createMediaId(),
              src: media.coverUrl,
              alt: '图片',
              width: media.width,
              height: media.height,
              cropX: 50,
              cropY: 50,
            },
          ]
        : []
    onChange({ kind: 'images', layout: 'grid', activeIndex: 0, items: source })
  }

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, media.kind === 'images' ? 4 - media.items.length : 1)
    if (!files.length) return
    try {
      onError('')
      const loaded = await Promise.all(files.map(readImage))
      if (media.kind === 'video') {
        onChange({ ...media, coverUrl: loaded[0].src, width: loaded[0].width, height: loaded[0].height })
      } else {
        const added = loaded.map((item, index) => ({
          ...item,
          id: createMediaId(),
          alt: files[index].name,
          cropX: 50,
          cropY: 50,
        }))
        onChange({ ...media, items: [...media.items, ...added].slice(0, 4) })
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : '无法读取图片。')
    } finally {
      event.target.value = ''
    }
  }

  const replace = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || media.kind !== 'images') return
    try {
      onError('')
      const loaded = await readImage(file)
      onChange({
        ...media,
        items: media.items.map((item, index) =>
          index === selectedIndex ? { ...item, ...loaded, alt: file.name } : item,
        ),
      })
    } catch (error) {
      onError(error instanceof Error ? error.message : '无法读取图片。')
    } finally {
      event.target.value = ''
    }
  }

  const updateSelected = (update: (item: ImageMediaItem) => ImageMediaItem, historyGroup?: string) => {
    if (media.kind !== 'images') return
    onChange(
      { ...media, items: media.items.map((item, index) => (index === selectedIndex ? update(item) : item)) },
      historyGroup,
    )
  }
  const scheduleSelected = (item: ImageMediaItem) => {
    pendingRef.current = item
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const pending = pendingRef.current
      if (pending && media.kind === 'images')
        onChange(
          { ...media, items: media.items.map((current, index) => (index === selectedIndex ? pending : current)) },
          'media-crop',
        )
    })
  }
  const updateCropFromPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.type === 'pointermove' && !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (!selected) return
    scheduleSelected({
      ...selected,
      cropX: Math.round(Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))),
      cropY: Math.round(Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))),
    })
  }
  const updateCropFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!selected) return
    const step = event.shiftKey ? 10 : 1
    let cropX = selected.cropX
    let cropY = selected.cropY
    if (event.key === 'ArrowLeft') cropX = Math.max(0, cropX - step)
    else if (event.key === 'ArrowRight') cropX = Math.min(100, cropX + step)
    else if (event.key === 'ArrowUp') cropY = Math.max(0, cropY - step)
    else if (event.key === 'ArrowDown') cropY = Math.min(100, cropY + step)
    else return
    event.preventDefault()
    updateSelected((item) => ({ ...item, cropX, cropY }), 'media-crop')
  }
  const move = (direction: -1 | 1) => {
    if (media.kind !== 'images') return
    const target = selectedIndex + direction
    if (target < 0 || target >= media.items.length) return
    const items = [...media.items]
    ;[items[selectedIndex], items[target]] = [items[target], items[selectedIndex]]
    onChange({ ...media, items })
    setSelectedIndex(target)
  }
  const remove = () => {
    if (media.kind !== 'images') return
    const items = media.items.filter((_, index) => index !== selectedIndex)
    onChange({ ...media, items, activeIndex: Math.min(media.activeIndex, Math.max(0, items.length - 1)) })
    setSelectedIndex(Math.max(0, Math.min(selectedIndex, items.length - 1)))
  }

  return (
    <div className={styles.mediaEditorRoot}>
      <div className={styles.row}>
        <span className={styles.label}>媒体类型</span>
        <span>
          <PanelSelect
            label="媒体类型"
            value={media.kind}
            onValueChange={setKind}
            options={[
              ['images', '图片'],
              ['video', '视频封面'],
            ]}
          />
        </span>
      </div>
      {media.kind === 'images' ? (
        <div className={styles.row}>
          <span className={styles.label}>图片样式</span>
          <span>
            <PanelSelect
              label="图片样式"
              value={media.layout}
              onValueChange={(value) => onChange({ ...media, layout: value as MediaLayout })}
              options={[
                ['grid', '拼图'],
                ['carousel', '横向滑动'],
              ]}
            />
          </span>
        </div>
      ) : null}
      {media.kind === 'video' ? (
        <>
          <div className={styles.row}>
            <span className={styles.label}>总时长（秒）</span>
            <span>
              <DeferredNumberInput
                label="总时长（秒）"
                value={media.durationSeconds}
                onCommit={(value) => {
                  const durationSeconds = normalizeSeconds(value)
                  onChange({
                    ...media,
                    durationSeconds,
                    currentTimeSeconds: Math.min(normalizeSeconds(media.currentTimeSeconds), durationSeconds),
                  })
                }}
              />
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>播放到（秒）</span>
            <span>
              <DeferredNumberInput
                label="播放到（秒）"
                value={media.currentTimeSeconds}
                max={media.durationSeconds}
                onCommit={(value) =>
                  onChange({ ...media, currentTimeSeconds: Math.min(normalizeSeconds(value), media.durationSeconds) })
                }
              />
            </span>
          </div>
          <label className={styles.stack}>
            <span className={styles.rangeHeading}>
              <span className={styles.label}>播放进度</span>
              <output>
                {formatVideoTime(media.currentTimeSeconds)} / {formatVideoTime(media.durationSeconds)}
              </output>
            </span>
            <input
              className={styles.crop}
              style={
                {
                  '--range-progress': `${media.durationSeconds > 0 ? (media.currentTimeSeconds / media.durationSeconds) * 100 : 0}%`,
                } as CSSProperties
              }
              type="range"
              min="0"
              max={Math.max(1, media.durationSeconds)}
              step="1"
              value={Math.min(media.currentTimeSeconds, Math.max(1, media.durationSeconds))}
              disabled={media.durationSeconds <= 0}
              onInput={(event) =>
                onChange({
                  ...media,
                  currentTimeSeconds: Math.min(media.durationSeconds, normalizeSeconds(event.currentTarget.value)),
                })
              }
            />
            <span className={styles.videoTimeHint}>
              画面左下角显示剩余 {formatVideoRemaining(media.durationSeconds, media.currentTimeSeconds)}
            </span>
          </label>
        </>
      ) : null}
      <label className={styles.upload}>
        <ImageIcon />
        {media.kind === 'images' ? '添加图片' : '更换封面'}
        <input
          type="file"
          multiple={media.kind === 'images'}
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={(event) => void upload(event)}
        />
      </label>
      {media.kind === 'video' && media.coverUrl ? (
        <div className={styles.videoAssetPreview}>
          <img src={media.coverUrl} alt="视频封面" />
          <span>{formatVideoRemaining(media.durationSeconds, media.currentTimeSeconds)}</span>
        </div>
      ) : null}
      {media.kind === 'images' ? (
        <>
          <div className={styles.mediaList}>
            {media.items.map((item, index) => (
              <button
                className={`${styles.mediaItem} ${index === selectedIndex ? styles.mediaItemSelected : ''}`}
                type="button"
                aria-label={`编辑第 ${index + 1} 张图片`}
                onClick={() => setSelectedIndex(index)}
                key={item.id}
              >
                <img src={item.src} alt={item.alt} style={{ objectPosition: `${item.cropX}% ${item.cropY}%` }} />
                <span className={styles.mediaIndex}>{index + 1}</span>
                {index === selectedIndex ? (
                  <span className={styles.selectedMark}>
                    <CheckIcon />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {selected ? (
            <div className={styles.cropEditor}>
              <div className={styles.cropEditorTitle}>
                <strong>编辑第 {selectedIndex + 1} 张</strong>
                <span>点击或拖动图片设置焦点</span>
              </div>
              <button
                type="button"
                className={styles.cropPreview}
                aria-label="图片裁切焦点，可用方向键微调"
                onKeyDown={updateCropFromKeyboard}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  updateCropFromPointer(event)
                }}
                onPointerMove={updateCropFromPointer}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId))
                    event.currentTarget.releasePointerCapture(event.pointerId)
                }}
                onPointerCancel={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId))
                    event.currentTarget.releasePointerCapture(event.pointerId)
                }}
              >
                <img
                  src={selected.src}
                  alt={selected.alt}
                  style={{ objectPosition: `${selected.cropX}% ${selected.cropY}%` }}
                  draggable={false}
                />
                <span className={styles.focalPoint} style={{ left: `${selected.cropX}%`, top: `${selected.cropY}%` }} />
              </button>
              <div className={styles.cropGroup}>
                <label className={styles.stack}>
                  <span className={styles.rangeHeading}>
                    <span className={styles.label}>水平焦点</span>
                    <output>{selected.cropX}%</output>
                  </span>
                  <input
                    aria-label="图片水平焦点"
                    className={styles.crop}
                    style={{ '--range-progress': `${selected.cropX}%` } as CSSProperties}
                    type="range"
                    min="0"
                    max="100"
                    value={selected.cropX}
                    onInput={(event) =>
                      updateSelected((item) => ({ ...item, cropX: Number(event.currentTarget.value) }), 'media-crop')
                    }
                  />
                </label>
                <label className={styles.stack}>
                  <span className={styles.rangeHeading}>
                    <span className={styles.label}>垂直焦点</span>
                    <output>{selected.cropY}%</output>
                  </span>
                  <input
                    aria-label="图片垂直焦点"
                    className={styles.crop}
                    style={{ '--range-progress': `${selected.cropY}%` } as CSSProperties}
                    type="range"
                    min="0"
                    max="100"
                    value={selected.cropY}
                    onInput={(event) =>
                      updateSelected((item) => ({ ...item, cropY: Number(event.currentTarget.value) }), 'media-crop')
                    }
                  />
                </label>
              </div>
              <div className={styles.mediaEditorActions}>
                <button type="button" disabled={selectedIndex === 0} onClick={() => move(-1)}>
                  <MoveLeftIcon />
                  前移
                </button>
                <button type="button" disabled={selectedIndex === media.items.length - 1} onClick={() => move(1)}>
                  <MoveRightIcon />
                  后移
                </button>
                <label className={styles.editorReplace}>
                  <ReplaceIcon />
                  替换
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={(event) => void replace(event)}
                  />
                </label>
                <button className={styles.editorDelete} type="button" onClick={remove}>
                  <TrashIcon />
                  删除
                </button>
              </div>
            </div>
          ) : null}
          {media.layout === 'carousel' && media.items.length > 1 ? (
            <label className={styles.row}>
              <span className={styles.label}>当前图片</span>
              <span>
                <input
                  className={styles.crop}
                  style={
                    { '--range-progress': `${(media.activeIndex / (media.items.length - 1)) * 100}%` } as CSSProperties
                  }
                  type="range"
                  min="0"
                  max={media.items.length - 1}
                  value={Math.min(media.activeIndex, media.items.length - 1)}
                  onInput={(event) => onChange({ ...media, activeIndex: Number(event.currentTarget.value) })}
                />
              </span>
            </label>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
