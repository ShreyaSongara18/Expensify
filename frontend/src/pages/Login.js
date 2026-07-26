import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { axiosClient } from '../utils/axiosClient';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Key, ShieldQuestion } from 'lucide-react';

function Login() {
    document.title = 'Login';
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Login Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Password Reset Flow State
    const [isResetFlow, setIsResetFlow] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1 = Enter Email, 2 = Answer Question & Reset
    const [resetEmail, setResetEmail] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Prevent login again if user already logged in
    useEffect(() => {
        if (localStorage.getItem("User")) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password!");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosClient.post('/auth/login', {
                email,
                password
            });

            if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                toast.error(response.data.message);
                return;
            }

            toast.success("Successfully Logged In!");
            const { token, user } = response.data.message;
            localStorage.setItem('Token', token);
            dispatch(setUser(user)); // Save to Redux Store and localStorage
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || "Failed to log in");
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Request security question
    const handleResetRequestQuestion = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            toast.error("Please enter your email!");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/auth/forgotPassword', { email: resetEmail });
            if (res.data.statusCode === 200) {
                setSecurityQuestion(res.data.message.securityQuestion);
                setResetStep(2);
            } else {
                toast.error(res.data.message || "User not found");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Answer question and save new password
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!securityAnswer || !newPassword) {
            toast.error("Please answer the question and provide a new password!");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters!");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/auth/resetPassword', {
                email: resetEmail,
                securityAnswer,
                newPassword
            });

            if (res.data.statusCode === 200) {
                toast.success("Password reset successfully! Please log in.");
                setIsResetFlow(false);
                setResetStep(1);
                setResetEmail('');
                setSecurityAnswer('');
                setNewPassword('');
            } else {
                toast.error(res.data.message || "Incorrect security answer!");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mont px-4">
            <div className="w-full max-w-md p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl space-y-8">
                
                {/* Regular Login Form */}
                {!isResetFlow ? (
                    <>
                        <div className="text-center">
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                            <p className="text-slate-400 mt-2 text-sm font-medium">Log in to check your latest insights.</p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email or Username</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="name@example.com or username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                        required
                                    />
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase">Password</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsResetFlow(true)}
                                        className="text-xs text-yellow-500 hover:underline font-semibold"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-11 pr-11 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                        required
                                    />
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all shadow-lg shadow-yellow-500/20"
                            >
                                {loading ? "Logging In..." : "Log In"}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Password Reset Flow Card */
                    <>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-yellow-500">
                                Reset Password
                            </h1>
                            <p className="text-slate-400 mt-2 text-sm font-medium">Follow steps to recover your account.</p>
                        </div>

                        {resetStep === 1 ? (
                            <form onSubmit={handleResetRequestQuestion} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Registered Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                            required
                                        />
                                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all"
                                >
                                    Get Security Question
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                                {/* Security Question text block */}
                                <div className="p-4 rounded-xl bg-slate-700 border border-slate-600 text-sm">
                                    <div className="flex items-center gap-2 text-yellow-500 font-semibold mb-1">
                                        <ShieldQuestion className="h-4 w-4" />
                                        <span>Security Question</span>
                                    </div>
                                    <p className="text-slate-200 italic">{securityQuestion}</p>
                                </div>

                                {/* Answer */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Your Answer</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Secret answer"
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                            required
                                        />
                                        <Key className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                            required
                                        />
                                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all"
                                >
                                    Reset Password
                                </button>
                            </form>
                        )}

                        <button 
                            onClick={() => { setIsResetFlow(false); setResetStep(1); }}
                            className="w-full text-center text-sm text-slate-400 hover:underline font-semibold"
                        >
                            Back to Login
                        </button>
                    </>
                )}

                {!isResetFlow && (
                    <p className="text-center text-sm text-slate-400 font-medium">
                        New User? <Link to="/signup" className="text-yellow-500 hover:underline">Go To SignUp</Link>
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;