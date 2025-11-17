import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Switch } from "@/components/ui/switch"
import type { Rule } from "@/types/types"
import RuleDeleteDialog from "./rule-delete-dialog"

export default function RuleCard({
  rule,
  onDelete,
  onToggle,
  onOpenEdit,
}: {
  rule: Rule
  onDelete: (id: string) => void
  onToggle: (isSelected: boolean) => void
  onOpenEdit: (rule: Rule) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col overflow-hidden">
        <h2
          className="text-base text-card-foreground line-clamp-2"
          title={rule.name}
        >
          {rule.name}
        </h2>
        <p className="text-xs text-muted-foreground truncate" title={rule.url}>
          {rule.url}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ButtonGroup onClick={(e) => e.stopPropagation()}>
          {/* edit */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onOpenEdit(rule)}
          >
            <Pencil />
          </Button>

          {/* delete dialog */}
          <RuleDeleteDialog confirmDelete={() => onDelete(rule.id)} />

          {/* switch */}
          <Button variant="outline" size="icon" asChild>
            <div>
              <Switch checked={rule.enabled} onCheckedChange={onToggle} />
            </div>
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
