import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { BrainCircuit, PenTool, X } from 'lucide-react';
import QuizGame from './QuizGame';
import ConnectDotsGame from './ConnectDotsGame';

export default function EngagementManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeGame, setActiveGame] = useState(null); // 'quiz' | 'dots' | null

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // User came back
                // We could add a check for how long they were gone, but for now just trigger it
                // Check if we haven't shown it recently or only show once per session?
                // For demo purposes, let's show it if they were gone.
                // To avoid spam, we might want a simple flag or cooldown.
                // Let's us a session storage flag or just a simple check.

                // Actually, user explicitly asked for this feature.
                // "while the attender deviates" -> upon return.

                // Only trigger if we aren't already showing it
                if (!isOpen) {
                    setIsOpen(true);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        setActiveGame(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Welcome Back! 👋</DialogTitle>
                    <DialogDescription>
                        We noticed you drifted away. Ready to refocus with a quick brain teaser?
                    </DialogDescription>
                </DialogHeader>

                {!activeGame ? (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 cursor-pointer transition-all"
                            onClick={() => setActiveGame('quiz')}
                        >
                            <BrainCircuit className="w-10 h-10 text-cyan-600 mb-2" />
                            <h3 className="font-semibold text-gray-900">Pop Quiz</h3>
                            <p className="text-xs text-center text-gray-500 mt-1">Test your event knowledge</p>
                        </div>

                        <div
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all"
                            onClick={() => setActiveGame('dots')}
                        >
                            <PenTool className="w-10 h-10 text-purple-600 mb-2" />
                            <h3 className="font-semibold text-gray-900">Connect Dots</h3>
                            <p className="text-xs text-center text-gray-500 mt-1">Focus your mind</p>
                        </div>
                    </div>
                ) : (
                    <div className="py-2">
                        <div className="flex justify-between items-center mb-4">
                            <Button variant="ghost" size="sm" onClick={() => setActiveGame(null)} className="-ml-2">
                                &larr; Back to menu
                            </Button>
                        </div>

                        {activeGame === 'quiz' && <QuizGame onComplete={() => { }} />}
                        {activeGame === 'dots' && <ConnectDotsGame />}
                    </div>
                )}

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        Maybe later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
