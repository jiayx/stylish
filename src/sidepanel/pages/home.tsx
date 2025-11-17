import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import Create from "@/components/create-modal"
import Header from "@/components/home-header"
import RuleList from "@/components/rule-list"
import { Button } from "@/components/ui/button"
import { useListLocalStorage } from "@/hooks/use-local-storage"
import { matchUrl } from "@/lib/match-url"
import { getCurrentTab, sendToActiveTab } from "@/lib/messaging"
import type { Rule } from "@/types/types"

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [currentRule, setCurrentRule] = useState<Rule | undefined>(undefined)

  const {
    list: rules,
    appendItem,
    removeItem,
    updateItem,
  } = useListLocalStorage<Rule>("rules", [])

  const handleRuleSave = (rule: Rule) => {
    if (rule.id) {
      updateItem(rule.id, rule)
    } else {
      rule.id = crypto.randomUUID()
      rule.createdAt = new Date().toISOString()
      rule.enabled = true
      appendItem(rule)
    }
    sendToActiveTab({ type: "RENDER_RULES" })
  }

  const handleRuleDelete = (id: string) => {
    removeItem(id)
    sendToActiveTab({ type: "RENDER_RULES" })
  }

  const handleRuleUpdate = (id: string, partial: Partial<Rule>) => {
    updateItem(id, partial).then(() => {
      sendToActiveTab({ type: "RENDER_RULES" })
    })
  }

  const [activeTabUrl, setActiveTabUrl] = useState<string>("")
  getCurrentTab().then((tab) => setActiveTabUrl(tab?.url || ""))

  const [currentPageRules, setCurrentPageRules] = useState<Rule[]>([])
  const [otherRules, setOtherRules] = useState<Rule[]>([])

  useEffect(() => {
    if (!activeTabUrl) return
    const currentPageRules: Rule[] = []
    const otherRules: Rule[] = []
    rules.forEach((rule) => {
      if (matchUrl(rule.url, activeTabUrl)) {
        currentPageRules.push(rule)
      } else {
        otherRules.push(rule)
      }
    })
    setCurrentPageRules(currentPageRules)
    setOtherRules(otherRules)
  }, [activeTabUrl, rules])

  chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId).then((tab) => {
      setActiveTabUrl(tab.url || "")
      sendToActiveTab({ type: "RENDER_RULES" })
    })
  })

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "ROUTE_CHANGE") {
      setActiveTabUrl(message.url)
      sendResponse(true)
    }
  })

  return (
    <>
      <div className="sticky top-0 z-10 p-4 border-b backdrop-blur-xs bg-gray-100/70 dark:bg-black/50">
        <Header />
      </div>

      <div className="p-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          RULES FOR THIS PAGE
        </span>
        <div className="mt-2">
          <RuleList
            rules={currentPageRules}
            onDelete={handleRuleDelete}
            onUpdate={handleRuleUpdate}
            onOpenCreate={(rule) => {
              setCurrentRule(rule)
              setShowModal(true)
            }}
          />
        </div>
      </div>

      <div className="p-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          OTHER RULES
        </span>
        <div className="mt-2">
          <RuleList
            rules={otherRules}
            onDelete={handleRuleDelete}
            onUpdate={handleRuleUpdate}
            onOpenCreate={(rule) => {
              setCurrentRule(rule)
              setShowModal(true)
            }}
          />
        </div>
      </div>

      <div className="p-10"></div>

      <div className="fixed bottom-4 right-4 z-50 hover:rotate-90 transition">
        <Button
          variant="default"
          size="icon"
          className="rounded-full w-12 h-12"
          onClick={() => {
            setCurrentRule(undefined)
            setShowModal(true)
          }}
        >
          <Plus />
        </Button>
      </div>

      <Create
        initialRule={currentRule}
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleRuleSave}
      />
    </>
  )
}
