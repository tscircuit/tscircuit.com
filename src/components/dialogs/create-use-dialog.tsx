import { FunctionComponent, useMemo, useState } from "react"

export const createUseDialog = <DialogType extends React.ComponentType<any>>(
  DialogComponent: DialogType,
) => {
  return () => {
    const [open, setOpen] = useState(false)
    const [dialogProps, setDialogProps] = useState<any>({})

    return useMemo(
      () => ({
        openDialog: (props?: any) => {
          if (props) {
            setDialogProps(props)
          }
          setOpen(true)
        },
        closeDialog: () => {
          setOpen(false)
          setDialogProps({})
        },
        Dialog: (
          props: Omit<
            React.ComponentProps<DialogType>,
            "open" | "onOpenChange"
          >,
        ) => (
          <DialogComponent
            {...(props as any)}
            {...dialogProps}
            open={open}
            onOpenChange={setOpen}
          />
        ),
        open,
      }),
      [open, dialogProps],
    )
  }
}
