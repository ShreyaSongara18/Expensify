import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { axiosClient } from '../utils/axiosClient';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User, ShieldQuestion, HelpCircle, Key } from 'lucide-react';

function Signup() {
    document.title = 'SignUp';
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const securityQuestions = [
        "What is the name of your first pet?",
        "What is your mother's maiden name?",
        "What was the name of your first school?",
        "What is your favorite book?",
        "What city were you born in?"
    ];

    // Password strength evaluator
    const evaluatePassword = (pass) => {
        if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
        let score = 0;
        if (pass.length >= 6) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
        if (score === 2 || score === 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
        return { score, label: 'Strong', color: 'bg-green-500' };
    };

    const strength = evaluatePassword(password);

    const submitForm = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!username || !email || !password || !securityQuestion || !securityAnswer) {
            toast.error("Please fill in all fields!");
            return;
        }

        // Email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address!");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters!");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/auth/signup', {
                username,
                email,
                password,
                securityQuestion,
                securityAnswer
            });

            if (res.data.statusCode === 201) {
                toast.success("Registered Successfully! Please log in.");
                navigate("/login");
            } else {
                toast.error(res.data.message || "Registration failed!");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mont px-4">
            <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">Join Expensify to manage your finance goals today.</p>
                </div>

                <form onSubmit={submitForm} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Your full name"
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                required
                            />
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                required
                            />
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
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

                        {/* Password strength bar */}
                        {password && (
                            <div className="mt-2.5 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Password Strength:</span>
                                    <span className={`font-bold ${
                                        strength.label === 'Strong' ? 'text-green-500' : strength.label === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                                    }`}>{strength.label}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${strength.color}`} 
                                        style={{ width: `${(strength.score / 4) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security Question dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Security Question (For Recovery)</label>
                        <div className="relative">
                            <select
                                value={securityQuestion}
                                onChange={(e) => setSecurityQuestion(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all appearance-none"
                                required
                            >
                                <option value="">Select a security question</option>
                                {securityQuestions.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                            <ShieldQuestion className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    {/* Security Answer */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Your Answer</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Your answer"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-700 border border-slate-600 outline-none text-sm text-white focus:ring-2 focus:ring-yellow-500 transition-all"
                                required
                            />
                            <Key className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all shadow-lg shadow-yellow-500/20"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400">
                    Already registered? <Link to="/login" className="text-yellow-500 hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;