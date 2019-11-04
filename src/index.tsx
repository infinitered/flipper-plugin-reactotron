import { clipboard } from "electron"
import fs from "fs"
import { FlipperPlugin } from "flipper"
import {
  theme,
  timelineCommandResolver,
  Header,
  repairSerialization,
  filterCommands,
  TimelineFilterModal,
  CommandType,
} from "reactotron-core-ui"
import styled, { ThemeProvider } from "styled-components"
import { MdSearch, MdDeleteSweep, MdVpnKey, MdFilterList } from "react-icons/md"

import logo from "../logo"
import logo2 from "../logo2"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.background};
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  padding-top: 4px;
  padding-right: 10px;
`
const SearchLabel = styled.p`
  padding: 0 10px;
  font-size: 14px;
  color: ${props => props.theme.foregroundDark};
`
const SearchInput = styled.input`
  border-radius: 4px;
  padding: 10px;
  flex: 1;
  background-color: ${props => props.theme.backgroundSubtleDark};
  border: none;
  color: ${props => props.theme.foregroundDark};
  font-size: 14px;
`

const TimelineContainer = styled.div`
  flex: 1;
  overflow-y: scroll;
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

interface PersistedState {
  commands: any[]
  isSearchOpen: boolean
  search: string
  hiddenCommands: CommandType[]
  isFilterModalOpen: boolean
}

export default class extends FlipperPlugin<never, never, PersistedState> {
  static defaultPersistedState = {
    commands: [],
    isSearchOpen: false,
    search: "",
    hiddenCommands: [],
    isFilterModalOpen: false,
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

  handlePress = () => {
    this.client.call("sendReactotronCommand", {
      type: "state.keys.request",
      payload: { path: null },
    })
  }

  render() {
    const {
      commands,
      search,
      isSearchOpen,
      hiddenCommands,
      isFilterModalOpen,
    } = this.props.persistedState

    let filteredCommands = filterCommands(commands, search, hiddenCommands)

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Header
            title="Timeline"
            actions={[
              {
                tip: "Search",
                icon: MdSearch,
                onClick: () => {
                  this.props.setPersistedState({
                    isSearchOpen: !isSearchOpen,
                  })
                },
              },
              {
                tip: "Show root keys",
                icon: MdVpnKey,
                onClick: () => {
                  this.handlePress()
                },
              },
              {
                tip: "Filter",
                icon: MdFilterList,
                onClick: () => {
                  this.props.setPersistedState({ isFilterModalOpen: true })
                },
              },
              {
                tip: "Clear",
                icon: MdDeleteSweep,
                onClick: () => {
                  this.props.setPersistedState({ commands: [] })
                },
              },
            ]}
          >
            {isSearchOpen && (
              <SearchContainer>
                <SearchLabel>Search</SearchLabel>
                <SearchInput
                  value={this.props.persistedState.search}
                  onChange={e => this.props.setPersistedState({ search: e.target.value })}
                />
              </SearchContainer>
            )}
          </Header>
          <TimelineContainer>
            {filteredCommands.map((command, idx) => {
              console.log(command)
              const CommandComponent = timelineCommandResolver(command.type)

              if (CommandComponent) {
                return (
                  <CommandComponent
                    key={command.id}
                    command={command}
                    copyToClipboard={clipboard.writeText}
                    readFile={path => {
                      return new Promise((resolve, reject) => {
                        fs.readFile(path, "utf-8", (err, data) => {
                          if (err || !data) reject(new Error("Something failed"))
                          else resolve(data)
                        })
                      })
                    }}
                    sendCommand={this.handleSendCommand}
                  />
                )
              }

              return null
            })}
          </TimelineContainer>
          <FooterContainer>
            <img src={`data:image/png;base64, ${logo2}`} height={30} />
          </FooterContainer>
          <TimelineFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => {
              this.props.setPersistedState({ isFilterModalOpen: false })
            }}
            hiddenCommands={hiddenCommands}
            setHiddenCommands={hiddenCommands => {
              this.props.setPersistedState({ hiddenCommands })
            }}
          />
        </Container>
      </ThemeProvider>
    )
  }
}
