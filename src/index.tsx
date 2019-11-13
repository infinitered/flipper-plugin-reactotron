import React from "react"
import { FlipperPlugin } from "flipper"
import { theme, repairSerialization, CommandType } from "reactotron-core-ui"
import styled, { ThemeProvider } from "styled-components"

import Timeline from "./Timeline"
import Subscriptions from "./Subscriptions"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.background};
`

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
      <ThemeProvider theme={theme}>
        <Container>
          {onTab === "timeline" && (
            <Timeline
              commands={commands}
              onSendCommand={this.handleSendCommand}
              onClearCommands={this.handleClearCommands}
              onChangeTab={this.handleChangeTab}
            />
          )}
          {onTab === "subscriptions" && (
            <Subscriptions
              commands={commands}
              onSendCommand={this.handleSendCommand}
              onChangeTab={this.handleChangeTab}
            />
          )}
        </Container>
      </ThemeProvider>
    )
  }
}
