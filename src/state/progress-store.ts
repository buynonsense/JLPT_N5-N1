import type { PluginSettings } from "../types"
import { DEFAULT_SETTINGS } from "../settings"


interface StoreIO {
  loadData: () => Promise<unknown>
  saveData: (value: PluginSettings) => Promise<void>
}


function cloneDefaultSettings(): PluginSettings {
  return {
    ...DEFAULT_SETTINGS,
    selectedLevels: [...DEFAULT_SETTINGS.selectedLevels],
    progress: {},
  }
}


export function createProgressStore(io: StoreIO) {
  let statePromise: Promise<PluginSettings> | null = null

  async function getState(): Promise<PluginSettings> {
    if (!statePromise) {
      statePromise = io.loadData().then((loaded) => {
        if (!loaded || typeof loaded !== "object") {
          return cloneDefaultSettings()
        }
        return {
          ...cloneDefaultSettings(),
          ...(loaded as Partial<PluginSettings>),
          selectedLevels: Array.isArray((loaded as Partial<PluginSettings>).selectedLevels)
            ? [...((loaded as Partial<PluginSettings>).selectedLevels as PluginSettings["selectedLevels"])]
            : [...DEFAULT_SETTINGS.selectedLevels],
          progress:
            typeof (loaded as Partial<PluginSettings>).progress === "object" &&
            (loaded as Partial<PluginSettings>).progress !== null
              ? { ...((loaded as Partial<PluginSettings>).progress as PluginSettings["progress"]) }
              : {},
        }
      })
    }
    return statePromise
  }

  async function persist(state: PluginSettings): Promise<void> {
    statePromise = Promise.resolve(state)
    await io.saveData(state)
  }

  async function markDone(id: string): Promise<void> {
    await setDone(id, true)
  }

  async function setDone(id: string, done: boolean): Promise<void> {
    const state = await getState()
    const existing = state.progress[id]
    state.progress[id] = {
      done,
      doneAt: done ? new Date().toISOString() : undefined,
      lastViewedAt: existing?.lastViewedAt,
      reviewCount: existing?.reviewCount ?? 0,
    }
    await persist(state)
  }

  async function markViewed(id: string): Promise<void> {
    const state = await getState()
    state.lastOpenedId = id
    state.progress[id] = {
      done: state.progress[id]?.done ?? false,
      doneAt: state.progress[id]?.doneAt,
      lastViewedAt: new Date().toISOString(),
      reviewCount: state.progress[id]?.reviewCount ?? 0,
    }
    await persist(state)
  }

  return {
    getState,
    markDone,
    setDone,
    markViewed,
  }
}
