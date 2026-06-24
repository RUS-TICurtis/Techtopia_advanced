import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import StageGroupNode from './nodes/StageGroupNode';
import DealNode from './nodes/DealNode';

const nodeTypes = {
  stageGroup: StageGroupNode,
  deal: DealNode,
};

const STAGE_WIDTH = 320;
const STAGE_MARGIN = 40;
const TOP_MARGIN = 20;

const PipelineFlowInner = ({ 
  stages, 
  stageColors, 
  stageProbabilities, 
  deals, 
  onDealMove,
  onEditDeal,
  onDeleteDeal
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const { project, getIntersectingNodes } = useReactFlow();

  // Re-calculate nodes when deals or stages change
  useEffect(() => {
    const newNodes = [];

    // 1. Create Stage Group Nodes
    stages.forEach((stageName, index) => {
      const stageDeals = deals.filter(d => d.stage === stageName);
      const sum = stageDeals.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      newNodes.push({
        id: `stage-${stageName}`,
        type: 'stageGroup',
        position: { x: index * (STAGE_WIDTH + STAGE_MARGIN), y: TOP_MARGIN },
        data: {
          title: stageName,
          count: stageDeals.length,
          value: sum,
          color: stageColors[stageName]
        },
        style: { width: STAGE_WIDTH, height: Math.max(600, stageDeals.length * 160 + 100) },
        draggable: false, // Don't allow dragging the columns
        selectable: false,
        zIndex: 0,
      });

      // 2. Create Deal Nodes inside this stage
      stageDeals.forEach((deal, dealIndex) => {
        newNodes.push({
          id: `deal-${deal.id}`,
          type: 'deal',
          // Position relative to parent
          position: { x: 20, y: 80 + dealIndex * 150 },
          parentNode: `stage-${stageName}`,
          extent: 'parent', // Optional: keeps them inside parent visually while dragging. 
          // Actually, if we want them to drag to another column, we remove extent: 'parent'.
          data: {
            deal,
            prob: stageProbabilities[stageName] || 50,
            onEdit: onEditDeal,
            onDelete: onDeleteDeal
          },
          draggable: true,
          zIndex: 10,
        });
      });
    });

    // To allow dragging between parents, we must NOT set `extent: 'parent'`.
    // And we must ensure child nodes can escape their parents.

    setNodes(newNodes);
  }, [deals, stages, stageColors, stageProbabilities, onEditDeal, onDeleteDeal, setNodes]);

  const onNodeDragStop = useCallback((event, node) => {
    if (node.type !== 'deal') return;

    // Use React Flow's getIntersectingNodes to find which stage it was dropped on
    const intersections = getIntersectingNodes(node).filter(n => n.type === 'stageGroup');
    
    if (intersections.length > 0) {
      // Find the stage name
      const targetStageNode = intersections[0];
      const targetStageName = targetStageNode.data.title;
      const dealId = node.id.replace('deal-', '');
      const deal = deals.find(d => d.id.toString() === dealId);

      if (deal && deal.stage !== targetStageName) {
        onDealMove(deal.id, targetStageName);
      }
    } else {
      // If dropped outside, we can just let the useEffect re-snap it to its current parent
      setNodes(nds => [...nds]); // force update
    }
  }, [getIntersectingNodes, deals, onDealMove, setNodes]);

  return (
    <div className="w-full h-[70vh] rounded-2xl border border-gray-800/80 overflow-hidden bg-[#0F172A]/30">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{ zIndex: 0 }}
      >
        <Background color="#1E293B" gap={16} />
        <Controls className="bg-gray-900 border-gray-800 fill-white" />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'stageGroup') return node.data.color;
            if (node.type === 'deal') return '#38BDF8';
            return '#1E293B';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="bg-gray-900 border-gray-800"
        />
      </ReactFlow>
    </div>
  );
};

export default function PipelineFlow(props) {
  return (
    <ReactFlowProvider>
      <PipelineFlowInner {...props} />
    </ReactFlowProvider>
  );
}
