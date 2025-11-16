import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Switch } from "@/components/ui/switch"
import type { Rule } from "@/types/types"

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
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
        {rule.name}
      </h2>

      <div className="flex items-center gap-2">
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onOpenEdit(rule)}
          >
            <Pencil />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(rule.id)}
          >
            <Trash className="text-red-500" />
          </Button>
          <Button variant="outline" size="icon">
            <Switch checked={rule.enabled} onCheckedChange={onToggle} />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
