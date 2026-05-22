"use client"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import { SearchIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const { t } = useTranslation()
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          {t("sidebar.search")}
        </Label>
        <SidebarInput
          id="search"
          placeholder={t("sidebar.typeToSearch")}
          className="h-8 pl-7"
        />
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}
