import { Plus } from "lucide-react"
import { useState } from "react"
import Create from "@/components/create-modal"
import Header from "@/components/Header"
import RuleList from "@/components/RuleList"
import { Button } from "@/components/ui/button"
import { useListLocalStorage } from "@/hooks/use-local-storage"
import { sendToActiveTab } from "@/lib/messaging"
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
    updateItem(id, partial)
    sendToActiveTab({ type: "RENDER_RULES" })
  }

  return (
    <>
      <div className="sticky top-0 z-10 p-4 border-b backdrop-blur bg-gray-50/70 dark:bg-gray-800/70">
        <Header />
      </div>

      <div className="p-2">
        <span className="text-xs font-semibold text-gray-600">
          RULES FOR THIS PAGE
        </span>
        <div className="mt-2">
          <RuleList
            rules={rules}
            onDelete={handleRuleDelete}
            onUpdate={handleRuleUpdate}
            onOpenCreate={(rule) => {
              setCurrentRule(rule)
              setShowModal(true)
            }}
          />
        </div>
      </div>

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
        onOpenChange={() => setShowModal(!showModal)}
        onSave={handleRuleSave}
      />
    </>
  )
}
