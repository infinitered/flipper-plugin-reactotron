import React, { useState } from "react"
import { clipboard } from "electron"
import fs from "fs"
import { timelineCommandResolver, filterCommands, TimelineFilterModal } from "reactotron-core-ui"
import styled from "styled-components"
import { MdSearch, MdDeleteSweep, MdVpnKey, MdFilterList, MdSwapVert } from "react-icons/md"

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
`

interface Props {
  commands: any[]
  onSendCommand: (command: any) => void
  onClearCommands: () => void
  onChangeTab: (tab: "timeline" | "subscriptions") => void
}

function Timeline({ commands, onSendCommand, onClearCommands, onChangeTab }: Props) {
  // TODO: Switch to a reducer
  // TODO: Persist some of these (like if the timeline is reversed) and load when we mount.
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isTimelineReversed, setIsTimelineReversed] = useState(false)
  const [hiddenCommands, setHiddenCommands] = useState([])
  const [search, setSearch] = useState("")

  let filteredCommands = filterCommands(commands, search, hiddenCommands)

  if (isTimelineReversed) {
    filteredCommands = filteredCommands.reverse()
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
              setIsSearchOpen(!isSearchOpen)
            },
          },
          {
            tip: "Show root keys",
            icon: MdVpnKey,
            onClick: () => {
              onSendCommand({
                type: "state.keys.request",
                payload: { path: null },
              })
            },
          },
          {
            tip: "Filter",
            icon: MdFilterList,
            onClick: () => {
              setIsFilterModalOpen(true)
            },
          },
          {
            tip: "Reverse Order",
            icon: MdSwapVert,
            onClick: () => {
              setIsTimelineReversed(!isTimelineReversed)
            },
          },
          {
            tip: "Clear",
            icon: MdDeleteSweep,
            onClick: () => {
              onClearCommands()
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
        {filteredCommands.map((command, idx) => {
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
                sendCommand={onSendCommand}
              />
            )
          }

          return null
        })}
      </TimelineContainer>
      <TimelineFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => {
          setIsFilterModalOpen(false)
        }}
        hiddenCommands={hiddenCommands}
        setHiddenCommands={setHiddenCommands}
      />
    </>
  )
}

export default Timeline
