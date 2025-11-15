import { X } from "lucide-react"
import { useEscape } from "../hooks/use-escape"
import type { Rule } from "../types/types"
import RuleForm from "./RuleForm"

export default function Create({
	open,
	onSave,
	onOpenChange,
	defaultRule,
}: {
	open: boolean
	onSave: (rule: Rule) => void
	onOpenChange: () => void
	defaultRule?: Rule
}) {
	const saveHandler = (rule: Rule) => {
		onSave(rule)
		onOpenChange()
	}

	const closeHandler = () => {
		onOpenChange()
	}

	// ESC to close
	useEscape(closeHandler)

	return (
		<div
			data-open={open}
			className="
        fixed top-0 left-0 right-0 z-100 w-full h-full
        overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full
        flex items-center justify-center bg-gray-50 dark:bg-gray-900
        transition-all duration-300 ease-in-out translate-y-full data-[open=true]:translate-y-0
      "
		>
			<div className="relative w-full max-w-md h-full md:h-auto">
				<div className="relative flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
					<X
						className="absolute left-2 w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
						onClick={closeHandler}
					/>
					<h2 className="mx-auto text-lg font-medium text-gray-900 dark:text-white">
						New Rule
					</h2>
				</div>
				<div className="p-4">
					<RuleForm onSubmit={saveHandler} defaultRule={defaultRule} />
				</div>
			</div>
		</div>
	)
}
