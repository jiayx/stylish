import { Button } from "@/components/ui/button"
import type { Rule } from "@/types/types"
import RuleCard from "./rule-card"

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
        <div className="p-4 border rounded-lg text-center bg-card text-card-foreground">
          <p className="text-muted-foreground text-base">No rules found.</p>
          <Button variant="ghost" onClick={() => onOpenCreate()}>
            Create Rule
          </Button>
        </div>
      )}
      {rules.map((rule) => (
        // biome-ignore lint/a11y/useSemanticElements: must use div, otherwise multiple layers of buttons are not allowed
        <div
          key={rule.id}
          role="button"
          tabIndex={0}
          className="p-4 border rounded-lg bg-card cursor-pointer"
          onClick={() => onOpenCreate(rule)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onOpenCreate(rule)
            }
          }}
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
