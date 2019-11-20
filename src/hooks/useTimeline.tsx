import { useReducer, useEffect } from "react"
import { CommandType } from "reactotron-core-ui"

enum StorageKey {
  ReversedOrder = "ReactotronTimelineReversedOrder",
  HiddenCommands = "ReactotronTimelineHiddenCommands",
}

interface TimelineState {
  isSearchOpen: boolean
  search: string
  isFilterOpen: boolean
  isReversed: boolean
  hiddenCommands: CommandType[]
}

interface TimelineAction {
  type:
    | "SEARCH_OPEN"
    | "SEARCH_CLOSE"
    | "SEARCH_SET"
    | "FILTER_OPEN"
    | "FILTER_CLOSE"
    | "ORDER_REVERSE"
    | "ORDER_REGULAR"
    | "HIDDENCOMMANDS_SET"
  payload?: string | CommandType[]
}

function timelineReducer(state: TimelineState, action: TimelineAction) {
  switch (action.type) {
    case "SEARCH_OPEN":
      return { ...state, isSearchOpen: true }
    case "SEARCH_CLOSE":
      return { ...state, isSearchOpen: false }
    case "SEARCH_SET":
      return { ...state, search: action.payload as string }
    case "FILTER_OPEN":
      return { ...state, isFilterOpen: true }
    case "FILTER_CLOSE":
      return { ...state, isFilterOpen: false }
    case "ORDER_REVERSE":
      return { ...state, isReversed: true }
    case "ORDER_REGULAR":
      return { ...state, isReversed: false }
    case "HIDDENCOMMANDS_SET":
      return { ...state, hiddenCommands: action.payload as CommandType[] }
    default:
      return state
  }
}

function useTimeline() {
  const [state, dispatch] = useReducer(timelineReducer, {
    isSearchOpen: false,
    search: "",
    isFilterOpen: false,
    isReversed: false,
    hiddenCommands: [],
  })

  // Load some values
  useEffect(() => {
    const isReversed = localStorage.getItem(StorageKey.ReversedOrder) === "reversed"
    const hiddenCommands = JSON.parse(localStorage.getItem(StorageKey.HiddenCommands) || "[]")

    dispatch({
      type: isReversed ? "ORDER_REVERSE" : "ORDER_REGULAR",
    })

    dispatch({
      type: "HIDDENCOMMANDS_SET",
      payload: hiddenCommands,
    })
  }, [])

  // Setup event handlers
  const toggleSearch = () => {
    dispatch({
      type: state.isSearchOpen ? "SEARCH_CLOSE" : "SEARCH_OPEN",
    })
  }

  const setSearch = (search: string) => {
    dispatch({
      type: "SEARCH_SET",
      payload: search,
    })
  }

  const openFilter = () => {
    dispatch({
      type: "FILTER_OPEN",
    })
  }

  const closeFilter = () => {
    dispatch({
      type: "FILTER_CLOSE",
    })
  }

  const toggleReverse = () => {
    const isReversed = !state.isReversed

    localStorage.setItem(StorageKey.ReversedOrder, isReversed ? "reversed" : "regular")

    dispatch({
      type: isReversed ? "ORDER_REVERSE" : "ORDER_REGULAR",
    })
  }

  const setHiddenCommands = (hiddenCommands: CommandType[]) => {
    localStorage.setItem(StorageKey.HiddenCommands, JSON.stringify(hiddenCommands))

    dispatch({
      type: "HIDDENCOMMANDS_SET",
      payload: hiddenCommands,
    })
  }

  return {
    isSearchOpen: state.isSearchOpen,
    toggleSearch,
    search: state.search,
    setSearch,
    isFilterOpen: state.isFilterOpen,
    openFilter,
    closeFilter,
    isReversed: state.isReversed,
    toggleReverse,
    hiddenCommands: state.hiddenCommands,
    setHiddenCommands,
  }
}

export default useTimeline
