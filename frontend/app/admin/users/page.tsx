'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, UserCheck, UserX } from 'lucide-react';
import { UserForm } from '@/components/admin/UserForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface User {
  _id: string;
  username: string;
  role: 'admin' | 'kitchen' | 'stall';
  fullName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await usersApi.getAll();
    if (result.success && result.data) {
      setUsers(result.data as User[]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load users',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleCreate = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    const result = editingUser
      ? await usersApi.update(editingUser._id, data)
      : await usersApi.create(data);

    if (result.success) {
      toast({
        title: 'Success',
        description: `User ${editingUser ? 'updated' : 'created'} successfully`,
      });
      setShowForm(false);
      loadUsers();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (userId: string) => {
    const result = await usersApi.delete(userId);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      loadUsers();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete user',
        variant: 'destructive',
      });
    }
    setDeletingUserId(null);
  };


  if (showForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {editingUser ? 'Edit User' : 'Create User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {editingUser
                ? 'Update user information and permissions'
                : 'Add a new user to the system'}
            </p>
          </div>
        </div>
        <UserForm
          initialData={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and their permissions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="w-full p-8 text-center text-muted-foreground">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="w-full p-8 text-center text-muted-foreground">
          No users found
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.username}</span>
                      {user._id === currentUser?._id && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.fullName || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <>
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Inactive</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUserId(user._id)}
                        disabled={user._id === currentUser?._id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingUserId !== null}
        onOpenChange={() => setDeletingUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUserId && handleDelete(deletingUserId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
