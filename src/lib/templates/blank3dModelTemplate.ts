export const blank3dModelTemplate = {
  type: "model",
  code: `
// Note: Eventually this should have a <jscad> wrapper
export const MyModel = (props: any) => (
  <>
    {/* <cuboid size={[5, 10, 5]} /> */}
    <cube size={1} />
  </>
)
`.trim(),
}
