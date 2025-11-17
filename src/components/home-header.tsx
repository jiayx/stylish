import { PaintBucket, SunMoon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export default function Header() {
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer">
        <PaintBucket className="" />
        <h1 className="text-lg font-bold leading-tight tracking-tight">
          Stylish
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleThemeToggle}>
          <SunMoon />
        </Button>
      </div>
    </header>
  )
}
