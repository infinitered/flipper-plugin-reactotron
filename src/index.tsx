import React from "react"
import { FlipperPlugin } from "flipper"
import { repairSerialization } from "reactotron-core-ui"

import Main from "./Main"

interface PersistedState {
  commands: any[]
  onTab: "timeline" | "subscriptions"
}

const objectFromChanges = (changes: any[]) =>
  changes.reduce((obj, change) => ({ ...obj, [change.path]: change.value }), {})

const compareChanges = (newChange: any, oldChange: any) => {
  for (const key in oldChange) {
    if (!(key in newChange)) {
      return {
        removed: { [key]: oldChange[key] },
      }
    }
  }

  for (const key in newChange) {
    if (!(key in oldChange)) {
      return {
        added: { [key]: newChange[key] },
      }
    }

    const newChangeValues = JSON.stringify(newChange[key]) || ""
    const oldChangeValues = JSON.stringify(oldChange[key]) || ""

    if (newChangeValues !== oldChangeValues) {
      return {
        changed: { [key]: newChange[key] },
      }
    }
  }
  return null
}

const rewriteChangesSinceLastStateSubscription = (
  state: PersistedState,
  data: Record<string, any>
) => {
  if (data.type !== "state.values.change") {
    return
  }

  let oldChange = {}
  const newChange = objectFromChanges(data.payload.changes)
  const changeCommands = state.commands.filter(command => command.type === "state.values.change")

  if (changeCommands.length) {
    const latestChange = changeCommands[0]
    oldChange = objectFromChanges(latestChange.payload.changes)
  }

  const diff = compareChanges(newChange, oldChange)
  data.payload = { ...data.payload, ...diff }
}

export default class extends FlipperPlugin<never, never, PersistedState> {
  static defaultPersistedState = {
    commands: [],
    onTab: "timeline",
  }

  static persistedStateReducer(
    persistedState: PersistedState,
    method: string,
    data: Record<string, any>
  ): PersistedState {
    const deserializedData = repairSerialization(JSON.parse(JSON.stringify(data)))
    rewriteChangesSinceLastStateSubscription(persistedState, deserializedData)

    return {
      ...persistedState,
      commands: [
        { ...deserializedData, id: persistedState.commands.length },
        ...persistedState.commands,
      ],
    }
  }

  init() {
    this.toggleScrollbar(false)
  }

  componentWillUnmount() {
    this.toggleScrollbar(true)
  }

  toggleScrollbar = (show: boolean) => {
    const flipperSidebar = document.getElementById("detailsSidebar")
    if (flipperSidebar) {
      flipperSidebar.style.overflow = show ? "scroll" : "hidden"
    }
  }

  handleSendCommand = (type: string, payload: any) => {
    this.client.call("sendReactotronCommand", { type, payload })
  }

  handleClearCommands = () => {
    this.props.setPersistedState({ commands: [] })
  }

  handleChangeTab = (tab: "timeline" | "subscriptions") => {
    this.props.setPersistedState({ onTab: tab })
  }

  render() {
    const { commands, onTab } = this.props.persistedState

    return (
      <Main
        commands={commands}
        onTab={onTab}
        onSendCommand={this.handleSendCommand}
        onClearCommands={this.handleClearCommands}
        onChangeTab={this.handleChangeTab}
      />
    )
  }
}
