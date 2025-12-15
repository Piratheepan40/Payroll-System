
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Shield, Key, Camera, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { updateProfile } from '@/lib/api';
import { useState } from 'react';

export default function Profile() {
    const { user, setUser } = useApp();
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name');

        try {
            const res = await updateProfile({ name });
            setUser(res.user);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const current_password = formData.get('current_password');
        const new_password = formData.get('new_password');
        const new_password_confirmation = formData.get('new_password_confirmation');

        if (new_password !== new_password_confirmation) {
            toast.error('New passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await updateProfile({
                current_password,
                new_password,
                new_password_confirmation
            });
            toast.success('Password updated successfully!');
            (e.target as HTMLFormElement).reset();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="My Profile" subtitle="Manage your account settings">
            <Helmet>
                <title>My Profile - Kalvayal</title>
            </Helmet>

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Profile Header Card */}
                <div className="relative rounded-xl overflow-hidden bg-card border shadow-sm">
                    {/* Cover Image Background */}
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"></div>

                    <div className="px-6 pb-6">
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-12 gap-4">
                            {/* Avatar */}
                            <div className="relative group">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarImage src="" alt={user?.name} />
                                    <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center sm:text-left space-y-1 mt-2 sm:mt-0">
                                <h2 className="text-2xl font-bold">{user?.name}</h2>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{user?.email}</span>
                                </div>
                            </div>

                            {/* Action Button (Optional) */}
                            <div className="mt-4 sm:mt-0">
                                <Button variant="outline" className="hidden sm:flex">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Change Photo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="general">General Information</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your personal details here.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input name="name" id="name" defaultValue={user?.name} className="pl-9" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input id="role" defaultValue={user?.role} className="pl-9 capitalize bg-muted" readOnly disabled />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" type="email" defaultValue={user?.email} className="pl-9 bg-muted" readOnly disabled />
                                        </div>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Your email address is managed by your organization's administrator.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Ensure your account is secure by using a strong password.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input name="current_password" type="password" className="pl-9" placeholder="••••••••" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input name="new_password" type="password" className="pl-9" placeholder="••••••••" required />
                                        </div>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Password should be at least 8 characters long.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input name="new_password_confirmation" type="password" className="pl-9" placeholder="••••••••" required />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
