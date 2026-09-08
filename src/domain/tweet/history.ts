import type {
  Author,
  PresentationSettings,
  QuoteTweet,
  ReplyTweet,
  TweetContent,
  TweetDocument,
  TweetMedia,
  TweetMetrics,
} from './types'

export type TweetAction =
  | { type: 'update-author'; value: Author; historyGroup?: string }
  | { type: 'update-content'; value: TweetContent; historyGroup?: string }
  | { type: 'update-media'; value: TweetMedia; historyGroup?: string }
  | { type: 'update-quote'; value: QuoteTweet; historyGroup?: string }
  | { type: 'update-reply'; value: ReplyTweet; historyGroup?: string }
  | { type: 'update-metrics'; value: TweetMetrics; historyGroup?: string }
  | { type: 'update-presentation'; value: PresentationSettings; historyGroup?: string }
  | { type: 'replace'; document: TweetDocument }

export type HistoryAction =
  | TweetAction
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'hydrate'; document: TweetDocument }

export interface TweetHistoryState {
  past: TweetDocument[]
  present: TweetDocument
  future: TweetDocument[]
  lastGroup: string | null
  lastChangeAt: number
}

const HISTORY_LIMIT = 100
export const HISTORY_MERGE_WINDOW_MS = 650

export function createHistoryState(document: TweetDocument): TweetHistoryState {
  return { past: [], present: structuredClone(document), future: [], lastGroup: null, lastChangeAt: 0 }
}

export function applyTweetAction(document: TweetDocument, action: TweetAction): TweetDocument {
  switch (action.type) {
    case 'update-author':
      return { ...document, author: action.value }
    case 'update-content':
      return { ...document, content: action.value }
    case 'update-media':
      return { ...document, media: action.value }
    case 'update-quote':
      return { ...document, quote: action.value }
    case 'update-reply':
      return { ...document, reply: action.value }
    case 'update-metrics':
      return { ...document, metrics: action.value }
    case 'update-presentation':
      return { ...document, presentation: action.value }
    case 'replace':
      return structuredClone(action.document)
  }
}

export function historyReducer(state: TweetHistoryState, action: HistoryAction): TweetHistoryState {
  if (action.type === 'hydrate') return createHistoryState(action.document)
  if (action.type === 'undo') {
    const previous = state.past.at(-1)
    if (!previous) return state
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
      lastGroup: null,
      lastChangeAt: 0,
    }
  }
  if (action.type === 'redo') {
    const next = state.future[0]
    if (!next) return state
    return {
      past: [...state.past, state.present].slice(-HISTORY_LIMIT),
      present: next,
      future: state.future.slice(1),
      lastGroup: null,
      lastChangeAt: 0,
    }
  }
  const next = applyTweetAction(state.present, action)
  const now = Date.now()
  const group = action.type === 'replace' ? undefined : action.historyGroup
  const merge = Boolean(group && group === state.lastGroup && now - state.lastChangeAt <= HISTORY_MERGE_WINDOW_MS)
  return {
    past: merge ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    lastGroup: group ?? null,
    lastChangeAt: now,
  }
}
