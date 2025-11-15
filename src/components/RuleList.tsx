import { Button } from "@heroui/react"
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
				<div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
					<p className="text-gray-600 dark:text-gray-400 text-base">
						No rules found.
					</p>
					<Button variant="ghost" onClick={() => onOpenCreate()} asChild>
						<span className="text-base text-sky-600 ">Create Rule</span>
					</Button>
				</div>
			)}
			{rules.map((rule) => (
				<div
					key={rule.id}
					className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg"
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
