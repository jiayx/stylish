import { Plus } from "lucide-react"
import { useState } from "react"
import Create from "../components/Create"
import Header from "../components/Header"
import RuleList from "../components/RuleList"
import { useListLocalStorage } from "../hooks/use-local-storage"
import type { Rule } from "../types/types"

export default function App() {
	const [showModal, setShowModal] = useState(false)
	const [currentRule, setCurrentRule] = useState<Rule | undefined>(undefined)

	const {
		list: rules,
		appendItem,
		removeItem,
		updateItem,
	} = useListLocalStorage<Rule>("rules", [])

	const handleRuleCreate = (rule: Rule) => {
		console.log("create", rule)
		appendItem(rule)
	}

	const handleRuleDelete = (id: string) => {
		console.log("delete", id)
		removeItem(id)
	}

	const handleRuleUpdate = (id: string, partial: Partial<Rule>) => {
		updateItem(id, partial)
	}

	return (
		<>
			<div className="p-4 border-b border-gray-200 dark:border-gray-800">
				<Header />
			</div>

			<div className="p-2">
				<span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
					RULES FOR THIS PAGE
				</span>
				<div className="mt-2">
					<RuleList
						rules={rules}
						onDelete={handleRuleDelete}
						onUpdate={handleRuleUpdate}
						onOpenCreate={(rule) => {
							console.log("open create", rule)
							setCurrentRule(rule)
							setShowModal(true)
						}}
					/>
				</div>
			</div>

			<button
				type="button"
				className="fixed bottom-4 right-4 z-50 bg-sky-500 rounded-full p-2 hover:bg-sky-600 cursor-pointer transition"
				onClick={() => {
					setShowModal(!showModal)
				}}
			>
				<Plus className="w-6 h-6 text-white cursor-pointer transition hover:rotate-90" />
			</button>

			<Create
				defaultRule={currentRule}
				open={showModal}
				onOpenChange={() => setShowModal(!showModal)}
				onSave={handleRuleCreate}
			/>
		</>
	)
}
