import { useEffect, useReducer, useRef, useState, type ChangeEvent } from 'react'
import { createHistoryState, historyReducer } from '../domain/tweet/history'
import { sampleTweet } from '../domain/tweet/sample'
import { createProjectFile, parseProjectFile } from '../domain/tweet/schema'
import { EditorSidebar } from '../features/editor/EditorSidebar'
import { downloadBlob, exportPreview } from '../features/export/exportPreview'
import { TweetPreview } from '../features/preview/TweetPreview'
import { loadDraft, saveDraft } from '../shared/lib/projectStorage'
import styles from './App.module.css'

type MobilePane = 'edit' | 'preview'
type SaveState = '正在恢复…' | '正在保存…' | '已保存' | '保存失败'

export default function App() {
  const [history, dispatch] = useReducer(historyReducer, sampleTweet, createHistoryState)
  const tweet = history.present
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveState>('正在恢复…')
  const [ready, setReady] = useState(false)
  const [mobilePane, setMobilePane] = useState<MobilePane>(() =>
    window.location.hash === '#preview' ? 'preview' : 'edit',
  )
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const previewRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const projectInputRef = useRef<HTMLInputElement>(null)
  const previewZoom =
    viewportWidth <= 1024
      ? Math.min(tweet.presentation.zoom, Math.max(0.45, (viewportWidth - 32) / tweet.presentation.canvasWidth))
      : tweet.presentation.zoom

  useEffect(() => {
    let active = true
    loadDraft()
      .then((draft) => {
        if (active && draft) dispatch({ type: 'hydrate', document: draft })
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? `草稿恢复失败：${error.message}` : '草稿恢复失败。')
      })
      .finally(() => {
        if (active) {
          setReady(true)
          setSaveStatus('已保存')
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    setSaveStatus('正在保存…')
    const timer = window.setTimeout(() => {
      saveDraft(tweet)
        .then(() => setSaveStatus('已保存'))
        .catch((error) => {
          setSaveStatus('保存失败')
          setMessage(error instanceof Error ? error.message : '草稿自动保存失败。')
        })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [ready, tweet])

  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      dispatch({ type: event.shiftKey ? 'redo' : 'undo' })
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const setZoom = (zoom: number) =>
    dispatch({
      type: 'update-presentation',
      value: { ...tweet.presentation, zoom: Math.max(0.45, Math.min(1.25, zoom)) },
      historyGroup: 'preview-zoom',
    })
  const fitPreview = () => {
    const stageWidth = stageRef.current?.clientWidth ?? viewportWidth
    const horizontalPadding = viewportWidth <= 1024 ? 32 : 96
    setZoom(Math.min(0.92, (stageWidth - horizontalPadding) / tweet.presentation.canvasWidth))
  }

  const handleExport = async () => {
    if (!previewRef.current || exporting) return
    setExporting(true)
    setMessage('')
    try {
      const result = await exportPreview(previewRef.current, { scale: tweet.presentation.exportScale })
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      downloadBlob(result.blob, `x-post-mockup-${stamp}.png`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PNG 生成失败。')
    } finally {
      setExporting(false)
    }
  }

  const saveProject = () => {
    const blob = new Blob([JSON.stringify(createProjectFile(tweet), null, 2)], { type: 'application/json' })
    downloadBlob(blob, `x-post-project-${new Date().toISOString().slice(0, 10)}.xpost.json`)
  }

  const openProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      if (file.size > 120 * 1024 * 1024) throw new Error('项目文件不能超过 120 MB。')
      const imported = parseProjectFile(JSON.parse(await file.text()) as unknown)
      dispatch({ type: 'replace', document: imported })
      setMessage('项目已打开。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '无法打开项目文件。')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className={styles.app}>
      <input
        ref={projectInputRef}
        className={styles.hiddenInput}
        type="file"
        aria-label="打开项目文件"
        accept=".xpost.json,.json,application/json"
        onChange={(event) => void openProject(event)}
      />
      <div className={styles.desktop}>
        <div className={`${styles.sidebarPane} ${mobilePane === 'preview' ? styles.hidden : ''}`}>
          <EditorSidebar
            tweet={tweet}
            dispatch={dispatch}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            saveStatus={saveStatus}
            onOpenProject={() => projectInputRef.current?.click()}
            onSaveProject={saveProject}
            onReset={() => dispatch({ type: 'replace', document: sampleTweet })}
            onExport={() => void handleExport()}
            exporting={exporting}
            message={message}
          />
        </div>
        <section
          className={`${styles.workspace} ${mobilePane === 'edit' ? styles.hidden : ''}`}
          aria-label="推文实时预览"
        >
          <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
              <button
                className={styles.toolButton}
                type="button"
                aria-label="缩小"
                onClick={() => setZoom(tweet.presentation.zoom - 0.1)}
              >
                −
              </button>
              <span className={styles.zoomText}>{Math.round(previewZoom * 100)}%</span>
              <button
                className={styles.toolButton}
                type="button"
                aria-label="放大"
                onClick={() => setZoom(tweet.presentation.zoom + 0.1)}
              >
                ＋
              </button>
              <button className={styles.toolButton} type="button" onClick={fitPreview}>
                适合窗口
              </button>
            </div>
            <span className={styles.modeText}>600 px · {tweet.presentation.theme === 'light' ? '浅色' : '深色'}</span>
          </div>
          <div ref={stageRef} className={styles.stage}>
            <div className={styles.scaleWrap} style={{ zoom: previewZoom }}>
              <TweetPreview ref={previewRef} document={tweet} />
            </div>
          </div>
        </section>
      </div>
      <nav className={styles.mobileNav} aria-label="移动端面板切换">
        <button
          className={mobilePane === 'edit' ? styles.active : ''}
          type="button"
          onClick={() => setMobilePane('edit')}
        >
          编辑
        </button>
        <button
          className={mobilePane === 'preview' ? styles.active : ''}
          type="button"
          onClick={() => setMobilePane('preview')}
        >
          预览
        </button>
      </nav>
    </main>
  )
}
