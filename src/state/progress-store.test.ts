import { describe, expect, it } from "vitest"

import { createProgressStore } from "./progress-store"


describe("progress store", () => {
  it("marks items done and persists timestamps", async () => {
    const saved: unknown[] = []
    const store = createProgressStore({
      loadData: async () => undefined,
      saveData: async (value) => {
        saved.push(value)
      },
    })

    await store.markDone("N5-001")
    const state = await store.getState()

    expect(state.progress["N5-001"].done).toBe(true)
    expect(state.progress["N5-001"].doneAt).toBeTruthy()
    expect(saved).toHaveLength(1)
  })

  it("updates last opened id and viewed timestamp", async () => {
    const store = createProgressStore({
      loadData: async () => undefined,
      saveData: async () => undefined,
    })

    await store.markViewed("N5-002")
    const state = await store.getState()

    expect(state.lastOpenedId).toBe("N5-002")
    expect(state.progress["N5-002"].lastViewedAt).toBeTruthy()
  })

  it("can uncheck a previously done item", async () => {
    const store = createProgressStore({
      loadData: async () => undefined,
      saveData: async () => undefined,
    })

    await store.setDone("N5-003", true)
    await store.setDone("N5-003", false)
    const state = await store.getState()

    expect(state.progress["N5-003"].done).toBe(false)
    expect(state.progress["N5-003"].doneAt).toBeUndefined()
  })
})
