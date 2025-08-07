import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Move, X, Type, ZoomIn, ZoomOut } from 'lucide-react';
import type { RuleflowStructuralData, RuleflowUIData } from '@shared/schema';

interface RuleflowNode {
  id: string;
  name: string;
  type: 'rulesheets' | 'ruleflow' | 'text';
  position: { x: number; y: number };
  size: { width: number; height: number };
  text?: string; // For text nodes
  fontSize?: number; // For text nodes, default 12px
}

interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
}

interface RuleflowEditorProps {
  content: string;
  onChange: (content: string) => void;
  structuralData?: RuleflowStructuralData | null;
  uiData?: RuleflowUIData | null;
  onStructuralChange?: (data: RuleflowStructuralData) => void;
  onUIChange?: (data: RuleflowUIData) => void;
  currentAssetId?: number; // ID of the current ruleflow being edited
}

type Tool = 'select' | 'connector' | 'text';

export function RuleflowEditor({ 
  content, 
  onChange, 
  structuralData, 
  uiData, 
  onStructuralChange, 
  onUIChange,
  currentAssetId
}: RuleflowEditorProps) {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState<RuleflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggedNode, setDraggedNode] = useState<RuleflowNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; point: { x: number; y: number } } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);

  const [isDraggingTextTool, setIsDraggingTextTool] = useState(false);
  const [editingTextNode, setEditingTextNode] = useState<string | null>(null);
  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  // Initialize zoom level to default 1.0, will be restored from UI data on first load only
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [zoomInitialized, setZoomInitialized] = useState<boolean>(false);
  
  // Canvas and viewport state
  const [canvasSize, setCanvasSize] = useState({ width: 5000, height: 3000 });
  const [viewportScroll, setViewportScroll] = useState({ x: 0, y: 0 });
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Load data from props on mount and when switching tabs
  useEffect(() => {
    console.log('RuleflowEditor data loading:', { 
      hasStructuralData: !!structuralData, 
      hasUIData: !!uiData,
      structuralNodes: structuralData?.nodes?.length || 0,
      uiNodes: uiData?.nodes?.length || 0
    });

    if (structuralData && uiData && Array.isArray(structuralData.nodes) && Array.isArray(uiData.nodes)) {
      // Restore canvas size and viewport position from UI data
      if (uiData.canvas?.size) {
        setCanvasSize(uiData.canvas.size);
      }
      if (uiData.canvas?.viewport) {
        setViewportScroll({ x: uiData.canvas.viewport.scrollX, y: uiData.canvas.viewport.scrollY });
      }
      
      // Reconstruct nodes from both structural and UI data
      const reconstructedNodes: RuleflowNode[] = structuralData.nodes.map(structuralNode => {
        const uiNode = uiData.nodes.find(ui => ui.id === structuralNode.id);
        return {
          id: structuralNode.id,
          name: structuralNode.name,
          type: structuralNode.type,
          text: structuralNode.text,
          fontSize: structuralNode.fontSize || 12,
          position: uiNode?.position || { x: 100, y: 100 },
          size: uiNode?.size || { 
            width: structuralNode.type === 'rulesheets' ? 150 : 
                  structuralNode.type === 'ruleflow' ? 180 : 
                  200, // Default width for text nodes
            height: structuralNode.type === 'rulesheets' ? 50 : 
                   structuralNode.type === 'ruleflow' ? 60 : 
                   80  // Default height for text nodes
          },
        };
      });

      // Reconstruct connections from both structural and UI data
      const reconstructedConnections: Connection[] = (structuralData.connections || []).map(structuralConn => {
        const uiConn = (uiData.connections || []).find(ui => ui.id === structuralConn.id);
        return {
          id: structuralConn.id,
          fromNodeId: structuralConn.fromNodeId,
          toNodeId: structuralConn.toNodeId,
          fromPoint: uiConn?.fromPoint || { x: 0, y: 0 },
          toPoint: uiConn?.toPoint || { x: 0, y: 0 },
        };
      });

      console.log('Setting nodes and connections:', { 
        nodeCount: reconstructedNodes.length, 
        connectionCount: reconstructedConnections.length 
      });
      setNodes(reconstructedNodes);
      setConnections(reconstructedConnections);
    } else {
      // If no data, initialize empty arrays (for new ruleflows)
      console.log('Initializing empty workflow');
      setNodes([]);
      setConnections([]);
    }
  }, [structuralData, uiData]);

  // Initialize zoom level from UI data only once on component mount
  useEffect(() => {
    if (!zoomInitialized && uiData && uiData.canvas && typeof uiData.canvas.zoom === 'number') {
      console.log('Initializing zoom level from UI data:', uiData.canvas.zoom);
      setZoomLevel(uiData.canvas.zoom);
      setZoomInitialized(true);
    }
  }, [uiData, zoomInitialized]); // Only run when UI data first becomes available

  // Initialize viewport scroll position from UI data (only once on load)
  const [scrollInitialized, setScrollInitialized] = useState(false);
  useEffect(() => {
    if (!scrollInitialized && uiData && uiData.canvas && uiData.canvas.viewport && uiData.canvas.viewport.scrollX !== undefined && uiData.canvas.viewport.scrollY !== undefined && viewportRef.current) {
      const scroll = { x: uiData.canvas.viewport.scrollX, y: uiData.canvas.viewport.scrollY };
      setViewportScroll(scroll);
      
      // Apply scroll position to viewport element only once on initial load
      viewportRef.current.scrollLeft = scroll.x;
      viewportRef.current.scrollTop = scroll.y;
      setScrollInitialized(true);
    }
  }, [uiData, scrollInitialized]);



  // Helper function to update both structural and UI data
  const updatePersistentData = useCallback((newNodes: RuleflowNode[], newConnections: Connection[]) => {
    if (onStructuralChange && onUIChange) {
      // Extract structural data
      const structural: RuleflowStructuralData = {
        nodes: newNodes.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          text: node.text, // Include text for text nodes
          fontSize: node.fontSize, // Include fontSize for text nodes
          assetId: undefined, // Could be populated if node references an actual asset
          metadata: {},
        })),
        connections: newConnections.map(conn => ({
          id: conn.id,
          fromNodeId: conn.fromNodeId,
          toNodeId: conn.toNodeId,
          condition: undefined,
          priority: undefined,
          metadata: {},
        })),
        version: "1.0",
        metadata: {},
      };

      // Extract UI data
      const ui: RuleflowUIData = {
        nodes: newNodes.map(node => ({
          id: node.id,
          position: node.position,
          size: node.size,
          style: {},
          isVisible: true,
        })),
        connections: newConnections.map(conn => ({
          id: conn.id,
          fromPoint: conn.fromPoint,
          toPoint: conn.toPoint,
          style: {},
          isVisible: true,
        })),
        canvas: {
          zoom: zoomLevel,
          panX: 0,
          panY: 0,
          gridSize: 20,
          size: canvasSize,
          viewport: { scrollX: viewportScroll.x, scrollY: viewportScroll.y },
        },
        version: "1.0",
      };

      onStructuralChange(structural);
      onUIChange(ui);
    }
  }, [onStructuralChange, onUIChange, zoomLevel, canvasSize, viewportScroll]);

  // Delete node and its connections
  const handleDeleteNode = useCallback((nodeId: string) => {
    console.log('Deleting node:', nodeId);
    
    // Remove the node
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    
    // Remove all connections that involve this node
    const updatedConnections = connections.filter(
      conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    );
    
    setNodes(updatedNodes);
    setConnections(updatedConnections);
    updatePersistentData(updatedNodes, updatedConnections);
    
    console.log(`Deleted node ${nodeId} and ${connections.length - updatedConnections.length} connections`);
  }, [nodes, connections, updatePersistentData]);

  // Find optimal position for new text node to avoid overlaps and stay within canvas bounds
  const findOptimalPosition = useCallback((preferredX: number, preferredY: number, nodeWidth = 200, nodeHeight = 80) => {
    const padding = 20;
    
    // Get canvas dimensions for boundary checking (accounting for zoom)
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const canvasWidth = (canvasRect?.width || 1000) / zoomLevel;
    const canvasHeight = (canvasRect?.height || 800) / zoomLevel;
    
    // Check if position overlaps with existing nodes or goes outside canvas
    const hasOverlap = (x: number, y: number) => {
      // Check canvas boundaries
      if (x < 0 || y < 0 || x + nodeWidth > canvasWidth || y + nodeHeight > canvasHeight) {
        return true;
      }
      
      // Check overlap with existing nodes
      return nodes.some(node => {
        const nodeRight = node.position.x + node.size.width;
        const nodeBottom = node.position.y + node.size.height;
        const newRight = x + nodeWidth;
        const newBottom = y + nodeHeight;
        
        return !(x >= nodeRight + padding || 
                newRight <= node.position.x - padding ||
                y >= nodeBottom + padding || 
                newBottom <= node.position.y - padding);
      });
    };
    
    // Constrain preferred position to canvas bounds
    const constrainedX = Math.max(0, Math.min(preferredX, canvasWidth - nodeWidth));
    const constrainedY = Math.max(0, Math.min(preferredY, canvasHeight - nodeHeight));
    
    // Try the constrained position first
    if (!hasOverlap(constrainedX, constrainedY)) {
      return { x: constrainedX, y: constrainedY };
    }
    
    // Try positions in a spiral pattern around the constrained position
    const step = 50;
    for (let radius = 1; radius <= 10; radius++) {
      for (let angle = 0; angle < 360; angle += 45) {
        const x = constrainedX + Math.cos(angle * Math.PI / 180) * radius * step;
        const y = constrainedY + Math.sin(angle * Math.PI / 180) * radius * step;
        
        if (!hasOverlap(x, y)) {
          return { x, y };
        }
      }
    }
    
    // Fallback to constrained position if no good spot found
    return { x: constrainedX, y: constrainedY };
  }, [nodes, zoomLevel]);

  // Create a new text node
  const createTextNode = useCallback((x: number, y: number) => {
    const nodeWidth = 200;
    const nodeHeight = 80;
    const position = findOptimalPosition(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight); // Center the node on click position
    
    const newNode: RuleflowNode = {
      id: `text-${Date.now()}`,
      name: 'Text Note',
      type: 'text',
      text: 'Enter your comment here...',
      fontSize: 12,
      position,
      size: { width: nodeWidth, height: nodeHeight }
    };
    
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    updatePersistentData(updatedNodes, connections);
    
    // Start editing the new text node
    setEditingTextNode(newNode.id);
  }, [nodes, connections, updatePersistentData, findOptimalPosition]);

  // Update text node content
  const updateTextNode = useCallback((nodeId: string, newText: string) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, text: newText } : node
    );
    setNodes(updatedNodes);
    updatePersistentData(updatedNodes, connections);
  }, [nodes, connections, updatePersistentData]);

  // Update text node font size
  const updateTextNodeFontSize = useCallback((nodeId: string, delta: number) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId && node.type === 'text') {
        const currentSize = node.fontSize || 12;
        const newSize = Math.max(8, Math.min(24, currentSize + delta)); // Min 8px, Max 24px
        console.log(`Font size change for node ${nodeId}: ${currentSize}px → ${newSize}px`);
        return { ...node, fontSize: newSize };
      }
      return node;
    });
    setNodes(updatedNodes);
    updatePersistentData(updatedNodes, connections);
  }, [nodes, connections, updatePersistentData]);



  // Zoom functions - simplified without state tracking
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel + 0.1, 2.0); // Max zoom 200%
    setZoomLevel(newZoom);
    // Persist the zoom level change with a delay 
    setTimeout(() => {
      updatePersistentData(nodes, connections);
    }, 300);
  }, [zoomLevel, nodes, connections, updatePersistentData]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel - 0.1, 0.5); // Min zoom 50%
    setZoomLevel(newZoom);
    // Persist the zoom level change with a delay
    setTimeout(() => {
      updatePersistentData(nodes, connections);
    }, 300);
  }, [zoomLevel, nodes, connections, updatePersistentData]);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    // Persist the zoom level change
    setTimeout(() => {
      updatePersistentData(nodes, connections);
    }, 300);
  }, [nodes, connections, updatePersistentData]);

  const handleZoomToFit = useCallback(() => {
    if (!viewportRef.current || nodes.length === 0) return;
    
    const viewportRect = viewportRef.current.getBoundingClientRect();
    const viewportWidth = viewportRect.width;
    const viewportHeight = viewportRect.height;
    
    // Calculate bounding box of all nodes on the canvas
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const nodeLeft = node.position.x;
      const nodeTop = node.position.y;
      const nodeRight = node.position.x + node.size.width;
      const nodeBottom = node.position.y + node.size.height;
      
      minX = Math.min(minX, nodeLeft);
      minY = Math.min(minY, nodeTop);
      maxX = Math.max(maxX, nodeRight);
      maxY = Math.max(maxY, nodeBottom);
    });
    
    // Add padding around the nodes
    const padding = 50;
    const contentWidth = maxX - minX + (padding * 2);
    const contentHeight = maxY - minY + (padding * 2);
    
    // Calculate zoom level to fit all nodes in viewport
    const zoomX = viewportWidth / contentWidth;
    const zoomY = viewportHeight / contentHeight;
    const optimalZoom = Math.min(zoomX, zoomY);
    
    // Constrain zoom to our limits (50% - 200%)
    const constrainedZoom = Math.max(0.5, Math.min(2.0, optimalZoom));
    
    // Calculate viewport scroll position to center the content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const scrollX = Math.max(0, centerX * constrainedZoom - viewportWidth / 2);
    const scrollY = Math.max(0, centerY * constrainedZoom - viewportHeight / 2);
    
    console.log(`Zoom to fit: content=${contentWidth}x${contentHeight}, viewport=${viewportWidth}x${viewportHeight}, zoom=${constrainedZoom}, scroll=(${scrollX},${scrollY})`);
    
    setZoomLevel(constrainedZoom);
    setViewportScroll({ x: scrollX, y: scrollY });
    
    // Update the actual scrollbars
    if (viewportRef.current) {
      viewportRef.current.scrollLeft = scrollX;
      viewportRef.current.scrollTop = scrollY;
    }
    
    // Persist changes
    setTimeout(() => {
      updatePersistentData(nodes, connections);
    }, 300);
  }, [nodes, connections, updatePersistentData]);

  // Handle viewport scroll events
  const handleViewportScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newScrollPosition = { x: target.scrollLeft, y: target.scrollTop };
    
    setViewportScroll(newScrollPosition);
    
    // Debounce persistence
    setTimeout(() => {
      updatePersistentData(nodes, connections);
    }, 300);
  }, [nodes, connections, updatePersistentData]);

  // Helper function to calculate edge connection points
  const getEdgeConnectionPoints = useCallback((fromNode: RuleflowNode, toNode: RuleflowNode) => {
    const fromCenter = {
      x: fromNode.position.x + fromNode.size.width / 2,
      y: fromNode.position.y + fromNode.size.height / 2
    };
    const toCenter = {
      x: toNode.position.x + toNode.size.width / 2,
      y: toNode.position.y + toNode.size.height / 2
    };

    // Calculate direction vector
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
      return { fromPoint: fromCenter, toPoint: toCenter };
    }

    // Helper function to find edge intersection with rectangle
    const getEdgePoint = (center: { x: number; y: number }, size: { width: number; height: number }, dirX: number, dirY: number) => {
      const halfWidth = size.width / 2;
      const halfHeight = size.height / 2;
      
      // Calculate intersection with each edge and pick the one that's closest
      const candidates = [];
      
      // Right edge (x = center.x + halfWidth)
      if (dirX > 0) {
        const t = halfWidth / dirX;
        const y = dirY * t;
        if (Math.abs(y) <= halfHeight) {
          candidates.push({ x: center.x + halfWidth, y: center.y + y });
        }
      }
      
      // Left edge (x = center.x - halfWidth)
      if (dirX < 0) {
        const t = -halfWidth / dirX;
        const y = dirY * t;
        if (Math.abs(y) <= halfHeight) {
          candidates.push({ x: center.x - halfWidth, y: center.y + y });
        }
      }
      
      // Bottom edge (y = center.y + halfHeight)
      if (dirY > 0) {
        const t = halfHeight / dirY;
        const x = dirX * t;
        if (Math.abs(x) <= halfWidth) {
          candidates.push({ x: center.x + x, y: center.y + halfHeight });
        }
      }
      
      // Top edge (y = center.y - halfHeight)
      if (dirY < 0) {
        const t = -halfHeight / dirY;
        const x = dirX * t;
        if (Math.abs(x) <= halfWidth) {
          candidates.push({ x: center.x + x, y: center.y - halfHeight });
        }
      }
      
      // Return the candidate closest to the direction
      if (candidates.length > 0) {
        return candidates.reduce((closest, candidate) => {
          const distCurrent = Math.abs(candidate.x - center.x - dirX * Math.max(halfWidth, halfHeight)) + 
                             Math.abs(candidate.y - center.y - dirY * Math.max(halfWidth, halfHeight));
          const distClosest = Math.abs(closest.x - center.x - dirX * Math.max(halfWidth, halfHeight)) + 
                            Math.abs(closest.y - center.y - dirY * Math.max(halfWidth, halfHeight));
          return distCurrent < distClosest ? candidate : closest;
        });
      }
      
      return center;
    };

    // Calculate edge points
    const fromEdge = getEdgePoint(fromCenter, fromNode.size, dx, dy);
    const toEdge = getEdgePoint(toCenter, toNode.size, -dx, -dy);

    return { fromPoint: fromEdge, toPoint: toEdge };
  }, []);



  // Handle dropping rulesheets from explorer
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Drop event on ruleflow canvas');
    
    // Remove drag target styling
    if (canvasRef.current) {
      canvasRef.current.classList.remove('drag-target');
    }
    
    // Try multiple data formats for cross-browser compatibility
    let dragData = '';
    
    // Try each format
    for (const type of ['application/json', 'text/plain', 'text']) {
      try {
        dragData = e.dataTransfer.getData(type);
        if (dragData) {
          break;
        }
      } catch (error) {
        // Skip failed formats
      }
    }
    
    if (!dragData) {
      console.log('No drag data found');
      return;
    }
    
    try {
      const asset = JSON.parse(dragData);
      
      if (asset.type !== 'rulesheets' && asset.type !== 'ruleflow') {
        return;
      }
      
      // Prevent dragging the current ruleflow onto itself
      if (asset.type === 'ruleflow' && currentAssetId && asset.id === currentAssetId) {
        console.log('Cannot drag current ruleflow onto itself:', asset.name);
        return;
      }
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const dropX = (e.clientX - rect.left) / zoomLevel;
      const dropY = (e.clientY - rect.top) / zoomLevel;
      const nodeSize = asset.type === 'ruleflow' ? { width: 180, height: 60 } : { width: 150, height: 50 };
      
      // Use optimal positioning with boundary checking
      const position = findOptimalPosition(dropX - nodeSize.width / 2, dropY - nodeSize.height / 2, nodeSize.width, nodeSize.height);
      
      const newNode: RuleflowNode = {
        id: `node-${asset.id}-${Date.now()}`,
        name: asset.name,
        type: asset.type as 'rulesheets' | 'ruleflow',
        position,
        size: nodeSize
      };
      
      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      updatePersistentData(updatedNodes, connections);
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }, [nodes, connections, updatePersistentData]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    // Visual feedback for valid drop target
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add visual feedback for drag enter
    if (canvasRef.current) {
      canvasRef.current.classList.add('drag-target');
    }
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Remove visual feedback for drag leave
    if (canvasRef.current && !canvasRef.current.contains(e.relatedTarget as Node)) {
      canvasRef.current.classList.remove('drag-target');
    }
  }, []);

  // Handle dragging existing nodes
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: RuleflowNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedTool === 'connector') {
      // Check if this node already has an outgoing connection
      const hasExistingConnection = connections.some(conn => conn.fromNodeId === node.id);
      
      if (hasExistingConnection) {
        console.log('Node already has a connection, cannot create another:', node.name);
        return; // Prevent creating multiple connections from same node
      }

      // Handle connector tool - start connection drag
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const nodeCenter = {
        x: node.position.x + node.size.width / 2,
        y: node.position.y + node.size.height / 2
      };
      
      setConnectionStart({ nodeId: node.id, point: nodeCenter });
      setIsConnecting(true);
      setIsDraggingConnection(true);
      console.log('Started connection drag from node:', node.name);
    } else {
      // Handle select tool - start dragging
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const offsetX = (e.clientX - rect.left) / zoomLevel - node.position.x;
      const offsetY = (e.clientY - rect.top) / zoomLevel - node.position.y;
      
      setDraggedNode(node);
      setDragOffset({ x: offsetX, y: offsetY });
    }
  }, [selectedTool, connections, zoomLevel]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const viewportRect = viewportRef.current?.getBoundingClientRect();
    if (!canvasRect || !viewportRect) return;
    
    // Calculate canvas coordinates accounting for viewport scroll and zoom
    const canvasX = (e.clientX - canvasRect.left) / zoomLevel;
    const canvasY = (e.clientY - canvasRect.top) / zoomLevel;
    
    setMousePosition({ x: canvasX, y: canvasY });
    
    // Handle node resizing
    if (resizingNode) {
      const node = nodes.find(n => n.id === resizingNode);
      if (node) {
        const deltaX = canvasX - resizeStartPos.x;
        const deltaY = canvasY - resizeStartPos.y;
        
        const newWidth = Math.max(100, resizeStartSize.width + deltaX); // Minimum width 100px
        const newHeight = Math.max(50, resizeStartSize.height + deltaY); // Minimum height 50px
        
        const updatedNodes = nodes.map(n =>
          n.id === resizingNode ? { ...n, size: { width: newWidth, height: newHeight } } : n
        );
        setNodes(updatedNodes);
        // Don't call updatePersistentData here - only save on mouseUp to reduce API calls
      }
      return;
    }
    
    // Handle connection dragging
    if (isDraggingConnection && selectedTool === 'connector') {
      // Just update mouse position for visual feedback
      return;
    }
    
    // Handle node dragging
    if (draggedNode && selectedTool === 'select') {
      let x = canvasX - dragOffset.x;
      let y = canvasY - dragOffset.y;
      
      // Canvas boundary checking - prevent nodes from moving outside canvas
      const canvasWidth = canvasSize.width;
      const canvasHeight = canvasSize.height;
      const nodeWidth = draggedNode.size.width;
      const nodeHeight = draggedNode.size.height;
      
      // Constrain x position
      x = Math.max(0, Math.min(x, canvasWidth - nodeWidth));
      
      // Constrain y position  
      y = Math.max(0, Math.min(y, canvasHeight - nodeHeight));
      
      const updatedNodes = nodes.map(node => 
        node.id === draggedNode.id 
          ? { ...node, position: { x, y } }
          : node
      );
      setNodes(updatedNodes);
      
      // Update connection endpoints if this node is connected
      const updatedConnections = connections.map(conn => {
        let updatedConn = { ...conn };
        
        // Find the other node to recalculate edge points
        let fromNode, toNode;
        if (conn.fromNodeId === draggedNode.id) {
          fromNode = { ...draggedNode, position: { x, y } };
          toNode = updatedNodes.find(n => n.id === conn.toNodeId);
        } else if (conn.toNodeId === draggedNode.id) {
          fromNode = updatedNodes.find(n => n.id === conn.fromNodeId);
          toNode = { ...draggedNode, position: { x, y } };
        }
        
        if (fromNode && toNode) {
          const { fromPoint, toPoint } = getEdgeConnectionPoints(fromNode, toNode);
          updatedConn.fromPoint = fromPoint;
          updatedConn.toPoint = toPoint;
        }
        
        return updatedConn;
      });
      setConnections(updatedConnections);
      
      // Update persistent data
      updatePersistentData(updatedNodes, updatedConnections);
    }
  }, [draggedNode, dragOffset, selectedTool, isDraggingConnection, nodes, getEdgeConnectionPoints, resizingNode, resizeStartPos, resizeStartSize, zoomLevel]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Handle resize completion
    if (resizingNode) {
      setResizingNode(null);
      // Update persistent data
      updatePersistentData(nodes, connections);
      return;
    }
    
    // Handle connection completion
    if (isDraggingConnection && selectedTool === 'connector' && connectionStart) {
      // Check if mouse up is over a node
      const target = e.target as HTMLElement;
      const nodeElement = target.closest('[data-node-id]');
      
      if (nodeElement) {
        const targetNodeId = nodeElement.getAttribute('data-node-id');
        const targetNode = nodes.find(n => n.id === targetNodeId);
        
        if (targetNode && targetNode.id !== connectionStart.nodeId) {
          // Double-check: ensure source node doesn't already have a connection
          const hasExistingConnection = connections.some(conn => conn.fromNodeId === connectionStart.nodeId);
          
          if (hasExistingConnection) {
            console.log('Source node already has a connection, aborting');
            return;
          }

          // Get source node for edge calculation
          const sourceNode = nodes.find(n => n.id === connectionStart.nodeId);
          if (!sourceNode) return;

          // Calculate edge connection points
          const { fromPoint, toPoint } = getEdgeConnectionPoints(sourceNode, targetNode);
          
          const newConnection: Connection = {
            id: `conn-${connectionStart.nodeId}-${targetNode.id}-${Date.now()}`,
            fromNodeId: connectionStart.nodeId,
            toNodeId: targetNode.id,
            fromPoint,
            toPoint
          };
          
          const updatedConnections = [...connections, newConnection];
          setConnections(updatedConnections);
          updatePersistentData(nodes, updatedConnections);
          console.log('Created connection:', newConnection);
        }
      }
      
      // Reset connection state
      setConnectionStart(null);
      setIsConnecting(false);
      setIsDraggingConnection(false);
    }
    
    // Handle node dragging
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, [isDraggingConnection, selectedTool, connectionStart, nodes, getEdgeConnectionPoints]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const viewportRect = viewportRef.current?.getBoundingClientRect();
    if (!canvasRect || !viewportRect) return;
    
    // Calculate canvas coordinates accounting for viewport scroll and zoom
    const canvasX = (e.clientX - canvasRect.left) / zoomLevel;
    const canvasY = (e.clientY - canvasRect.top) / zoomLevel;
    
    if (selectedTool === 'text') {
      // Create text node at click position on canvas
      createTextNode(canvasX, canvasY);
      setSelectedTool('select'); // Switch back to select tool after creation
    } else if (selectedTool === 'connector' && isConnecting && !isDraggingConnection) {
      // Cancel connection if clicking on empty canvas
      setConnectionStart(null);
      setIsConnecting(false);
      console.log('Connection cancelled');
    }
  }, [selectedTool, isConnecting, isDraggingConnection, createTextNode, zoomLevel]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b border-border p-2 flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">
          {t('editor.ruleflow.title') || 'Ruleflow Designer'}
        </h3>
        <div className="text-xs text-muted-foreground ml-auto">
  {t('editor.ruleflow.dragHint') || 'Drag rulesheets and ruleflows from the explorer to add them to the flow'}
        </div>
      </div>

      {/* Editor Container - holds viewport and fixed palette */}
      <div className="flex-1 relative">
        {/* Viewport - scrollable window into the canvas */}
        <div 
          ref={viewportRef}
          className="absolute inset-0 bg-muted/20 border-2 border-dashed border-muted-foreground/20"
          style={{ 
            overflow: 'scroll',
            scrollbarWidth: 'auto'
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onScroll={handleViewportScroll}
        >
        {/* Canvas - the virtual workspace that can be larger than viewport */}
        <div 
          ref={canvasRef}
          className="relative origin-top-left transition-transform duration-200"
          style={{ 
            width: canvasSize.width * zoomLevel,
            height: canvasSize.height * zoomLevel,
            transform: `scale(${zoomLevel})`,
            transformOrigin: '0 0',
            backgroundImage: `
              radial-gradient(circle, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay for visual reference */}
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ zIndex: 0 }}>
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 20 0 L 0 0 0 20" 
                    fill="none" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Render connections */}
        <svg 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            zIndex: 20, 
            width: '100%', 
            height: '100%'
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <polygon
                points="0 2, 10 6, 0 10"
                fill="#2563eb"
              />
            </marker>
          </defs>
          {connections.map((connection, index) => {
            console.log(`Rendering connection ${index}:`, connection);
            console.log(`From point: (${connection.fromPoint.x}, ${connection.fromPoint.y})`);
            console.log(`To point: (${connection.toPoint.x}, ${connection.toPoint.y})`);
            return (
              <g key={connection.id}>
                <line
                  x1={connection.fromPoint.x}
                  y1={connection.fromPoint.y}
                  x2={connection.toPoint.x}
                  y2={connection.toPoint.y}
                  stroke="#2563eb"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />


              </g>
            );
          })}
          
          {/* Render connection preview while connecting */}
          {isDraggingConnection && connectionStart && (
            <g>
              <defs>
                <marker
                  id="preview-arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
              <line
                x1={connectionStart.point.x}
                y1={connectionStart.point.y}
                x2={mousePosition.x}
                y2={mousePosition.y}
                stroke="#6b7280"
                strokeWidth="3"
                strokeDasharray="8,4"
                markerEnd="url(#preview-arrowhead)"
                opacity="0.7"
              />
              <circle
                cx={connectionStart.point.x}
                cy={connectionStart.point.y}
                r="4"
                fill="#2563eb"
                opacity="0.8"
              />
            </g>
          )}
        </svg>

        {/* Render nodes */}
        {nodes.map((node) => {
          const hasOutgoingConnection = connections.some(conn => conn.fromNodeId === node.id);
          const isTextNode = node.type === 'text';
          
          if (isTextNode) {
            // Render text node differently
            return (
              <div
                key={node.id}
                data-node-id={node.id}
                className="absolute bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg shadow-md transition-colors group cursor-move"
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: node.size.width,
                  height: node.size.height,
                  zIndex: 15, // Higher than regular nodes but lower than connections
                  userSelect: 'none'
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
              >
                <div className="h-full p-2 relative">
                  {editingTextNode === node.id ? (
                    <textarea
                      className="w-full h-full resize-none border-none outline-none bg-transparent leading-tight"
                      value={node.text || ''}
                      onChange={(e) => updateTextNode(node.id, e.target.value)}
                      onBlur={() => setEditingTextNode(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingTextNode(null);
                        }
                      }}
                      autoFocus
                      style={{ 
                        resize: 'none',
                        fontSize: `${node.fontSize || 12}px`
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full leading-tight whitespace-pre-wrap overflow-hidden cursor-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTextNode(node.id);
                      }}
                      style={{ fontSize: `${node.fontSize || 12}px` }}
                    >
                      {node.text || 'Enter your comment here...'}
                    </div>
                  )}
                  
                  {/* Font size controls */}
                  <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-4 h-4 bg-blue-500 hover:bg-blue-600 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateTextNodeFontSize(node.id, 2);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      title="Increase font size"
                    >
                      +
                    </button>
                    <button
                      className="w-4 h-4 bg-blue-500 hover:bg-blue-600 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateTextNodeFontSize(node.id, -2);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      title="Decrease font size"
                    >
                      -
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full border border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    title="Delete text node"
                  >
                    <X size={8} className="text-white" />
                  </button>
                  
                  {/* Resize handle */}
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 dark:bg-yellow-600 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect) {
                        setResizeStartPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        });
                        setResizeStartSize({
                          width: node.size.width,
                          height: node.size.height
                        });
                        setResizingNode(node.id);
                      }
                    }}
                    title="Resize"
                  />
                </div>
              </div>
            );
          }
          
          // Render regular rulesheets/ruleflow nodes
          return (
            <div
              key={node.id}
              data-node-id={node.id}
              className={`absolute bg-card border-2 rounded-lg shadow-md transition-colors group ${
                selectedTool === 'connector' 
                  ? (hasOutgoingConnection ? 'cursor-not-allowed' : 'cursor-crosshair')
                  : 'cursor-move'
              } ${
                hasOutgoingConnection && selectedTool === 'connector'
                  ? 'border-gray-400 opacity-60' // Disabled appearance for nodes with connections
                  : node.type === 'rulesheets' 
                    ? 'border-blue-500 hover:border-blue-400' 
                    : 'border-purple-500 hover:border-purple-400'
              } ${
                connectionStart?.nodeId === node.id ? 'ring-2 ring-primary ring-offset-2' : ''
              } ${
                isDraggingConnection && connectionStart?.nodeId !== node.id && !hasOutgoingConnection
                  ? 'hover:ring-2 hover:ring-green-400 hover:ring-offset-1' 
                  : ''
              }`}
            style={{
              left: node.position.x,
              top: node.position.y,
              width: node.size.width,
              height: node.size.height,
              zIndex: 5, // Lower than text nodes
              userSelect: 'none'
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node)}
          >
              <div className="h-full flex items-center justify-center p-2 relative">
                <div className="text-center">
                  <div className={`w-6 h-6 mx-auto mb-1 rounded flex items-center justify-center ${
                    hasOutgoingConnection && selectedTool === 'connector'
                      ? 'bg-gray-400' // Grayed out when has connection and in connector mode
                      : node.type === 'rulesheets' 
                        ? 'bg-blue-500' 
                        : 'bg-purple-500'
                  }`}>
                    <span className="text-xs text-white font-bold">
                      {node.type === 'rulesheets' ? 'RS' : 'RF'}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground truncate" title={node.name}>
                    {node.name}
                  </div>
                </div>
                
                {/* Connection indicator */}
                {hasOutgoingConnection && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center">
                    <ArrowRight size={8} className="text-white" />
                  </div>
                )}
                
                {/* Delete button */}
                <button
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full border border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  title="Delete node"
                >
                  <X size={8} className="text-white" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state message */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-lg mb-2">🎯</div>
              <div className="text-sm">
                {t('editor.ruleflow.emptyState') || 'Drag rulesheets and ruleflows from the explorer to start building your flow'}
              </div>
            </div>
          </div>
        )}
        
        {/* Close the canvas */}
        </div>
        
        {/* Close the viewport */}
        </div>

        {/* Floating Tool Palette - Fixed to editor container, not scrollable */}
        <div 
          className="absolute bg-card border border-border rounded-lg shadow-lg p-2 z-50 pointer-events-auto"
          style={{
            top: '8px',
            left: '8px',
          }}
        >
          <div className="flex flex-col gap-1">
            <button
              className={`p-2 rounded hover:bg-muted transition-colors ${
                selectedTool === 'select' ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => setSelectedTool('select')}
              title="Select Tool"
            >
              <Move size={16} />
            </button>
            <button
              className={`p-2 rounded hover:bg-muted transition-colors ${
                selectedTool === 'connector' ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => setSelectedTool('connector')}
              title="Connector Tool"
            >
              <ArrowRight size={16} />
            </button>
            <button
              className={`p-2 rounded hover:bg-muted transition-colors ${
                selectedTool === 'text' ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => setSelectedTool('text')}
              title="Text Tool - Click to add comment"
            >
              <Type size={16} />
            </button>
            
            {/* Separator */}
            <div className="w-full h-px bg-border my-1" />
            
            {/* Zoom Controls */}
            <button
              className="p-2 rounded hover:bg-muted transition-colors"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              className="p-2 rounded hover:bg-muted transition-colors"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              className="px-2 py-1 rounded hover:bg-muted transition-colors text-xs font-mono"
              onClick={handleZoomReset}
              title="Reset Zoom (100%)"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              className="p-2 rounded hover:bg-muted transition-colors"
              onClick={handleZoomToFit}
              title="Zoom to Fit All Nodes"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="5" y="5" width="2" height="2" fill="currentColor" />
                <rect x="9" y="5" width="2" height="2" fill="currentColor" />
                <rect x="5" y="9" width="2" height="2" fill="currentColor" />
                <rect x="9" y="9" width="2" height="2" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
        
      </div>

      {/* Status bar */}
      <div className="border-t border-border p-2 text-xs text-muted-foreground flex justify-between">
        <span>
          {t('editor.ruleflow.nodeCount') || `${nodes.length} nodes, ${connections.length} connections`}
        </span>
        <span className="capitalize">
          {isDraggingConnection 
            ? 'Drag to target node and release to connect' 
            : `Tool: ${selectedTool}`
          } | Zoom: {Math.round(zoomLevel * 100)}%
        </span>
      </div>
    </div>
  );
}