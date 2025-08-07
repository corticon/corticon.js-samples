import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";
import type { Project, Asset } from "@shared/schema";

interface GitStatusProps {
  selectedProject: Project | null;
  assets: Asset[];
}

export default function GitStatus({ selectedProject, assets }: GitStatusProps) {
  // Mock git status - in a real implementation, this would come from actual git status
  const mockChanges = [
    { file: "Policy.vocabulary", status: "M", type: "modified" },
    { file: "PremiumCalculation.rules", status: "A", type: "added" },
    { file: "OldRules.rules", status: "D", type: "deleted" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "M":
        return "text-warning-amber";
      case "A":
        return "text-success-green";
      case "D":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (!selectedProject) {
    return null;
  }

  return (
    <div id="gitStatusId" className="border-t border-gray-700 p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Source Control
        </h4>
        <span className="bg-github-blue text-white text-xs px-2 py-1 rounded">
          {mockChanges.length}
        </span>
      </div>
      
      <div className="space-y-1 text-xs mb-3">
        {mockChanges.map((change, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className={getStatusColor(change.status)}>{change.status}</span>
            <span className="truncate text-dark-text">{change.file}</span>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          size="sm"
          className="flex-1 bg-success-green hover:bg-green-600 text-white text-xs py-2 rounded h-auto"
        >
          <Check className="h-3 w-3 mr-1" />
          Commit
        </Button>
        <Button 
          size="sm"
          variant="secondary"
          className="px-3 bg-gray-600 hover:bg-gray-500 text-white text-xs py-2 rounded h-auto"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
