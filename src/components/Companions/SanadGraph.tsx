
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Handle,
    Position
} from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, initialEdges } from '../../data/sanadGraph';
import './SanadGraph.css';

// Custom Node Component for Sanad to allow specific styling based on color data
function SanadNode({ data }: NodeProps) {
    return (
        <div
            className="sanad-node"
            style={{
                '--node-color': data.color as string,
                borderLeftWidth: '6px' // Thicker left border for emphasis
            } as React.CSSProperties}
        >
            <Handle type="target" position={Position.Top} style={{ background: data.color as string }} />
            <div>{data.label as string}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: data.color as string }} />
        </div>
    );
}

const nodeTypes = {
    sanadNode: SanadNode,
};

export function SanadGraph() {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="sanad-graph-container">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={1.5}
                attributionPosition="bottom-right"
            >
                <Background color="var(--color-border)" gap={20} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}
