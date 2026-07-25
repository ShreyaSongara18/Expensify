import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';
import { logoutUser } from '../redux/userSlice';
import { 
    LayoutDashboard, 
    Receipt, 
    PlusCircle, 
    PiggyBank, 
    FileText, 
    User, 
    LogOut, 
    Sun, 
    Moon, 
    Menu, 
    X,
    TrendingUp
} from 'lucide-react';

function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    
    const darkMode = useSelector(state => state.theme.darkMode);
    const currentUser = useSelector(state => state.user.currentUser);
    
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Expenses', path: '/expenses', icon: Receipt },
        { name: 'Add Expense', path: '/add-expense', icon: PlusCircle },
        { name: 'Budget', path: '/budget', icon: PiggyBank },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Profile', path: '/profile', icon: User }
    ];

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <div className={`min-h-screen flex ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-950'} transition-colors duration-300`}>
            {/* Sidebar Desktop */}
            <aside className={`hidden md:flex flex-col w-64 border-r ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} transition-colors duration-300`}>
                <div className="h-16 flex items-center px-6 border-b border-inherit gap-3">
                    <TrendingUp className="h-8 w-8 text-yellow-500 animate-pulse" />
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                        Expensify
                    </span>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                    active 
                                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' 
                                    : `hover:bg-yellow-500/10 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`
                                }`}
                            >
                                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-yellow-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-inherit">
                    <button 
                        onClick={handleLogout}
                        className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            darkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                    >
                        <LogOut className="h-5 w-5 text-slate-400" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 transform ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out md:hidden ${
                darkMode ? 'bg-slate-800 border-r border-slate-700' : 'bg-white border-r border-slate-200'
            }`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-inherit">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-yellow-500" />
                        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                            Expensify
                        </span>
                    </div>
                    <button onClick={() => setMobileOpen(false)}>
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    active 
                                    ? 'bg-yellow-500 text-white' 
                                    : `hover:bg-yellow-500/10 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`
                                }`}
                            >
                                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-inherit">
                    <button 
                        onClick={handleLogout}
                        className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            darkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                    >
                        <LogOut className="h-5 w-5 text-slate-400" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-x-hidden">
                {/* Navbar */}
                <header className={`h-16 flex items-center justify-between px-6 border-b ${
                    darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'
                } backdrop-blur-md sticky top-0 z-40 transition-colors duration-300`}>
                    <div className="flex items-center gap-4">
                        <button 
                            className="md:hidden"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-bold capitalize">
                            {location.pathname.replace('/', '') || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button 
                            onClick={() => dispatch(toggleTheme())}
                            className={`p-2 rounded-xl border transition-all hover:scale-105 ${
                                darkMode ? 'border-slate-700 hover:bg-slate-700 text-yellow-400' : 'border-slate-200 hover:bg-slate-100 text-amber-600'
                            }`}
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* User Profile Info */}
                        {currentUser && (
                            <div className="flex items-center gap-3 pl-3 border-l border-slate-300 dark:border-slate-700">
                                {currentUser.profilePic ? (
                                    <img 
                                        src={currentUser.profilePic} 
                                        alt="Avatar" 
                                        className="h-9 w-9 rounded-full object-cover border border-yellow-500"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-white uppercase shadow-inner">
                                        {currentUser.username[0]}
                                    </div>
                                )}
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold truncate max-w-[120px]">{currentUser.username}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[120px]">{currentUser.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content wrapper */}
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;
