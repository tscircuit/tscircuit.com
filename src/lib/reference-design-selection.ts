export type ReferenceDesignSelection = {
  release?: string
  file?: string
  sheet?: string
  view?: string
}

export const readReferenceDesignSelection = (
  params: Record<string, string>,
): ReferenceDesignSelection => ({
  release: params.reference_release,
  file: params.reference_file,
  sheet: params.reference_sheet,
  view: params.reference_view,
})

export const referenceDesignUrlParams = (
  name: string,
  selection: ReferenceDesignSelection,
) => ({
  reference_design: name,
  reference_release: selection.release,
  reference_file: selection.file,
  reference_sheet: selection.sheet,
  reference_view: selection.view,
})

export type ReferenceDesignState = {
  open: string
  selections: Partial<Record<string, ReferenceDesignSelection>>
}

type Action =
  | { type: "open"; name: string }
  | {
      type: "selection" | "navigate"
      name: string
      selection: ReferenceDesignSelection
    }

export function referenceDesignReducer(
  state: ReferenceDesignState,
  action: Action,
): ReferenceDesignState {
  if (action.type === "open")
    return {
      open: action.name,
      selections: action.name
        ? {
            ...state.selections,
            [action.name]: state.selections[action.name] ?? {},
          }
        : state.selections,
    }
  return {
    open: action.name,
    selections: { ...state.selections, [action.name]: action.selection },
  }
}
