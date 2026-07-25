import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { axiosClient } from '../utils/axiosClient';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    PieChart as PieIcon, 
    ArrowUpRight,
    Award,
    Calendar,
    Activity
} from 'lucide-react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function Dashboard() {
    const currentUser = useSelector(state => state.user.currentUser);
    const darkMode = useSelector(state => state.theme.darkMode);
    
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                if (!currentUser) return;
                // Fetch a large limit of transactions to compute metrics and graphs
                const response = await axiosClient.post('/expenses/allExpenses', {
                    userId: currentUser._id,
                    limit: 1000,
                    page: 1
                });
                if (response.data.statusCode === 200) {
                    setAllTransactions(response.data.message.expenses || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`h-32 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`h-80 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className={`h-80 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
            </div>
        );
    }

    // Calculations
    let totalIncome = 0;
    let totalExpense = 0;
    
    allTransactions.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'Income') {
            totalIncome += amt;
        } else {
            totalExpense += amt;
        }
    });

    const totalBalance = totalIncome - totalExpense;
    const savings = totalIncome > 0 ? totalIncome - totalExpense : 0;
    const savingsPercent = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Category Breakdown
    const categoryTotals = {};
    allTransactions.filter(t => t.type === 'Expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const categoryLabels = Object.keys(categoryTotals);
    const categoryValues = Object.values(categoryTotals);

    // Find highest spending category
    let highestCategory = 'N/A';
    let highestAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
        if (val > highestAmount) {
            highestAmount = val;
            highestCategory = cat;
        }
    });

    // Monthly aggregation for Charts (last 6 months)
    const monthlyData = {};
    allTransactions.forEach(t => {
        if (!t.date) return;
        const dateObj = new Date(t.date);
        const monthYear = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expense: 0 };
        }
        if (t.type === 'Income') {
            monthlyData[monthYear].income += Number(t.amount);
        } else {
            monthlyData[monthYear].expense += Number(t.amount);
        }
    });

    const last6Months = Object.keys(monthlyData).slice(-6);
    const monthlyIncomes = last6Months.map(m => monthlyData[m].income);
    const monthlyExpenses = last6Months.map(m => monthlyData[m].expense);

    // Average daily spending (last 30 days)
    const last30DaysExpenses = allTransactions
        .filter(t => t.type === 'Expense' && (new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24) <= 30);
    const total30Days = last30DaysExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgDailySpending = Math.round(total30Days / 30);

    // Comparison with previous month
    const thisMonthStr = new Date().toLocaleString('default', { month: 'short', year: '2-digit' });
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthStr = prevMonthDate.toLocaleString('default', { month: 'short', year: '2-digit' });

    const thisMonthSpending = monthlyData[thisMonthStr]?.expense || 0;
    const prevMonthSpending = monthlyData[prevMonthStr]?.expense || 0;
    const monthlyComparisonDiff = thisMonthSpending - prevMonthSpending;

    // Charts Config
    const chartThemeColor = darkMode ? '#94a3b8' : '#64748b';
    const gridThemeColor = darkMode ? '#334155' : '#e2e8f0';

    const barChartData = {
        labels: last6Months,
        datasets: [
            {
                label: 'Income',
                data: monthlyIncomes,
                backgroundColor: 'rgba(34, 197, 94, 0.75)',
                borderRadius: 8,
            },
            {
                label: 'Expense',
                data: monthlyExpenses,
                backgroundColor: 'rgba(239, 68, 68, 0.75)',
                borderRadius: 8,
            }
        ]
    };

    const pieChartData = {
        labels: categoryLabels.length > 0 ? categoryLabels : ['No Expenses'],
        datasets: [
            {
                data: categoryValues.length > 0 ? categoryValues : [1],
                backgroundColor: [
                    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
                    '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#6b7280'
                ],
                borderWidth: 0,
            }
        ]
    };

    const lineChartData = {
        labels: last6Months,
        datasets: [
            {
                label: 'Savings Trend',
                data: last6Months.map(m => monthlyData[m].income - monthlyData[m].expense),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#f59e0b',
            }
        ]
    };

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
                    <p className="text-slate-400">Welcome back, {currentUser?.username}. Here is your financial snapshot.</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span>{new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Balance */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-slate-400">Total Balance</p>
                            <h3 className="text-2xl font-bold mt-2">₹{totalBalance.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Income */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-slate-400">Total Income</p>
                            <h3 className="text-2xl font-bold mt-2 text-green-500">₹{totalIncome.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Expenses */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-slate-400">Total Expenses</p>
                            <h3 className="text-2xl font-bold mt-2 text-red-500">₹{totalExpense.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Savings */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-slate-400">Savings</p>
                            <h3 className="text-2xl font-bold mt-2 text-yellow-500">₹{savings.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                            <Award className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Resume-Level Financial Insights */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="h-6 w-6 text-yellow-500 animate-pulse" />
                    <h3 className="text-lg font-bold">Financial Insights & Trends</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-4 rounded-xl bg-slate-500/5">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block">Highest Spending Category</span>
                        <span className="text-lg font-bold block mt-1 text-red-500">{highestCategory}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">₹{highestAmount.toLocaleString()} total</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-500/5">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block">Average Daily Spending</span>
                        <span className="text-lg font-bold block mt-1 text-amber-500">₹{avgDailySpending.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">Based on last 30 days</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-500/5">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block">Savings Percentage</span>
                        <span className="text-lg font-bold block mt-1 text-green-500">{savingsPercent}%</span>
                        <span className="text-xs text-slate-400 block mt-0.5">of total income saved</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-500/5">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block">Monthly Spending Trend</span>
                        <span className={`text-lg font-bold block mt-1 flex items-center gap-1 ${
                            monthlyComparisonDiff <= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {monthlyComparisonDiff <= 0 ? 'Down' : 'Up'} by {Math.abs(monthlyComparisonDiff).toLocaleString()}
                            <ArrowUpRight className={`h-4 w-4 transform ${monthlyComparisonDiff <= 0 ? 'rotate-90' : ''}`} />
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">vs previous month</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income vs Expenses */}
                <div className={`p-6 rounded-2xl border lg:col-span-2 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <h3 className="font-bold text-lg mb-6">Income vs Expense comparison</h3>
                    <div className="h-80">
                        <Bar 
                            data={barChartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { labels: { color: chartThemeColor } } },
                                scales: {
                                    x: { grid: { color: gridThemeColor }, ticks: { color: chartThemeColor } },
                                    y: { grid: { color: gridThemeColor }, ticks: { color: chartThemeColor } }
                                }
                            }} 
                        />
                    </div>
                </div>

                {/* Category Pie */}
                <div className={`p-6 rounded-2xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <h3 className="font-bold text-lg mb-6">Category-wise Expense Breakdown</h3>
                    <div className="h-80 flex items-center justify-center">
                        {categoryLabels.length > 0 ? (
                            <Pie 
                                data={pieChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { color: chartThemeColor } } }
                                }}
                            />
                        ) : (
                            <div className="text-center text-slate-400">
                                <PieIcon className="h-12 w-12 mx-auto mb-2 text-slate-500" />
                                <p>No expense data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Savings Line Chart */}
                <div className={`p-6 rounded-2xl border lg:col-span-3 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <h3 className="font-bold text-lg mb-6">Monthly Savings Trend</h3>
                    <div className="h-80">
                        <Line 
                            data={lineChartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { labels: { color: chartThemeColor } } },
                                scales: {
                                    x: { grid: { color: gridThemeColor }, ticks: { color: chartThemeColor } },
                                    y: { grid: { color: gridThemeColor }, ticks: { color: chartThemeColor } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
