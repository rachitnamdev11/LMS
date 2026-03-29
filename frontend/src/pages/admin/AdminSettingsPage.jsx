import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient.js';
import { AdminPageLayout } from './AdminDashboard.jsx';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then((r) => setSettings(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const r = await api.put('/admin/settings', settings);
      setSettings(r.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setSettings((prev) => ({ ...prev, categories: [...(prev.categories || []), newCategory.trim()] }));
    setNewCategory('');
  };

  const removeCategory = (index) => {
    setSettings((prev) => ({ ...prev, categories: prev.categories.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <AdminPageLayout>
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <div className="space-y-6 pb-10 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure platform-wide settings.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">General</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Platform Name</label>
              <input type="text" value={settings?.platformName || ''} onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contact Email</label>
              <input type="email" value={settings?.contactEmail || ''} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">About Text</label>
              <textarea value={settings?.aboutText || ''} onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none" />
            </div>
          </div>

          {/* Upload & Maintenance */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">System</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Max Upload Size (MB)</label>
                <input type="number" value={settings?.maxUploadSizeMB || 500} onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Maintenance Mode</label>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings?.maintenanceMode })}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${settings?.maintenanceMode ? 'bg-red-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}`}
                >
                  {settings?.maintenanceMode ? '🔴 Maintenance ON' : '🟢 Platform Active'}
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Course Categories</h3>
            <div className="flex flex-wrap gap-2">
              {(settings?.categories || []).map((cat, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-dark-800 text-sm text-slate-700 dark:text-slate-300">
                  {cat}
                  <button type="button" onClick={() => removeCategory(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add category..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
              <button type="button" onClick={addCategory} className="px-4 py-2 bg-slate-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-300 dark:hover:bg-dark-600 transition-colors">Add</button>
            </div>
          </div>

          {/* Save */}
          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-600/20">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          {saved && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm text-center">
              ✅ Settings saved successfully!
            </div>
          )}
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default AdminSettingsPage;
