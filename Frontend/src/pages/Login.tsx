
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';
import { Loader2, Mail, Lock, AlertCircle, ArrowRight, Shield, TrendingUp, Users } from 'lucide-react';
import Logo from '@/assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useApp();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <Helmet>
                <title>Login - Kalvayal</title>
            </Helmet>

            {/* Left Side - Brand & Visual */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-cyan-600 via-cyan-700 to-slate-800 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                    <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo & Brand */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
                                <img src={Logo} alt="Kalvayal" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Kalvayal</h2>
                                <p className="text-xs text-cyan-100">Samugaseevaka Sangam</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Message */}
                    <div className="space-y-6 max-w-md">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold leading-tight">
                                Streamline Your Payroll Management
                            </h1>
                            <p className="text-lg text-cyan-100">
                                Powerful, secure, and intuitive payroll system designed for modern organizations.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Secure & Compliant</p>
                                    <p className="text-xs text-cyan-100">EPF/ETF automated calculations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Real-time Analytics</p>
                                    <p className="text-xs text-cyan-100">Track payroll trends instantly</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Worker Management</p>
                                    <p className="text-xs text-cyan-100">Complete employee profiles</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-cyan-100">
                        <p>&copy; {new Date().getFullYear()} Kalvayal. All rights reserved.</p>
                        <p className="text-xs mt-1 opacity-75">Developed by NES</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-5 duration-700">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl p-2">
                                <img src={Logo} alt="Kalvayal" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Kalvayal</h2>
                                <p className="text-xs text-muted-foreground">Payroll System</p>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email address
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 text-base border-2 focus:border-primary transition-all duration-200"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 text-base border-2 focus:border-primary transition-all duration-200"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* Mobile Footer */}
                    <div className="lg:hidden text-center text-xs text-muted-foreground pt-8">
                        <p>&copy; {new Date().getFullYear()} Kalvayal. All rights reserved.</p>
                        <p className="mt-1 opacity-75">Developed by NES</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default Login;
