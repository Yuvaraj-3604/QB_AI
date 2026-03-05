import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    ShieldCheck,
    Search
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { api } from '@/api/base44Client';
import { API_URL } from '../config';

export default function VerifyCertificate() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [certIdVerify, setCertIdVerify] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const user = api.auth.me();

    const handleVerifyCert = async () => {
        if (!certIdVerify.trim()) return;
        setVerifying(true);
        setVerifyError(null);
        setVerificationResult(null);

        try {
            const response = await fetch(`${API_URL}/api/requests/verify/${certIdVerify.trim()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                setVerificationResult(data);
            } else {
                setVerifyError(data.error || 'Invalid Certificate ID');
            }
        } catch (err) {
            setVerifyError('Failed to connect to verification service');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

                <main className="p-6 max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Credential Verification</h1>
                        <p className="text-gray-500 mt-1">Verify the authenticity of QuestBridge AI certificates</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Verification Input Card */}
                        <Card className="border-cyan-100 shadow-sm overflow-hidden">
                            <div className="bg-cyan-500/5 p-6 border-b border-cyan-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-200">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Verify a Certificate</h2>
                                        <p className="text-sm text-gray-500">Enter the unique Certificate ID to validate details</p>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                                        <Input
                                            placeholder="Enter Certificate ID (e.g. QB-XXXX-YYYY)"
                                            value={certIdVerify}
                                            onChange={(e) => setCertIdVerify(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleVerifyCert()}
                                            className="pl-12 h-14 text-lg border-2 border-gray-100 focus:border-cyan-500 bg-gray-50/50 rounded-2xl transition-all"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleVerifyCert}
                                        disabled={verifying}
                                        className="w-full h-14 text-lg bg-cyan-500 hover:bg-cyan-600 shadow-xl shadow-cyan-100 rounded-2xl transition-all active:scale-[0.98]"
                                    >
                                        {verifying ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying Credentials...</>
                                        ) : (
                                            'Verify Authenticity'
                                        )}
                                    </Button>

                                    {verifyError && (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in zoom-in duration-300">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p className="font-medium">{verifyError}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Card */}
                        <Card className="border-gray-100 shadow-xl relative overflow-hidden bg-white min-h-[400px]">
                            {!verificationResult ? (
                                <CardContent className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-12 h-12 text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-400">Waiting for Certificate ID</h3>
                                    <p className="text-gray-400 max-w-xs mt-2">Enter a valid ID above to see the official verified credentials from our database.</p>
                                </CardContent>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-green-50/30">
                                        <div className="flex items-center gap-3 text-green-600">
                                            <CheckCircle2 className="w-6 h-6" />
                                            <span className="font-black tracking-widest text-sm uppercase">Verification Successful</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                            Record ID: {certIdVerify}
                                        </span>
                                    </div>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div className="group transition-all">
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2">Participant Name</p>
                                                    <p className="text-2xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                                                        {verificationResult.participantName}
                                                    </p>
                                                </div>
                                                <div className="group transition-all">
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2">Registered Email</p>
                                                    <p className="text-xl font-bold text-gray-900">{verificationResult.participantEmail}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="group transition-all">
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2">Event Title</p>
                                                    <div className="flex items-start gap-3">
                                                        <Calendar className="w-6 h-6 text-cyan-500 mt-1 flex-shrink-0" />
                                                        <p className="text-2xl font-bold text-cyan-600 line-clamp-2 leading-tight">
                                                            {verificationResult.eventName}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="group transition-all">
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2">Completion Date</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {verificationResult.eventDate ? format(new Date(verificationResult.eventDate), 'MMMM d, yyyy') : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 mt-4 p-6 bg-cyan-50/50 rounded-3xl border border-cyan-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-cyan-100">
                                                        <span className="text-2xl">🎓</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Official Participation Record</p>
                                                        <p className="text-xs text-gray-500">Verified by QuestBridge AI Authentication System</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 mb-1">Authenticated on</p>
                                                    <p className="text-sm font-bold text-cyan-600">
                                                        {format(new Date(verificationResult.issuedAt), 'PPP')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            )}
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
