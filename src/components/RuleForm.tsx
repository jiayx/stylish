import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react"
import { useEffect, useState } from "react"
import type { Rule } from "../types/types"

const defaultRule: Rule = {
  id: "",
  name: "",
  url: "",
  selector: "",
  style: "",
  enabled: true,
  createdAt: "",
}

export default function RuleForm({
  onSubmit,
  initialRule,
}: {
  onSubmit: (data: Rule) => void
  initialRule?: Rule
}) {
  const [rule, setRule] = useState<Rule>(initialRule || defaultRule)

  useEffect(() => {
    if (initialRule) {
      setRule(initialRule)
    } else {
      chrome.runtime.sendMessage("GET_ACTIVE_TAB", (response) => {
        console.log("response", response)
        if (!response) return

        setRule({
          ...defaultRule,
          url: response.url,
        })
      })
    }
  }, [initialRule])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newRule = {
      ...rule,
    }

    if (!initialRule) {
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
    setRule(initialRule || defaultRule)
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
          console.log("validate", value)
          if (!value) {
            return "Please enter a valid URL"
          }
          return null
        }}
      >
        <Label>URL</Label>
        <Input
          placeholder="Enter URL"
          value={rule.url}
          onChange={handleChange}
        />
        <Description>Support regex</Description>
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
        <Input
          placeholder="Enter selector"
          value={rule.selector}
          onChange={handleChange}
        />
        <Button type="button">Get Selector</Button>
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
        <Input
          placeholder="Enter rule name"
          value={rule.name}
          onChange={handleChange}
        />
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
          value={rule.style}
          onChange={handleChange}
          onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            console.log("input", e.target.value)
            const target = e.target
            target.style.height = "auto"
            target.style.height = `${target.scrollHeight}px`
          }}
          onReset={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            console.log("reset")
            const target = e.target
            target.style.height = "auto"
            target.style.height = `${target.scrollHeight}px`
          }}
        />
        <FieldError />
      </TextField>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
      </div>
    </Form>
  )
}
