import { PaintBucket, Settings } from "lucide-react"

export default function Header() {
	return (
		<header className="sticky top-0 z-10 flex items-center justify-between">
			<div className="flex items-center gap-2 cursor-pointer">
				<PaintBucket className="text-sky-400 dark:text-white" />
				<h1 className="text-lg font-bold leading-tight tracking-tight text-sky-400 dark:text-white">
					Stylish
				</h1>
			</div>
			<div className="flex items-center gap-2 cursor-pointer transition-colors hover:text-sky-800 dark:hover:text-white-800">
				<div className="p-2 rounded-full hover:bg-sky-200 dark:hover:bg-sky-800">
					<Settings className="w-5 h-5 text-sky-400 dark:text-white-500" />
				</div>
			</div>
		</header>
	)
}
