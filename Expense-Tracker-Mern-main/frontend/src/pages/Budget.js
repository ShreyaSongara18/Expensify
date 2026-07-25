import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBudget } from '../redux/expenseSlice';
import { axiosClient } from '../utils/axiosClient';
import { toast } from 'react-hot-toast';
import { 
    PiggyBank, 
    Calendar, 
    Save, 
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';

function Budget() {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.user.currentUser);
    const darkMode = useSelector(state => state.theme.darkMode);
    
    const reduxMonthlyLimit = useSelector(state => state.expenses.monthlyLimit);
    const reduxCategoryLimits = useSelector(state => state.expenses.categoryLimits);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const [monthlyLimit, setMonthlyLimit] = useState(0);
    const [categoryLimits, setCategoryLimits] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Monthly expenses for calculations
    const [currentExpenses, setCurrentExpenses] = useState([]);
    
    const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other'];
    const months = [
        { val: 1, label: 'January' }, { val: 2, label: 'February' }, { val: 3, label: 'March' },
        { val: 4, label: 'April' }, { val: 5, label: 'May' }, { val: 6, label: 'June' },
        { val: 7, label: 'July' }, { val: 8, label: 'August' }, { val: 9, label: 'September' },
        { val: 10, label: 'October' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
    ];

    const loadBudgetData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Load budget
            const res = await axiosClient.post('/budget/getBudget', {
                userId: currentUser._id,
                month: selectedMonth,
                year: selectedYear
            });
            if (res.data.statusCode === 200) {
                const b = res.data.message;
                setMonthlyLimit(b.monthlyLimit || 0);
                
                const limitMap = {};
                categories.forEach(cat => {
                    limitMap[cat] = (b.categoryLimits && b.categoryLimits[cat]) || 0;
                });
                setCategoryLimits(limitMap);
            }

            // Load all expenses for that month & year to compute remaining sums
            const expRes = await axiosClient.post('/expenses/allExpenses', {
                userId: currentUser._id,
                startDate: new Date(selectedYear, selectedMonth - 1, 1).toISOString(),
                endDate: new Date(selectedYear, selectedMonth, 0).toISOString(),
                limit: 1000
            });
            if (expRes.data.statusCode === 200) {
                setCurrentExpenses(expRes.data.message.expenses || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBudgetData();
        // eslint-disable-next-line
    }, [selectedMonth, selectedYear, currentUser]);

    const handleCategoryLimitChange = (cat, val) => {
        setCategoryLimits(prev => ({
            ...prev,
            [cat]: Number(val) || 0
        }));
    };

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosClient.post('/budget/updateBudget', {
                userId: currentUser._id,
                month: selectedMonth,
                year: selectedYear,
                monthlyLimit,
                categoryLimits
            });
            if (response.data.statusCode === 200) {
                toast.success("Budget updated successfully!");
                dispatch(fetchBudget({ userId: currentUser._id, month: selectedMonth, year: selectedYear }));
            } else {
                toast.error(response.data.message || "Failed to update budget");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals spent
    const totalSpent = currentExpenses
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const remainingTotalBudget = monthlyLimit - totalSpent;
    const monthlyExceeded = monthlyLimit > 0 && totalSpent > monthlyLimit;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Budgets</h1>
                    <p className="text-slate-400">Plan your categories and set spending thresholds.</p>
                </div>
                
                {/* Month/Year selectors */}
                <div className="flex gap-2">
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className={`h-11 px-4 rounded-xl border outline-none text-sm font-semibold transition-all ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                        }`}
                    >
                        {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className={`h-11 px-4 rounded-xl border outline-none text-sm font-semibold transition-all ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                        }`}
                    >
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Progress status card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border md:col-span-2 flex flex-col justify-between ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Overall Monthly Budget</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                monthlyExceeded ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                            }`}>
                                {monthlyExceeded ? 'Limit Exceeded' : 'Safe'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Spent: ₹{totalSpent}</span>
                            <span>Limit: ₹{monthlyLimit}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    monthlyExceeded ? 'bg-red-500' : 'bg-yellow-500'
                                }`} 
                                style={{ width: `${monthlyLimit > 0 ? Math.min((totalSpent / monthlyLimit) * 100, 100) : 0}%` }}
                            />
                        </div>
                    </div>
                    {monthlyLimit > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm">
                            {monthlyExceeded ? (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <span className="text-red-500 font-semibold">You have exceeded your monthly limit by ₹{Math.abs(remainingTotalBudget)}!</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    <span className="text-green-500 font-semibold">Remaining budget is ₹{remainingTotalBudget}. Good job!</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Edit Total Limit Form */}
                <div className={`p-6 rounded-2xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                    <h3 className="font-bold text-lg mb-4">Set Limit</h3>
                    <form onSubmit={handleSaveBudget} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Monthly Spending Limit</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={monthlyLimit}
                                    onChange={(e) => setMonthlyLimit(Number(e.target.value) || 0)}
                                    className={`w-full h-11 px-4 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-yellow-500 ${
                                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                                <span className="absolute right-4 top-3 text-slate-400 font-semibold">₹</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <Save className="h-4 w-4" />
                            Save Limit
                        </button>
                    </form>
                </div>
            </div>

            {/* Category Budgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Track progress of categories */}
                <div className={`p-6 rounded-2xl border lg:col-span-2 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <h3 className="font-bold text-lg mb-6">Category Budgets Progress</h3>
                    <div className="space-y-6">
                        {categories.map(cat => {
                            const limit = categoryLimits[cat] || 0;
                            const spent = currentExpenses
                                .filter(t => t.category === cat && t.type === 'Expense')
                                .reduce((sum, t) => sum + t.amount, 0);
                            const remaining = limit - spent;
                            const exceeded = limit > 0 && spent > limit;

                            return (
                                <div key={cat} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span>{cat}</span>
                                        <span className={exceeded ? 'text-red-500' : 'text-slate-400'}>
                                            ₹{spent} / ₹{limit} {limit > 0 && `(${remaining >= 0 ? `₹${remaining} left` : `₹${Math.abs(remaining)} over`})`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ${
                                                exceeded ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} 
                                            style={{ width: `${limit > 0 ? Math.min((spent / limit) * 100, 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Edit Category Budgets Form */}
                <div className={`p-6 rounded-2xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <h3 className="font-bold text-lg mb-6">Configure Categories</h3>
                    <form onSubmit={handleSaveBudget} className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                        {categories.map(cat => (
                            <div key={cat}>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">{cat} Limit (₹)</label>
                                <input
                                    type="number"
                                    value={categoryLimits[cat] || ''}
                                    onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                                    placeholder="No limit set"
                                    className={`w-full h-10 px-3 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-yellow-500 ${
                                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                            </div>
                        ))}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all mt-4 sticky bottom-0"
                        >
                            <Save className="h-4 w-4" />
                            Save All Category Budgets
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Budget;
