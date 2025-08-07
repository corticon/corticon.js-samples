import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  RefreshCw, 
  Folder, 
  FolderOpen, 
  FileText, 
  Code,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Circle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project, Asset } from "@shared/schema";

interface ProjectExplorerProps {
  projects: Project[];
  selectedProject: Project | null;
  assets: Asset[];
  onProjectSelect: (project: Project) => void;
  onAssetOpen: (asset: Asset) => void;
  onCreateAsset: (name: string, type: string) => void;
  onDeleteAsset?: (asset: Asset) => void;
  onCreateProject?: (name: string, description?: string) => void;
  onDeleteProject?: (project: Project) => void;
  isLoading: boolean;
  currentAssetId?: number; // ID of currently active ruleflow to prevent self-drag
}

export interface ProjectExplorerRef {
  openCreateDialog: () => void;
}

const ProjectExplorer = forwardRef<ProjectExplorerRef, ProjectExplorerProps>(({ 
  projects, 
  selectedProject, 
  assets, 
  onProjectSelect, 
  onAssetOpen,
  onCreateAsset,
  onDeleteAsset,
  onCreateProject,
  onDeleteProject,
  isLoading,
  currentAssetId
}, ref) => {
  const { t } = useLanguage();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['vocabulary', 'rulesheets', 'ruleflow', 'rulestest'])
  );
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Project management state
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  useImperativeHandle(ref, () => ({
    openCreateDialog: () => setIsCreateDialogOpen(true)
  }));

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const getAssetsByType = (type: string) => {
    return assets.filter(asset => asset.type === type);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return <Code className="h-4 w-4 text-github-blue" />;
      case 'rulesheets':
        return <FileText className="h-4 w-4 text-success-green" />;
      case 'ruleflow':
        return <FileText className="h-4 w-4 text-warning-amber" />;
      case 'rulestest':
        return <FileText className="h-4 w-4 text-purple-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleCreateAsset = () => {
    if (newAssetName && newAssetType) {
      onCreateAsset(newAssetName, newAssetType);
      setNewAssetName("");
      setNewAssetType("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleCreateProject = () => {
    if (newProjectName && onCreateProject) {
      onCreateProject(newProjectName, newProjectDescription || undefined);
      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreateProjectDialogOpen(false);
    }
  };

  const assetTypes = [
    { value: 'vocabulary', label: t('asset.vocabulary') },
    { value: 'rulesheets', label: t('asset.rulesheets') },
    { value: 'ruleflow', label: t('asset.ruleflow') },
    { value: 'rulestest', label: t('asset.rulestest') },
  ];

  return (
    <div id="projectExplorerId" className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400">
            {t('project.explorer')}
          </h3>
          <div className="flex space-x-1">
            {/* Create Project Button */}
            <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="p-1 hover:bg-gray-600 rounded h-auto" 
                  title="New Project"
                >
                  <Folder className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-sidebar-bg border-gray-700 text-dark-text">
                <DialogHeader>
                  <DialogTitle className="text-dark-text">{t('project.createProject')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t('project.projectName')}
                    </label>
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="bg-tab-bg border-gray-600 text-dark-text placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t('project.description')}
                    </label>
                    <Input
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                      className="bg-tab-bg border-gray-600 text-dark-text placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateProjectDialogOpen(false)}
                      className="border-gray-600 text-gray-400 hover:bg-gray-600"
                    >
                      {t('project.cancel')}
                    </Button>
                    <Button 
                      onClick={handleCreateProject}
                      disabled={!newProjectName}
                      className="bg-github-blue hover:bg-blue-700"
                    >
                      {t('project.create')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="p-1 hover:bg-gray-600 rounded h-auto" 
                  title="New Asset"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-sidebar-bg border-gray-700 text-dark-text">
                <DialogHeader>
                  <DialogTitle className="text-dark-text">{t('asset.createAsset')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t('asset.assetName')}
                    </label>
                    <Input
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      placeholder="Enter asset name"
                      className="bg-tab-bg border-gray-600 text-dark-text placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t('asset.assetType')}
                    </label>
                    <Select value={newAssetType} onValueChange={setNewAssetType}>
                      <SelectTrigger className="bg-tab-bg border-gray-600 text-dark-text placeholder:text-gray-400">
                        <SelectValue placeholder={t('asset.selectType')} />
                      </SelectTrigger>
                      <SelectContent className="bg-sidebar-bg border-gray-700">
                        {assetTypes.map((type) => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value}
                            className="text-dark-text hover:bg-gray-600 focus:bg-gray-600"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-gray-600 text-gray-400 hover:bg-gray-600"
                    >
                      {t('project.cancel')}
                    </Button>
                    <Button 
                      onClick={handleCreateAsset}
                      disabled={!newAssetName || !newAssetType}
                      className="bg-github-blue hover:bg-blue-700"
                    >
                      {t('project.create')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-1 hover:bg-gray-600 rounded h-auto" 
              title="RefreshCw"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Project List */}
        {projects.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-500 mb-2">All Projects ({projects.length})</h4>
            <div className="max-h-32 overflow-y-auto scrollbar-thin space-y-1">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className={`group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-600 ${
                    selectedProject?.id === project.id ? 'bg-gray-600' : ''
                  }`}
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Folder className="h-3 w-3 text-github-blue flex-shrink-0" />
                    <span className="text-xs truncate">{project.name}</span>
                  </div>
                  {onDeleteProject && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-auto w-auto hover:bg-gray-500 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-sidebar-bg border-gray-600">
                        <DropdownMenuItem 
                          className="text-xs text-red-400 hover:bg-gray-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
                              onDeleteProject(project);
                            }
                          }}
                        >
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Active Project Display */}
        {selectedProject ? (
          <div className="bg-tab-bg rounded border border-gray-600 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4 text-warning-amber" />
                <span className="text-sm font-medium">{selectedProject.name}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              <i className="fas fa-git-alt mr-1"></i>main • synced
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No project selected</div>
        )}
      </div>

      {/* File Explorer */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">Loading...</div>
        ) : selectedProject ? (
          <div className="p-2">
            <div className="space-y-1">
              {assetTypes.map((folder) => {
                const folderAssets = getAssetsByType(folder.value);
                const isExpanded = expandedFolders.has(folder.value);
                
                return (
                  <div key={folder.value} className="text-xs">
                    {/* Folder Header */}
                    <div 
                      className="flex items-center py-1 px-2 hover:bg-gray-600 rounded cursor-pointer"
                      onClick={() => toggleFolder(folder.value)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      )}
                      {isExpanded ? (
                        <FolderOpen className="h-4 w-4 text-warning-amber ml-1 mr-2" />
                      ) : (
                        <Folder className="h-4 w-4 text-gray-500 ml-1 mr-2" />
                      )}
                      <span>{folder.label}</span>
                      {folderAssets.length > 0 && (
                        <span className="ml-auto text-gray-500">({folderAssets.length})</span>
                      )}
                    </div>

                    {/* Folder Contents */}
                    {isExpanded && (
                      <div className="ml-6 space-y-1">
                        {folderAssets.map((asset) => {
                          const isDraggable = asset.type === 'rulesheets' || asset.type === 'ruleflow';
                          const isCurrentAsset = asset.type === 'ruleflow' && currentAssetId && asset.id === currentAssetId;
                          const isActuallyDraggable = isDraggable && !isCurrentAsset;
                          
                          return (
                            <div 
                              key={asset.id}
                              className={`flex items-center py-1 px-2 hover:bg-gray-600 rounded group ${
                                isCurrentAsset 
                                  ? 'cursor-not-allowed opacity-60' 
                                  : isActuallyDraggable 
                                    ? 'cursor-grab' 
                                    : 'cursor-pointer'
                              }`}
                              onClick={isActuallyDraggable ? undefined : () => onAssetOpen(asset)}
                              draggable={isActuallyDraggable}
                              onMouseDown={(e) => {
                                console.log('Mouse down event for:', asset.name, 'isDraggable:', isActuallyDraggable);
                                if (isActuallyDraggable) {
                                  console.log('Mouse down on draggable element:', asset.name);
                                  e.currentTarget.style.cursor = 'grabbing';
                                }
                              }}
                              onMouseUp={(e) => {
                                if (isActuallyDraggable) {
                                  console.log('Mouse up on draggable element:', asset.name);
                                  e.currentTarget.style.cursor = 'grab';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (isActuallyDraggable) {
                                  e.currentTarget.style.cursor = 'grab';
                                }
                              }}
                              onDragStart={(e) => {
                                console.log('🚀 DragStart event fired for:', asset.name, 'isActuallyDraggable:', isActuallyDraggable);
                                if (isCurrentAsset) {
                                  console.log('❌ Preventing drag for current ruleflow:', asset.name);
                                  e.preventDefault();
                                  return false;
                                }
                                if (isActuallyDraggable) {
                                  console.log('✅ Setting drag data for asset:', asset.name);
                                  
                                  // Set multiple data formats for better browser compatibility
                                  const dragData = {
                                    id: asset.id,
                                    name: asset.name,
                                    type: asset.type
                                  };
                                  
                                  const dragDataString = JSON.stringify(dragData);
                                  console.log('📦 Drag data:', dragDataString);
                                  
                                  try {
                                    e.dataTransfer.setData('application/json', dragDataString);
                                    e.dataTransfer.setData('text/plain', dragDataString);
                                    e.dataTransfer.setData('text', dragDataString); // Additional fallback
                                    e.dataTransfer.effectAllowed = 'copy';
                                    console.log('✅ Data transfer set successfully');
                                  } catch (error) {
                                    console.error('❌ Error setting drag data:', error);
                                  }
                                  
                                  e.currentTarget.style.cursor = 'grabbing';
                                  e.currentTarget.classList.add('dragging');
                                  
                                  // Create a more visible custom drag image
                                  const dragImage = document.createElement('div');
                                  dragImage.textContent = `📋 ${asset.name}`;
                                  dragImage.style.position = 'absolute';
                                  dragImage.style.top = '-1000px';
                                  dragImage.style.backgroundColor = '#2563eb';
                                  dragImage.style.color = 'white';
                                  dragImage.style.padding = '8px 12px';
                                  dragImage.style.borderRadius = '6px';
                                  dragImage.style.fontSize = '14px';
                                  dragImage.style.fontWeight = 'bold';
                                  dragImage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                  document.body.appendChild(dragImage);
                                  
                                  try {
                                    e.dataTransfer.setDragImage(dragImage, 20, 20);
                                    console.log('✅ Custom drag image set');
                                  } catch (error) {
                                    console.error('❌ Error setting drag image:', error);
                                  }
                                  
                                  // Clean up drag image after drag starts
                                  setTimeout(() => {
                                    if (document.body.contains(dragImage)) {
                                      document.body.removeChild(dragImage);
                                    }
                                  }, 100);
                                } else {
                                  console.log('❌ Preventing drag for non-draggable asset');
                                  e.preventDefault();
                                  return false;
                                }
                              }}
                              onDragEnd={(e) => {
                                if (isActuallyDraggable) {
                                  console.log('🏁 Drag ended for:', asset.name);
                                  e.currentTarget.style.cursor = 'grab';
                                  e.currentTarget.classList.remove('dragging');
                                }
                              }}
                              onDoubleClick={(e) => {
                                if (isDraggable) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onAssetOpen(asset);
                                }
                              }}
                              style={{
                                userSelect: isActuallyDraggable ? 'none' : 'auto',
                                WebkitUserSelect: isActuallyDraggable ? 'none' : 'auto'
                              }}
                              title={isCurrentAsset ? "Currently open - cannot drag onto itself" : undefined}
                            >
                            {getAssetIcon(asset.type)}
                            <span className={`ml-2 flex-1 ${isCurrentAsset ? 'text-gray-400' : ''}`}>
                              {asset.name}
                              {isCurrentAsset && <span className="ml-1 text-xs">(currently open)</span>}
                            </span>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                              <Circle className="h-2 w-2 text-warning-amber fill-current" />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="p-1 h-auto w-auto hover:bg-gray-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-sidebar-bg border-gray-600">
                                  <DropdownMenuItem className="text-xs text-dark-text hover:bg-gray-600 cursor-pointer">
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs text-dark-text hover:bg-gray-600 cursor-pointer">
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs text-dark-text hover:bg-gray-600 cursor-pointer">
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-xs text-red-400 hover:bg-gray-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onDeleteAsset && confirm(`Are you sure you want to delete "${asset.name}"?`)) {
                                        onDeleteAsset(asset);
                                      }
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                        })}
                        
                        {folderAssets.length === 0 && (
                          <div className="py-2 px-2 text-gray-500 text-xs">
                            No {folder.label.toLowerCase()} files
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400">
            <div className="text-4xl mb-2">📁</div>
            <p>Select a project to view files</p>
          </div>
        )}
      </div>
    </div>
  );
});

ProjectExplorer.displayName = "ProjectExplorer";

export default ProjectExplorer;
