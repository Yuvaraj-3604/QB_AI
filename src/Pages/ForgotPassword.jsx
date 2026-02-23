import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px]" />
            </div>

            <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white relative z-10 shadow-xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="text-white font-bold text-2xl">Q</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your email to receive reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Ex. john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="bg-green-500/20 text-green-400 p-4 rounded-lg">
                                <p>Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.</p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                onClick={() => setSubmitted(false)}
                            >
                                Try diferent email
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-700 pt-6">
                    <Link to="/login" className="flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
