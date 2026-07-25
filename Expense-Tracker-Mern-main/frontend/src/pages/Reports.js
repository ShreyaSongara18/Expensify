import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { axiosClient } from '../utils/axiosClient';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { 
    FileText, 
    Download, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Wallet
} from 'lucide-react';

function Reports() {
    const currentUser = useSelector(state => state.user.currentUser);
    const darkMode = useSelector(state => state.theme.darkMode);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyTransactions, setMonthlyTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const months = [
        { val: 1, label: 'January' }, { val: 2, label: 'February' }, { val: 3, label: 'March' },
        { val: 4, label: 'April' }, { val: 5, label: 'May' }, { val: 6, label: 'June' },
        { val: 7, label: 'July' }, { val: 8, label: 'August' }, { val: 9, label: 'September' },
        { val: 10, label: 'October' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
    ];

    const fetchMonthlyData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
            const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();
            
            const response = await axiosClient.post('/expenses/allExpenses', {
                userId: currentUser._id,
                startDate,
                endDate,
                limit: 1000
            });
            
            if (response.data.statusCode === 200) {
                setMonthlyTransactions(response.data.message.expenses || []);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlyData();
        // eslint-disable-next-line
    }, [selectedMonth, selectedYear, currentUser]);

    // Compute Metrics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    monthlyTransactions.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'Income') {
            totalIncome += amt;
        } else {
            totalExpense += amt;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
        }
    });

    const savings = totalIncome - totalExpense;
    const savingsPercentage = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Export CSV
    const exportCSV = () => {
        if (monthlyTransactions.length === 0) {
            toast.error("No transactions to export!");
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Type,Title,Category,Payment Method,Amount (INR),Description\n";

        monthlyTransactions.forEach(t => {
            const dateStr = new Date(t.date).toLocaleDateString('en-GB');
            const row = [
                dateStr,
                t.type,
                `"${t.title.replace(/"/g, '""')}"`,
                t.category,
                t.paymentMethod,
                t.amount,
                `"${(t.description || '').replace(/"/g, '""')}"`
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const fileName = `Financial_Report_${months.find(m => m.val === selectedMonth).label}_${selectedYear}.csv`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV report exported successfully!");
    };

    // Export PDF
    const exportPDF = () => {
        if (monthlyTransactions.length === 0) {
            toast.error("No transactions to export!");
            return;
        }

        const doc = new jsPDF();
        const monthLabel = months.find(m => m.val === selectedMonth).label;
        
        // Title & Header
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text("Expensify Financial Report", 14, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Period: ${monthLabel} ${selectedYear}`, 14, 28);
        doc.text(`Generated for: ${currentUser.username} (${currentUser.email})`, 14, 34);
        
        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 38, 196, 38);

        // Summary Statistics
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text("Monthly Financial Summary", 14, 48);

        doc.setFontSize(11);
        doc.text(`Total Income: Rs. ${totalIncome.toLocaleString()}`, 14, 56);
        doc.text(`Total Expenses: Rs. ${totalExpense.toLocaleString()}`, 14, 62);
        doc.text(`Net Savings: Rs. ${savings.toLocaleString()} (${savingsPercentage}% saved)`, 14, 68);

        // Divider
        doc.line(14, 74, 196, 74);

        // Transactions Table Header
        doc.setFontSize(14);
        doc.text("Detailed Transactions List", 14, 84);
        
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text("Date", 14, 94);
        doc.text("Type", 36, 94);
        doc.text("Title", 60, 94);
        doc.text("Category", 110, 94);
        doc.text("Method", 150, 94);
        doc.text("Amount (Rs.)", 175, 94);
        
        doc.line(14, 97, 196, 97);

        let y = 104;
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        monthlyTransactions.forEach((t) => {
            if (y > 275) {
                doc.addPage();
                y = 20; // reset y on new page
                
                doc.setFontSize(10);
                doc.setTextColor(71, 85, 105);
                doc.text("Date", 14, y);
                doc.text("Type", 36, y);
                doc.text("Title", 60, y);
                doc.text("Category", 110, y);
                doc.text("Method", 150, y);
                doc.text("Amount (Rs.)", 175, y);
                doc.line(14, y + 3, 196, y + 3);
                y += 10;
                doc.setFontSize(9);
                doc.setTextColor(30, 41, 59);
            }

            const dateStr = new Date(t.date).toLocaleDateString('en-GB');
            doc.text(dateStr, 14, y);
            doc.text(t.type, 36, y);
            doc.text(t.title.substring(0, 24), 60, y);
            doc.text(t.category, 110, y);
            doc.text(t.paymentMethod, 150, y);
            
            const amtPrefix = t.type === 'Income' ? '+' : '-';
            doc.text(`${amtPrefix}${t.amount}`, 175, y);

            y += 8;
        });

        const fileName = `Financial_Report_${monthLabel}_${selectedYear}.pdf`;
        doc.save(fileName);
        toast.success("PDF report downloaded successfully!");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Financial Reports</h1>
                    <p className="text-slate-400">Export statement sheets and analyze monthly summaries.</p>
                </div>

                {/* Filters */}
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

            {/* Quick Export Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Buttons card */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-6 w-6 text-yellow-500" />
                            <h3 className="font-bold text-lg">Download Statements</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-6">
                            Download the selected month's transaction records directly to your device as a formatted CSV spreadsheet or a structured PDF invoice report.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={exportPDF}
                            disabled={loading || monthlyTransactions.length === 0}
                            className="flex-1 h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-40"
                        >
                            <Download className="h-5 w-5" />
                            Export PDF
                        </button>
                        <button
                            onClick={exportCSV}
                            disabled={loading || monthlyTransactions.length === 0}
                            className={`flex-1 h-12 border font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 ${
                                darkMode ? 'border-slate-700 hover:bg-slate-700 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                            <Download className="h-5 w-5" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Monthly Summary Statistics */}
                <div className={`p-6 rounded-2xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                    <h3 className="font-bold text-lg mb-6">Monthly Scorecard</h3>
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-10 bg-slate-700 rounded" />
                            <div className="h-10 bg-slate-700 rounded" />
                        </div>
                    ) : monthlyTransactions.length === 0 ? (
                        <div className="text-center text-slate-400 py-6">
                            <p>No transactions found for this period.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="flex items-center gap-2 text-slate-400">
                                    <Wallet className="h-4 w-4" />
                                    Starting Income
                                </span>
                                <span className="text-green-500">₹{totalIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="flex items-center gap-2 text-slate-400">
                                    <ArrowDownRight className="h-4 w-4" />
                                    Total Spendings
                                </span>
                                <span className="text-red-500">₹{totalExpense.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-semibold pt-4 border-t border-slate-250 dark:border-slate-700">
                                <span className="flex items-center gap-2 text-slate-400">
                                    <ArrowUpRight className="h-4 w-4" />
                                    Net Savings
                                </span>
                                <span className="text-yellow-500">₹{savings.toLocaleString()} ({savingsPercentage}%)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Breakdown list */}
            {monthlyTransactions.length > 0 && (
                <div className={`p-6 rounded-2xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <h3 className="font-bold text-lg mb-6">Category Spends Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(categoryTotals).map(([cat, amt]) => (
                            <div key={cat} className="p-4 rounded-xl bg-slate-500/5">
                                <span className="text-xs text-slate-400 font-semibold uppercase">{cat}</span>
                                <h4 className="text-lg font-bold mt-1 text-slate-850 dark:text-white">₹{amt.toLocaleString()}</h4>
                                <span className="text-xs text-slate-400 block mt-0.5">
                                    {totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0}% of expenses
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
