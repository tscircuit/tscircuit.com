import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Github, Shield, Trash2, Save } from "lucide-react"

interface ConnectedRepoSettingsProps {
  projectName?: string
  onSave?: (settings: any) => void
}

export const ConnectedRepoSettings = ({
  projectName = "tscircuit-project",
  onSave,
}: ConnectedRepoSettingsProps) => {
  // MOCK
  const initialSettings = {
    general: {
      projectName: projectName,
      description: "A TypeScript circuit design project",
    },
    git: {
      repository: "github.com/user/tscircuit-project",
      productionBranch: "main",
      autoBuildEnabled: true,
      prComment: true,
      buildPrs: true,
    },
    security: {
      privateBuilds: false,
      requireApprovalForPrs: true,
    },
  }

  const [settings, setSettings] = useState(initialSettings)
  const [hasChanges, setHasChanges] = useState(false)

  // Track changes
  useEffect(() => {
    const isChanged =
      JSON.stringify(settings) !== JSON.stringify(initialSettings)
    setHasChanges(isChanged)
  }, [settings])

  const handleSave = () => {
    onSave?.(settings)
    setHasChanges(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Settings
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Configure your build settings
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="general"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
          <TabsTrigger
            value="git"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Github className="w-3 h-3 sm:w-4 sm:h-4" />
            Git
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Security</span>
            <span className="sm:hidden">Sec</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={settings.general.projectName}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, projectName: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.general.description}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, description: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="git" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Git Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="repository">Repository</Label>
                <Input
                  id="repository"
                  value={settings.git.repository}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      git: { ...prev.git, repository: e.target.value },
                    }))
                  }
                  placeholder="github.com/user/repo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productionBranch">Production Branch</Label>
                <Input
                  id="productionBranch"
                  value={settings.git.productionBranch}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      git: { ...prev.git, productionBranch: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoBuildEnabled"
                    checked={settings.git.autoBuildEnabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        git: { ...prev.git, autoBuildEnabled: checked },
                      }))
                    }
                  />
                  <Label htmlFor="autoBuildEnabled">
                    Enable automatic builds
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="prComment"
                    checked={settings.git.prComment}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        git: { ...prev.git, prComment: checked },
                      }))
                    }
                  />
                  <Label htmlFor="prComment">
                    Comment on pull requests with build preview
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="buildPrs"
                    checked={settings.git.buildPrs}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        git: { ...prev.git, buildPrs: checked },
                      }))
                    }
                  />
                  <Label htmlFor="buildPrs">
                    Build pull requests automatically
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="privateBuilds"
                    checked={settings.security.privateBuilds}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          privateBuilds: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="privateBuilds">Make builds private</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireApprovalForPrs"
                    checked={settings.security.requireApprovalForPrs}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          requireApprovalForPrs: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="requireApprovalForPrs">
                    Require approval for PR builds
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 text-lg sm:text-xl">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-600">Delete Project</h4>
                  <p className="text-sm text-gray-600">
                    Permanently delete this project and all its builds
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the project and remove all build data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Project
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
