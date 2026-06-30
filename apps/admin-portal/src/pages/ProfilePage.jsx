import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getImageUrl } from '../api/apiClient';
import { User, Shield, Lock, Eye, EyeOff, Loader2, Camera, X } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser } = useAuth();
  
  // Profile settings state
  const [name, setName] = useState(user.username || user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // Current picture from server
  const currentPictureUrl = user.profile_picture_url || user.profilePictureUrl;
  const displayPicture = avatarPreview || (currentPictureUrl ? getImageUrl(currentPictureUrl) : null);

  // Default avatar letter — "W" for webcoders, or first letter of name
  const avatarLetter = (user.username || user.name || 'W').charAt(0).toUpperCase();

  // Password settings state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'Image must be under 5 MB.' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileMessage(null);
  };

  const handleClearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      let res;
      if (avatarFile) {
        // Send as multipart/form-data when a file is attached
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('avatar', avatarFile);
        res = await apiClient('/users/profile', { method: 'PUT', body: formData });
      } else {
        res = await apiClient('/users/profile', { method: 'PUT', body: { name, email } });
      }
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const res = await apiClient('/admin/change-password', {
        method: 'PUT',
        body: { newPassword, confirmPassword }
      });
      if (res.success) {
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4">
      
      {/* Page Header */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-blue-400 mt-1.5">
            Account Settings
          </h1>
          <p className="text-slate-550 text-xs">
            Manage your administrative details and update account security settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card View */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center flex flex-col items-center">
            
            {/* Avatar with Upload Overlay */}
            <div className="relative mb-4 group">
              {displayPicture ? (
                <img 
                  src={displayPicture}
                  alt={user.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30 bg-slate-950"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-500/30 text-white flex items-center justify-center text-xl font-black select-none">
                  {avatarLetter}
                </div>
              )}
              {/* Camera hover overlay */}
              {/* <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change profile picture"
              >
                <Camera className="h-6 w-6 text-white" />
              </button> */}
              {/* Clear preview badge */}
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleClearAvatar}
                  className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center border-2 border-slate-900 transition-colors"
                  title="Remove selected photo"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-input"
            />

            {/* <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors mb-3"
            >
              Change Photo
            </button> */}
            
            {/* <h2 className="text-lg font-bold text-white leading-snug">{user.username || user.name}</h2>
            <p className="text-xs text-slate-500 mb-1">{user.email}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15 mt-1">
              <Shield className="h-3 w-3" />
              <span>{user.role}</span>
            </span> */}
            {avatarPreview && (
              <p className="text-[10px] text-amber-400 mt-3 font-semibold">📷 New photo selected — save to apply</p>
            )}
          </div>
        </div>

        {/* Editing Panels */}
        <div className="md:col-span-2 space-y-8">
          
          {/* General Profile Settings Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-850">
              <User className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-base text-white">General Information</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Profile Picture
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-4 p-4 bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Camera className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate">
                      {avatarFile ? avatarFile.name : 'Click to choose a photo'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {avatarFile ? `${(avatarFile.size / 1024).toFixed(0)} KB selected` : 'JPG, PNG, GIF — up to 5 MB'}
                    </p>
                  </div>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleClearAvatar(); }}
                      className="ml-auto text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {profileMessage && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  profileMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {profileMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 select-none active:scale-[0.98]"
              >
                {profileLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save General Settings</span>
              </button>
            </form>
          </div>

          {/* Password Security Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-850">
              <Lock className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-base text-white">Security & Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* New Password input */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-700 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-700 focus:border-blue-500"
                  />
                </div>
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  passwordMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 select-none active:scale-[0.98]"
              >
                {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
