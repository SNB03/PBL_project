// src/components/admin/StoreSettings.jsx
import React, { useState, useEffect } from 'react';

const StoreSettings = () => {
  const [settings, setSettings] = useState({ maxRadius: 10, ratePerKm: 10, freeDeliveryThreshold: 999 });

  useEffect(() => {
    fetch('http://localhost:8080/api/admin/config/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSettings(data); })
      .catch(err => console.error(err));
  }, []);

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/admin/config/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert("✅ Logistics Configuration Saved!");
    } catch (err) { alert("Failed to save settings."); }
  };

  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-header"><h2>Store Logistics & Configuration</h2></div>
      <form className="settings-form-panel" onSubmit={handleSettingsSave}>
        <div className="settings-group">
          <h3>🚚 Delivery Radius & Pricing</h3>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Maximum Delivery Radius (km)</label>
              <input type="number" value={settings.maxRadius} onChange={(e) => setSettings({...settings, maxRadius: Number(e.target.value)})} />
            </div>
            <div className="form-group flex-1">
              <label>Delivery Rate (₹ per km)</label>
              <input type="number" value={settings.ratePerKm} onChange={(e) => setSettings({...settings, ratePerKm: Number(e.target.value)})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Free Delivery Threshold (₹)</label>
              <input type="number" value={settings.freeDeliveryThreshold} onChange={(e) => setSettings({...settings, freeDeliveryThreshold: Number(e.target.value)})} />
            </div>
          </div>
        </div>
        <button type="submit" className="btn-action primary">Save Configuration</button>
      </form>
    </div>
  );
};

export default StoreSettings;