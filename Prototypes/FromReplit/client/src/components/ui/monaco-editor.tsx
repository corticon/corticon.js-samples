import { useEffect, useState } from 'react';

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  options?: any;
}

export default function MonacoEditor({ value, language, onChange }: MonacoEditorProps) {
  const [content, setContent] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);

    // Basic JSON validation
    if (language === 'json') {
      try {
        JSON.parse(newValue);
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      setContent(formatted);
      onChange(formatted);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
    }
  };

  return (
    <div id="monacoEditorId" className="h-full w-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Language: {language.toUpperCase()}</span>
          {!isValid && (
            <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
              Invalid JSON
            </span>
          )}
          {isValid && (
            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
              Valid JSON
            </span>
          )}
        </div>
        <button
          onClick={formatJson}
          className="text-xs px-2 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded"
          disabled={!isValid}
        >
          Format
        </button>
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={handleChange}
          className="editor-textarea w-full h-full p-4 bg-background text-foreground font-mono text-sm border-none outline-none resize-none"
          style={{
            fontFamily: 'JetBrains Mono, Monaco, "Cascadia Code", "Roboto Mono", monospace',
            lineHeight: '1.5',
            tabSize: 2
          }}
          placeholder={language === 'json' ? 'Enter JSON content...' : 'Enter content...'}
          spellCheck={false}
        />
        
        {/* Line numbers overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted border-r border-border pointer-events-none">
          <div className="p-4 text-xs text-muted-foreground font-mono leading-6">
            {content.split('\n').map((_, index) => (
              <div key={index} className="text-right pr-2">
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            .editor-textarea {
              padding-left: 4rem !important;
            }
          `
        }} />
      </div>
    </div>
  );
}
