import { useState } from 'react';
import { adminConfig } from '../config';

function Settings() {
  const [config, setConfig] = useState(adminConfig);

  const handleSave = () => {
    localStorage.setItem('saad_dashboard_config', JSON.stringify(config));
    alert('Settings saved!');
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Settings</h1>
      
      <div className="admin-section">
        <h2>Admin Configuration</h2>
        <p style={{ color: '#8b949e', marginBottom: '1rem' }}>
          Edit the <code>src/config.js</code> file to customize your dashboard settings.
        </p>
        
        <div className="form-group">
          <label>Site Title</label>
          <input 
            type="text" 
            value={config.siteTitle} 
            onChange={(e) => setConfig({...config, siteTitle: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Admin Email</label>
          <input 
            type="email" 
            value={config.adminEmail} 
            onChange={(e) => setConfig({...config, adminEmail: e.target.value})}
          />
        </div>
        
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
      
      <div className="admin-section" style={{ marginTop: '1rem' }}>
        <h2>Current Configuration (JSON)</h2>
        <textarea 
          value={JSON.stringify(config, null, 2)} 
          readOnly 
          style={{ width: '100%', minHeight: '200px', fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
}

export default Settings;
