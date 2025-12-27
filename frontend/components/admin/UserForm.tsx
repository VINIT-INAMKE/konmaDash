'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface User {
  _id: string;
  username: string;
  role: 'admin' | 'kitchen' | 'stall';
  fullName?: string;
  isActive: boolean;
}

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    password: '',
    role: initialData?.role || 'kitchen',
    fullName: initialData?.fullName || '',
    isActive: initialData?.isActive ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username) {
      toast({
        title: 'Validation Error',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

    if (!initialData && !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Password is required for new users',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Prepare data
    const submitData: any = {
      username: formData.username,
      role: formData.role,
      fullName: formData.fullName || undefined,
      isActive: formData.isActive,
    };

    // Only include password if it's set (for create or password change)
    if (formData.password) {
      submitData.password = formData.password;
    }

    await onSubmit(submitData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter username (lowercase, alphanumeric)"
              disabled={!!initialData || isLoading}
            />
            {initialData && (
              <p className="text-xs text-muted-foreground">
                Username cannot be changed after creation
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!initialData && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={
                initialData
                  ? 'Leave blank to keep current password'
                  : 'Enter password (min 6 characters)'
              }
              disabled={isLoading}
            />
            {initialData && (
              <p className="text-xs text-muted-foreground">
                Only enter a new password if you want to change it
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Enter full name (optional)"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'kitchen' | 'stall') =>
                setFormData({ ...formData, role: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="kitchen">Kitchen (Batch Cooking & Transfers)</SelectItem>
                <SelectItem value="stall">Stall (Sales & Inventory)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between space-x-2 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive users cannot login
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
