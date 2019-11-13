import React, { FunctionComponent } from "react"
import { Header as CoreHeader } from "reactotron-core-ui"
import { MdReorder, MdAssignment } from "react-icons/md"

interface Props {
  title: string
  actions: any[]
  onTab: "timeline" | "subscriptions"
  onChangeTab: (tab: "timeline" | "subscriptions") => void
}

const Header: FunctionComponent<Props> = ({ title, actions, onTab, onChangeTab, children }) => {
  return (
    <CoreHeader
      title={title}
      actions={actions}
      tabs={[
        {
          text: "Timeline",
          icon: MdReorder,
          isActive: onTab === "timeline",
          onClick: () => {
            onChangeTab("timeline")
          },
        },
        {
          text: "Subscriptions",
          icon: MdAssignment,
          isActive: onTab === "subscriptions",
          onClick: () => {
            onChangeTab("subscriptions")
          },
        },
      ]}
    >
      {children}
    </CoreHeader>
  )
}

export default Header
