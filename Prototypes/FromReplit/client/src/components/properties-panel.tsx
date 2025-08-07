import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Settings, AlertTriangle, Users, X, Plus } from "lucide-react";
import type { Asset } from "@shared/schema";

interface PropertiesPanelProps {
  activeAsset: Asset | null;
  assets: Asset[];
}

export default function PropertiesPanel({ activeAsset, assets }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'validation'>('properties');
  const [assetName, setAssetName] = useState("");
  const [assetVersion, setAssetVersion] = useState("");
  const [assetDescription, setAssetDescription] = useState("");


  useEffect(() => {
    if (activeAsset) {
      setAssetName(activeAsset.name);
      // Extract version from content if available
      const content = activeAsset.content as any;
      const version = content?.rulesheet?.version || content?.vocabulary?.version || content?.ruleflow?.version || content?.rulestest?.version || "1.0";
      setAssetVersion(version);
      setAssetDescription(content?.description || "");
    }
  }, [activeAsset]);

  if (!activeAsset) {
    return (
      <div id="propertiesPanelId" className="w-80 bg-sidebar-bg border-l border-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select an asset to view properties</p>
        </div>
      </div>
    );
  }

  return (
    <div id="propertiesPanelId" className="w-80 bg-sidebar-bg border-l border-gray-700 flex flex-col">
      {/* Panel Tabs */}
      <div className="flex border-b border-gray-700">
        <button 
          className={`flex-1 px-4 py-2 text-xs border-r border-gray-700 ${
            activeTab === 'properties' 
              ? 'text-dark-text bg-tab-bg' 
              : 'text-gray-400 hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('properties')}
        >
          <Settings className="h-3 w-3 mr-1 inline" />
          Properties
        </button>
        <button 
          className={`flex-1 px-4 py-2 text-xs ${
            activeTab === 'validation' 
              ? 'text-dark-text bg-tab-bg' 
              : 'text-gray-400 hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('validation')}
        >
          <AlertTriangle className="h-3 w-3 mr-1 inline" />
          Validation
        </button>
      </div>

      {/* Properties Panel */}
      {activeTab === 'properties' && (
        <div className="flex-1 p-4 text-sm text-dark-text overflow-y-auto scrollbar-thin">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Asset Name
              </label>
              <Input 
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full bg-tab-bg border border-gray-600 rounded px-3 py-2 text-sm focus:border-github-blue focus:outline-none text-dark-text"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Version
              </label>
              <Input 
                value={assetVersion}
                onChange={(e) => setAssetVersion(e.target.value)}
                className="w-full bg-tab-bg border border-gray-600 rounded px-3 py-2 text-sm focus:border-github-blue focus:outline-none text-dark-text"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Description
              </label>
              <Textarea 
                rows={3}
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                className="w-full bg-tab-bg border border-gray-600 rounded px-3 py-2 text-sm focus:border-github-blue focus:outline-none resize-none text-dark-text"
                placeholder="Asset description..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Asset References
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-tab-bg rounded border border-gray-600">
                  <span className="text-sm">Policy</span>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 p-1 h-auto">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-tab-bg rounded border border-gray-600">
                  <span className="text-sm">Customer</span>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 p-1 h-auto">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Button 
                  variant="outline"
                  className="w-full p-2 border border-dashed border-gray-600 rounded text-gray-400 hover:border-github-blue hover:text-github-blue text-sm bg-transparent h-auto"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Reference
                </Button>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* Validation Panel */}
      {activeTab === 'validation' && (
        <div className="flex-1 p-4 text-sm text-dark-text overflow-y-auto scrollbar-thin">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-900/20 border border-green-700 rounded">
              <div className="w-2 h-2 rounded-full bg-success-green mt-2"></div>
              <div>
                <div className="text-success-green font-medium text-xs">JSON Schema Valid</div>
                <div className="text-gray-400 text-xs mt-1">Asset structure matches expected schema</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
              <div className="w-2 h-2 rounded-full bg-warning-amber mt-2"></div>
              <div>
                <div className="text-warning-amber font-medium text-xs">Warning</div>
                <div className="text-gray-400 text-xs mt-1">No description provided for this asset</div>
              </div>
            </div>

            <div className="text-center text-gray-400 py-8">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">All validations passed</p>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Panel */}
      <div className="border-t border-gray-700 p-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
          Active Collaborators
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-success-green flex items-center justify-center text-sm text-white font-medium">
              SC
            </div>
            <div className="flex-1">
              <div className="text-sm text-dark-text">Sarah Chen</div>
              <div className="text-xs text-gray-400">Editing line 16</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-success-green"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-github-blue flex items-center justify-center text-sm text-white font-medium">
              MJ
            </div>
            <div className="flex-1">
              <div className="text-sm text-dark-text">Mike Johnson</div>
              <div className="text-xs text-gray-400">Viewing file</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-github-blue"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
