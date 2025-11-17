import { useForm } from "@tanstack/react-form"
import { SquareDashedMousePointer } from "lucide-react"
import { useEffect, useEffectEvent } from "react"
import z from "zod"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { matchUrl } from "@/lib/match-url"
import type { Message } from "@/lib/messaging"
import { getCurrentTab, sendToActiveTab } from "@/lib/messaging"
import { cn, debounce } from "@/lib/utils"
import type { Rule } from "@/types/types"

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  url: z.string().min(1, "URL is required."),
  selector: z.string().min(1, "Selector is required."),
  style: z.string(),
  enabled: z.boolean(),
  createdAt: z.string(),
})

export default function RuleForm({
  onSubmit,
  initialRule,
  pickerActive,
  setPickerActive,
}: {
  onSubmit: (data: Rule) => void
  initialRule?: Rule
  pickerActive: boolean
  setPickerActive: (active: boolean) => void
}) {
  const form = useForm({
    defaultValues: {
      id: initialRule?.id || "",
      name: initialRule?.name || "",
      url: initialRule?.url || "",
      selector: initialRule?.selector || "",
      style: initialRule?.style || "",
      enabled: true,
      createdAt: initialRule?.createdAt || "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      // 解构防止修改传入对象的值
      onSubmit({ ...value })
    },
  })

  const resetForm = useEffectEvent(() => {
    form.reset()
    getCurrentTab()
      .then((tab) => {
        form.setFieldValue("url", tab?.url || "")
      })
      .catch(console.error)
    sendToActiveTab({ type: "REMOVE_RULE", id: "preview" }).catch(console.error)
  })

  useEffect(() => {
    if (initialRule) {
      // 编辑模式：用当前 rule 填充
      form.reset({
        id: initialRule.id || "",
        name: initialRule.name || "",
        url: initialRule.url || "",
        selector: initialRule.selector || "",
        style: initialRule.style || "",
        enabled: initialRule.enabled,
        createdAt: initialRule.createdAt || "",
      })
    } else {
      resetForm()
    }
  }, [initialRule, form])

  const handleSelector = () => {
    sendToActiveTab({ type: "START_PICKER" })
      .then(() => {
        setPickerActive(true)
      })
      .catch(console.error)
  }

  const handleChromeMessage = useEffectEvent(
    (
      msg: Message,
      _sender: chrome.runtime.MessageSender,
      // biome-ignore lint/suspicious/noExplicitAny: any
      sendResponse: any,
    ) => {
      if (msg.type === "ELEMENT_PICKED") {
        setPickerActive(false)
        form.setFieldValue("selector", msg.selector)
        const oldUrl = form.getFieldValue("url")
        if (!oldUrl || !matchUrl(oldUrl, msg.url)) {
          form.setFieldValue("url", msg.url)
        }
        sendResponse(true)
      }
    },
  )
  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleChromeMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleChromeMessage)
    }
  }, [])

  const handleCssPreview = debounce((style: string) => {
    const selector = form.getFieldValue("selector")
    if (!selector) return
    sendToActiveTab({
      type: "PREVIEW_RULE",
      rule: { id: "preview", name: "preview", style, selector, enabled: true },
    })
  }, 500)

  return (
    <form
      id="rule-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field name="url">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter URL"
                  autoComplete="off"
                />
                {!field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
                <FieldDescription>Supports the * wildcard</FieldDescription>
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="selector">
          {(field) => {
            return (
              <Field
                data-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              >
                <FieldLabel htmlFor={field.name}>Selector</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    placeholder="Type or pick with the button ->"
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={handleSelector}
                      className={cn({
                        "text-green-400": pickerActive,
                        "hover:text-green-500": pickerActive,
                      })}
                    >
                      <SquareDashedMousePointer />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="name">
          {(field) => {
            return (
              <Field
                data-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              >
                <FieldLabel htmlFor={field.name}>Rule Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  placeholder="Enter rule name"
                  autoComplete="off"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="style">
          {(field) => {
            return (
              <Field
                data-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              >
                <FieldLabel htmlFor={field.name}>CSS Style</FieldLabel>
                <Textarea
                  placeholder={"font-size: 20px;\nbackground-color: red;"}
                  className="resize-none overflow-hidden"
                  rows={5}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    handleCssPreview(e.target.value)
                  }}
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  autoComplete="off"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )
          }}
        </form.Field>

        <Field orientation="horizontal">
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            className="flex-1"
          >
            Reset
          </Button>
          <Button type="submit" form="rule-form" className="flex-1">
            Save
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
