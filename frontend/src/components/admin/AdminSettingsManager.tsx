import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2, ShieldCheck, Save, Key, Database, Mail, HardDrive, ListFilter } from 'lucide-react';
import { adminDashboardApi, AdminSettings, AdminAuditLog } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { DashboardCard } from '../ui/DashboardCard';
import { SectionHeader } from '../ui/SectionHeader';
import { PageContainer } from '../ui/PageContainer';
import { FormSection } from '../ui/FormSection';
import { Input } from '../ui/Input';

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
    <PageContainer className="font-body">
      <PageHeader
        title="System Configuration & Security Governance"
        description="Configure campus parameters, AI service keys, mail server settings, and inspect administrative audit logs."
        icon={Settings2}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <DashboardCard className="space-y-6">
          <SectionHeader title="System Parameters" icon={Settings2} />

          <form onSubmit={handleSaveSettings}>
            <FormSection>
              <Input
                label="Institution Name"
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="College Code"
                  type="text"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                />
                <Input
                  label="AI Model Engine"
                  type="text"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SMTP Host"
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
                <Input
                  label="SMTP Port"
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                />
              </div>

              <Input
                label="Storage Limit (GB)"
                type="number"
                value={storageLimitGb}
                onChange={(e) => setStorageLimitGb(Number(e.target.value))}
              />
            </FormSection>

            <div className="pt-6 mt-6 border-t border-[#E2E8F0] dark:border-[#2A2A2A] flex justify-end">
              <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save size={16} />}>
                Save Settings
              </Button>
            </div>
          </form>
        </DashboardCard>

        {/* Audit Logs Stream */}
        <DashboardCard className="space-y-4">
          <SectionHeader title="Security & Admin Audit Logs" icon={ShieldCheck} iconColor="text-emerald-500" />

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-blue-600 dark:text-blue-400">{log.action}</span>
                  <span className="text-xs font-medium text-zinc-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Target: {log.target_type} ({log.target_id || 'N/A'}) · {log.details || 'Action completed successfully.'}
                </p>
                <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-700/50 flex justify-between">
                  <span className="text-[11px] font-mono text-zinc-500">User: {log.user_email || 'admin@campusmate.edu'}</span>
                  <span className="text-[11px] font-mono text-zinc-500">IP: {log.ip_address}</span>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="text-sm text-zinc-500 text-center py-10">No audit logs found.</div>
            )}
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
};
