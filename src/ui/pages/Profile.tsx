import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Camera, RefreshCw, Trash2, User as UserIcon } from 'lucide-react';
import { DashboardHeader } from '@/ui/components/DashboardHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/components/ui/avatar';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Badge } from '@/ui/components/ui/badge';
import { useAuth } from '@/ui/contexts/AuthContext';
import { apiService } from '@/ui/services/api.service';
import { useProgressToast } from '@/ui/hooks/useProgressToast';

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

type ProfileFormState = {
  name: string;
  email: string;
  githubUsername: string;
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, token, updateAuthenticatedUser } = useAuth();
  const toast = useProgressToast();

  const [form, setForm] = useState<ProfileFormState>({
    name: '',
    email: '',
    githubUsername: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarPayload, setAvatarPayload] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      githubUsername: user.githubUsername ?? '',
    });
    setAvatarPreview(user.avatarUrl ?? null);
    setAvatarPayload(undefined);
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;

    return (
      form.name.trim() !== (user.name ?? '') ||
      form.email.trim().toLowerCase() !== (user.email ?? '').toLowerCase() ||
      form.githubUsername.trim() !== (user.githubUsername ?? '') ||
      avatarPayload !== undefined
    );
  }, [form, avatarPayload, user]);

  const handleInputChange =
    (field: keyof ProfileFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.showError('Invalid file', 'Please choose an image file.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.showError('Image too large', 'Choose an image up to 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : null;
      if (!value) return;

      setAvatarPreview(value);
      setAvatarPayload(value);
    };

    reader.onerror = () => {
      toast.showError('Failed to read image', 'Try another image and try again.');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarPayload('');
  };

  const handleSave = async () => {
    if (!token || !user || isSaving || !hasChanges) return;

    const toastId = toast.showLoading('Saving profile...', 'Updating your profile data');
    setIsSaving(true);

    try {
      const updatedProfile = await apiService.updateProfile(token, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        githubUsername: form.githubUsername.trim(),
        ...(avatarPayload !== undefined ? { avatarUrl: avatarPayload } : {}),
      });

      updateAuthenticatedUser(updatedProfile);
      setAvatarPayload(undefined);

      toast.completeWithSuccess(
        toastId,
        'Profile updated',
        'Your profile information has been saved successfully.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      toast.completeWithError(toastId, 'Update failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,hsl(var(--accent)/0.18),transparent_38%),radial-gradient(circle_at_88%_8%,hsl(var(--primary)/0.12),transparent_34%),radial-gradient(circle_at_45%_86%,hsl(var(--secondary)/0.1),transparent_42%)]" />
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="pl-[316px] pr-6 pt-[122px] pb-8 relative z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information and profile picture.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-5">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Stored in the database and used across the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-28 w-28 border border-border/60">
                  <AvatarImage src={avatarPreview ?? undefined} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background hover:bg-muted/30 h-9 text-sm">
                    <Camera className="h-4 w-4" />
                    Upload image
                  </div>
                </Label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

                <Button variant="outline" onClick={handleRemoveAvatar} disabled={!avatarPreview} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Remove image
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">Accepted formats: PNG, JPG, WEBP, GIF. Max size 2MB.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>These details identify you across dashboards and reports.</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <UserIcon className="h-3.5 w-3.5" />
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input id="profile-name" value={form.name} onChange={handleInputChange('name')} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" type="email" value={form.email} onChange={handleInputChange('email')} placeholder="you@company.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-github">GitHub Username</Label>
                <Input
                  id="profile-github"
                  value={form.githubUsername}
                  onChange={handleInputChange('githubUsername')}
                  placeholder="github handle"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(user.updatedAt).toLocaleString()}
                </p>
                <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="gap-2 min-w-[170px]">
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
