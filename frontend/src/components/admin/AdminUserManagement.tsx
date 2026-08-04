import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Key, ShieldCheck, UserCheck, UserX, UserSearch } from 'lucide-react';
import { adminDashboardApi, AdminUser } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';
import { Table, Column } from '../ui/Table';
import { Dialog } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import { FilterBar, FilterOption } from '../ui/FilterBar';
import { DashboardCard } from '../ui/DashboardCard';
import { Input } from '../ui/Input';
import { FormSection } from '../ui/FormSection';
import { PageContainer } from '../ui/PageContainer';

interface Props {
  searchQuery?: string;
  selectedRole?: string;
  selectedDept?: string;
  selectedStatus?: string;
}

const roleOptions: FilterOption[] = [
  { id: 'All', label: 'All Roles' },
  { id: 'student', label: 'Student' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'admin', label: 'Admin' },
];

const statusOptions: FilterOption[] = [
  { id: 'All', label: 'All Status' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
];

export const AdminUserManagement: React.FC<Props> = ({ 
  searchQuery = '',
  selectedRole: propsSelectedRole = 'All',
  selectedDept = 'All',
  selectedStatus: propsSelectedStatus = 'All' 
}) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState(propsSelectedRole);
  const [selectedStatus, setSelectedStatus] = useState(propsSelectedStatus);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<AdminUser | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [password, setPassword] = useState('CollegeMate@2026');
  const [newPassword, setNewPassword] = useState('CollegeMate@2026');

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardApi.getUsers({
        role: selectedRole !== 'All' ? selectedRole : undefined,
        search: searchQuery,
      });
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (selectedStatus === 'active' && !u.is_active) return false;
      if (selectedStatus === 'suspended' && u.is_active) return false;
      return true;
    });
  }, [users, selectedStatus]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      await adminDashboardApi.createUser({ name, email, role, department, password });
      showToast(`User ${name} created successfully.`, 'success');
      setShowCreateModal(false);
      setName(''); setEmail('');
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to create user.', 'error');
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const updated = await adminDashboardApi.toggleUserStatus(user.id);
      showToast(`User ${user.name} is now ${updated.is_active ? 'Active' : 'Suspended'}.`, 'info');
      fetchUsers();
    } catch (err) {}
  };

  const handleResetPassword = async () => {
    if (!resetModalUser) return;
    try {
      await adminDashboardApi.resetUserPassword(resetModalUser.id, newPassword);
      showToast(`Password reset for ${resetModalUser.name}.`, 'success');
      setResetModalUser(null);
    } catch (err) {}
  };

  const handleDeleteUser = async (id: number, userName: string) => {
    if (!window.confirm(`Permanently delete account for ${userName}?`)) return;
    try {
      await adminDashboardApi.deleteUser(id);
      showToast(`User ${userName} deleted.`, 'info');
      fetchUsers();
    } catch (err) {}
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'User Name & Email',
      sortable: true,
      render: (u) => (
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</div>
          <div className="text-xs text-zinc-500">{u.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => {
        let variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'info';
        if (u.role === 'admin') variant = 'error';
        if (u.role === 'faculty') variant = 'warning';
        return <Badge variant={variant} className="capitalize">{u.role}</Badge>;
      }
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (u) => <span className="text-sm text-zinc-600 dark:text-zinc-400">{u.department || 'General'}</span>
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <Badge variant={u.is_active ? 'success' : 'neutral'}>
          {u.is_active ? 'Active' : 'Suspended'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(u)} title={u.is_active ? 'Suspend' : 'Activate'}>
            {u.is_active ? <UserX size={16} className="text-amber-500" /> : <UserCheck size={16} className="text-emerald-500" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setResetModalUser(u)} title="Reset Password">
            <Key size={16} className="text-blue-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id, u.name)} title="Delete">
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="User & Role Management"
        description="Manage student, faculty, and administrator accounts, roles, and status."
        icon={Users}
        actionText="Add User"
        actionIcon={Plus}
        onActionClick={() => setShowCreateModal(true)}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <FilterBar options={roleOptions} activeId={selectedRole} onSelect={setSelectedRole} />
        <FilterBar options={statusOptions} activeId={selectedStatus} onSelect={setSelectedStatus} />
      </div>

      <DashboardCard className="p-0 md:p-0 overflow-hidden">
        <Table
          columns={columns}
          data={filteredUsers}
          isLoading={loading}
          searchable={false} 
          emptyMessage="No users match the current filters."
        />
      </DashboardCard>

      {/* Create User Dialog */}
      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create User Account">
        <form id="create-user-form" onSubmit={handleCreateUser}>
          <FormSection>
            <Input label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] mb-1.5">System Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-[10px] text-sm text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all duration-200">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] mb-1.5">Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-[10px] text-sm text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all duration-200">
                  <option value="Computer Science & Engineering">CS & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Comm</option>
                </select>
              </div>
            </div>
            <Input label="Initial Password" type="text" value={password} onChange={e => setPassword(e.target.value)} />
          </FormSection>
        </form>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="primary" type="submit" form="create-user-form">Create User</Button>
        </div>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog isOpen={!!resetModalUser} onClose={() => setResetModalUser(null)} title={`Reset Password for ${resetModalUser?.name}`}>
        <FormSection>
          <Input label="New Password" type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </FormSection>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setResetModalUser(null)}>Cancel</Button>
          <Button variant="primary" onClick={handleResetPassword}>Reset Password</Button>
        </div>
      </Dialog>
    </PageContainer>
  );
};
