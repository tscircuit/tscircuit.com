export const evalCompiledJs = (compiledCode: string) => {
  const functionBody = `
var exports = {};
var require = globalThis.__tscircuit_require;
var module = { exports };
${compiledCode};
return module;`.trim()
  return Function(functionBody).call(globalThis)
}
