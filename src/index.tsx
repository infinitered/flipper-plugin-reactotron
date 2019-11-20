import React from "react"
import { FlipperPlugin } from "flipper"
import { repairSerialization } from "reactotron-core-ui"

import Main from "./Main"

interface PersistedState {
  commands: any[]
  onTab: "timeline" | "subscriptions"
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
