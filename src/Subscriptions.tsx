import React, { useEffect, useState, useReducer } from "react"
import { SubscriptionAddModal, CommandType, ContentView } from "reactotron-core-ui"
import { MdDelete, MdAdd, MdDeleteSweep } from "react-icons/md"
import styled from "styled-components"

import Header from "./Header"

const SubscriptionContainer = styled.div`
  display: flex;
  padding: 15px 20px;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.line};
`
const SubscriptionPath = styled.div`
  flex: 0.3;
  word-break: break-all;
  cursor: text;
  user-select: text;
  color: ${props => props.theme.tag};
`
const SubscriptionValue = styled.div`
  flex: 0.7;
  word-break: break-all;
  user-select: text;
`
const SubscriptionRemove = styled.div`
  cursor: pointer;
  padding-left: 10px;
  color: ${props => props.theme.foreground};
`
interface Action {
  type: "ADD_SUBSCRIPTION" | "REMOVE_SUBSCRIPTION" | "CLEAR_SUBSCRIPTIONS"
  payload?: string
}

function subscriptionsReducer(state: string[], action: Action) {
  switch (action.type) {
    case "ADD_SUBSCRIPTION":
      return [...state, action.payload]
    case "REMOVE_SUBSCRIPTION":
      const idx = state.indexOf(action.payload)

      return [...state.slice(0, idx), ...state.slice(idx + 1)]
    case "CLEAR_SUBSCRIPTIONS":
      return []
    default:
      return state
  }
}

function getLatestChanges(commands: any[]) {
  const changeCommands = commands.filter(c => c.type === CommandType.StateValuesChange)
  const latestChangeCommands = changeCommands.length > 0 ? changeCommands[0] : { payload: {} }
  return latestChangeCommands.payload.changes || []
}

interface Props {
  commands: any[]
  onSendCommand: (commands: any) => void
  onChangeTab: (tab: "timeline" | "subscriptions") => void
}

function Subscriptions({ commands, onSendCommand, onChangeTab }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  // TODO: Consider converting this whole thing to a custom hook and get it out of this file.
  const [subscriptions, dispatch] = useReducer(subscriptionsReducer, [])

  const addSubscription = (path: string) => {
    if (subscriptions.indexOf(path) > -1) return

    // TODO: Handle "*"s (ref core-server)

    dispatch({
      type: "ADD_SUBSCRIPTION",
      payload: path,
    })
    setIsAddModalOpen(false)
  }
  const removeSubscription = (path: string) => {
    const pathLocation = subscriptions.indexOf(path)

    if (pathLocation === -1) return

    dispatch({
      type: "REMOVE_SUBSCRIPTION",
      payload: path,
    })
  }
  const clearSubscriptions = () => {
    dispatch({
      type: "CLEAR_SUBSCRIPTIONS",
    })
  }

  const subscriptionValues = getLatestChanges(commands)

  // TODO: Stop forcing this through and actually track subscriptions
  useEffect(() => {
    onSendCommand({
      type: "state.values.subscribe",
      payload: { paths: subscriptions },
    })
  }, [subscriptions])

  // TODO: Handle Empty!
  return (
    <>
      <Header
        title="Subscription"
        actions={[
          {
            tip: "Add",
            icon: MdAdd,
            onClick: () => {
              setIsAddModalOpen(true)
            },
          },
          {
            tip: "Clear",
            icon: MdDeleteSweep,
            onClick: () => {
              clearSubscriptions()
            },
          },
        ]}
        onTab="subscriptions"
        onChangeTab={onChangeTab}
      />
      {subscriptionValues.map(subscription => {
        const value =
          typeof subscription.value === "object"
            ? { value: subscription.value }
            : subscription.value

        return (
          <SubscriptionContainer key={`subscription-${subscription.path}`}>
            <SubscriptionPath>{subscription.path}</SubscriptionPath>
            <SubscriptionValue>
              <ContentView value={value} />
            </SubscriptionValue>
            <SubscriptionRemove>
              <MdDelete size={24} onClick={() => removeSubscription(subscription.path)} />
            </SubscriptionRemove>
          </SubscriptionContainer>
        )
      })}
      <SubscriptionAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
        }}
        onAddSubscription={addSubscription}
      />
    </>
  )
}

export default Subscriptions
