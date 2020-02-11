import React, { useContext } from "react"
import {
  ReactotronContext,
  CommandType,
  ContentView,
  EmptyState,
  StateContext,
  SubscriptionAddModal,
} from "reactotron-core-ui"
import { MdDelete, MdAdd, MdDeleteSweep, MdNotificationsNone } from "react-icons/md"
import styled from "styled-components"

import Header from "./Header"

const SubscriptionsContainer = styled.div`
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
  onChangeTab: (tab: "timeline" | "subscriptions") => void
}

function Subscriptions({ onChangeTab }: Props) {
  const {
    commands,
    openSubscriptionModal,
    isSubscriptionModalOpen,
    closeSubscriptionModal,
  } = useContext(ReactotronContext)
  const { addSubscription, removeSubscription, clearSubscriptions } = useContext(StateContext)

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
              openSubscriptionModal()
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
        {subscriptionValues.length === 0 ? (
          <EmptyState icon={MdNotificationsNone} title="No Subscriptions">
            {/* You can subscribe to state changes in your redux or mobx-state-tree store by pressing{" "}
            {subscriptionModalSequence && (
              <KeybindKeys
                keybind={subscriptionModalKeybind}
                sequence={subscriptionModalSequence}
                addWidth={false}
              />
            )} */}
          </EmptyState>
        ) : (
          subscriptionValues.map(subscription => {
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
          })
        )}
      </SubscriptionsContainer>
      <SubscriptionAddModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => {
          closeSubscriptionModal()
        }}
        onAddSubscription={(path: string) => {
          // TODO: Get this out of here.
          closeSubscriptionModal()
          addSubscription(path)
        }}
      />
    </>
  )
}

export default Subscriptions
