import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function ProfileSettings({ user, setUser, selectedGroup, setSelectedGroup }) {
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [picture, setPicture] = useState(user?.picture || '');
  const [preview, setPreview] = useState(user?.picture || '');
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgradeError, setUpgradeError] = useState('');
  const navigate = useNavigate();
  if (!user) return <div style={{padding: 32, textAlign: 'center'}}>Loading...</div>;

  const handlePictureChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setPicture(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let pictureUrl = user.picture;
    if (picture && picture instanceof File) {
      pictureUrl = preview;
    }
    const updated = { ...user, username, phone, picture: pictureUrl };
    await fetch(`${API_URL}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setUser(updated);
    setSaving(false);
    if (selectedGroup) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const handleUpgrade = async () => {
    setSaving(true);
    setUpgradeError('');
    const res = await fetch(`${API_URL}/upgrade-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, username, password: upgradePassword })
    });
    if (res.ok) {
      const upgraded = await res.json();
      setUser({ ...upgraded, guest: false });
      setShowUpgrade(false);
      setUpgradePassword('');
      navigate(-1);
    } else {
      setUpgradeError('Upgrade failed. Try a different username or password.');
    }
    setSaving(false);
  };

  return (
    <div className="profile-settings-page" style={{maxWidth: 420, margin: '3.5rem auto 0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(44,100,255,0.08)', padding: '2.5rem 2rem'}}>
      <h2 style={{textAlign: 'center', color: '#2a6cff', marginBottom: 24}}>Profile Settings</h2>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <label htmlFor="profile-pic-input" style={{cursor: 'pointer'}}>
          <img src={preview || '/logo192.png'} alt="Profile" style={{width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px #2a6cff22', marginBottom: 8}} />
          <input id="profile-pic-input" type="file" accept="image/*" style={{display: 'none'}} onChange={handlePictureChange} />
        </label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{padding: '12px', borderRadius: 8, border: '1.5px solid #cfd8ff', width: '100%', fontSize: '1.1rem'}} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number for PayNow (optional)" style={{padding: '12px', borderRadius: 8, border: '1.5px solid #cfd8ff', width: '100%', fontSize: '1.1rem'}} />
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{marginTop: 18, width: '100%'}}>{saving ? 'Saving...' : 'Save Changes'}</button>
        {user.guest && !showUpgrade && (
          <button className="btn-secondary" style={{marginTop: 18, width: '100%'}} onClick={() => setShowUpgrade(true)}>Upgrade to Account</button>
        )}
        {showUpgrade && (
          <div style={{width: '100%', marginTop: 12}}>
            <input type="password" value={upgradePassword} onChange={e => setUpgradePassword(e.target.value)} placeholder="Set a password" style={{padding: '12px', borderRadius: 8, border: '1.5px solid #cfd8ff', width: '100%', fontSize: '1.1rem', marginBottom: 8}} />
            <button className="btn-primary" onClick={handleUpgrade} disabled={saving || !upgradePassword} style={{width: '100%'}}>{saving ? 'Signing Up...' : 'Sign Up'}</button>
            {upgradeError && <div style={{color: '#f44336', marginTop: 8}}>{upgradeError}</div>}
          </div>
        )}
      </div>
    </div>
  );
} 