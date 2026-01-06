import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StageNode, DecisionNode, AutomationNode, ManualHandoffNode } from './CustomNodes';
import './ATSWorkflowMapper.css';

const nodeTypes = {
  stage: StageNode,
  decision: DecisionNode,
  automation: AutomationNode,
  manual: ManualHandoffNode,
};

// Define the initial nodes for the ATS workflow
const initialNodes = [
  // Stage 1: Application
  {
    id: '1',
    type: 'stage',
    position: { x: 50, y: 200 },
    data: {
      label: 'Applied',
      icon: '📝',
      description: 'Candidate submits application',
    },
  },
  // Automation: Resume parsing
  {
    id: '2',
    type: 'automation',
    position: { x: 300, y: 200 },
    data: {
      label: 'Auto Resume Parse',
      icon: '🤖',
      description: 'AI extracts candidate info',
    },
  },
  // Decision: Initial screening
  {
    id: '3',
    type: 'decision',
    position: { x: 550, y: 150 },
    data: {
      label: 'Meets Requirements?',
      icon: '🎯',
      description: 'Auto-check qualifications',
    },
  },
  // Manual: Recruiter review
  {
    id: '4',
    type: 'manual',
    position: { x: 850, y: 80 },
    data: {
      label: 'Recruiter Review',
      icon: '👤',
      description: 'Manual application review',
    },
  },
  // Stage 2: Phone screen
  {
    id: '5',
    type: 'stage',
    position: { x: 1100, y: 80 },
    data: {
      label: 'Phone Screen',
      icon: '📞',
      description: 'Initial phone interview',
    },
  },
  // Automation: Schedule interview
  {
    id: '6',
    type: 'automation',
    position: { x: 1350, y: 80 },
    data: {
      label: 'Auto Schedule',
      icon: '📅',
      description: 'Send calendar invite',
    },
  },
  // Decision: Phone screen result
  {
    id: '7',
    type: 'decision',
    position: { x: 1600, y: 30 },
    data: {
      label: 'Passed Phone Screen?',
      icon: '✅',
      description: 'Evaluate interview performance',
    },
  },
  // Manual: Hiring manager handoff
  {
    id: '8',
    type: 'manual',
    position: { x: 1900, y: -50 },
    data: {
      label: 'HM Handoff',
      icon: '🤝',
      description: 'Hiring manager takes over',
    },
  },
  // Stage 3: Onsite
  {
    id: '9',
    type: 'stage',
    position: { x: 2150, y: -50 },
    data: {
      label: 'Onsite Interview',
      icon: '🏢',
      description: 'Full interview loop',
    },
  },
  // Automation: Feedback collection
  {
    id: '10',
    type: 'automation',
    position: { x: 2400, y: -50 },
    data: {
      label: 'Collect Feedback',
      icon: '📊',
      description: 'Automated feedback forms',
    },
  },
  // Decision: Hire decision
  {
    id: '11',
    type: 'decision',
    position: { x: 2650, y: -100 },
    data: {
      label: 'Recommend Hire?',
      icon: '🎓',
      description: 'Team consensus review',
    },
  },
  // Stage 4: Offer
  {
    id: '12',
    type: 'stage',
    position: { x: 2950, y: -180 },
    data: {
      label: 'Offer',
      icon: '💼',
      description: 'Extend job offer',
    },
  },
  // Automation: Offer generation
  {
    id: '13',
    type: 'automation',
    position: { x: 3200, y: -180 },
    data: {
      label: 'Generate Offer',
      icon: '📄',
      description: 'Auto-create offer letter',
    },
  },
  // Decision: Offer accepted
  {
    id: '14',
    type: 'decision',
    position: { x: 3450, y: -230 },
    data: {
      label: 'Offer Accepted?',
      icon: '🤔',
      description: 'Candidate decision',
    },
  },
  // Stage 5: Accepted
  {
    id: '15',
    type: 'stage',
    position: { x: 3750, y: -310 },
    data: {
      label: 'Accepted',
      icon: '🎉',
      description: 'Candidate accepts offer',
    },
  },
  // Automation: Onboarding
  {
    id: '16',
    type: 'automation',
    position: { x: 4000, y: -310 },
    data: {
      label: 'Start Onboarding',
      icon: '🚀',
      description: 'Begin onboarding process',
    },
  },
  // Rejection nodes
  {
    id: '17',
    type: 'stage',
    position: { x: 600, y: 400 },
    data: {
      label: 'Rejected',
      icon: '❌',
      description: 'Application rejected',
    },
  },
  {
    id: '18',
    type: 'automation',
    position: { x: 850, y: 400 },
    data: {
      label: 'Send Rejection',
      icon: '📧',
      description: 'Auto-send rejection email',
    },
  },
];

// Define edges (connections between nodes)
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', sourceHandle: 'yes', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'e3-17', source: '3', target: '17', sourceHandle: 'no', label: 'No', style: { stroke: '#ef4444' } },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6', animated: true },
  { id: 'e6-7', source: '6', target: '7', animated: true },
  { id: 'e7-8', source: '7', target: '8', sourceHandle: 'yes', label: 'Pass', style: { stroke: '#10b981' } },
  { id: 'e7-17', source: '7', target: '17', sourceHandle: 'no', label: 'Fail', style: { stroke: '#ef4444' } },
  { id: 'e8-9', source: '8', target: '9' },
  { id: 'e9-10', source: '9', target: '10', animated: true },
  { id: 'e10-11', source: '10', target: '11', animated: true },
  { id: 'e11-12', source: '11', target: '12', sourceHandle: 'yes', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'e11-17', source: '11', target: '17', sourceHandle: 'no', label: 'No', style: { stroke: '#ef4444' } },
  { id: 'e12-13', source: '12', target: '13', animated: true },
  { id: 'e13-14', source: '13', target: '14', animated: true },
  { id: 'e14-15', source: '14', target: '15', sourceHandle: 'yes', label: 'Accepted', style: { stroke: '#10b981' } },
  { id: 'e14-17', source: '14', target: '17', sourceHandle: 'no', label: 'Declined', style: { stroke: '#ef4444' } },
  { id: 'e15-16', source: '15', target: '16', animated: true },
  { id: 'e17-18', source: '17', target: '18', animated: true },
];

export default function ATSWorkflowMapper() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h1>ATS Workflow Mapper</h1>
        <p>Interactive Recruiting Pipeline Visualization</p>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box stage-box"></div>
          <span>Pipeline Stage</span>
        </div>
        <div className="legend-item">
          <div className="legend-box decision-box"></div>
          <span>Decision Point</span>
        </div>
        <div className="legend-item">
          <div className="legend-box automation-box"></div>
          <span>Automation</span>
        </div>
        <div className="legend-item">
          <div className="legend-box manual-box"></div>
          <span>Manual Handoff</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'stage':
                return '#3b82f6';
              case 'decision':
                return '#f59e0b';
              case 'automation':
                return '#10b981';
              case 'manual':
                return '#8b5cf6';
              default:
                return '#ccc';
            }
          }}
          nodeStrokeWidth={3}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
