import React, { useState, useEffect } from 'react';
import { Settings2, ShieldCheck, Save, Key, Database, Mail, HardDrive, ListFilter } from 'lucide-react';
import { adminDashboardApi, AdminSettings, AdminAuditLog } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsManager: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [aiProvider, setAiProvider] = useState('Google Gemini 2.0 Flash');
  const [storageLimitGb, setStorageLimitGb] = useState(500);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [st, logs] = await Promise.all([adminDashboardApi.getSettings(), adminDashboardApi.getAuditLogs()]);
      setSettings(st);
      setCollegeName(st.college_name);
      setCollegeCode(st.college_code);
      setSmtpHost(st.smtp_host);
      setSmtpPort(st.smtp_port);
      setAiProvider(st.ai_provider);
      setStorageLimitGb(st.storage_limit_gb);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error fetching admin settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminDashboardApi.updateSettings({
        college_name: collegeName,
        college_code: collegeCode,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        ai_provider: aiProvider,
        storage_limit_gb: storageLimitGb,
      });
      showToast('System settings updated successfully.', 'success');
      fetchData();
    } catch (err) {
      console.error('Error updating settings:', err);
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">System Configuration & Security Governance</h3>
        <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Configure campus parameters, AI service keys, mail server settings, and inspect administrative audit logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
            <Settings2 className="text-[#0E2A6D] dark:text-[#60A5FA]" size={20} />
            System Parameters
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="text-caption font-bold text-[#64748B]">Institution Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">College Code</label>
                <input
                  type="text"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>
              <div>
                <label className="text-caption font-bold text-[#64748B]">AI Model Engine</label>
                <input
                  type="text"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>
              <div>
                <label className="text-caption font-bold text-[#64748B]">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-caption font-bold text-[#64748B]">Storage Limit (GB)</label>
              <input
                type="number"
                value={storageLimitGb}
                onChange={(e) => setStorageLimitGb(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Audit Logs Stream */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
            <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
            Security & Admin Audit Logs
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-caption text-[#0E2A6D] dark:text-[#60A5FA]">{log.action}</span>
                  <span className="text-small text-[#64748B]">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-caption text-[#475569] dark:text-[#CBD5E1]">
                  Target: {log.target_type} ({log.target_id || 'N/A'}) · {log.details || 'Action completed successfully.'}
                </p>
                <p className="text-small font-mono text-[#64748B]">User: {log.user_email || 'admin@campusmate.edu'} · IP: {log.ip_address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
