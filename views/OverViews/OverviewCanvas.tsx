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

// Helper function to get category from item
const getItemCategory = (item: FetchedItemType): string | null => {
  // Try to get category from attributes (localized_name-subtitle role)
  const categoryAttribute = item.attributes?.find(
    (attr) => attr && typeof attr === 'object' &&
      (attr as any).roles?.includes('localized_name-subtitle')
  );

  if (categoryAttribute) {
    const value = (categoryAttribute as FetchedAttributeValueType)?.value;
    if (typeof value === 'string' && value) {
      return value;
    }
  }

  // Fallback: try to access raw data if available
  if ((item as any).rawData?.category?.localized_name) {
    return (item as any).rawData.category.localized_name;
  }

  if ((item as any).sourceData?.category?.localized_name) {
    return (item as any).sourceData.category.localized_name;
  }

  return null;
};

// Helper function to get subcategories from item
const getItemSubcategories = (item: FetchedItemType): string[] => {
  // Try to access raw data
  const rawData = (item as any).rawData || (item as any).sourceData;

  if (rawData?.subcategory && Array.isArray(rawData.subcategory)) {
    return rawData.subcategory
      .map((sub: any) => sub?.localized_name || sub?.name)
      .filter((name: string | undefined): name is string => Boolean(name));
  }

  return [];
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

// CategoryNode for category/subcategory nodes
const CategoryNode = ({ data }: { data: any }) => {
  const { categoryName, itemCount, isSubcategory } = data;

  return (
    <div
      className={`category-node ${isSubcategory ? 'subcategory' : 'category'}`}
      style={{
        padding: isSubcategory ? '8px 12px' : '12px 16px',
        background: isSubcategory ? '#e0f2fe' : '#3b82f6',
        color: isSubcategory ? '#0369a1' : '#ffffff',
        borderRadius: '8px',
        fontWeight: isSubcategory ? 500 : 600,
        fontSize: isSubcategory ? '13px' : '15px',
        textAlign: 'center',
        minWidth: '100px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div>{categoryName}</div>
      {itemCount !== undefined && (
        <div style={{
          fontSize: '11px',
          opacity: 0.8,
          marginTop: '4px',
          fontWeight: 'normal'
        }}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </div>
      )}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={false}
        style={{ background: isSubcategory ? '#0369a1' : '#ffffff', width: '8px', height: '8px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={false}
        style={{ background: isSubcategory ? '#0369a1' : '#ffffff', width: '8px', height: '8px' }}
      />
    </div>
  );
};

const nodeTypes = {
  itemNode: ItemNode,
  categoryNode: CategoryNode,
};

export const OverviewCanvas = (options: ViewOptions) => {

  const { odi, setSelectedItemEntity, highlightAttributes } = useODI();
  const detailToOpen = findItemDetailViewToOpen(options, odi);

  const config = options.overview as OverviewCanvasType;
  const layout = config.layout || 'geographic';

  // Track zoom level
  const [zoom, setZoom] = useState(1);

  // Generate nodes - items with category/subcategory connections
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Group items by category and subcategory
    const categoryMap = new Map<string, { items: FetchedItemType[]; subcategories: Map<string, FetchedItemType[]> }>();

    options.items.forEach((item) => {
      const category = getItemCategory(item) || 'Uncategorized';
      const subcategories = getItemSubcategories(item);

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { items: [], subcategories: new Map() });
      }

      const categoryData = categoryMap.get(category)!;
      categoryData.items.push(item);

      // Group by subcategory
      if (subcategories.length > 0) {
        subcategories.forEach((subcategory) => {
          if (!categoryData.subcategories.has(subcategory)) {
            categoryData.subcategories.set(subcategory, []);
          }
          categoryData.subcategories.get(subcategory)!.push(item);
        });
      }
    });

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

    // Create category nodes (positioned on the left side)
    const categories = Array.from(categoryMap.entries());
    const categoryNodeIds: string[] = [];

    categories.forEach(([categoryName, categoryData], categoryIndex) => {
      const categoryNodeId = `category-${categoryName}`;
      categoryNodeIds.push(categoryNodeId);

      // Position category nodes on the left
      nodes.push({
        id: categoryNodeId,
        type: 'categoryNode',
        position: {
          x: 50,
          y: 100 + categoryIndex * 120,
        },
        data: {
          categoryName,
          itemCount: categoryData.items.length,
          isSubcategory: false,
        },
        className: 'category-node',
        draggable: true,
      });

      // Track items that are connected to subcategories
      const itemsConnectedToSubcategory = new Set<FetchedItemType>();

      // Create subcategory nodes (positioned below their category)
      const subcategories = Array.from(categoryData.subcategories.entries());

      subcategories.forEach(([subcategoryName, subcategoryItems], subIndex) => {
        const subcategoryNodeId = `subcategory-${categoryName}-${subcategoryName}`;

        nodes.push({
          id: subcategoryNodeId,
          type: 'categoryNode',
          position: {
            x: 200,
            y: 100 + categoryIndex * 120 + subIndex * 80,
          },
          data: {
            categoryName: subcategoryName,
            itemCount: subcategoryItems.length,
            isSubcategory: true,
          },
          className: 'subcategory-node',
          draggable: true,
        });

        // Connect subcategory to category
        edges.push({
          id: `edge-${categoryNodeId}-${subcategoryNodeId}`,
          source: categoryNodeId,
          target: subcategoryNodeId,
          type: config.connectionType || 'smoothstep',
          animated: false,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 2,
          },
        });

        // Connect items to subcategory
        subcategoryItems.forEach((item) => {
          itemsConnectedToSubcategory.add(item);
          const itemNodeId = `item-${options.items.indexOf(item)}`;
          edges.push({
            id: `edge-${subcategoryNodeId}-${itemNodeId}`,
            source: subcategoryNodeId,
            target: itemNodeId,
            type: config.connectionType || 'smoothstep',
            animated: false,
            style: {
              stroke: '#cbd5e1',
              strokeWidth: 1.5,
            },
          });
        });
      });

      // Connect items without subcategory directly to category
      const itemsWithoutSubcategory = categoryData.items.filter(item =>
        !itemsConnectedToSubcategory.has(item)
      );

      itemsWithoutSubcategory.forEach((item) => {
        const itemNodeId = `item-${options.items.indexOf(item)}`;
        edges.push({
          id: `edge-${categoryNodeId}-${itemNodeId}`,
          source: categoryNodeId,
          target: itemNodeId,
          type: config.connectionType || 'smoothstep',
          animated: false,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 2,
          },
        });
      });
    });

    // Create item nodes (positioned on the right side based on geography)
    options.items.forEach((item, itemIndex) => {
      let position = { x: 0, y: 0 };

      // Different layout algorithms
      switch (layout) {
        case 'geographic':
          const coords = getItemCoordinates(item);
          if (coords) {
            // Shift items to the right to make room for category nodes
            position = {
              x: ((coords.lng - bounds.minLng) / lngRange) * 1200 + 400,
              y: ((bounds.maxLat - coords.lat) / latRange) * 900 + 200,
            };
          } else {
            // Fallback for items without coordinates
            position = {
              x: 500 + (itemIndex % 3) * 350,
              y: 100 + Math.floor(itemIndex / 3) * 300,
            };
          }
          break;
        default:
          position = {
            x: 500 + (itemIndex % 4) * 350,
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
  }, [options.items, layout, detailToOpen, highlightAttributes, config.connectionType]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({
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
          onMove={(_, viewport) => setZoom(viewport.zoom)}
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
              <h4>Category Canvas</h4>
              <div className="panel-stats">
                <span>Items: {options.items.length}</span>
                <span>Categories: {new Set(options.items.map(item => getItemCategory(item) || 'Uncategorized')).size}</span>
                <span>Connections: {edges.length}</span>
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


