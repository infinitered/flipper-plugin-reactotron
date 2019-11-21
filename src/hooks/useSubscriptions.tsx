import { useReducer, useEffect } from "react"

enum StorageKey {
  Subscriptions = "ReactotronSubscriptions",
}

interface State {
  subscriptions: string[]
  isAddOpen: boolean
}

interface Action {
  type: "SUBSCRIPTIONS_SET" | "ADD_OPEN" | "ADD_CLOSE"
  payload?: string | string[]
}

function subscriptionsReducer(state: State, action: Action) {
  switch (action.type) {
    case "SUBSCRIPTIONS_SET":
      return { ...state, subscriptions: action.payload as string[] }
    case "ADD_OPEN":
      return { ...state, isAddOpen: true }
    case "ADD_CLOSE":
      return { ...state, isAddOpen: false }
    default:
      return state
  }
}

function useSubscriptions(onSendCommand: (command: any) => void) {
  const [state, dispatch] = useReducer(subscriptionsReducer, {
    subscriptions: [],
    isAddOpen: false,
  })

  // Internal Handlers
  const sendSubscriptions = (subscriptions: string[]) => {
    localStorage.setItem(StorageKey.Subscriptions, JSON.stringify(subscriptions))

    onSendCommand({
      type: "state.values.subscribe",
      payload: { paths: subscriptions },
    })
  }

  // Load up saved subscriptions!
  useEffect(() => {
    const subscriptions = JSON.parse(localStorage.getItem(StorageKey.Subscriptions) || "[]")

    dispatch({
      type: "SUBSCRIPTIONS_SET",
      payload: subscriptions,
    })

    if (subscriptions.length === 0) return

    sendSubscriptions(subscriptions)
  }, [])

  // Setup event handlers
  const addSubscription = (path: string) => {
    dispatch({
      type: "ADD_CLOSE",
    })

    if (state.subscriptions.indexOf(path) > -1) return

    const newSubscriptions = [...state.subscriptions, path]

    sendSubscriptions(newSubscriptions)

    dispatch({
      type: "SUBSCRIPTIONS_SET",
      payload: newSubscriptions,
    })
  }

  const removeSubscription = (path: string) => {
    const idx = state.subscriptions.indexOf(path)

    const newSubscriptions = [
      ...state.subscriptions.slice(0, idx),
      ...state.subscriptions.slice(idx + 1),
    ]

    sendSubscriptions(newSubscriptions)

    dispatch({
      type: "SUBSCRIPTIONS_SET",
      payload: newSubscriptions,
    })
  }

  const clearSubscriptions = () => {
    sendSubscriptions([])

    dispatch({
      type: "SUBSCRIPTIONS_SET",
      payload: [],
    })
  }

  const openAddModal = () => {
    dispatch({
      type: "ADD_OPEN",
    })
  }

  const closeAddModal = () => {
    dispatch({
      type: "ADD_CLOSE",
    })
  }

  return {
    subscriptions: state.subscriptions,
    addSubscription,
    removeSubscription,
    clearSubscriptions,
    isAddOpen: state.isAddOpen,
    openAddModal,
    closeAddModal,
  }
}

export default useSubscriptions
