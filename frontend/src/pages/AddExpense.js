import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { axiosClient } from '../utils/axiosClient';
import { fetchBudget } from '../redux/expenseSlice';
import { 
    PlusCircle, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    Calendar, 
    Tag, 
    CreditCard, 
    Info 
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function AddExpense() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.user.currentUser);
    const darkMode = useSelector(state => state.theme.darkMode);
    
    // Budgets from redux store
    const monthlyLimit = useSelector(state => state.expenses.monthlyLimit);
    const categoryLimits = useSelector(state => state.expenses.categoryLimits);

    const [type, setType] = useState('Expense');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date());
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const expenseCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

    // Fetch budget for the selected date's month and year
    useEffect(() => {
        if (currentUser) {
            const selectedMonth = date.getMonth() + 1;
            const selectedYear = date.getFullYear();
            dispatch(fetchBudget({ userId: currentUser._id, month: selectedMonth, year: selectedYear }));
        }
    }, [date, currentUser, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !amount || !category || !date) {
            toast.error("Please fill in all required fields!");
            return;
        }

        setLoading(true);
        try {
            const parsedAmount = Number(amount);
            
            // Check budget warnings BEFORE creating the transaction (for Expenses only)
            if (type === 'Expense' && currentUser) {
                const selectedMonth = date.getMonth() + 1;
                const selectedYear = date.getFullYear();
                
                // Fetch all expenses of the current month to calculate limits
                const response = await axiosClient.post('/expenses/allExpenses', {
                    userId: currentUser._id,
                    startDate: new Date(selectedYear, selectedMonth - 1, 1).toISOString(),
                    endDate: new Date(selectedYear, selectedMonth, 0).toISOString(),
                    limit: 1000
                });
                
                if (response.data.statusCode === 200) {
                    const currentExpenses = response.data.message.expenses || [];
                    const categoryTotal = currentExpenses
                        .filter(exp => exp.category === category && exp.type === 'Expense')
                        .reduce((sum, exp) => sum + exp.amount, 0);
                    const totalMonthExpenses = currentExpenses
                        .filter(exp => exp.type === 'Expense')
                        .reduce((sum, exp) => sum + exp.amount, 0);

                    // Check Category Budget
                    const limitForCategory = categoryLimits[category] || 0;
                    if (limitForCategory > 0 && (categoryTotal + parsedAmount) > limitForCategory) {
                        toast.error(`⚠️ Budget Exceeded! Limit for ${category} is ₹${limitForCategory}. You spent ₹${categoryTotal + parsedAmount}.`, {
                            duration: 6000
                        });
                    }

                    // Check Total Monthly Budget
                    if (monthlyLimit > 0 && (totalMonthExpenses + parsedAmount) > monthlyLimit) {
                        toast.error(`⚠️ Monthly Spending Limit Exceeded! Total Budget is ₹${monthlyLimit}. Current total spent: ₹${totalMonthExpenses + parsedAmount}.`, {
                            duration: 6000
                        });
                    }
                }
            }

            // Create Transaction API call
            const payload = {
                usersid: currentUser._id,
                title,
                amount: parsedAmount,
                category,
                date: date.toISOString(),
                paymentMethod,
                type,
                description
            };

            const createRes = await axiosClient.post('/expenses/addExpense', payload);
            if (createRes.data.statusCode === 200) {
                toast.success(`${type} added successfully!`);
                navigate('/expenses');
            } else {
                toast.error(createRes.data.message || "Failed to create transaction");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className={`p-8 rounded-3xl border transition-all ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl shadow-slate-100'
            }`}>
                <div className="flex items-center gap-3 mb-8">
                    <PlusCircle className="h-8 w-8 text-yellow-500" />
                    <h1 className="text-2xl font-bold">Add Transaction</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Toggle Income vs Expense */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => { setType('Expense'); setCategory(''); }}
                            className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                                type === 'Expense'
                                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                                : `${darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'} text-slate-400`
                            }`}
                        >
                            <ArrowDownCircle className="h-5 w-5" />
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType('Income'); setCategory(''); }}
                            className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                                type === 'Income'
                                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                                : `${darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'} text-slate-400`
                            }`}
                        >
                            <ArrowUpCircle className="h-5 w-5" />
                            Income
                        </button>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Rent, Grocery shopping, Salary"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${
                                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${
                                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                }`}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${
                                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                }`}
                                required
                            >
                                <option value="">Select Category</option>
                                {type === 'Expense' 
                                    ? expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                                    : incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                                }
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date */}
                        <div className="flex flex-col">
                            <label className="block text-sm font-semibold mb-2">Date</label>
                            <DatePicker
                                selected={date}
                                onChange={(d) => setDate(d)}
                                className={`w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${
                                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                }`}
                                dateFormat="dd/MM/yyyy"
                                required
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className={`w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${
                                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                                }`}
                                required
                            >
                                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                        <textarea
                            rows="3"
                            placeholder="Add transaction notes..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${
                                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                    >
                        {loading ? "Adding..." : "Add Transaction"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddExpense;
