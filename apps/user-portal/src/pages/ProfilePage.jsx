import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getImageUrl } from '../api/apiClient';
import { User, Mail, Shield, CreditCard, Calendar, Edit3, Save, X, ShieldAlert, Upload } from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.profilePictureUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.profilePictureUrl || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size exceeds 2MB limit.');
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const getDisplayAvatar = () => {
    if (!avatarPreview) return '';
    if (avatarPreview.startsWith('blob:') || avatarPreview.startsWith('http')) {
      return avatarPreview;
    }
    return getImageUrl(avatarPreview);
  };

  const getFormattedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Display Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (selectedFile) {
        // Multipart/form-data upload
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('email', user.email);
        formData.append('avatar', selectedFile);

        res = await apiClient('/users/profile', {
          method: 'PUT',
          body: formData
        });
      } else {
        // Standard JSON body
        res = await apiClient('/users/profile', {
          method: 'PUT',
          body: {
            name: name.trim(),
            email: user.email,
            profilePictureUrl: avatar.trim() || null
          }
        });
      }
      
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        setSelectedFile(null);
        setIsEditing(false);
      } else {
        setError(res.error?.message || 'Failed to update your profile.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setAvatar(user.profilePictureUrl || '');
    setSelectedFile(null);
    setAvatarPreview(user.profilePictureUrl || '');
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-4">
      {/* Header Banner - Premium glassmorphic look */}
      {/* <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group"> */}
        
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-blue-950/20 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-400 mt-1.5">
              Your Profile
            </h1>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              Manage your display identity and access credentials.
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-350 hover:text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-650 transition-all active:scale-[0.98] shrink-0 leading-none shadow-md"
            >
              <Edit3 className="h-3.5 w-3.5 shrink-0" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2.5 shadow-lg animate-shake">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Glow Indicators */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

        {/* View/Edit form */}
        <form onSubmit={handleSave} className="space-y-6 relative z-10">
          
          {/* Header Avatar Display */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-850">
            {/* Circular Profile Avatar */}
            <div 
              className="rounded-full overflow-hidden border border-zinc-800 bg-zinc-955 flex items-center justify-center shrink-0" 
              style={{ width: '80px', height: '80px', minWidth: '80px' }}
            >
              {avatarPreview ? (
                <img 
                  src={getDisplayAvatar()} 
                  alt={name} 
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                  }}
                />
              ) : (
                <div className="text-3xl font-black text-zinc-650 select-none">{name ? name[0].toUpperCase() : 'U'}</div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-lg font-black text-zinc-150">{user.name}</h2>
              {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-850 text-zinc-400 text-[9px] uppercase font-bold tracking-widest select-none">
                <Shield className="h-3 w-3 text-blue-400" />
                <span>{user.role}</span>
              </div> */}
            </div>
          </div>

          <div className="space-y-5">
            {isEditing ? (
              <>
                {/* Editable: Display Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-450  tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black-200 placeholder-zinc-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
                  />
                </div>

                {/* Editable: Avatar Uploader */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-450 tracking-wider">
                    Profile Avatar Image
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="avatar-file-input"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-file-input').click()}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98] leading-none"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Choose Local Image File</span>
                    </button>
                    {selectedFile && (
                      <span className="text-xs text-zinc-400 font-semibold truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">Supports JPG, PNG, and WEBP. Max size: 2MB.</p>
                </div>
              </>
            ) : (
              <>
                {/* Read Only: Display Name Row */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500  tracking-wider">Display Name</p>
                    <p className="text-sm font-semibold text-zinc-200 mt-1">{user.name}</p>
                  </div>
                </div>
              </>
            )}

            {/* Read-Only: Role ID Number */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500  tracking-wider">
                  {user.role === 'student' ? 'Student Registration ID' : 'Recruiter License ID'}
                </p>
                <p className="text-sm font-semibold text-zinc-200 mt-1">
                  {user.role === 'student' ? (user.student_id || 'ST-MOCK-777') : (user.recruiter_id || 'RC-MOCK-999')}
                </p>
              </div>
            </div>

            {/* Read-Only: Verified Email */}
            <div className="flex items-start gap-4 opacity-75">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-500">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500  tracking-wider">Verified Email</p>
                <p className="text-sm font-semibold text-zinc-350 mt-1">{user.email}</p>
              </div>
            </div>

            {/* Read-Only: Account Created */}
            <div className="flex items-start gap-4 opacity-75">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-500">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Account Created</p>
                <p className="text-sm font-semibold text-zinc-350 mt-1 font-medium">
                  {getFormattedDate(user.created_at || new Date())}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-5 border-t border-zinc-855 mt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 leading-none"
              >
                <Save className="h-3.5 w-3.5 shrink-0" />
                <span className="leading-none">{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-650 transition-colors leading-none"
              >
                <X className="h-3.5 w-3.5 shrink-0" />
                <span className="leading-none">Cancel</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
