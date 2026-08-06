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
    <div className="space-y-6 font-sans">
      {/* ── Top Hero Header Card ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-1">
        <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">System Configuration & Security Governance</h3>
        <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Configure campus parameters, AI service keys, mail server settings, and inspect administrative audit logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <Settings2 className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
            System Parameters
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3.5">
            <div>
              <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Institution Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">College Code</label>
                <input
                  type="text"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">AI Model Engine</label>
                <input
                  type="text"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Storage Limit (GB)</label>
              <input
                type="number"
                value={storageLimitGb}
                onChange={(e) => setStorageLimitGb(Number(e.target.value))}
                className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Audit Logs Stream */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <ShieldCheck className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
            Security & Admin Audit Logs
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#111827] dark:text-[#FAFAFA]">{log.action}</span>
                  <span className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA]">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">
                  Target: {log.target_type} ({log.target_id || 'N/A'}) · {log.details || 'Action completed successfully.'}
                </p>
                <p className="text-[12px] font-mono text-[#6B7280] dark:text-[#A1A1AA]">User: {log.user_email || 'admin@campusmate.edu'} · IP: {log.ip_address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
