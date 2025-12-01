import React, { useCallback, useMemo, useState, useEffect, type ChangeEventHandler } from 'react';
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
} from 'reactflow';
import {
  FetchedItemType,
  findItemDetailViewToOpen,
  OverviewConfig,
  useODI,
  ViewOptions,
} from "@meridian-ui/meridian";
import 'reactflow/dist/style.css';
import './overview-canvas.scss';

// Import extracted modules
import { getItemCoordinates, calculateDistance, hierarchicalClustering } from './OverviewCanvas.helpers';
import { ItemNode, ClusterBox } from './OverviewCanvas.nodes';
import { generateClusterName } from './OverviewCanvas.utils';
import { CANVAS_CONFIG, CLUSTER_BORDER_COLORS } from './OverviewCanvas.constants';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface OverviewCanvasType extends OverviewConfig {
  type: 'canvas';
  layout?: 'geographic';
  nodeSize?: 'small' | 'medium' | 'large';
  showMiniMap?: boolean;
  showControls?: boolean;
  connectionType?: 'default' | 'straight' | 'step' | 'smoothstep';
  proximityThreshold?: number;
  maxConnections?: number;
  clusterThreshold?: number;
  showClusterLabels?: boolean;
  clusteringAlgorithm?: 'proximity' | 'hierarchical';
  hierarchicalMaxDistance?: number;
}

export const canvasDefaultSpec: Partial<OverviewCanvasType> = {
  layout: 'geographic',
  nodeSize: 'medium',
  showMiniMap: true,
  showControls: true,
  connectionType: 'smoothstep',
  proximityThreshold: 3,
  maxConnections: 5,
  clusterThreshold: 2,
  showClusterLabels: true,
  clusteringAlgorithm: 'hierarchical',
  hierarchicalMaxDistance: 3,
};

// ============================================================================
// Node Types Registration
// ============================================================================

const nodeTypes = {
  itemNode: ItemNode,
  clusterBox: ClusterBox,
};

// ============================================================================
// Main Component
// ============================================================================

export const OverviewCanvas = (options: ViewOptions) => {
  const { odi, setSelectedItemEntity, highlightAttributes } = useODI();
  const detailToOpen = findItemDetailViewToOpen(options, odi);
  const config = options.overview as OverviewCanvasType;
  const layout = config.layout || 'geographic';

  // ============================================================================
  // State Management
  // ============================================================================

  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>('light');

  const effectiveColorMode = useMemo(() => {
    if (colorMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return colorMode;
  }, [colorMode]);

  const onColorModeChange: ChangeEventHandler<HTMLSelectElement> = useCallback((evt) => {
    setColorMode(evt.target.value as 'light' | 'dark' | 'system');
  }, []);

  // ============================================================================
  // Node & Edge Generation
  // ============================================================================

  const { nodes: initialNodes, edges: initialEdges, clusters } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Prepare items with coordinates
    const itemsWithCoords: Array<{ item: FetchedItemType; index: number; coords: { lat: number; lng: number } | null }> =
      options.items.map((item, index) => ({
        item,
        index,
        coords: getItemCoordinates(item),
      }));

    const allCoords = itemsWithCoords
      .map(entry => entry.coords)
      .filter((coord): coord is { lat: number; lng: number } => coord !== null);

    const bounds = allCoords.length > 0 ? {
      minLat: Math.min(...allCoords.map(c => c.lat)),
      maxLat: Math.max(...allCoords.map(c => c.lat)),
      minLng: Math.min(...allCoords.map(c => c.lng)),
      maxLng: Math.max(...allCoords.map(c => c.lng)),
    } : { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };

    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;

    // Calculate initial positions
    const initialPositions: Array<{ x: number; y: number }> = [];
    itemsWithCoords.forEach(({ item, index: itemIndex, coords }) => {
      let position = { x: 0, y: 0 };
      switch (layout) {
        case 'geographic':
          if (coords) {
            position = {
              x: ((coords.lng - bounds.minLng) / lngRange) * CANVAS_CONFIG.WIDTH + 400,
              y: ((bounds.maxLat - coords.lat) / latRange) * CANVAS_CONFIG.HEIGHT + 400,
            };
          } else {
            position = {
              x: 300 + (itemIndex % 4) * 600,
              y: 300 + Math.floor(itemIndex / 4) * 500,
            };
          }
          break;
        default:
          position = {
            x: (itemIndex % 5) * 450 + 150,
            y: Math.floor(itemIndex / 5) * 400 + 150,
          };
          break;
      }
      initialPositions.push(position);
    });

    // Apply force-based spacing
    const finalPositions = [...initialPositions];
    for (let iteration = 0; iteration < CANVAS_CONFIG.MAX_ITERATIONS; iteration++) {
      let moved = false;
      for (let i = 0; i < finalPositions.length; i++) {
        for (let j = i + 1; j < finalPositions.length; j++) {
          const dx = finalPositions[j].x - finalPositions[i].x;
          const dy = finalPositions[j].y - finalPositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CANVAS_CONFIG.MIN_NODE_DISTANCE && distance > 0) {
            const force = (CANVAS_CONFIG.MIN_NODE_DISTANCE - distance) / distance * 0.7;
            const moveX = dx * force;
            const moveY = dy * force;
            finalPositions[i].x -= moveX;
            finalPositions[i].y -= moveY;
            finalPositions[j].x += moveX;
            finalPositions[j].y += moveY;
            moved = true;
          }
        }
      }
      if (!moved) break;
    }

    // Create updated options with overview config
    const updatedOptions: ViewOptions = {
      ...options,
      overview: {
        ...options.overview,
        hiddenAttributes: options.overview.hiddenAttributes,
        shownAttributes: options.overview.shownAttributes,
      },
    };

    // Create nodes
    itemsWithCoords.forEach(({ item, index: itemIndex }, idx) => {
      const position = finalPositions[idx];
      const handleNodeClick = (clickedItem: FetchedItemType) => {
        if (detailToOpen && !highlightAttributes) {
          setSelectedItemEntity(
            detailToOpen,
            clickedItem.overviewIndex ?? 0,
            clickedItem.itemId ?? '',
            {
              ...updatedOptions,
              viewType: 'detail',
              overview: {
                ...updatedOptions.overview,
                detailViews: updatedOptions.overview.detailViews,
              },
            },
            { x: 0, y: 0 }
          );
        }
        if (detailToOpen?.openIn === 'new-page') {
          updatedOptions.onOpenDetailNewPage(clickedItem);
        }
      };

      const configKey = JSON.stringify({
        hidden: options.overview.hiddenAttributes,
        shown: options.overview.shownAttributes,
        highlight: highlightAttributes,
      });

      nodes.push({
        id: `item-${itemIndex}`,
        type: 'itemNode',
        position,
        data: {
          item,
          onClick: handleNodeClick,
          options: updatedOptions,
          effectiveColorMode,
          highlightAttributes,
          configKey,
        },
        className: 'single-item-node',
        draggable: true,
      });
    });

    // Clustering
    let clusters: Array<Array<number>> = [];
    const nodeClusterMap = new Map<number, number>();

    if (layout === 'geographic' && allCoords.length > 1) {
      const clusteringAlgorithm = config.clusteringAlgorithm || 'hierarchical';
      const clusterThreshold = config.clusterThreshold ?? 2;

      if (clusteringAlgorithm === 'hierarchical') {
        const pointsWithCoords = itemsWithCoords
          .map((entry, idx) => ({ coords: entry.coords!, index: idx }))
          .filter(entry => entry.coords !== null);
        const maxDistance = config.hierarchicalMaxDistance ?? 3;
        clusters = hierarchicalClustering(pointsWithCoords, maxDistance);
        clusters.forEach((cluster, clusterIdx) => {
          cluster.forEach(nodeIdx => nodeClusterMap.set(nodeIdx, clusterIdx));
        });
        console.log(`Hierarchical clustering: Created ${clusters.length} clusters (maxDistance=${maxDistance}km)`);
      } else {
        const visited = new Set<number>();
        for (let i = 0; i < itemsWithCoords.length; i++) {
          if (visited.has(i) || !itemsWithCoords[i].coords) continue;
          const cluster: number[] = [i];
          visited.add(i);
          const queue = [i];
          while (queue.length > 0) {
            const currentIdx = queue.shift()!;
            const current = itemsWithCoords[currentIdx];
            if (!current.coords) continue;
            for (let j = 0; j < itemsWithCoords.length; j++) {
              if (visited.has(j) || !itemsWithCoords[j].coords) continue;
              const distance = calculateDistance(current.coords, itemsWithCoords[j].coords!);
              if (distance <= clusterThreshold) {
                cluster.push(j);
                visited.add(j);
                queue.push(j);
              }
            }
          }
          if (cluster.length > 1) {
            clusters.push(cluster);
            cluster.forEach(nodeIdx => nodeClusterMap.set(nodeIdx, clusters.length - 1));
          }
        }
        console.log(`Proximity clustering: Created ${clusters.length} clusters (threshold=${clusterThreshold}km)`);
      }
    }

    // Create edges within clusters
    if (layout === 'geographic' && allCoords.length > 1 && clusters.length > 0) {
      clusters.forEach((cluster) => {
        if (cluster.length < 2) return;
        cluster.forEach((nodeIdx) => {
          const source = itemsWithCoords[nodeIdx];
          if (!source || !source.coords) return;
          const sourceCoords = source.coords;
          let closestDistance = Infinity;
          let closestNodeIdx: number | null = null;
          cluster.forEach((otherNodeIdx) => {
            if (otherNodeIdx === nodeIdx) return;
            const target = itemsWithCoords[otherNodeIdx];
            if (!target || !target.coords) return;
            const distance = calculateDistance(sourceCoords, target.coords);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestNodeIdx = otherNodeIdx;
            }
          });
          if (closestNodeIdx !== null && nodeIdx < closestNodeIdx) {
            edges.push({
              id: `edge-${nodeIdx}-${closestNodeIdx}`,
              source: `item-${nodeIdx}`,
              target: `item-${closestNodeIdx}`,
              type: 'straight',
              animated: false,
              style: {
                stroke: effectiveColorMode === 'dark' ? '#1e293b' : '#334155',
                strokeWidth: 1.5,
                opacity: 0.8,
              },
            });
          }
        });
      });
    }

    // Spread clusters apart
    if (clusters.length > 1 && layout === 'geographic') {
      for (let iteration = 0; iteration < 50; iteration++) {
        let moved = false;
        for (let c1 = 0; c1 < clusters.length; c1++) {
          for (let c2 = c1 + 1; c2 < clusters.length; c2++) {
            const cluster1 = clusters[c1];
            const cluster2 = clusters[c2];
            let center1 = { x: 0, y: 0 };
            let center2 = { x: 0, y: 0 };
            cluster1.forEach(nodeIdx => {
              center1.x += finalPositions[nodeIdx].x;
              center1.y += finalPositions[nodeIdx].y;
            });
            center1.x /= cluster1.length;
            center1.y /= cluster1.length;
            cluster2.forEach(nodeIdx => {
              center2.x += finalPositions[nodeIdx].x;
              center2.y += finalPositions[nodeIdx].y;
            });
            center2.x /= cluster2.length;
            center2.y /= cluster2.length;
            const dx = center2.x - center1.x;
            const dy = center2.y - center1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < CANVAS_CONFIG.MIN_CLUSTER_DISTANCE && distance > 0) {
              const force = (CANVAS_CONFIG.MIN_CLUSTER_DISTANCE - distance) / distance * 0.3;
              const moveX = dx * force;
              const moveY = dy * force;
              cluster1.forEach(nodeIdx => {
                finalPositions[nodeIdx].x -= moveX;
                finalPositions[nodeIdx].y -= moveY;
              });
              cluster2.forEach(nodeIdx => {
                finalPositions[nodeIdx].x += moveX;
                finalPositions[nodeIdx].y += moveY;
              });
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
    }

    // Update node positions
    nodes.forEach((node, idx) => {
      if (idx < finalPositions.length) {
        node.position = finalPositions[idx];
      }
    });

    // Add cluster info to nodes
    nodes.forEach((node, idx) => {
      const clusterId = nodeClusterMap.get(idx);
      if (clusterId !== undefined && clusters[clusterId]) {
        node.data = {
          ...node.data,
          clusterId,
          clusterSize: clusters[clusterId].length,
        };
      }
    });

    // Create cluster boxes
    const clusterBoxNodes: Node[] = [];
    clusters.forEach((cluster, clusterIdx) => {
      const clusterItems = cluster.map(nodeIdx => itemsWithCoords[nodeIdx]?.item).filter(Boolean);
      const { name: clusterName, subtitle: clusterSubtitle } = generateClusterName(clusterItems as FetchedItemType[], clusterIdx, config);
      const clusterPositions = cluster.map(nodeIdx => finalPositions[nodeIdx]).filter(Boolean);

      if (clusterPositions.length > 0) {
        const minX = Math.min(...clusterPositions.map(p => p.x));
        const maxX = Math.max(...clusterPositions.map(p => p.x));
        const minY = Math.min(...clusterPositions.map(p => p.y));
        const maxY = Math.max(...clusterPositions.map(p => p.y));
        const boxWidth = maxX - minX + CANVAS_CONFIG.CLUSTER_PADDING * 2;
        const boxHeight = maxY - minY + CANVAS_CONFIG.CLUSTER_PADDING * 2;
        const boxX = minX - CANVAS_CONFIG.CLUSTER_PADDING;
        const boxY = minY - CANVAS_CONFIG.CLUSTER_PADDING;
        const clusterColor = CLUSTER_BORDER_COLORS[clusterIdx % CLUSTER_BORDER_COLORS.length];

        clusterBoxNodes.push({
          id: `cluster-box-${clusterIdx}`,
          type: 'clusterBox',
          position: { x: boxX, y: boxY },
          data: {
            clusterId: clusterIdx,
            clusterName,
            clusterSubtitle,
            clusterSize: cluster.length,
            color: clusterColor,
            effectiveColorMode,
          },
          style: { width: boxWidth, height: boxHeight },
          draggable: false,
          selectable: false,
          zIndex: 0,
        });
      }
    });

    return { nodes: [...clusterBoxNodes, ...nodes], edges, clusters };
  }, [
    options.items,
    options.overview,
    options.overview?.hiddenAttributes,
    options.overview?.shownAttributes,
    layout,
    detailToOpen,
    highlightAttributes,
    config.proximityThreshold,
    config.maxConnections,
    config.connectionType,
    config.clusterThreshold,
    config.clusteringAlgorithm,
    config.hierarchicalMaxDistance,
    effectiveColorMode
  ]);

  // ============================================================================
  // ReactFlow State Management
  // ============================================================================

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="overview-canvas geographic-canvas" style={{ width: '100%', height: '550px', marginBottom: "2rem", border: "2px solid #ededed" }}>
      <div className="canvas-container" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionLineType={ConnectionLineType.SmoothStep}
          nodeTypes={nodeTypes}
          minZoom={0.1}
          maxZoom={2}
          fitView
          className="react-flow-canvas"
          style={{
            backgroundColor: effectiveColorMode === 'dark' ? '#0f172a' : '#ffffff',
          }}
        >
          <MiniMap
            nodeColor={effectiveColorMode === 'dark' ? '#94a3b8' : '#64748b'}
            nodeStrokeWidth={2}
            zoomable
            pannable
            style={{
              backgroundColor: effectiveColorMode === 'dark' ? '#1e293b' : '#f8fafc',
              border: `1px solid ${effectiveColorMode === 'dark' ? '#334155' : '#e2e8f0'}`,
            }}
          />

          <Background
            color={effectiveColorMode === 'dark' ? '#475569' : '#ccc'}
            variant={BackgroundVariant.Dots}
          />

          <Controls />

          <Panel position="top-right" className="canvas-panel">
            <div className="panel-content" style={{
              background: effectiveColorMode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${effectiveColorMode === 'dark' ? '#475569' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                color: effectiveColorMode === 'dark' ? '#f1f5f9' : '#1f2937',
                fontSize: '16px',
                fontWeight: 600,
              }}>
                Geographic Canvas
              </h4>
              <div className="panel-stats" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px',
                color: effectiveColorMode === 'dark' ? '#cbd5e1' : '#6b7280',
                marginBottom: '12px',
              }}>
                <span>Items: {options.items.length}</span>
                <span>Connections: {initialEdges.length}</span>
                {clusters && clusters.length > 0 && (
                  <span>Clusters: {clusters.length}</span>
                )}
              </div>
              {layout === 'geographic' && (
                <div className="panel-info" style={{
                  fontSize: '11px',
                  color: effectiveColorMode === 'dark' ? '#94a3b8' : '#6b7280',
                  marginBottom: '12px',
                }}>
                  {config.clusteringAlgorithm === 'hierarchical' ? (
                    <>
                      <div>Algorithm: Hierarchical</div>
                      <div>Max merge: {config.hierarchicalMaxDistance ?? 3}km</div>
                    </>
                  ) : (
                    <>
                      <div>Algorithm: Proximity</div>
                      <div>Proximity: {config.proximityThreshold ?? 3}km</div>
                      <div>Cluster: {config.clusterThreshold ?? 2}km</div>
                    </>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: effectiveColorMode === 'dark' ? '#cbd5e1' : '#374151',
                  marginBottom: '4px',
                }}>
                  Theme:
                </label>
                <select
                  value={colorMode}
                  onChange={onColorModeChange}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${effectiveColorMode === 'dark' ? '#475569' : '#d1d5db'}`,
                    backgroundColor: effectiveColorMode === 'dark' ? '#1e293b' : '#ffffff',
                    color: effectiveColorMode === 'dark' ? '#f1f5f9' : '#1f2937',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <button
                onClick={resetLayout}
                className="reset-button"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: effectiveColorMode === 'dark' ? '#3b82f6' : '#2563eb',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = effectiveColorMode === 'dark' ? '#2563eb' : '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = effectiveColorMode === 'dark' ? '#3b82f6' : '#2563eb';
                }}
              >
                Reset Layout
              </button>
            </div>
          </Panel>

          <Panel position="bottom-left" className="canvas-info">
            <div className="info-content" style={{
              background: effectiveColorMode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${effectiveColorMode === 'dark' ? '#475569' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px',
                color: effectiveColorMode === 'dark' ? '#cbd5e1' : '#6b7280',
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px', color: effectiveColorMode === 'dark' ? '#f1f5f9' : '#1f2937' }}>
                    Clustering Explanation:
                  </div>
                  {layout === 'geographic' && clusters.length > 0 ? (
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      {config.clusteringAlgorithm === 'hierarchical' ? (
                        <>
                          <strong>Hierarchical Clustering:</strong> Groups restaurants within{' '}
                          <strong>{config.hierarchicalMaxDistance ?? 3}km</strong> of each other.
                          <br />
                          <span style={{ opacity: 0.8 }}>Restaurants in the same colored box are within this distance.</span>
                        </>
                      ) : (
                        <>
                          <strong>Proximity Clustering:</strong> Groups restaurants within{' '}
                          <strong>{config.clusterThreshold ?? 2}km</strong> of each other.
                          <br />
                          <span style={{ opacity: 0.8 }}>Restaurants in the same colored box are within this distance.</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>
                      No clusters found. Restaurants are displayed individually.
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: `1px solid ${effectiveColorMode === 'dark' ? '#475569' : '#e5e7eb'}` }}>
                  <div style={{ fontSize: '11px' }}>
                    <strong>Connections:</strong> Thin lines connect restaurants within the same cluster.
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
