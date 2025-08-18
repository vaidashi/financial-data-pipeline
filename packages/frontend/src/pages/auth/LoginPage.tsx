import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { validateEmail } from '../../lib/utils';
import type { LoginRequest } from '../../types/api';

const LoginPage: React.FC = () => {
    const { login, isLoading, isAuthenticated } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>();

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const onSubmit = async (data: LoginRequest): Promise<void> => {
        try {
            await login(data);
        } catch (error) {
            // Error handling is done in the context
            console.error('Login error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <Input
                                    {...register('email', {
                                        required: 'Email is required',
                                        validate: (value: string) => validateEmail(value) || 'Please enter a valid email',
                                    })}
                                    type="email"
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    error={errors.email?.message}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="relative">
                                <Input
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    placeholder="Enter your password"
                                    error={errors.password?.message}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <Link
                                        to="/forgot-password"
                                        className="font-medium text-primary-600 hover:text-primary-500"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/register"
                                    className="font-medium text-primary-600 hover:text-primary-500"
                                >
                                    Create your account
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Demo credentials */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
                        <p className="text-xs text-blue-700">
                            Email: demo@financial-pipeline.com<br />
                            Password: demo123
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default LoginPage;