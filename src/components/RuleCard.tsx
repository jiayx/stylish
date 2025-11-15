import { Switch } from "@heroui/react"
import { Pencil, Trash } from "lucide-react"
import type { Rule } from "../types/types"

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
			<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
				{rule.name}
			</h2>
			<div className="flex items-center gap-3">
				<Pencil
					className="w-4 h-4 text-sky-600 hover:text-sky-800 cursor-pointer transition"
					onClick={() => onOpenEdit(rule)}
				/>
				<Trash
					className="w-4 h-4 text-red-400 hover:text-red-800 cursor-pointer transition"
					onClick={() => onDelete(rule.id)}
				/>
				<Switch isSelected={rule.enabled} onChange={onToggle}>
					<Switch.Control>
						<Switch.Thumb />
					</Switch.Control>
				</Switch>
			</div>
		</div>
	)
}
