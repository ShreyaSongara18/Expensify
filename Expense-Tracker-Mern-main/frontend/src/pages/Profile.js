import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { axiosClient } from '../utils/axiosClient';
import { toast } from 'react-hot-toast';
import { 
    User, 
    Mail, 
    Lock, 
    Camera, 
    Save, 
    KeyRound
} from 'lucide-react';

function Profile() {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.user.currentUser);
    const darkMode = useSelector(state => state.theme.darkMode);

    // Profile Details State
    const [username, setUsername] = useState(currentUser?.username || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [profilePic, setProfilePic] = useState(currentUser?.profilePic || '');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Convert Image file to Base64
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image file size should be less than 2MB!");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePic(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Save profile updates
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!username || !email) {
            toast.error("Username and email cannot be empty!");
            return;
        }

        setUpdatingProfile(true);
        try {
            const response = await axiosClient.post('/auth/updateProfile', {
                userId: currentUser._id,
                username,
                email,
                profilePic
            });
            if (response.data.statusCode === 200) {
                toast.success("Profile updated successfully!");
                dispatch(setUser(response.data.message)); // Updates Redux & LocalStorage
            } else {
                toast.error(response.data.message || "Failed to update profile");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdatingProfile(false);
        }
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields!");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters!");
            return;
        }

        setUpdatingPassword(true);
        try {
            const response = await axiosClient.post('/auth/changePassword', {
                userId: currentUser._id,
                oldPassword,
                newPassword
            });
            if (response.data.statusCode === 200) {
                toast.success("Password changed successfully!");
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(response.data.message || "Failed to change password");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Box: Photo and Details */}
            <div className={`p-8 rounded-3xl border flex flex-col items-center justify-between text-center ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}>
                <div className="w-full flex flex-col items-center">
                    {/* Avatar Upload */}
                    <div className="relative group cursor-pointer mb-6">
                        {profilePic ? (
                            <img 
                                src={profilePic} 
                                alt="Profile Avatar" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500 shadow-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-yellow-500 flex items-center justify-center font-black text-white text-5xl uppercase shadow-lg">
                                {currentUser?.username[0]}
                            </div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                            <Camera className="h-8 w-8 text-white" />
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="hidden" 
                            />
                        </label>
                    </div>

                    <h2 className="text-xl font-bold">{currentUser?.username}</h2>
                    <p className="text-slate-400 text-sm mt-1">{currentUser?.email}</p>
                </div>

                <div className="w-full pt-6 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 font-medium">
                    <span>Member since: {new Date(currentUser?.createdAt).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Middle Box: Edit Info */}
            <div className={`p-8 rounded-3xl border lg:col-span-2 space-y-8 ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}>
                {/* Profile Edit Form */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <User className="h-6 w-6 text-yellow-500" />
                        <h3 className="font-bold text-lg">Account Information</h3>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-yellow-500 ${
                                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-yellow-500 ${
                                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={updatingProfile}
                            className="px-5 h-11 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all ml-auto"
                        >
                            <Save className="h-4 w-4" />
                            {updatingProfile ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <KeyRound className="h-6 w-6 text-yellow-500" />
                        <h3 className="font-bold text-lg">Change Password</h3>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-yellow-500 ${
                                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-yellow-500 ${
                                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-yellow-500 ${
                                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={updatingPassword}
                            className="px-5 h-11 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all ml-auto"
                        >
                            <Lock className="h-4 w-4" />
                            {updatingPassword ? "Updating..." : "Change Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
