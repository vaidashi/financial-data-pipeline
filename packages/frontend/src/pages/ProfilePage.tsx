import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Calendar, Shield } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import { formatDate } from '../lib/utils';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileFormData): Promise<void> => {
    try {
      // TODO: Implement profile update API call
      console.log('Update profile:', data);
      refreshUser();
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile info */}
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar
                src={user?.avatar || ''}
                name={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || ''}
                size="xl"
                className="mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username
                }
              </h2>
              <p className="text-gray-600">@{user?.username}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{user?.role.toLowerCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register('firstName', {
                        required: 'First name is required',
                      })}
                      label="First Name"
                      error={errors.firstName?.message}
                    />
                    <Input
                      {...register('lastName', {
                        required: 'Last name is required',
                      })}
                      label="Last Name"
                      error={errors.lastName?.message}
                    />
                  </div>

                  <Input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email',
                      },
                    })}
                    type="email"
                    label="Email Address"
                    error={errors.email?.message}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!isDirty}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;