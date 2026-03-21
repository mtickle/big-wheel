import { memo } from 'react';

const Wheel = memo(({
    rotation,
    topIndex,
    transitionEnabled,
    size,
    wheelValues,
    isSpinning
}) => {
    const SEGMENT_DEG = 18;
    const CENTER = size / 2;
    const RADIUS = size / 2 - 25;
    const TEXT_RADIUS = RADIUS - 50;
    const LIGHTS_COUNT = 40;
    const LIGHTS_RADIUS = RADIUS + 15;

    const polarToCartesian = (cx, cy, r, angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const describeWedge = (cx, cy, r, startAngle, endAngle) => {
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
    };

    return (
        <div className="relative group mt-20" style={{ width: size, height: size }}>

            {/* 1. THE STATIC CABINET (Does NOT rotate) */}
            <div className="absolute -inset-10 bg-gradient-to-b from-slate-900 via-black to-slate-900 rounded-full shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-8 border-slate-800 z-0" />

            {/* 2. THE FIXED LIGHTS LAYER (Does NOT rotate) */}
            <svg
                width={size}
                height={size}
                className="absolute inset-0 z-20 pointer-events-none"
            >
                {[...Array(LIGHTS_COUNT)].map((_, i) => {
                    const angle = (i * (360 / LIGHTS_COUNT));
                    const pos = polarToCartesian(CENTER, CENTER, LIGHTS_RADIUS, angle);

                    return (
                        <circle
                            key={`light-${i}`}
                            cx={pos.x}
                            cy={pos.y}
                            r="4.5"
                            fill={i % 2 === 0 ? "#fbbf24" : "#fffbeb"}
                            className={`${isSpinning ? "animate-pulse" : "opacity-80"}`}
                            style={{
                                animationDelay: `${i * 80}ms`,
                                filter: isSpinning ? "drop-shadow(0 0 8px rgba(251,191,36,0.8))" : "none"
                            }}
                        />
                    );
                })}
            </svg>

            {/* 3. THE RED POINTER (Fixed at the top) */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]">
                <div className="w-0 h-0 border-l-[28px] border-r-[28px] border-t-[56px] border-l-transparent border-r-transparent border-t-red-600" />
                <div className="w-3 h-12 bg-slate-500 absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border-2 border-slate-700" />
            </div>

            {/* 4. THE SPINNING WHEEL (The only part that rotates) */}
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="relative z-10"
                style={{
                    transform: `rotate(-${rotation}deg)`,
                    transition: transitionEnabled ? "transform 4000ms cubic-bezier(0.15, 0, 0.1, 1)" : "none",
                    willChange: "transform"
                }}
            >
                <defs>
                    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="50%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                </defs>

                {wheelValues.map((val, i) => {
                    const startAngle = (i - topIndex) * SEGMENT_DEG - 9;
                    const endAngle = startAngle + SEGMENT_DEG;
                    const midAngle = startAngle + SEGMENT_DEG / 2;
                    const textPos = polarToCartesian(CENTER, CENTER, TEXT_RADIUS, midAngle);

                    let fill = i % 2 === 0 ? "url(#silverGrad)" : "#eab308";
                    if (val === 100) fill = "#0f172a";
                    if (val === 5 || val === 15) fill = "#15803d";

                    return (
                        <g key={i}>
                            <path
                                d={describeWedge(CENTER, CENTER, RADIUS, startAngle, endAngle)}
                                fill={fill}
                                stroke="#000"
                                strokeWidth="2"
                            />
                            <circle
                                cx={polarToCartesian(CENTER, CENTER, RADIUS - 8, startAngle).x}
                                cy={polarToCartesian(CENTER, CENTER, RADIUS - 8, startAngle).y}
                                r="3.5"
                                fill="#334155"
                            />
                            <text
                                x={textPos.x}
                                y={textPos.y}
                                fill={val === 100 ? "#ef4444" : "#0f172a"}
                                fontSize="34"
                                fontWeight="900"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${midAngle} ${textPos.x} ${textPos.y})`}
                                className="font-black"
                            >
                                {val === 100 ? "1.00" : val}
                            </text>
                        </g>
                    );
                })}

                {/* Center Nut */}
                <circle cx={CENTER} cy={CENTER} r="22" fill="#1e293b" stroke="#475569" strokeWidth="6" />
                <circle cx={CENTER} cy={CENTER} r="8" fill="#94a3b8" />
            </svg>
        </div>
    );
});

export default Wheel;