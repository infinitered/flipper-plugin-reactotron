import { FlipperPlugin } from "flipper";
import { theme, timelineCommandResolver } from "reactotron-core-ui";
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

const LeftContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  width: 100px;
  align-items: center;
`;
const MiddleContainer = styled.div`
  display: flex;
  flex: 1;
  padding-left: 10px;
  justify-content: center;
  align-items: center;
`;
const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  width: 100px;
  justify-content: flex-end;
  align-items: center;
`;

const Title = styled.div`
  color: ${props => props.theme.foregroundLight};
  text-align: center;
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
      commands: [data, ...persistedState.commands]
    };
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <HeaderContainer>
            <LeftContainer></LeftContainer>
            <MiddleContainer>
              <Title>Timeline</Title>
            </MiddleContainer>
            <RightContainer></RightContainer>
          </HeaderContainer>
          <TimelineContainer>
            {this.props.persistedState.commands.map(command => {
              const CommandComponent = timelineCommandResolver(command.type);

              console.log(command.date);

              if (CommandComponent) {
                return <CommandComponent command={command} />;
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
