import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Key, ShieldCheck, Search, Filter, X, UserCheck, UserX } from 'lucide-react';
import { adminDashboardApi, AdminUser } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';

interface Props {
  selectedRole: string;
  selectedDept: string;
  selectedStatus: string;
  searchQuery: string;
}

export const AdminUserManagement: React.FC<Props> = ({
  selectedRole,
  selectedDept,
  selectedStatus,
  searchQuery,
}) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [password, setPassword] = useState('CollegeMate@2026');

  // Password reset state
  const [resetModalUser, setResetModalUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('CollegeMate@2026');

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedDept, selectedStatus, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardApi.getUsers({
        role: selectedRole !== 'All' ? selectedRole : undefined,
        department: selectedDept !== 'All' ? selectedDept : undefined,
        search: searchQuery,
      });
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      await adminDashboardApi.createUser({
        name,
        email,
        role,
        department,
        password,
      });
      showToast(`User ${name} created successfully.`, 'success');
      setShowCreateModal(false);
      setName('');
      setEmail('');
      fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      showToast(err.response?.data?.detail || 'Failed to create user.', 'error');
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const updated = await adminDashboardApi.toggleUserStatus(user.id);
      showToast(`User ${user.name} is now ${updated.is_active ? 'Active' : 'Suspended'}.`, 'info');
      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleResetPassword = async () => {
    if (!resetModalUser) return;
    try {
      await adminDashboardApi.resetUserPassword(resetModalUser.id, newPassword);
      showToast(`Password reset for ${resetModalUser.name}.`, 'success');
      setResetModalUser(null);
    } catch (err) {
      console.error('Error resetting password:', err);
    }
  };

  const handleDeleteUser = async (id: number, userName: string) => {
    if (!window.confirm(`Permanently delete account for ${userName}?`)) return;
    try {
      await adminDashboardApi.deleteUser(id);
      showToast(`User ${userName} deleted.`, 'info');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Bar Controls Card ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
        <div className="space-y-1">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">User & Role Management</h3>
          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Manage student, faculty, and administrator accounts, roles, and status.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-2 transition shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* ── Users Table Container ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[14px] font-sans">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                <th className="py-3.5 px-4">User Name & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#1A1A1A]/50 transition">
                  <td className="py-3.5 px-4">
                    <h4 className="font-medium text-[#111827] dark:text-[#FAFAFA]">{u.name}</h4>
                    <p className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA]">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium capitalize ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : u.role === 'faculty'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-[#111827]/10 dark:bg-[#FAFAFA]/10 text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">
                    {u.department || 'General'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium ${
                        u.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-[#6B7280] dark:text-[#A1A1AA]'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                        className={`p-1.5 rounded-lg transition ${
                          u.is_active ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>

                      <button
                        onClick={() => setResetModalUser(u)}
                        title="Reset Password"
                        className="p-1.5 text-[#64748B] hover:text-[#0E2A6D] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Key size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Delete User"
                        className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-caption text-[#64748B]">
                    No user accounts match the current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create User Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E5E7EB] dark:border-[#2A2A2A] font-sans">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
              <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Create User Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-[6px] text-[#6B7280] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kannan"
                  required
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh@campusmate.edu"
                  required
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition cursor-pointer"
                  >
                    <option value="Computer Science & Engineering">CS & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Comm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Initial Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#27272A] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition cursor-pointer shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Password Reset Modal ── */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E5E7EB] dark:border-[#2A2A2A]">
            <h4 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Reset Password for {resetModalUser.name}
            </h4>

            <div>
              <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">New Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
              <button
                onClick={() => setResetModalUser(null)}
                className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#27272A] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition cursor-pointer shadow-xs"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
