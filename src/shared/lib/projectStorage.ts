import { parseTweetDocument } from '../../domain/tweet/schema'
import type { TweetDocument } from '../../domain/tweet/types'

const DATABASE_NAME = 'x-post-mockup-generator'
const STORE_NAME = 'drafts'
const DRAFT_KEY = 'current'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('无法打开浏览器草稿数据库。'))
  })
}

export async function saveDraft(document: TweetDocument): Promise<void> {
  const database = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(structuredClone(document), DRAFT_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('草稿保存失败。'))
      transaction.onabort = () => reject(transaction.error ?? new Error('草稿保存被中止。'))
    })
  } finally {
    database.close()
  }
}

export async function loadDraft(): Promise<TweetDocument | null> {
  const database = await openDatabase()
  try {
    const value = await new Promise<unknown>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(DRAFT_KEY)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('草稿读取失败。'))
    })
    return value === undefined ? null : parseTweetDocument(value)
  } finally {
    database.close()
  }
}
