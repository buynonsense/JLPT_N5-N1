export interface ApplySourceDocPathChangeInput {
  previousPath: string
  nextPath: string
  reindex: () => Promise<void>
}


export interface ApplySourceDocPathChangeResult {
  sourceDocPath: string
  rolledBack: boolean
  reason?: string
}


export async function applySourceDocPathChange(
  input: ApplySourceDocPathChangeInput,
): Promise<ApplySourceDocPathChangeResult> {
  try {
    await input.reindex()
    return {
      sourceDocPath: input.nextPath,
      rolledBack: false,
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    return {
      sourceDocPath: input.previousPath,
      rolledBack: true,
      reason,
    }
  }
}
