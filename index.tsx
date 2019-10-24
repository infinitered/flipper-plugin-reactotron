import { clipboard } from "electron";
import { FlipperPlugin } from "flipper";
import {
  theme,
  timelineCommandResolver,
  Header,
  repairSerialization
} from "reactotron-core-ui";
import styled, { ThemeProvider } from "styled-components";

import logo from "./logo";
import logo2 from "./logo2";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.background};
`;

const HeaderContainer = styled.div`
  display: flex;
  background-color: ${props => props.theme.backgroundSubtleLight};
  border-bottom: 1px solid ${props => props.theme.chromeLine};
  color: ${props => props.theme.foregroundDark};
  box-shadow: 0 0 30px ${props => props.theme.glow};
  height: 70px;
`;

const TimelineContainer = styled.div`
  flex: 1;
  overflow-y: scroll;
`;

const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: ${props => props.theme.backgroundSubtleLight};
  border-top: 1px solid ${props => props.theme.chromeLine};
  color: ${props => props.theme.foregroundDark};
  height: 35px;
  padding: 10px;
`;

interface PersistedState {
  commands: any[];
}

export default class extends FlipperPlugin<never, never, PersistedState> {
  static defaultPersistedState = { commands: [] };

  static persistedStateReducer(
    persistedState: PersistedState,
    method: string,
    data: Object
  ): PersistedState {
    return {
      commands: [repairSerialization(data), ...persistedState.commands]
    };
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Header title="Timeline" />
          <TimelineContainer>
            {this.props.persistedState.commands.map((command, idx) => {
              const CommandComponent = timelineCommandResolver(command.type);

              if (CommandComponent) {
                return (
                  <CommandComponent
                    key={idx}
                    command={command}
                    copyToClipboard={clipboard.writeText}
                  />
                );
              }

              return null;
            })}
          </TimelineContainer>
          <FooterContainer>
            <img src={`data:image/png;base64, ${logo2}`} height={30} />
          </FooterContainer>
        </Container>
      </ThemeProvider>
    );
  }
}
