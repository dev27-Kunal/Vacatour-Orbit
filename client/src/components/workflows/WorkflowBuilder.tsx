import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Play, Save, Settings, Plus, GitBranch,
  Users, Mail, Clock, Filter, CheckCircle, XCircle
} from 'lucide-react';
import { apiPost } from '@/lib/api-client';

// Custom node types
const TriggerNode = ({ data }: any) => (
  <div className="px-4 py-2 bg-green-100 border-2 border-green-500 rounded-lg">
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center space-x-2">
      <Play className="h-4 w-4 text-green-600" />
      <div>
        <div className="text-sm font-semibold text-green-900">{data.label}</div>
        <div className="text-xs text-green-700">{data.trigger}</div>
      </div>
    </div>
  </div>
);

const ActionNode = ({ data }: any) => (
  <div className="px-4 py-2 bg-blue-100 border-2 border-blue-500 rounded-lg">
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center space-x-2">
      <Settings className="h-4 w-4 text-blue-600" />
      <div>
        <div className="text-sm font-semibold text-blue-900">{data.label}</div>
        <div className="text-xs text-blue-700">{data.action}</div>
      </div>
    </div>
  </div>
);

const ConditionNode = ({ data }: any) => (
  <div className="px-4 py-2 bg-yellow-100 border-2 border-yellow-500 rounded-lg">
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Right} id="true" />
    <Handle type="source" position={Position.Left} id="false" />
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 text-yellow-600" />
      <div>
        <div className="text-sm font-semibold text-yellow-900">{data.label}</div>
        <div className="text-xs text-yellow-700">{data.condition}</div>
      </div>
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'Job Created', trigger: 'When a new job is posted' }
  },
  {
    id: '2',
    type: 'condition',
    position: { x: 250, y: 150 },
    data: { label: 'Check Job Type', condition: 'If job type is URGENT' }
  },
  {
    id: '3',
    type: 'action',
    position: { x: 100, y: 250 },
    data: { label: 'Select Top Bureaus', action: 'Auto-select 5 bureaus' }
  },
  {
    id: '4',
    type: 'action',
    position: { x: 400, y: 250 },
    data: { label: 'Standard Distribution', action: 'Distribute to all bureaus' }
  },
  {
    id: '5',
    type: 'action',
    position: { x: 250, y: 350 },
    data: { label: 'Send Notifications', action: 'Email selected bureaus' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', sourceHandle: 'true', target: '3', label: 'Yes', animated: true },
  { id: 'e2-4', source: '2', sourceHandle: 'false', target: '4', label: 'No', animated: true },
  { id: 'e3-5', source: '3', target: '5', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true }
];

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('Auto Bureau Selection Workflow');
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type: 'trigger' | 'action' | 'condition') => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: 250, y: nodes.length * 100 },
      data: {
        label: type === 'trigger' ? 'New Trigger' : type === 'action' ? 'New Action' : 'New Condition',
        [type]: 'Configure this node'
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const saveWorkflow = async () => {
    setIsSaving(true);
    try {
      const workflow = {
        name: workflowName,
        nodes,
        edges,
        category: 'BUREAU_SELECTION',
        trigger_type: 'JOB_CREATED',
        is_active: true
      };

      await apiPost('/api/vms/workflows/templates', workflow);
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[600px] relative">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="px-3 py-1 border rounded-md font-semibold"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => addNode('trigger')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center space-x-1"
              >
                <Play className="h-4 w-4" />
                <span className="text-sm">Add Trigger</span>
              </button>
              <button
                onClick={() => addNode('condition')}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 flex items-center space-x-1"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Add Condition</span>
              </button>
              <button
                onClick={() => addNode('action')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Add Action</span>
              </button>
            </div>
          </div>
          <button
            onClick={saveWorkflow}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="h-full pt-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger': return '#10B981';
                case 'condition': return '#F59E0B';
                case 'action': return '#3B82F6';
                default: return '#9CA3AF';
              }
            }}
          />
        </ReactFlow>
      </div>

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-lg p-4 z-20">
          <h3 className="font-semibold mb-3">Node Properties</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, data: { ...node.data, label: e.target.value } }
                        : node
                    )
                  );
                }}
                className="w-full px-3 py-1 border rounded-md"
              />
            </div>

            {selectedNode.type === 'trigger' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event</label>
                <select className="w-full px-3 py-1 border rounded-md">
                  <option>Job Created</option>
                  <option>Application Received</option>
                  <option>Status Changed</option>
                  <option>Time-based</option>
                </select>
              </div>
            )}

            {selectedNode.type === 'condition' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                  <select className="w-full px-3 py-1 border rounded-md">
                    <option>Job Type</option>
                    <option>Salary Range</option>
                    <option>Bureau Count</option>
                    <option>Application Count</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                  <select className="w-full px-3 py-1 border rounded-md">
                    <option>Equals</option>
                    <option>Greater Than</option>
                    <option>Less Than</option>
                    <option>Contains</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input type="text" className="w-full px-3 py-1 border rounded-md" />
                </div>
              </>
            )}

            {selectedNode.type === 'action' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select className="w-full px-3 py-1 border rounded-md">
                    <option>Select Bureaus</option>
                    <option>Send Email</option>
                    <option>Update Status</option>
                    <option>Create Task</option>
                    <option>Reject Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parameters</label>
                  <textarea className="w-full px-3 py-1 border rounded-md" rows={3} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}