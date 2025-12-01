import React from 'react';
import { Handle, Position } from 'reactflow';
import { getAttributesByRole, MeridianItem, ViewOptions } from "@meridian-ui/meridian";

// Cluster colors for visual distinction
const CLUSTER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

const CLUSTER_BORDER_COLORS = [
  '#667eea',
  '#f093fb',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#30cfd0',
  '#a8edea',
  '#ff9a9e',
];

// ItemNode for single items
export const ItemNode = ({ data, isConnectable }: { data: any; isConnectable: boolean }) => {
  const { item, onClick, options, clusterId, clusterSize } = data;

  // Get restaurant name for label
  const titleAttr = getAttributesByRole(item, 'title');
  const restaurantName = titleAttr && typeof titleAttr === 'object' && 'value' in titleAttr
    ? String(titleAttr.value)
    : 'Restaurant';

  const clusterGradient = clusterId !== undefined ? CLUSTER_GRADIENTS[clusterId % CLUSTER_GRADIENTS.length] : '';
  const clusterBorderColor = clusterId !== undefined ? CLUSTER_BORDER_COLORS[clusterId % CLUSTER_BORDER_COLORS.length] : 'transparent';

  return (
    <div
      className="item-node-card single-node"
      style={{
        position: 'relative',
        border: clusterId !== undefined && clusterSize && clusterSize > 1
          ? `3px solid ${clusterBorderColor}`
          : '2px solid transparent',
        borderRadius: '12px',
        boxShadow: clusterId !== undefined && clusterSize && clusterSize > 1
          ? `0 4px 12px ${clusterBorderColor}40`
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Cluster indicator badge */}
      {clusterId !== undefined && clusterSize && clusterSize > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: clusterGradient,
            color: 'white',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: `0 2px 6px ${clusterBorderColor}40`,
            zIndex: 11,
            pointerEvents: 'none',
            border: '1px solid white',
          }}
        >
          #{clusterId + 1}
        </div>
      )}

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} id="top" isConnectable={isConnectable} style={{ background: '#3b82f6' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isConnectable} style={{ background: '#3b82f6' }} />
      <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} style={{ background: '#3b82f6' }} />
      <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} style={{ background: '#3b82f6' }} />

      {/* Label above node */}
      <div
        style={{
          position: 'absolute',
          top: '-35px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#1f2937',
          whiteSpace: 'nowrap',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {restaurantName}
      </div>

      <div className="node-content">
        <div className="items-container single">
          <div className="item-wrapper" onClick={() => onClick?.(item)}>
            <MeridianItem
              item={item}
              options={options as ViewOptions}
              index={0}
              itemView={options.overview.itemView}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ClusterBox component for visual cluster containers
export const ClusterBox = ({ data }: { data: { clusterId: number; clusterName: string; clusterSubtitle: string; clusterSize: number; color: string; effectiveColorMode: 'light' | 'dark' } }) => {
  const { clusterId, clusterName, clusterSubtitle, clusterSize, color, effectiveColorMode } = data;

  const borderColor = effectiveColorMode === 'dark' ? `${color}80` : color;
  const backgroundColor = effectiveColorMode === 'dark' ? `${color}10` : `${color}15`;
  const labelBg = effectiveColorMode === 'dark'
    ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
    : `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: `3px solid ${borderColor}`,
        borderRadius: '16px',
        background: backgroundColor,
        position: 'relative',
        boxShadow: effectiveColorMode === 'dark'
          ? `0 4px 16px ${color}20`
          : `0 4px 16px ${color}30`,
        pointerEvents: 'none', // Don't block interactions with restaurant nodes
      }}
    >
      {/* Cluster Label at top */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: labelBg,
          color: 'white',
          padding: '10px 24px',
          borderRadius: '20px',
          fontSize: '15px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          boxShadow: `0 4px 12px ${color}50`,
          zIndex: 12,
          border: `2px solid ${effectiveColorMode === 'dark' ? '#1e293b' : 'white'}`,
          minWidth: '180px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '17px', marginBottom: '2px', fontWeight: 800 }}>{clusterName}</div>
        <div style={{ fontSize: '11px', opacity: 0.9, fontWeight: 500, marginBottom: '2px' }}>{clusterSubtitle}</div>
        <div style={{ fontSize: '11px', opacity: 0.95, fontWeight: 600 }}>{clusterSize} {clusterSize === 1 ? 'restaurant' : 'restaurants'}</div>
      </div>
    </div>
  );
};

