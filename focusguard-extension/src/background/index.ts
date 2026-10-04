import { syncDefaultListDnrRules } from './dnr'
import { evaluateDecisionWithAI } from './aiPipeline'
import {
  appendCorrection,
  getManualRules,
  getTemporaryAllows,
  initializeStorageDefaults,
  setManualRules,
  setTemporaryAllows,
} from '../shared/storage'
import { STORAGE_KEYS, type ManualRule, type RuntimeMessage } from '../shared/types'

chrome.runtime.onInstalled.addListener(() => {
  void initializeStorageDefaults().then(syncDefaultListDnrRules)
})

chrome.runtime.onStartup.addListener(() => {
  void syncDefaultListDnrRules()
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return
  if (STORAGE_KEYS.manualRules in changes || STORAGE_KEYS.defaultList in changes) {
    void syncDefaultListDnrRules()
  }
})

async function handleMessage(message: RuntimeMessage): Promise<unknown> {
  switch (message.type) {
    case 'CHECK_URL':
      return evaluateDecisionWithAI({ url: message.url })

    case 'CHECK_TEXT':
      return evaluateDecisionWithAI({
        url: message.url,
        text: message.text,
        title: message.title,
        metaDescription: message.metaDescription,
        headings: message.headings,
        youtube: message.youtube,
      })

    case 'ADD_QUICK_RULE': {
      const rules = await getManualRules()
      const newRule: ManualRule = {
        id: crypto.randomUUID(),
        target: message.target,
        action: message.action,
        value: message.value,
        createdAt: Date.now(),
      }
      // Replace any existing rule for the same target+value so quick actions toggle cleanly.
      const withoutDuplicate = rules.filter((r) => !(r.target === newRule.target && r.value.toLowerCase() === newRule.value.toLowerCase()))
      await setManualRules([...withoutDuplicate, newRule])
      return { ok: true }
    }

    case 'ALLOW_ONCE': {
      const allows = await getTemporaryAllows()
      await setTemporaryAllows([
        ...allows,
        { domain: message.domain, expiresAt: Date.now() + message.minutes * 60_000, reason: message.reason },
      ])
      return { ok: true }
    }

    case 'AI_CORRECTION': {
      const rules = await getManualRules()
      const withoutDuplicate = rules.filter((r) => !(r.target === 'url' && r.value === message.url))
      await setManualRules([
        ...withoutDuplicate,
        { id: crypto.randomUUID(), target: 'url', action: 'allow', value: message.url, createdAt: Date.now(), note: 'AI correction' },
      ])
      await appendCorrection({
        id: crypto.randomUUID(),
        url: message.url,
        title: message.title,
        textExcerpt: message.textExcerpt,
        categoryGiven: message.categoryGiven,
        correctVerdict: 'allow',
        createdAt: Date.now(),
      })
      return { ok: true }
    }

    case 'RULES_CHANGED':
      await syncDefaultListDnrRules()
      return { ok: true }
  }
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  handleMessage(message).then(sendResponse)
  return true
})
