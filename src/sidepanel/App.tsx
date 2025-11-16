import { ThemeProvider } from "@/components/theme-provider"
import Home from "./pages/home"

export default function App() {
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  )
}
