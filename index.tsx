import { FlipperPlugin } from "flipper";
import { theme, timelineCommandResolver } from "reactotron-core-ui";
import { ThemeProvider } from "styled-components";

export default class extends FlipperPlugin<never, never, { commands: any[] }> {
  static defaultPersistedState = { commands: [] };

  static persistedStateReducer<PersistedState>(
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
        <div>
          {this.props.persistedState.commands.map(command => {
            const CommandComponent = timelineCommandResolver(command.type);

            console.log(command.date);

            if (CommandComponent) {
              return <CommandComponent command={command} />;
            }

            return null;
          })}
        </div>
      </ThemeProvider>
    );
  }
}
