import { useState, useEffect } from 'react';
import { dbUtils } from '../services/database';

function Settings({ userId, config, onSave }) {
  const [draft, setDraft] = useState(config);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setDraft(config); }, [config]);

  const handleSave = async event => {
    event.preventDefault();
    setIsSaving(true);
    setStatus('');
    const prefs = { siteTitle: draft.siteTitle.trim(), adminEmail: draft.adminEmail.trim() };
    const result = await dbUtils.saveDashboardPrefs(userId, prefs);
    if (result.success) {
      onSave({ ...config, ...prefs });
      setStatus('Settings saved to Firebase.');
    } else {
      setStatus('Could not save settings: ' + result.error);
    }
    setIsSaving(false);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Settings</h1>
      <form className="admin-section" onSubmit={handleSave}>
        <h2>Dashboard preferences</h2>
        <div className="form-group">
          <label htmlFor="site-title">Site Title</label>
          <input id="site-title" required maxLength={100} value={draft.siteTitle}
            onChange={event => setDraft({ ...draft, siteTitle: event.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="admin-email">Contact Email</label>
          <input id="admin-email" type="email" value={draft.adminEmail}
            onChange={event => setDraft({ ...draft, adminEmail: event.target.value })} />
        </div>
        <button className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Settings'}</button>
        {status && <p role="status" className="status-message">{status}</p>}
      </form>
    </div>
  );
}

export default Settings;

