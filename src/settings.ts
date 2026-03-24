import type { PluginSettings } from "./types"
import { DEFAULT_DOC_PATH } from "./constants"


export const DEFAULT_SETTINGS: PluginSettings = {
  version: 1,
  sourceDocPath: DEFAULT_DOC_PATH,
  selectedLevels: ["N5"],
  defaultShowUnlearnedOnly: false,
  preferredViewMode: "category",
  progress: {},
}
