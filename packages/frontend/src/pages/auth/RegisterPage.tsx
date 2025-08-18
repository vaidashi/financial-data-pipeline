import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { validateEmail, validatePassword } from '../../lib/utils';
import type { RegisterRequest } from '../../types/api';

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest>();

  const password = watch('password');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterRequest): Promise<void> => {
    try {
      await registerUser(data);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join and start tracking your investments
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('firstName', {
                    required: 'First name is required',
                  })}
                  label="First Name"
                  placeholder="John"
                  error={errors.firstName?.message}
                  autoComplete="given-name"
                />
                <Input
                  {...register('lastName', {
                    required: 'Last name is required',
                  })}
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  autoComplete="family-name"
                />
              </div>

              <Input
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores',
                  },
                })}
                label="Username"
                placeholder="johndoe"
                error={errors.username?.message}
                autoComplete="username"
              />

              <Input
                {...register('email', {
                  required: 'Email is required',
                  validate: (value: string) => validateEmail(value) || 'Please enter a valid email',
                })}
                type="email"
                label="Email Address"
                placeholder="john@example.com"
                error={errors.email?.message}
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value: string) => {
                      const validation = validatePassword(value);
                      return validation.isValid || validation.errors[0];
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a strong password"
                  error={errors.password?.message}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {password && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li className={password.length >= 6 ? 'text-success-600' : ''}>
                      At least 6 characters
                    </li>
                    <li className={/(?=.*[a-z])/.test(password) ? 'text-success-600' : ''}>
                      One lowercase letter
                    </li>
                    <li className={/(?=.*[A-Z])/.test(password) ? 'text-success-600' : ''}>
                      One uppercase letter
                    </li>
                    <li className={/(?=.*\d)/.test(password) ? 'text-success-600' : ''}>
                      One number
                    </li>
                  </ul>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in to your account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;