import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchExpenses, clearExpenses } from '../redux/expenseSlice';
import { deleteExpense } from '../utils/renders';
import { 
    Search, 
    Filter, 
    Trash2, 
    ArrowUpDown, 
    ChevronLeft, 
    ChevronRight,
    Plus,
    X,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function Expenses() {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.user.currentUser);
    const darkMode = useSelector(state => state.theme.darkMode);
    
    const { list: expenses, total, page, pages, loading } = useSelector(state => state.expenses);

    // Filter states
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [sortBy, setSortBy] = useState('date');
    const [order, setOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);

    const expenseCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
    const allCategories = [...expenseCategories, ...incomeCategories];

    const loadExpenses = () => {
        if (!currentUser) return;
        dispatch(fetchExpenses({
            userId: currentUser._id,
            search,
            category,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
            sortBy,
            order,
            page: currentPage,
            limit: 6
        }));
    };

    useEffect(() => {
        loadExpenses();
        // eslint-disable-next-line
    }, [category, sortBy, order, currentPage, currentUser]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadExpenses();
    };

    const handleResetFilters = () => {
        setSearch('');
        setCategory('All');
        setStartDate(null);
        setEndDate(null);
        setSortBy('date');
        setOrder('desc');
        setCurrentPage(1);
    };

    const handleDelete = async (expenseId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            await deleteExpense({ expenseId, userId: currentUser._id });
            loadExpenses();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
                    <p className="text-slate-400">View and manage all income and expenses.</p>
                </div>
                <Link
                    to="/add-expense"
                    className="px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
                >
                    <Plus className="h-5 w-5" />
                    New Transaction
                </Link>
            </div>

            {/* Filters panel */}
            <div className={`p-6 rounded-2xl border ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search title, notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full h-11 pl-10 pr-4 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                        />
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>

                    {/* Category */}
                    <div>
                        <select
                            value={category}
                            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                            className={`w-full h-11 px-4 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <option value="All">All Categories</option>
                            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="flex gap-2">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => { setStartDate(date); setCurrentPage(1); }}
                            placeholderText="Start Date"
                            className={`w-full h-11 px-4 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                        />
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => { setEndDate(date); setCurrentPage(1); }}
                            placeholderText="End Date"
                            className={`w-full h-11 px-4 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-yellow-500 ${
                                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                        />
                    </div>

                    {/* Search & Reset Buttons */}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 h-11 bg-slate-650 hover:bg-slate-750 border border-slate-350 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className={`px-3 h-11 rounded-xl border transition-all flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 ${
                                darkMode ? 'border-slate-650 text-slate-400' : 'border-slate-200 text-slate-600'
                            }`}
                            title="Reset filters"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </form>

                {/* Sort Bar */}
                <div className="flex flex-wrap items-center justify-between mt-6 pt-6 border-t border-slate-250 dark:border-slate-700 gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-4">
                        <span>Sort By:</span>
                        <button 
                            onClick={() => { setSortBy('date'); setOrder(order === 'asc' ? 'desc' : 'asc'); setCurrentPage(1); }}
                            className={`flex items-center gap-1 font-semibold ${sortBy === 'date' ? 'text-yellow-500' : ''}`}
                        >
                            Date {sortBy === 'date' && (order === 'asc' ? '↑' : '↓')}
                        </button>
                        <button 
                            onClick={() => { setSortBy('amount'); setOrder(order === 'asc' ? 'desc' : 'asc'); setCurrentPage(1); }}
                            className={`flex items-center gap-1 font-semibold ${sortBy === 'amount' ? 'text-yellow-500' : ''}`}
                        >
                            Amount {sortBy === 'amount' && (order === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                    <div>
                        Showing {expenses.length} of {total} transactions
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`h-24 rounded-2xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    ))}
                </div>
            ) : expenses.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">No Transactions Found</h3>
                    <p className="text-slate-400 mt-1">Try resetting your filters or add a new transaction.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {expenses.map((t) => (
                        <div 
                            key={t._id}
                            className={`p-6 rounded-2xl border flex items-center justify-between group transition-all duration-300 hover:shadow-lg ${
                                darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-350 shadow-sm shadow-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3.5 rounded-xl ${
                                    t.type === 'Income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                    {t.type === 'Income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold">{t.title}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                                            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                        }`}>{t.category}</span>
                                        <span>•</span>
                                        <span>{t.paymentMethod}</span>
                                        <span>•</span>
                                        <span>{new Date(t.date).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    {t.description && (
                                        <p className="text-xs text-slate-400 mt-2 italic font-mono">
                                            {t.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-bold ${
                                    t.type === 'Income' ? 'text-green-500' : 'text-red-500'
                                }`}>
                                    {t.type === 'Income' ? '+' : '-'}₹{t.amount}
                                </span>
                                <button
                                    onClick={() => handleDelete(t._id)}
                                    className={`p-2 rounded-xl border opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500 ${
                                        darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-250 text-slate-500'
                                    }`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {pages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-xl border transition-all ${
                            currentPage === 1 
                            ? 'opacity-40 cursor-not-allowed border-transparent' 
                            : `hover:bg-yellow-500/10 ${darkMode ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-800'}`
                        }`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-semibold text-sm">
                        Page {currentPage} of {pages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pages))}
                        disabled={currentPage === pages}
                        className={`p-2 rounded-xl border transition-all ${
                            currentPage === pages
                            ? 'opacity-40 cursor-not-allowed border-transparent'
                            : `hover:bg-yellow-500/10 ${darkMode ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-800'}`
                        }`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default Expenses;
