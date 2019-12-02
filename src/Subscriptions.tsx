import React from "react"
import { SubscriptionAddModal, CommandType, ContentView } from "reactotron-core-ui"
import { MdDelete, MdAdd, MdDeleteSweep } from "react-icons/md"
import styled from "styled-components"

import Header from "./Header"

const SubscriptionsContainer = styled.div`
  flex: 1;
  overflow-y: scroll;
`

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

function getLatestChanges(commands: any[]) {
  const changeCommands = commands.filter(c => c.type === CommandType.StateValuesChange)
  const latestChangeCommands = changeCommands.length > 0 ? changeCommands[0] : { payload: {} }
  return latestChangeCommands.payload.changes || []
}

interface Props {
  commands: any[]
  onChangeTab: (tab: "timeline" | "subscriptions") => void
  // Subscription Handler things
  subscriptions: string[]
  addSubscription: (path: string) => void
  removeSubscription: (path: string) => void
  clearSubscriptions: () => void
  isAddOpen: boolean
  openAddModal: () => void
  closeAddModal: () => void
}

function Subscriptions({
  commands,
  onChangeTab,
  addSubscription,
  removeSubscription,
  clearSubscriptions,
  isAddOpen,
  openAddModal,
  closeAddModal,
}: Props) {
  const subscriptionValues = getLatestChanges(commands)

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
              openAddModal()
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
      <SubscriptionsContainer>
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
      </SubscriptionsContainer>
      <SubscriptionAddModal
        isOpen={isAddOpen}
        onClose={() => {
          closeAddModal()
        }}
        onAddSubscription={addSubscription}
      />
    </>
  )
}

export default Subscriptions
