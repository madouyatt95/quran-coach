import { useId } from 'react';

/** Original geometric ornament. No artwork extracted from a printed edition. */
export function PageOrnaments({opening}:{opening:boolean}) {
    const id=useId().replace(/:/g,'');
    return <svg className="iq-page-ornaments" viewBox="0 0 600 860" aria-hidden="true">
        <defs>
            <pattern id={`${id}-vine`} width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M0 16Q8 0 16 16T32 16M16 0Q0 8 16 16T16 32" fill="none" stroke="#9d873d" strokeWidth="1.1"/>
                <path d="M16 5L23 16 16 27 9 16Z" fill="#205f53" stroke="#cfbb76" strokeWidth=".7"/>
                <path d="M16 11L20 16 16 21 12 16Z" fill={opening?'#cb7a90':'#e6d392'}/>
                <circle cx="16" cy="16" r="1.5" fill="#fff5cc"/>
            </pattern>
            <g id={`${id}-flower`}>
                {[0,45,90,135].map(a=><ellipse key={a} rx="8" ry="20" transform={`rotate(${a})`} fill="#e0cf93" stroke="#357365" strokeWidth="1"/>)}
                <circle r="9" fill="#255c80" stroke="#a56a88" strokeWidth="3"/><circle r="3" fill="#f7e6ba"/>
            </g>
        </defs>
        <rect x="28" y="48" width="544" height="744" rx="3" fill="none" stroke="#b6a46d"/>
        <rect x="35" y="55" width="530" height="730" fill={opening?'#246c84':'#266255'} stroke="#ad975d" strokeWidth="3"/>
        <rect x="40" y="60" width="520" height="720" fill={`url(#${id}-vine)`}/>
        <rect x={opening?88:54} y={opening?170:90} width={opening?424:492} height={opening?510:652} fill="var(--iq-paper,#fffdf4)" stroke="#bca45b" strokeWidth="4"/>
        <rect x={opening?96:60} y={opening?178:96} width={opening?408:480} height={opening?494:640} fill="none" stroke="#416553" strokeWidth="1.5"/>
        {opening && <>
            {[68,532].flatMap(x=>[100,208,316,424,532,640,748].map(y=><use key={`${x}-${y}`} href={`#${id}-flower`} transform={`translate(${x} ${y}) scale(.85)`}/>))}
            {[142,220,300,380,458].flatMap(x=>[104,744].map(y=><use key={`${x}-${y}`} href={`#${id}-flower`} transform={`translate(${x} ${y})`}/>))}
            <path d="M160 142L184 125H416L440 142 416 159H184Z" fill="var(--iq-paper,#fff7dc)" stroke="#baa264" strokeWidth="2"/>
        </>}
        <path d="M268 798L280 786H320L332 798 320 810H280Z" fill="var(--iq-paper,#f5edd4)" stroke="#a78d46"/>
    </svg>;
}
