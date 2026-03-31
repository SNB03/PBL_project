// src/components/admin/StaffManagement.jsx
import React, { useState, useEffect } from 'react';

const StaffManagement = () => {
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/config/staff');
      if (res.ok) setDeliveryStaff(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:8080/api/admin/config/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });

      if (res.ok) {
        const savedData = await res.json();

        // 👉 ALERT THE ADMIN OF THE GENERATED PIN
        alert(`✅ Success! Rider added.\n\nTell the rider to log in using:\nPhone: ${savedData.phone}\nPIN/Password: ${savedData.pin}`);

        setNewStaff({ name: '', phone: '' });
        fetchStaff();
      } else {
        alert("Failed to add rider. Phone number might already exist.");
      }
    } catch (err) {
      alert("Server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-header">
        <h2>Delivery Staff Management</h2>
        <p style={{ color: '#64748b', margin: 0 }}>Register and manage your delivery fleet.</p>
      </div>

      <div className="analytics-layout" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

        {/* RIGHT (Form) */}
        <div className="analytics-right" style={{ flex: '1', minWidth: '300px' }}>
          <form className="settings-form-panel" onSubmit={handleAddStaff} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="settings-group">
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#0f172a' }}>➕ Register New Rider</h3>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ramesh Kumar"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-action primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '15px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isSubmitting ? 'Generating PIN...' : 'Add to Fleet'}
            </button>
          </form>
        </div>

        {/* LEFT (Table) */}
        <div className="analytics-left" style={{ flex: '2', minWidth: '400px' }}>
          <div className="admin-table-wrapper" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Rider ID</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Name</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Contact</th>

                  {/* 👉 NEW: Show the auto-generated PIN in the table */}
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Login PIN</th>

                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveryStaff.map(staff => (
                  <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#f59e0b' }}>D-0{staff.id}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a' }}>{staff.name}</td>
                    <td style={{ padding: '15px', color: '#475569' }}>{staff.phone}</td>

                    {/* Highlight the PIN so the Admin can easily copy it */}
                    <td style={{ padding: '15px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', letterSpacing: '2px' }}>
                        {staff.pin}
                      </span>
                    </td>

                    <td style={{ padding: '15px' }}>
                      {staff.active ?
                        <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Active</span> :
                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Inactive</span>
                      }
                    </td>
                  </tr>
                ))}
                {deliveryStaff.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No delivery staff registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffManagement;