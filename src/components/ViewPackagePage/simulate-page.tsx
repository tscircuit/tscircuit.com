"use client"

import { useState, useEffect } from "react"
import RepoPageContent from "./components/repo-page-content"

// Sample data for simulation
const samplePackageFiles = [
  {
    package_file_id: "1",
    package_release_id: "1",
    file_path: "README.md",
    content_text:
      "# @tscircuit/keyboard-default60\n\nA Default 60 keyboard created with tscircuit\n\n## Features\n\n- Full mechanical keyboard PCB design\n- Compatible with standard 60% cases\n- USB-C connector\n- Supports QMK firmware",
    created_at: "2023-04-15T12:00:00Z",
  },
  {
    package_file_id: "2",
    package_release_id: "1",
    file_path: "LICENSE",
    content_text:
      'MIT License\n\nCopyright (c) 2023 tscircuit\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions...',
    created_at: "2023-04-15T12:00:00Z",
  },
  {
    package_file_id: "3",
    package_release_id: "1",
    file_path: "lib/index.tsx",
    content_text:
      "import React from 'react'\nimport { PCB, Resistor, Capacitor, LED } from '@tscircuit/react'\n\nexport const KeyboardDefault60 = () => {\n  return (\n    <PCB name=\"keyboard-default60\">\n      {/* Main controller */}\n      <Microcontroller x={50} y={50} name=\"MCU1\" />\n      \n      {/* Key matrix */}\n      <KeyMatrix x={100} y={100} rows={5} cols={14} />\n      \n      {/* Power circuit */}\n      <PowerCircuit x={20} y={20} />\n    </PCB>\n  )\n}",
    created_at: "2023-04-15T12:00:00Z",
  },
  {
    package_file_id: "4",
    package_release_id: "1",
    file_path: "lib/components/KeyMatrix.tsx",
    content_text:
      "import React from 'react'\nimport { Switch, Diode } from '@tscircuit/react'\n\ninterface KeyMatrixProps {\n  x: number\n  y: number\n  rows: number\n  cols: number\n}\n\nexport const KeyMatrix = ({ x, y, rows, cols }: KeyMatrixProps) => {\n  const keys = []\n  \n  for (let row = 0; row < rows; row++) {\n    for (let col = 0; col < cols; col++) {\n      keys.push(\n        <Switch\n          key={`key-${row}-${col}`}\n          x={x + col * 19.05}\n          y={y + row * 19.05}\n          name={`SW${row * cols + col + 1}`}\n        />\n      )\n      \n      keys.push(\n        <Diode\n          key={`diode-${row}-${col}`}\n          x={x + col * 19.05 + 5}\n          y={y + row * 19.05 + 5}\n          name={`D${row * cols + col + 1}`}\n        />\n      )\n    }\n  }\n  \n  return <>{keys}</>\n}",
    created_at: "2023-04-15T12:00:00Z",
  },
  {
    package_file_id: "5",
    package_release_id: "1",
    file_path: "lib/components/PowerCircuit.tsx",
    content_text:
      'import React from \'react\'\nimport { Capacitor, Resistor, Regulator } from \'@tscircuit/react\'\n\ninterface PowerCircuitProps {\n  x: number\n  y: number\n}\n\nexport const PowerCircuit = ({ x, y }: PowerCircuitProps) => {\n  return (\n    <>\n      <Regulator\n        x={x}\n        y={y}\n        name="U1"\n        value="AP2112K-3.3"\n      />\n      <Capacitor\n        x={x - 10}\n        y={y}\n        name="C1"\n        value="10uF"\n      />\n      <Capacitor\n        x={x + 10}\n        y={y}\n        name="C2"\n        value="10uF"\n      />\n      <Resistor\n        x={x}\n        y={y + 10}\n        name="R1"\n        value="10k"\n      />\n    </>\n  )\n}',
    created_at: "2023-04-15T12:00:00Z",
  },
  {
    package_file_id: "6",
    package_release_id: "1",
    file_path: "package.json",
    content_text:
      '{\n  "name": "@tscircuit/keyboard-default60",\n  "version": "0.0.361",\n  "description": "A Default 60 keyboard created with tscircuit",\n  "main": "dist/index.js",\n  "types": "dist/index.d.ts",\n  "scripts": {\n    "build": "tsc",\n    "test": "jest"\n  },\n  "dependencies": {\n    "@tscircuit/react": "^0.1.0",\n    "react": "^18.2.0"\n  },\n  "devDependencies": {\n    "typescript": "^5.0.0",\n    "jest": "^29.0.0"\n  },\n  "license": "MIT"\n}',
    created_at: "2023-04-15T12:00:00Z",
  },
  {
    package_file_id: "7",
    package_release_id: "1",
    file_path: "tsconfig.json",
    content_text:
      '{\n  "compilerOptions": {\n    "target": "es2020",\n    "module": "esnext",\n    "moduleResolution": "node",\n    "declaration": true,\n    "outDir": "./dist",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true,\n    "jsx": "react"\n  },\n  "include": ["lib/**/*"],\n  "exclude": ["node_modules", "**/*.test.ts"]\n}',
    created_at: "2023-04-15T12:00:00Z",
  },
]

const samplePackageInfo = {
  name: "@tscircuit/keyboard-default60",
  unscoped_name: "keyboard-default60",
  owner_github_username: "tscircuit",
  star_count: "16",
  description: "A Default 60 keyboard created with tscircuit",
  ai_description:
    "This package contains the PCB design for a standard 60% mechanical keyboard layout, created using the tscircuit library. It includes the schematic, PCB layout, and 3D model.",
}

export default function SimulatePage() {
  const [packageFiles, setPackageFiles] = useState<any>(null)
  const [packageInfo, setPackageInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data after 1 second
    const timer = setTimeout(() => {
      setPackageFiles(samplePackageFiles)
      setPackageInfo(samplePackageInfo)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Event handlers with window.alert for testing
  const handleFileClicked = (file: any) => {
    window.alert(`File clicked: ${file.name}`)
  }

  const handleDirectoryClicked = (directory: any) => {
    window.alert(`Directory clicked: ${directory.name}`)
  }

  const handleExportClicked = (exportType: string) => {
    window.alert(`Export clicked: ${exportType}`)
  }

  const handleEditClicked = () => {
    window.alert("Edit button clicked")
  }

  return (
    <RepoPageContent
      packageFiles={packageFiles}
      packageInfo={packageInfo}
      importantFilePaths={["README.md", "LICENSE", "package.json"]}
      onFileClicked={handleFileClicked}
      onDirectoryClicked={handleDirectoryClicked}
      onExportClicked={handleExportClicked}
      onEditClicked={handleEditClicked}
    />
  )
}
