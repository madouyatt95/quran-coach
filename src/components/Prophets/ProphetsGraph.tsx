import { Link } from 'react-router-dom';
import { prophetRelations } from '../../data/prophetRelations';
import { useCallback, useMemo, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    Handle,
    Position,
    BackgroundVariant
} from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes } from '../../data/prophetsGraph';
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
    search?:string;
}

export function ProphetsGraph({ onSelectProphet, search='' }: Props) {
    const [selected,setSelected]=useState<number|null>(null);
    const matched=prophets.filter(p=>`${p.nameFr} ${p.nameIslamic} ${p.nameAr} ${p.title}`.toLowerCase().includes(search.toLowerCase().trim())).map(p=>p.id);
    const connected=new Set(matched);
    if(search.trim())for(const relation of prophetRelations)if(matched.includes(relation.source)||matched.includes(relation.target)){connected.add(relation.source);connected.add(relation.target);}
    const allNodes=[...initialNodes,...prophets.filter(p=>!initialNodes.some(n=>n.id===p.id)).map((p,i)=>({id:p.id,position:{x:100+i*180,y:1500},data:{id:p.id},type:'prophetNode'}))];
    const nodes=allNodes.filter(n=>connected.has(n.id));
    const edges=prophetRelations.map((r,i)=>({id:String(i),source:r.source,target:r.target,type:'smoothstep',label:r.label,style:{stroke:'#c9a84c'},labelStyle:{fill:'#d4b85e',fontSize:10},labelBgStyle:{fill:'#18203a'}})).filter(e=>connected.has(e.source)&&connected.has(e.target));
    const relation=selected===null?null:prophetRelations[selected];

    const onNodeClick = useCallback((_: React.MouseEvent, node: {data:{id?:unknown}}) => {
        const prophet = prophets.find(p => p.id === node.data.id);
        if (prophet) {
            onSelectProphet(prophet);
        }
    }, [onSelectProphet]);

    return (<section className="journey-relations"><p>Touchez une liaison pour comprendre le lien et consulter son passage source. La disposition ne représente pas une chronologie datée.</p>
        {nodes.length===0&&<p role="status">Aucun prophète trouvé.</p>}
        <div className="journey-relation-buttons" aria-label="Relations documentées">{edges.map(e=><button key={e.id} onClick={()=>setSelected(Number(e.id))}>{prophets.find(p=>p.id===e.source)?.nameIslamic} · {prophets.find(p=>p.id===e.target)?.nameIslamic}</button>)}</div>
        {relation&&<article className="journey-relation-card"><h3>{relation.label}</h3><p>{relation.description}</p><Link to={`/read?surah=${relation.reference.split(':')[0]}&ayah=${relation.reference.split(':')[1].split('-')[0]}`}>Lire le passage {relation.reference}</Link> · <a href={`https://quran.com/${relation.reference.replace(':','/')}`} target="_blank" rel="noopener noreferrer">Source ↗</a><p><button onClick={()=>setSelected(null)}>Fermer l’explication</button></p></article>}
        <div style={{ width: '100%', height: '70vh', borderRadius: 'var(--radius-lg, 12px)', overflow: 'hidden', border: '1px solid var(--color-border, #e5e7eb)' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                key={search}
                nodesDraggable={false}
                onEdgeClick={(_,edge)=>setSelected(Number(edge.id))}
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
        </div></section>
    );
}
