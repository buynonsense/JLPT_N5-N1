export interface ContinueStudyInput {
  candidateIds: string[]
  lastOpenedId?: string
  doneMap: Record<string, boolean>
}


export function pickContinueStudyId(input: ContinueStudyInput): string | undefined {
  if (input.lastOpenedId && input.candidateIds.includes(input.lastOpenedId)) {
    return input.lastOpenedId
  }

  const firstUndone = input.candidateIds.find((id) => !input.doneMap[id])
  if (firstUndone) {
    return firstUndone
  }

  return input.candidateIds[0]
}


export function pickCandidateIds<T extends { id: string }>(items: T[]): string[] {
  return items.map((item) => item.id)
}
