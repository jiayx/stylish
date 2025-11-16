import { Button } from "@/components/ui/button"
import type { Rule } from "../types/types"
import RuleCard from "./RuleCard"

export default function RuleList({
  rules,
  onDelete,
  onUpdate,
  onOpenCreate,
}: {
  rules: Rule[]
  onDelete: (id: string) => void
  onUpdate: (id: string, partial: Partial<Rule>) => void
  onOpenCreate: (rule?: Rule) => void
}) {
  return (
    <div className="space-y-2">
      {rules.length === 0 && (
        <div className="p-4 border rounded-lg text-center">
          <p className="text-gray-500 text-base">No rules found.</p>
          <Button variant="ghost" onClick={() => onOpenCreate()}>
            Create Rule
          </Button>
        </div>
      )}
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="p-4 border rounded-lg dark:bg-gray-800 bg-white"
        >
          <RuleCard
            rule={rule}
            onOpenEdit={(rule: Rule) => onOpenCreate(rule)}
            onDelete={() => onDelete(rule.id)}
            onToggle={(isSelected) =>
              onUpdate(rule.id, { enabled: isSelected })
            }
          />
        </div>
      ))}
    </div>
  )
}
