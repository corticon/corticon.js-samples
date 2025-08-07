import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Code, Users, GitBranch, FileText, Layers } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Box className="h-8 w-8 text-github-blue" />
              <span className="text-xl font-semibold text-gray-900">Corticon Studio Web</span>
            </div>
            <Button 
              onClick={() => setLocation('/projects')}
              className="bg-github-blue hover:bg-blue-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-8">
            Professional Rule Management
            <span className="block text-github-blue">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            A modern web-based replacement for Eclipse-based Corticon Studio. 
            Manage your business rules with comprehensive project management, 
            real-time collaboration, and powerful editing capabilities.
          </p>
          <Button 
            size="lg"
            onClick={() => setLocation('/projects')}
            className="bg-github-blue hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Rule Management
            </h2>
            <p className="text-lg text-gray-600">
              Professional-grade tools for managing Corticon assets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-github-blue mb-4" />
                <CardTitle>Asset Management</CardTitle>
                <CardDescription>
                  Organize and manage vocabulary, rulesheets, ruleflow, and rulestest files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• JSON-based editing with syntax highlighting</li>
                  <li>• Schema validation and error detection</li>
                  <li>• Hierarchical project organization</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-success-green mb-4" />
                <CardTitle>Advanced Editor</CardTitle>
                <CardDescription>
                  Monaco Editor with syntax highlighting and validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Professional IDE experience</li>
                  <li>• Multi-tab editing interface</li>
                  <li>• Keyboard shortcuts and IntelliSense</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-warning-amber mb-4" />
                <CardTitle>Real-time Collaboration</CardTitle>
                <CardDescription>
                  Work together with your team in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Multi-user editing sessions</li>
                  <li>• User presence indicators</li>
                  <li>• Conflict resolution</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <GitBranch className="h-10 w-10 text-github-blue mb-4" />
                <CardTitle>Version Control</CardTitle>
                <CardDescription>
                  Built-in Git integration for project versioning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Track changes and commit history</li>
                  <li>• Branch management</li>
                  <li>• Diff visualization</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Layers className="h-10 w-10 text-success-green mb-4" />
                <CardTitle>Project Organization</CardTitle>
                <CardDescription>
                  Intuitive project and file management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Hierarchical folder structure</li>
                  <li>• Search and filter capabilities</li>
                  <li>• File upload and download</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Box className="h-10 w-10 text-warning-amber mb-4" />
                <CardTitle>Professional Interface</CardTitle>
                <CardDescription>
                  GitHub-inspired design with accessibility focus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Clean, intuitive interface</li>
                  <li>• Light and dark theme support</li>
                  <li>• Responsive design for all devices</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Box className="h-6 w-6 text-github-blue" />
            <span className="text-lg font-semibold">Corticon Studio Web</span>
          </div>
          <p className="text-gray-400">
            Professional rule management for the modern enterprise
          </p>
        </div>
      </footer>
    </div>
  );
}
