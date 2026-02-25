import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config';

import { api } from '@/api/base44Client';

export default function QuizGame({ onComplete, eventName }) {
    const [questions, setQuestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    const handleAnswer = (index) => {
        setSelectedOption(index);
        const correct = index === questions[currentQuestion].answer;
        setIsCorrect(correct);
        const newScore = correct ? score + 1 : score;

        setTimeout(() => {
            setScore(newScore);

            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setShowResult(true);

                // Save to Backend
                fetch(`${API_URL}/api/engagement`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        participant_email: localStorage.getItem('user_email') || 'anonymous@questbridge.com',
                        activity_type: 'Quiz Game',
                        details: { total_questions: questions.length },
                        score: newScore
                    })
                })
                    .then(res => res.json())
                    .then(data => console.log('Engagement logged:', data))
                    .catch(err => console.error('Failed to log engagement:', err));

                if (onComplete) onComplete(newScore);
            }
        }, 1000);
    };

    const resetGame = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        setSelectedOption(null);
        setIsCorrect(null);
    };

    if (!gameStarted) {
        return (
            <Card className="w-full max-w-md mx-auto text-center border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-2xl">Crazy AI Quiz!</CardTitle>
                    <CardDescription>Generate a custom unhinged quiz based on: <br /><strong className="text-cyan-600">"{eventName}"</strong></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center mb-6">
                        <div className="text-5xl">🤖</div>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Powered by GROQ's blazing fast LLM.
                    </p>
                    <Button
                        onClick={async () => {
                            setIsGenerating(true);
                            try {
                                const aiQuestions = await api.ai.generateQuiz(eventName);
                                if (aiQuestions && aiQuestions.length > 0) {
                                    setQuestions(aiQuestions);
                                    setGameStarted(true);
                                } else {
                                    alert('Received empty or invalid quiz questions.');
                                }
                            } catch (err) {
                                alert('Error generating AI quiz: ' + err.message);
                            } finally {
                                setIsGenerating(false);
                            }
                        }}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 text-white w-full py-6 text-lg"
                    >
                        {isGenerating ? 'Generating Crazy Questions...' : '✨ Generate AI Quiz Now'}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (showResult) {
        return (
            <Card className="w-full max-w-md mx-auto text-center border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                    <CardDescription>You scored {score} out of {questions.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center mb-6">
                        {score === questions.length ? (
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        ) : (
                            <div className="text-4xl">🎯</div>
                        )}
                    </div>
                    <p className="text-gray-600">
                        {score === questions.length ? "Perfect Score! You are a genius!" : "Great effort! Keep learning."}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={resetGame} variant="outline" className="gap-2">
                        <RefreshCcw className="w-4 h-4" /> Play Again
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle>Quick Quiz</CardTitle>
                <CardDescription>Question {currentQuestion + 1} of {questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">{questions[currentQuestion].question}</h3>
                <div className="grid gap-3">
                    {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                            key={index}
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedOption !== null}
                            className={`p-4 rounded-lg text-left transition-colors border ${selectedOption === index
                                ? isCorrect
                                    ? 'bg-green-100 border-green-500 text-green-700'
                                    : 'bg-red-100 border-red-500 text-red-700'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {selectedOption === index && (
                                    isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
