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
import { getCurrentTab, sendToActiveTab } from "@/lib/messaging"
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
}: {
  onSubmit: (data: Rule) => void
  initialRule?: Rule
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
    sendToActiveTab({ type: "START_PICKER" }).catch(console.error)
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "ELEMENT_PICKED") {
      console.log("selector", msg)

      form.setFieldValue("selector", msg.selector)

      const oldUrl = form.getFieldValue("url")
      if (!oldUrl || !matchUrl(oldUrl, msg.url)) {
        form.setFieldValue("url", msg.url)
      }

      sendResponse(true)
    }
  })

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
                <FieldDescription>Support regex</FieldDescription>
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
                    placeholder="Enter selector or select from page"
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton onClick={handleSelector}>
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
                  placeholder={
                    "color: red;\nfont-size: 20px;\nbackground-color: yellow;"
                  }
                  className="resize-none overflow-hidden"
                  rows={5}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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
          <Button type="submit" form="rule-form">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={resetForm}>
            reset
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
