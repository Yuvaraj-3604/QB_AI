import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { RefreshCcw, CheckCircle2 } from 'lucide-react';

const generateDots = (count = 5) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 80 + 10,
    })).sort((a, b) => a.id - b.id);
};

export default function ConnectDotsGame() {
    const [dots, setDots] = useState([]);
    const [nextDot, setNextDot] = useState(1);
    const [lines, setLines] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        setDots(generateDots(5));
        setNextDot(1);
        setLines([]);
        setGameOver(false);
    };

    const handleDotClick = (dot) => {
        if (dot.id === nextDot) {
            if (nextDot > 1) {
                const prevDot = dots.find(d => d.id === nextDot - 1);
                setLines([...lines, { x1: prevDot.x, y1: prevDot.y, x2: dot.x, y2: dot.y }]);
            }

            if (nextDot === dots.length) {
                setGameOver(true);
            } else {
                setNextDot(nextDot + 1);
            }
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto border-none shadow-none select-none">
            <CardHeader>
                <CardTitle>Connect the Dots</CardTitle>
                <CardDescription>Click the numbers in order: 1 to 5</CardDescription>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} className="relative w-full h-64 bg-slate-50 rounded-xl border border-dashed border-slate-300 overflow-hidden cursor-crosshair">
                    {/* Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {lines.map((line, i) => (
                            <line
                                key={i}
                                x1={`${line.x1}%`}
                                y1={`${line.y1}%`}
                                x2={`${line.x2}%`}
                                y2={`${line.y2}%`}
                                stroke="#06b6d4" // cyan-500
                                strokeWidth="2"
                            />
                        ))}
                    </svg>

                    {/* Dots */}
                    {dots.map((dot) => (
                        <div
                            key={dot.id}
                            onClick={() => handleDotClick(dot)}
                            className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm cursor-pointer
                ${dot.id < nextDot ? 'bg-cyan-500 text-white border-cyan-600 scale-100' :
                                    dot.id === nextDot ? 'bg-white border-2 border-cyan-500 text-cyan-600 hover:scale-110 animate-pulse' :
                                        'bg-white border border-gray-300 text-gray-400'}`}
                            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                        >
                            {dot.id}
                        </div>
                    ))}

                    {gameOver && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                            <p className="text-xl font-bold text-gray-800">Well Done!</p>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button onClick={resetGame} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" /> Reset
                </Button>
            </CardFooter>
        </Card>
    );
}
