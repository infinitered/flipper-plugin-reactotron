import React, { FunctionComponent, useContext } from "react"
import { clipboard } from "electron"
import fs from "fs"
import {
  timelineCommandResolver,
  filterCommands,
  TimelineFilterModal,
  DispatchActionModal,
  EmptyState,
  ReactotronContext,
  TimelineContext,
} from "reactotron-core-ui"
import {
  MdSearch,
  MdDeleteSweep,
  MdFilterList,
  MdSwapVert,
  MdReorder,
  MdVpnKey,
  MdSend,
} from "react-icons/md"
import styled from "styled-components"

import Header from "./Header"

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

  &::-webkit-scrollbar {
    background-color: transparent;
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
    border: 0px;
    border-radius: 0px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.25) !important;
    border-radius: 4px;
  }
`

interface Props {
  onChangeTab: (tab: "timeline" | "subscriptions") => void
}

const Timeline: FunctionComponent<Props> = ({ onChangeTab }) => {
  const {
    sendCommand,
    clearCommands,
    commands,
    openDispatchModal,
    closeDispatchModal,
    isDispatchModalOpen,
    dispatchModalInitialAction,
  } = useContext(ReactotronContext)
  const {
    isSearchOpen,
    toggleSearch,
    setSearch,
    search,
    isReversed,
    toggleReverse,
    openFilter,
    closeFilter,
    isFilterOpen,
    hiddenCommands,
    setHiddenCommands,
  } = useContext(TimelineContext)

  let filteredCommands = filterCommands(commands, search, hiddenCommands)

  if (isReversed) {
    filteredCommands = filteredCommands.reverse()
  }

  const dispatchAction = (action: any) => {
    sendCommand("state.action.dispatch", { action })
  }

  return (
    <>
      <Header
        title="Timeline"
        actions={[
          {
            tip: "Search",
            icon: MdSearch,
            onClick: () => {
              toggleSearch()
            },
          },
          {
            tip: "Dispatch Action",
            icon: MdSend,
            onClick: () => {
              openDispatchModal("")
            },
          },
          {
            tip: "Show root keys",
            icon: MdVpnKey,
            onClick: () => {
              sendCommand("state.keys.request", { path: null })
            },
          },
          {
            tip: "Filter",
            icon: MdFilterList,
            onClick: () => {
              openFilter()
            },
          },
          {
            tip: "Reverse Order",
            icon: MdSwapVert,
            onClick: () => {
              toggleReverse()
            },
          },
          {
            tip: "Clear",
            icon: MdDeleteSweep,
            onClick: () => {
              clearCommands()
            },
          },
        ]}
        onTab="timeline"
        onChangeTab={onChangeTab}
      >
        {isSearchOpen && (
          <SearchContainer>
            <SearchLabel>Search</SearchLabel>
            <SearchInput value={search} onChange={e => setSearch(e.target.value)} />
          </SearchContainer>
        )}
      </Header>
      <TimelineContainer>
        {filteredCommands.length === 0 ? (
          <EmptyState icon={MdReorder} title="No Activity">
            Once your app connects and starts sending events, they will appear here.
          </EmptyState>
        ) : (
          filteredCommands.map(command => {
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
                  sendCommand={sendCommand}
                  dispatchAction={dispatchAction}
                  openDispatchDialog={openDispatchModal}
                />
              )
            }

            return null
          })
        )}
      </TimelineContainer>
      <TimelineFilterModal
        isOpen={isFilterOpen}
        onClose={() => {
          closeFilter()
        }}
        hiddenCommands={hiddenCommands}
        setHiddenCommands={setHiddenCommands}
      />
      <DispatchActionModal
        isOpen={isDispatchModalOpen}
        initialValue={dispatchModalInitialAction}
        onClose={() => {
          closeDispatchModal()
        }}
        onDispatchAction={dispatchAction}
        isDarwin={window.process.platform === "darwin"}
      />
    </>
  )
}

export default Timeline
