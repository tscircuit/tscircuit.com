import * as React from "react"
import { Link } from "wouter"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"

const CmdKMenu = () => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // All available blank templates
  const blankTemplates = [
    { name: "Blank Circuit Board", type: "board" },
    { name: "Blank Circuit Module", type: "package" },
    { name: "Blank 3D Model", type: "model", disabled: true },
    { name: "Blank Footprint", type: "footprint", disabled: true },
  ]

  // All available templates
  const templates = [{ name: "Blinking LED Board", type: "board" }]

  // Import options
  const importOptions = [
    { name: "KiCad Footprint", type: "footprint" },
    { name: "KiCad Project", type: "board" },
    { name: "KiCad Module", type: "package" },
    { name: "JLCPCB Component", type: "package", special: true },
  ]

  const commands = [
    {
      group: "Create New",
      items: blankTemplates.map((template) => ({
        label: `Create New ${template.name}`,
        href: template.disabled
          ? undefined
          : `/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`,
        disabled: template.disabled,
        type: template.type,
      })),
    },
    {
      group: "Templates",
      items: templates.map((template) => ({
        label: `Use ${template.name} Template`,
        href: `/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`,
        type: template.type,
      })),
    },
    {
      group: "Import",
      items: importOptions.map((option) => ({
        label: `Import ${option.name}`,
        action: option.special
          ? () => {
              setOpen(false)
              // setIsJLCPCBDialogOpen(true);
            }
          : () => {
              setOpen(false)
              // toastNotImplemented(`${option.name} Import`);
            },
        type: option.type,
      })),
    },
  ]

  const filteredCommands = commands
    .map((group) => ({
      ...group,
      items: group.items.filter((command) =>
        command.label.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0)

  const CommandItemWrapper = ({
    children,
    href,
    action,
    onSelect,
    disabled,
  }: {
    children: React.ReactNode
    href?: string
    action?: () => void
    onSelect: () => void
    disabled?: boolean
  }) => {
    if (disabled) {
      return <div className="opacity-50 cursor-not-allowed">{children}</div>
    }
    if (href) {
      return (
        <Link href={href}>
          <a onClick={onSelect} className="w-full">
            {children}
          </a>
        </Link>
      )
    }
    return (
      <div onClick={action} className="cursor-pointer w-full">
        {children}
      </div>
    )
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search for commands..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {filteredCommands.length > 0 ? (
          filteredCommands.map((group, groupIndex) => (
            <CommandGroup key={groupIndex} heading={group.group}>
              {group.items.map((command, itemIndex) => (
                <CommandItem
                  key={itemIndex}
                  onSelect={() => {
                    if (!command.disabled) {
                      setOpen(false)
                    }
                  }}
                  className={`flex items-center justify-between ${command.disabled ? "opacity-50" : ""}`}
                  disabled={command.disabled}
                >
                  <CommandItemWrapper
                    href={command.href}
                    action={command.action}
                    onSelect={() => setOpen(false)}
                    disabled={command.disabled}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{command.label}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {command.type}
                      </span>
                    </div>
                  </CommandItemWrapper>
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        ) : (
          <CommandEmpty>No commands found.</CommandEmpty>
        )}
      </CommandList>
    </CommandDialog>
  )
}

export default CmdKMenu
