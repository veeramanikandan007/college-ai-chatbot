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
    <div className="space-y-6 font-body">
      {/* ── Top Bar Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div>
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">User & Role Management</h3>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Manage student, faculty, and administrator accounts, roles, and status.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition shrink-0"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* ── Users Table ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-body">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-caption font-bold uppercase tracking-[0.05em] text-[#64748B] dark:text-[#94A3B8]">
                <th className="py-3.5 px-4">User Name & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F5F7FB]/50 dark:hover:bg-[#0F172A]/50 transition">
                  <td className="py-3.5 px-4">
                    <h4 className="font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">{u.name}</h4>
                    <p className="text-caption text-[#64748B]">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-caption font-bold capitalize ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : u.role === 'faculty'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-[#0E2A6D]/10 text-[#0E2A6D] dark:text-[#60A5FA]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-caption text-[#475569] dark:text-[#CBD5E1]">
                    {u.department || 'General'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-caption font-bold ${
                        u.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 text-[#64748B]'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Create User Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#64748B] hover:text-[#1F2937]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kannan"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh@collegemate.edu"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-caption font-bold text-[#64748B]">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="Computer Science & Engineering">CS & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Comm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Initial Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-caption font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Password Reset Modal ── */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">
              Reset Password for {resetModalUser.name}
            </h4>

            <div>
              <label className="text-caption font-bold text-[#64748B]">New Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setResetModalUser(null)} className="h-9 px-3 text-caption font-bold text-[#64748B]">
                Cancel
              </button>
              <button onClick={handleResetPassword} className="h-9 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
