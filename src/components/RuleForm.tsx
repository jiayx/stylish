import {
	Button,
	FieldError,
	Form,
	Input,
	Label,
	TextArea,
	TextField,
} from "@heroui/react"
import { useState } from "react"
import type { Rule } from "../types/types"

export default function RuleForm({
	onSubmit,
	defaultRule,
}: {
	onSubmit: (data: Rule) => void
	defaultRule?: Rule
}) {
	const [rule, setRule] = useState<Rule>(
		defaultRule || {
			id: "",
			name: "",
			url: "",
			selector: "",
			style: "",
			enabled: true,
			createdAt: "",
		},
	)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const newRule = {
			...rule,
		}

		if (!defaultRule) {
			console.log("create mode")
			newRule.id = crypto.randomUUID()
			newRule.createdAt = new Date().toISOString()
		}

		onSubmit(newRule)
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setRule({
			...rule,
			[e.target.name]: e.target.value,
		})
	}

	const handleReset = () => {
		setRule(
			defaultRule || {
				id: "",
				name: "",
				url: "",
				selector: "",
				style: "",
				enabled: true,
				createdAt: "",
			},
		)
	}

	return (
		<Form
			className="flex flex-col gap-4"
			onSubmit={handleSubmit}
			onReset={handleReset}
		>
			<TextField
				isRequired
				name="url"
				type="text"
				validate={(value) => {
					if (!value) {
						return "Please enter a valid URL"
					}
					return null
				}}
			>
				<Label>URL</Label>
				<Input placeholder="Enter URL" onChange={handleChange} />
				<FieldError />
			</TextField>
			<TextField
				isRequired
				name="selector"
				type="text"
				validate={(value) => {
					if (!value) {
						return "Please enter a valid selector"
					}
					return null
				}}
			>
				<Label>Selector</Label>
				<Input placeholder="Enter selector" onChange={handleChange} />
				<FieldError />
			</TextField>
			<TextField
				isRequired
				name="name"
				type="text"
				validate={(value) => {
					if (!value) {
						return "Please enter a valid rule name"
					}
					return null
				}}
			>
				<Label>Rule Name</Label>
				<Input placeholder="Enter rule name" onChange={handleChange} />
				<FieldError />
			</TextField>
			<TextField name="style">
				<Label>CSS Style</Label>
				<TextArea
					placeholder={
						"color: red;\nfont-size: 20px;\nbackground-color: yellow;"
					}
					className="resize-none overflow-hidden"
					rows={5}
					onChange={handleChange}
					onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
						const target = e.target
						target.style.height = "auto"
						target.style.height = `${target.scrollHeight}px`
					}}
				/>
				<FieldError />
			</TextField>
			<div className="flex gap-2">
				<Button type="submit">Submit</Button>
				<Button type="reset" variant="secondary">
					Reset
				</Button>
			</div>
		</Form>
	)
}
