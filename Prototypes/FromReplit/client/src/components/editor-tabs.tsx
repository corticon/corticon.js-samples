import { Button } from "@/components/ui/button";
import { X, Columns, XCircle } from "lucide-react";
import type { Asset } from "@shared/schema";

interface EditorTabsProps {
  tabs: Asset[];
  activeTab: Asset | null;
  onTabClick: (tab: Asset) => void;
  onTabClose: (tab: Asset) => void;
  onCloseAll?: () => void;
}

export default function EditorTabs({ tabs, activeTab, onTabClick, onTabClose, onCloseAll }: EditorTabsProps) {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return <i className="fas fa-file-code text-github-blue mr-2 text-xs"></i>;
      case 'rulesheets':
        return <i className="fas fa-file-alt text-success-green mr-2 text-xs"></i>;
      case 'ruleflow':
        return <i className="fas fa-sitemap text-warning-amber mr-2 text-xs"></i>;
      case 'rulestest':
        return <i className="fas fa-flask text-purple-400 mr-2 text-xs"></i>;
      default:
        return <i className="fas fa-file text-gray-400 mr-2 text-xs"></i>;
    }
  };

  if (tabs.length === 0) {
    return (
      <div id="editorTabsId" className="bg-muted border-b border-border h-10 flex items-center px-4 text-sm text-muted-foreground">
        No files open
      </div>
    );
  }

  return (
    <div id="editorTabsId" className="bg-muted border-b border-border flex items-center text-sm overflow-x-auto">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab?.id === tab.id;
          
          return (
            <div 
              key={tab.id}
              className={`
                flex items-center px-4 py-2 border-r border-border min-w-0 cursor-pointer
                ${isActive 
                  ? 'bg-background text-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
              onClick={() => onTabClick(tab)}
            >
              {getAssetIcon(tab.type)}
              <span className="truncate max-w-32">{tab.name}</span>
              <div className="flex items-center ml-2 space-x-1">
                {/* Unsaved indicator */}
                <div className="w-2 h-2 rounded-full bg-warning-amber" title="Unsaved changes"></div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2 hover:bg-destructive rounded p-1 h-auto w-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab);
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive-foreground" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Actions */}
      <div className="ml-auto flex items-center px-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="p-2 hover:bg-accent rounded h-auto" 
          title="Split Editor"
        >
          <Columns className="h-3 w-3 text-muted-foreground hover:text-accent-foreground" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="p-2 hover:bg-accent rounded h-auto" 
          title="Close All"
          onClick={onCloseAll}
          disabled={tabs.length === 0}
        >
          <XCircle className="h-3 w-3 text-muted-foreground hover:text-accent-foreground" />
        </Button>
      </div>
    </div>
  );
}
