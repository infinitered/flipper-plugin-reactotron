import React from "react"
import { FlipperPlugin } from "flipper"
import { repairSerialization } from "reactotron-core-ui"

import Main from "./Main"

interface PersistedState {
  commands: any[]
  onTab: "timeline" | "subscriptions"
}

const compareChanges = (newChange, oldChange) => {
  for (let key in oldChange) {
    if (!(key in newChange)) {
      return { removed: oldChange }
    }
  }
  for (let key in newChange) {
    if (!(key in oldChange)) {
      return { added: newChange }
    }

    const newChangeValues = JSON.stringify(newChange[key]) || ""
    const oldChangeValues = JSON.stringify(oldChange[key]) || ""

    if ((newChangeValues.length - oldChangeValues.length != 0)
      || newChangeValues !== oldChangeValues) {
      return { changed: newChange }
    }
  }
  return null
}

const rewriteChangesSinceLastStateSubscription = (state, data) => {
  if (data.type != "state.values.change") {
    return
  }

  const objectFromSubscriptionPair = (pair: {}) => {
    let obj = {}
    obj[pair["path"]] = pair["value"]
    return obj
  }

  let oldChange = []
  const newChange = data["payload"]["changes"].map(change => objectFromSubscriptionPair(change))
  const changeCommands = state.commands.filter(command => command.type === "state.values.change")

  if (changeCommands.length) {
    const latestChange = changeCommands[0]
    oldChange = latestChange["payload"]["changes"].map(change => objectFromSubscriptionPair(change))
  }

  const diff = compareChanges(newChange, oldChange)

  data["payload"] = { ...data["payload"], ...diff }
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

    rewriteChangesSinceLastStateSubscription(persistedState, data)

    return {
      ...persistedState,
      commands: [
        repairSerialization({ ...data, id: persistedState.commands.length }),
        ...persistedState.commands,
      ],
    }
  }

  handleSendCommand = (command: any) => {
    this.client.call("sendReactotronCommand", command)
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
