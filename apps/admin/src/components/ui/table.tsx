"use client"

import * as React from "react"

import { STICKY_TOOLBAR_OFFSET_CHANGE_EVENT } from "@/hooks/use-sticky-toolbar-offset"
import { cn } from "@/lib/utils"

type TableProps = React.ComponentProps<"table"> & {
  containerClassName?: string
  stickyHeader?: boolean
}

function Table({
  className,
  containerClassName,
  stickyHeader = false,
  ...props
}: TableProps) {
  const tableRef = React.useRef<HTMLTableElement>(null)

  React.useLayoutEffect(() => {
    const table = tableRef.current
    if (!stickyHeader || !table) return

    let animationFrame = 0
    const updateHeaderPosition = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const header = table.tHead
        if (!header) return

        const configuredTop = Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--admin-sticky-table-top"
          )
        )
        const stickyTop = Number.isFinite(configuredTop) ? configuredTop : 80
        const tableTop = table.getBoundingClientRect().top
        const maximumOffset = Math.max(0, table.offsetHeight - header.offsetHeight)
        const offset = Math.min(
          Math.max(stickyTop - tableTop, 0),
          maximumOffset
        )

        table.style.setProperty("--admin-table-header-translate", `${offset}px`)
      })
    }

    updateHeaderPosition()
    window.addEventListener("scroll", updateHeaderPosition, { passive: true })
    window.addEventListener("resize", updateHeaderPosition)
    window.addEventListener(
      STICKY_TOOLBAR_OFFSET_CHANGE_EVENT,
      updateHeaderPosition
    )
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateHeaderPosition)
    observer?.observe(table)

    return () => {
      cancelAnimationFrame(animationFrame)
      observer?.disconnect()
      window.removeEventListener("scroll", updateHeaderPosition)
      window.removeEventListener("resize", updateHeaderPosition)
      window.removeEventListener(
        STICKY_TOOLBAR_OFFSET_CHANGE_EVENT,
        updateHeaderPosition
      )
      table.style.removeProperty("--admin-table-header-translate")
    }
  }, [stickyHeader])

  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        ref={tableRef}
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm",
          stickyHeader &&
            "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:translate-y-[var(--admin-table-header-translate,0px)] [&_thead_th]:bg-zinc-950 [&_thead_th]:shadow-[inset_0_-1px_0_rgba(255,255,255,0.1)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
