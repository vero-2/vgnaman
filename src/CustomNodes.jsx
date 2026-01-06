import { Handle, Position } from '@xyflow/react';
import './CustomNodes.css';

// Stage Node - for main pipeline stages
export const StageNode = ({ data }) => {
  return (
    <div className="stage-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon">{data.icon || '📋'}</div>
        <div className="node-label">{data.label}</div>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// Decision Node - for decision points
export const DecisionNode = ({ data }) => {
  return (
    <div className="decision-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon">{data.icon || '❓'}</div>
        <div className="node-label">{data.label}</div>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="yes" style={{ top: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="no" />
    </div>
  );
};

// Automation Node - for automated touchpoints
export const AutomationNode = ({ data }) => {
  return (
    <div className="automation-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon">{data.icon || '⚙️'}</div>
        <div className="node-label">{data.label}</div>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// Manual Handoff Node - for manual intervention points
export const ManualHandoffNode = ({ data }) => {
  return (
    <div className="manual-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-icon">{data.icon || '👤'}</div>
        <div className="node-label">{data.label}</div>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
