import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel,
  Node,
  Edge,
  BackgroundVariant,
  Handle,
  Position,
} from 'reactflow';
import { OverviewConfig } from "@meridian-ui/meridian";
import {
  FetchedItemType,
  ViewOptions,
  FetchedAttributeValueType,
} from "@meridian-ui/meridian";
import { useODI } from "@meridian-ui/meridian";
import { findItemDetailViewToOpen } from "@meridian-ui/meridian";
import { MeridianItem } from "@meridian-ui/meridian";
import 'reactflow/dist/style.css';
import './overview-canvas.scss';

export interface OverviewCanvasType extends OverviewConfig {
  type: 'canvas';
  layout?: 'geographic';
  nodeSize?: 'small' | 'medium' | 'large';
  showMiniMap?: boolean;
  showControls?: boolean;
  connectionType?: 'default' | 'straight' | 'step' | 'smoothstep';
}

export const canvasDefaultSpec: Partial<OverviewCanvasType> = {
  layout: 'geographic',
  nodeSize: 'medium',
  showMiniMap: true,
  showControls: true,
  connectionType: 'smoothstep',
};

// Helper function to get coordinates from item
const getItemCoordinates = (item: FetchedItemType): { lat: number; lng: number } | null => {
  const latAttribute = item.internalAttributes?.find(
    (attr) => attr && typeof attr === 'object' && attr.label === 'lat'
  );
  const lngAttribute = item.internalAttributes?.find(
    (attr) => attr && typeof attr === 'object' && attr.label === 'lng'
  );

  if (!latAttribute || !lngAttribute) return null;

  const lat = parseFloat((latAttribute as FetchedAttributeValueType)?.value ?? '0');
  const lng = parseFloat((lngAttribute as FetchedAttributeValueType)?.value ?? '0');

  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;

  return { lat, lng };
};

// ItemNode for single items
const ItemNode = ({ data, isConnectable }: { data: any; isConnectable: boolean }) => {
  const { item, onClick, options } = data;

  return (
    <div className="item-node-card single-node">
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        style={{ background: '#3b82f6' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        style={{ background: '#3b82f6' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        style={{ background: '#3b82f6' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        style={{ background: '#3b82f6' }}
      />

      <div className="node-content">
        <div className="items-container single">
          <div
            className="item-wrapper"
            onClick={() => onClick?.(item)}
          >
            <MeridianItem
              item={item}
              options={options}
              index={0}
              itemView={options.overview.itemView}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  itemNode: ItemNode,
};

export const OverviewCanvas = (options: ViewOptions) => {

  const { odi, setSelectedItemEntity, highlightAttributes } = useODI();
  const detailToOpen = findItemDetailViewToOpen(options, odi);

  const config = options.overview as OverviewCanvasType;
  const layout = config.layout || 'geographic';

  // Track zoom level
  const [zoom, setZoom] = useState(1);

  // Generate nodes - one per item
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Calculate bounds for geographic layout
    const allCoords = options.items
      .map(item => getItemCoordinates(item))
      .filter((coord): coord is { lat: number; lng: number } => coord !== null);

    const bounds = allCoords.length > 0 ? {
      minLat: Math.min(...allCoords.map(c => c.lat)),
      maxLat: Math.max(...allCoords.map(c => c.lat)),
      minLng: Math.min(...allCoords.map(c => c.lng)),
      maxLng: Math.max(...allCoords.map(c => c.lng)),
    } : { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };

    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;

    options.items.forEach((item, itemIndex) => {
      let position = { x: 0, y: 0 };

      // Different layout algorithms
      switch (layout) {
        case 'geographic':
          const coords = getItemCoordinates(item);
          if (coords) {
            position = {
              x: ((coords.lng - bounds.minLng) / lngRange) * 1500 + 200,
              y: ((bounds.maxLat - coords.lat) / latRange) * 900 + 200,
            };
          } else {
            position = {
              x: 100 + (itemIndex % 3) * 350,
              y: 100 + Math.floor(itemIndex / 3) * 300,
            };
          }
          break;
        default:
          position = {
            x: (itemIndex % 4) * 350 + 100,
            y: Math.floor(itemIndex / 4) * 300 + 100,
          };
          break;
      }

      const handleNodeClick = (clickedItem: FetchedItemType) => {
        if (detailToOpen && !highlightAttributes) {
          setSelectedItemEntity(
            detailToOpen,
            clickedItem.overviewIndex ?? 0,
            clickedItem.itemId ?? '',
            {
              ...options,
              viewType: 'detail',
              overview: {
                ...options.overview,
                detailViews: options.overview.detailViews,
              },
            },
            { x: 0, y: 0 }
          );
        }
        if (detailToOpen?.openIn === 'new-page') {
          options.onOpenDetailNewPage(clickedItem);
        }
      };

      nodes.push({
        id: `item-${itemIndex}`,
        type: 'itemNode',
        position,
        data: {
          item,
          onClick: handleNodeClick,
          options,
        },
        className: 'single-item-node',
        draggable: true,
      });
    });

    return { nodes, edges };
  }, [options.items, layout, detailToOpen, highlightAttributes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds: Edge[]) => addEdge({
      ...params,
      type: config.connectionType || 'smoothstep',
      animated: true,
    }, eds)),
    [setEdges, config.connectionType]
  );

  const resetLayout = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges, initialNodes, initialEdges]);

  return (
    <div className="overview-canvas geographic-canvas" style={{ width: '100%', height: '600px', marginBottom: "2rem", border: "2px solid #ededed" }}>
      <div className="canvas-container" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onMove={(_: any, viewport: { zoom: number }) => setZoom(viewport.zoom)}
          connectionLineType={ConnectionLineType.SmoothStep}
          nodeTypes={nodeTypes}
          minZoom={0.1}
          maxZoom={2}
          fitView
          className="react-flow-canvas"
        >

          {config.showControls && <Controls />}

          {config.showMiniMap && (
            <MiniMap
              nodeColor="#64748b"
              nodeStrokeWidth={2}
              zoomable
              position="top-right"
              pannable
            />
          )}

          <Background color="#ccc" variant={BackgroundVariant.Dots} />

          {/* Zoom Level Display Panel - Bottom Right */}
          <Panel position="bottom-right" className="zoom-panel">
            <div className="zoom-display" style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <span style={{ fontWeight: 500 }}>Zoom:</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#1f2937',
                  fontSize: '16px'
                }}>
                  {(zoom * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{
                marginTop: '4px',
                fontSize: '11px',
                color: '#6b7280'
              }}>
                {zoom < 0.5 ? 'Zoomed Out' : zoom > 1.5 ? 'Zoomed In' : 'Normal'}
              </div>
            </div>
          </Panel>

          <Panel position="top-right" className="canvas-panel">
            <div className="panel-content">
              <h4>Geographic Canvas</h4>
              <div className="panel-stats">
                <span>Items: {options.items.length}</span>
              </div>
              <button onClick={resetLayout} className="reset-button">
                Reset Layout
              </button>
            </div>
          </Panel>

          <Panel position="bottom-left" className="canvas-info">
            <div className="info-content">
              <p>Layout: <strong>{layout}</strong></p>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};


