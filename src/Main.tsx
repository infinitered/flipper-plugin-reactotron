import React, { FunctionComponent } from "react"
import { theme } from "reactotron-core-ui"
import styled, { ThemeProvider } from "styled-components"

import useTimeline from "./hooks/useTimeline"
import Timeline from "./Timeline"
import Subscriptions from "./Subscriptions"

import logo from "../logo"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.background};
`

const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: ${props => props.theme.backgroundSubtleLight};
  border-top: 1px solid ${props => props.theme.chromeLine};
  color: ${props => props.theme.foregroundDark};
  height: 35px;
  padding: 10px;
`

interface Props {
  commands: any[]
  onTab: "timeline" | "subscriptions"
  onSendCommand: (command: any) => void
  onClearCommands: () => void
  onChangeTab: (tab: "timeline" | "subscriptions") => void
}

const Main: FunctionComponent<Props> = ({
  commands,
  onTab,
  onSendCommand,
  onClearCommands,
  onChangeTab,
}) => {
  const timelineHandler = useTimeline()

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {onTab === "timeline" && (
          <Timeline
            commands={commands}
            onSendCommand={onSendCommand}
            onClearCommands={onClearCommands}
            onChangeTab={onChangeTab}
            {...timelineHandler}
          />
        )}
        {onTab === "subscriptions" && (
          <Subscriptions
            commands={commands}
            onSendCommand={onSendCommand}
            onChangeTab={onChangeTab}
          />
        )}
        <FooterContainer>
          <img src={`data:image/png;base64, ${logo}`} height={30} />
        </FooterContainer>
      </Container>
    </ThemeProvider>
  )
}

export default Main
