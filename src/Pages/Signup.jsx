import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Eye, EyeOff, Loader2, AlertCircle, Users, Mic } from 'lucide-react';
import { api } from '@/api/base44Client';

export default function Signup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [role, setRole] = useState('attendee');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await api.auth.signup({
                username: formData.name,
                email: formData.email,
                password: formData.password,
                role
            });
            navigate(role === 'host' ? '/Dashboard' : '/Events');
        } catch (err) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[100px]" />
                <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px]" />
            </div>

            <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white relative z-10 shadow-xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="text-white font-bold text-2xl">Q</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription className="text-slate-400">Get started with QuestBridge today</CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="mb-5">
                        <Label className="text-slate-300 mb-2 block">I want to join as</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('attendee')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'attendee'
                                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                        : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                    }`}
                            >
                                <Users className="w-6 h-6" />
                                <span className="text-sm font-semibold">Attendee</span>
                                <span className="text-xs text-center opacity-70">Join & attend events</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('host')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'host'
                                        ? 'border-Purple-500 bg-purple-500/10 text-purple-400'
                                        : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                    }`}
                                style={role === 'host' ? { borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', color: '#c084fc' } : {}}
                            >
                                <Mic className="w-6 h-6" />
                                <span className="text-sm font-semibold">Host</span>
                                <span className="text-xs text-center opacity-70">Create & manage events</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" type="text" placeholder="John Doe"
                                value={formData.name} onChange={handleChange} required
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@example.com"
                                value={formData.email} onChange={handleChange} required
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input id="password" name="password" type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password" value={formData.password} onChange={handleChange} required
                                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 pr-10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password"
                                placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500" />
                        </div>
                        <Button type="submit"
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
                            disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-slate-700 pt-6">
                    <p className="text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">Sign in</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
