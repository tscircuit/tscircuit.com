import { FunctionComponent, useMemo, useState } from "react"

export const createUseDialog = <
  DialogType extends React.ComponentType<any>,
  DialogProps extends Record<string, any>,
>(
  DialogComponent: DialogType,
) => {
  return () => {
    const [open, setOpen] = useState(false)
    const [dialogProps, setDialogProps] = useState<DialogProps | {}>({})

    return useMemo(
      () => ({
        openDialog: (props?: DialogProps) => {
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
