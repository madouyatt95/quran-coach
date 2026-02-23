import { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    BackgroundVariant
} from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, initialEdges } from '../../data/prophetsGraph';
import { prophets } from '../../data/prophets';
import type { Prophet } from '../../data/prophets';

const ProphetNode = ({ data }: NodeProps) => {
    const prophet = useMemo(() => prophets.find(p => p.id === data.id), [data.id]);

    if (!prophet) return <div>Unknown</div>;

    return (
        <div
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '8px 12px', borderRadius: '12px', border: `2px solid ${prophet.color}`,
                backgroundColor: 'var(--color-surface, #fff)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                minWidth: '120px', cursor: 'pointer', textAlign: 'center'
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: '#9ca3af' }} />
            <span style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{prophet.icon}</span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--color-text, #1f2937)', marginBottom: '2px' }}>{prophet.nameIslamic}</strong>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted, #6b7280)' }}>{prophet.period}</span>
            <Handle type="source" position={Position.Bottom} style={{ background: '#9ca3af' }} />
        </div>
    );
};

const nodeTypes = {
    prophetNode: ProphetNode,
};

interface Props {
    onSelectProphet: (prophet: Prophet) => void;
}

export function ProphetsGraph({ onSelectProphet }: Props) {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
        const prophet = prophets.find(p => p.id === node.data.id);
        if (prophet) {
            onSelectProphet(prophet);
        }
    }, [onSelectProphet]);

    return (
        <div style={{ width: '100%', height: '70vh', borderRadius: 'var(--radius-lg, 12px)', overflow: 'hidden', border: '1px solid var(--color-border, #e5e7eb)' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls />
                <MiniMap zoomable pannable nodeColor={(n) => {
                    const prophet = prophets.find(p => p.id === n.data.id);
                    return prophet ? prophet.color : '#eee';
                }} />
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--color-border, #e5e7eb)" />
            </ReactFlow>
        </div>
    );
}
