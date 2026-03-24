import { describe, expect, it } from "vitest"

import { pickCandidateIds, pickContinueStudyId } from "./continue-study"


describe("pickContinueStudyId", () => {
  it("prefers last opened id when it is still in scope", () => {
    const id = pickContinueStudyId({
      candidateIds: ["N5-001", "N5-002"],
      lastOpenedId: "N5-002",
      doneMap: {},
    })

    expect(id).toBe("N5-002")
  })

  it("falls back to first unfinished item", () => {
    const id = pickContinueStudyId({
      candidateIds: ["N5-001", "N5-002", "N5-003"],
      lastOpenedId: "N4-001",
      doneMap: { "N5-001": true, "N5-002": false },
    })

    expect(id).toBe("N5-002")
  })

  it("falls back to first item when all are done", () => {
    const id = pickContinueStudyId({
      candidateIds: ["N5-001", "N5-002"],
      lastOpenedId: undefined,
      doneMap: { "N5-001": true, "N5-002": true },
    })

    expect(id).toBe("N5-001")
  })

  it("respects a temporary filtered candidate scope", () => {
    const id = pickContinueStudyId({
      candidateIds: ["N4-001", "N4-002"],
      lastOpenedId: "N5-002",
      doneMap: { "N4-001": true, "N4-002": false, "N5-002": false },
    })

    expect(id).toBe("N4-002")
  })

  it("builds candidate ids from the current filtered items", () => {
    const ids = pickCandidateIds([{ id: "N3-001" }, { id: "N3-002" }])
    expect(ids).toEqual(["N3-001", "N3-002"])
  })
})
