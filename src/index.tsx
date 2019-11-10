import React from "react"
import { FlipperPlugin } from "flipper"
import { theme, repairSerialization, CommandType } from "reactotron-core-ui"
import styled, { ThemeProvider } from "styled-components"

import Timeline from "./Timeline"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.background};
`

interface PersistedState {
  commands: any[]
  search: string
  hiddenCommands: CommandType[]
  isFilterModalOpen: boolean
  isTimelineReversed: boolean
}

export default class extends FlipperPlugin<never, never, PersistedState> {
  static defaultPersistedState = {
    commands: [],
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

  render() {
    const { commands } = this.props.persistedState

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Timeline
            commands={commands}
            onSendCommand={this.handleSendCommand}
            onClearCommands={this.handleClearCommands}
          />
        </Container>
      </ThemeProvider>
    )
  }
}
