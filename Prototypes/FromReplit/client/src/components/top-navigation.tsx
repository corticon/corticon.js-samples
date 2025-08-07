import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Box, ChevronDown, Plus, Save, Upload, FileText, Trash2, FolderPlus, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import type { User, Project, Asset } from "@shared/schema";

interface TopNavigationProps {
  user: User | null;
  selectedProject: Project | null;
  onProjectChange: (project: Project) => void;
  projects: Project[];
  onCreateAsset?: () => void;
  onDeleteAsset?: (asset: Asset) => void;
  activeAsset?: Asset | null;
}

export default function TopNavigation({ 
  user, 
  selectedProject, 
  onProjectChange, 
  projects,
  onCreateAsset,
  onDeleteAsset,
  activeAsset
}: TopNavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const languageNames: Record<Language, string> = {
    en: t('lang.english'),
    fr: t('lang.french'),
    de: t('lang.german'),
    es: t('lang.spanish'),
  };
  
  const getUserInitials = (user: User | null) => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <nav id="topNavigationId" className="bg-background border-b border-border h-10 flex items-center px-4 justify-between text-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Box className="h-4 w-4 text-github-blue" />
          <span className="font-semibold">Corticon Studio Web</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-xs h-auto">
                {t('nav.file')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover border-border">
              <DropdownMenuItem 
                onClick={onCreateAsset}
                className="text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Plus className="h-3 w-3 mr-2" />
                {t('file.newAsset')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => activeAsset && onDeleteAsset?.(activeAsset)}
                disabled={!activeAsset}
                className="text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                {t('file.deleteAsset')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" className="px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-xs h-auto">
            {t('nav.edit')}
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-xs h-auto">
            {t('nav.view')}
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-xs h-auto">
            {t('nav.project')}
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-xs h-auto">
            {t('nav.git')}
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-xs h-auto">
            {t('nav.help')}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Project Selector */}
        {selectedProject && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-xs h-auto">
                <span>{selectedProject.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => onProjectChange(project)}
                  className={`text-popover-foreground hover:bg-accent hover:text-accent-foreground ${selectedProject.id === project.id ? "bg-accent" : ""}`}
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Collaboration Indicators */}
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 rounded-full bg-success-green flex items-center justify-center text-xs text-white font-medium" title="Sarah Chen - Online">
            SC
          </div>
          <div className="w-6 h-6 rounded-full bg-github-blue flex items-center justify-center text-xs text-white font-medium" title="Mike Johnson - Editing">
            MJ
          </div>
          <span className="text-xs text-gray-400">2 {t('nav.usersOnline')}</span>
        </div>

        {/* Action Buttons */}
        <Button size="sm" className="px-3 py-1 bg-github-blue hover:bg-blue-700 rounded text-xs text-white h-auto">
          <Upload className="h-3 w-3 mr-1" />
          {t('nav.saveSync')}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem disabled className="text-popover-foreground">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email
              }
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={toggleTheme}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  {t('user.lightMode')}
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  {t('user.darkMode')}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {/* Language Submenu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {t('user.language')}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="left" align="start" className="bg-popover border-border">
                {(['en', 'fr', 'de', 'es'] as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                      language === lang ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    {languageNames[lang]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => window.location.href = '/api/logout'}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              {t('user.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
