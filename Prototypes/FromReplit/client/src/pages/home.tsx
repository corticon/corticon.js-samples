import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TopNavigation from "@/components/top-navigation";
import ProjectExplorer, { type ProjectExplorerRef } from "@/components/project-explorer";
import EditorTabs from "@/components/editor-tabs";
import MonacoEditor from "@/components/ui/monaco-editor";
import { RuleflowEditor } from "@/components/ruleflow-editor";

import PropertiesPanel from "@/components/properties-panel";
import GitStatus from "@/components/git-status";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Project, Asset, RuleflowStructuralData, RuleflowUIData } from "@shared/schema";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openTabs, setOpenTabs] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<Asset | null>(null);

  // This is commented out to simplify things - we disable authentication
  // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     toast({
  //       title: "Unauthorized",
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //     return;
  //   }
  // }, [isAuthenticated, isLoading, toast]);

  // Authentication disabled for development mode
  // No redirect needed - useAuth() always returns authenticated user

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    enabled: true, // Always enabled since auth is disabled
    retry: false,
  });

  // Fetch assets for selected project
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["/api/projects", selectedProject?.id, "assets"],
    enabled: !!selectedProject,
    retry: false,
  });

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects && Array.isArray(projects) && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: async (assetData: { name: string; type: string; content: any }) => {
      if (!selectedProject) throw new Error("No project selected");
      return await apiRequest("POST", `/api/projects/${selectedProject.id}/assets`, assetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject?.id, "assets"] });
      toast({
        title: "Asset created",
        description: "Asset has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create asset.",
        variant: "destructive",
      });
    },
  });

  // Update asset mutation
  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: any }) => {
      return await apiRequest("PUT", `/api/assets/${id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject?.id, "assets"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update asset.",
        variant: "destructive",
      });
    },
  });

  // Update ruleflow workflow mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({
      assetId,
      structuralData,
      uiData
    }: {
      assetId: number;
      structuralData?: RuleflowStructuralData;
      uiData?: RuleflowUIData;
    }) => {
      return await apiRequest("PATCH", `/api/assets/${assetId}/workflow`, { structuralData, uiData });
    },
    onSuccess: () => {
      // Optional: Silent success for frequent updates
      console.log("Workflow saved successfully");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Update workflow error:", error);
      toast({
        title: "Error",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description?: string }) => {
      return await apiRequest("POST", `/api/projects`, projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "Project has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    },
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: number) => {
      return await apiRequest("DELETE", `/api/assets/${assetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject?.id, "assets"] });
      toast({
        title: "Asset deleted",
        description: "Asset has been deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete asset.",
        variant: "destructive",
      });
    },
  });

  const handleOpenAsset = async (asset: Asset) => {
    // Check if tab is already open
    const existingTab = openTabs.find(tab => tab.id === asset.id);
    if (existingTab) {
      setActiveTab(existingTab);
      return;
    }

    try {
      // Fetch complete asset data with structuralData and uiData
      const response = await apiRequest("GET", `/api/assets/${asset.id}`);
      const fullAsset = await response.json() as Asset;



      // Add the complete asset data to tabs
      setOpenTabs([...openTabs, fullAsset]);
      setActiveTab(fullAsset);
    } catch (error) {
      console.error("Failed to fetch asset data:", error);
      toast({
        title: "Error",
        description: "Failed to load asset data.",
        variant: "destructive",
      });
    }
  };

  const handleCloseTab = (asset: Asset) => {
    const newTabs = openTabs.filter(tab => tab.id !== asset.id);
    setOpenTabs(newTabs);

    if (activeTab?.id === asset.id) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    }
  };

  const handleCloseAll = () => {
    setOpenTabs([]);
    setActiveTab(null);
  };

  const handleContentChange = (content: string) => {
    if (activeTab) {
      try {
        const parsedContent = JSON.parse(content);
        updateAssetMutation.mutate({ id: activeTab.id, content: parsedContent });
      } catch (error) {
        // Invalid JSON, don't save
      }
    }
  };

  // Reference to project explorer to trigger create dialog
  const projectExplorerRef = useRef<ProjectExplorerRef>(null);

  const handleCreateAssetFromMenu = () => {
    projectExplorerRef.current?.openCreateDialog();
  };

  const handleDeleteAssetFromMenu = (asset: Asset) => {
    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      deleteAssetMutation.mutate(asset.id);

      // Close the tab if it's open
      if (openTabs.find(tab => tab.id === asset.id)) {
        handleCloseTab(asset);
      }
    }
  };

  const handleCreateProject = (name: string, description?: string) => {
    createProjectMutation.mutate({ name, description });
  };

  const handleDeleteProject = (project: Project) => {
    deleteProjectMutation.mutate(project.id);

    // If the deleted project was selected, clear selection
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
      setOpenTabs([]);
      setActiveTab(null);
    }
  };

  const handleCreateAsset = (name: string, type: string) => {
    const defaultContent = getDefaultContent(type);
    createAssetMutation.mutate({ name, type, content: defaultContent });
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return {
          vocabulary: {
            name: "NewVocabulary",
            version: "1.0",
            entities: []
          }
        };
      case 'rulesheets':
        return {
          rulesheet: {
            name: "NewRulesheet",
            version: "1.0",
            rules: []
          }
        };
      case 'ruleflow':
        return {
          ruleflow: {
            name: "NewRuleflow",
            version: "1.0",
            steps: []
          }
        };
      case 'rulestest':
        return {
          rulestest: {
            name: "NewRulestest",
            version: "1.0",
            tests: []
          }
        };
      default:
        return {};
    }
  };

  // auth is disabled
  // if (isLoading || !isAuthenticated) {
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation
        user={user as any}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        projects={Array.isArray(projects) ? projects : []}
        onCreateAsset={handleCreateAssetFromMenu}
        onDeleteAsset={handleDeleteAssetFromMenu}
        activeAsset={activeTab}
      />

      {/* Main content area - takes remaining space except status bar */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div id="sidebarId" className="w-64 bg-muted border-r border-border flex flex-col">
          <ProjectExplorer
            ref={projectExplorerRef}
            projects={Array.isArray(projects) ? projects : []}
            selectedProject={selectedProject}
            assets={Array.isArray(assets) ? assets : []}
            onProjectSelect={setSelectedProject}
            onAssetOpen={handleOpenAsset}
            onCreateAsset={handleCreateAsset}
            onDeleteAsset={(asset) => {
              deleteAssetMutation.mutate(asset.id);
              // Close the tab if it's open
              if (openTabs.find(tab => tab.id === asset.id)) {
                handleCloseTab(asset);
              }
            }}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            isLoading={projectsLoading || assetsLoading}
            currentAssetId={activeTab?.type === 'ruleflow' ? activeTab.id : undefined}
          />

          <GitStatus
            selectedProject={selectedProject}
            assets={Array.isArray(assets) ? assets : []}
          />
        </div>

        {/* Main Content - constrained by parent flex */}
        <div id="mainContentId" className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <EditorTabs
            tabs={openTabs}
            activeTab={activeTab}
            onTabClick={setActiveTab}
            onTabClose={handleCloseTab}
            onCloseAll={handleCloseAll}
          />

          {/* Editor Area - takes remaining space in this column */}
          <div className="flex-1 flex min-h-0">
            {/* Editor */}
            <div id="editorPanelId" className="flex-1 bg-background">
              {activeTab ? (
                activeTab.type === 'ruleflow' ? (
                  <RuleflowEditor
                    key={activeTab.id} // Force re-render when switching tabs
                    content={JSON.stringify(activeTab.content || {}, null, 2)}
                    onChange={handleContentChange}
                    structuralData={activeTab.structuralData as RuleflowStructuralData}
                    uiData={activeTab.uiData as RuleflowUIData}
                    currentAssetId={activeTab.id} // Pass current asset ID to prevent self-drag
                    onStructuralChange={(structuralData) => {
                      // Update the active tab's structural data immediately
                      setActiveTab(prev => prev ? { ...prev, structuralData } : null);

                      // Update tabs list as well
                      setOpenTabs(prev => prev.map(tab =>
                        tab.id === activeTab.id ? { ...tab, structuralData } : tab
                      ));

                      updateWorkflowMutation.mutate({
                        assetId: activeTab.id,
                        structuralData
                      });
                    }}
                    onUIChange={(uiData) => {
                      // Update the active tab's UI data immediately
                      setActiveTab(prev => prev ? { ...prev, uiData } : null);

                      // Update tabs list as well
                      setOpenTabs(prev => prev.map(tab =>
                        tab.id === activeTab.id ? { ...tab, uiData } : tab
                      ));

                      updateWorkflowMutation.mutate({
                        assetId: activeTab.id,
                        uiData
                      });
                    }}
                  />
                ) : (
                  <MonacoEditor
                    value={JSON.stringify(activeTab.content || {}, null, 2)}
                    language="json"
                    onChange={handleContentChange}
                    options={{
                      theme: 'vs-dark',
                      minimap: { enabled: true },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                )
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium mb-2">No file open</h3>
                    <p className="text-sm">Select a file from the explorer to start editing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Properties Panel */}
            <PropertiesPanel
              activeAsset={activeTab}
              assets={Array.isArray(assets) ? assets : []}
            />
          </div>
        </div>
      </div>

      {/* Status Bar - Fixed at bottom of viewport */}
      <div id="bottomStatusBarId" className="bg-primary text-primary-foreground text-xs flex items-center justify-between px-4 py-1 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>
            <i className="fas fa-git-alt mr-1"></i>main
          </span>
          <span>
            <i className="fas fa-sync mr-1"></i>Sync: Just now
          </span>
          <span>
            <i className="fas fa-check mr-1"></i>0 problems
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Corticon Studio Web v1.0.0</span>
          <span>JSON Schema Valid</span>
          {activeTab && <span>Ln 1, Col 1</span>}
        </div>
      </div>
    </div>
  );
}
