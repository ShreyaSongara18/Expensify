import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="App">
        <div><Toaster position="top-center" reverseOrder={false} /></div>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login />}></Route>
          <Route path='/signup' element={<Signup />}></Route>

          {/* Protected Dashboard Layout Routes */}
          <Route path='/' element={<Navigate to='/dashboard' replace />}></Route>
          <Route path='/dashboard' element={<ProtectedRoutes><Layout><Dashboard /></Layout></ProtectedRoutes>} />
          <Route path='/expenses' element={<ProtectedRoutes><Layout><Expenses /></Layout></ProtectedRoutes>} />
          <Route path='/add-expense' element={<ProtectedRoutes><Layout><AddExpense /></Layout></ProtectedRoutes>} />
          <Route path='/budget' element={<ProtectedRoutes><Layout><Budget /></Layout></ProtectedRoutes>} />
          <Route path='/reports' element={<ProtectedRoutes><Layout><Reports /></Layout></ProtectedRoutes>} />
          <Route path='/profile' element={<ProtectedRoutes><Layout><Profile /></Layout></ProtectedRoutes>} />
          
          {/* Catch-all redirect */}
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
    </div>
  );
}

export function ProtectedRoutes(props){
  if(localStorage.getItem("User"))
  {
    return props.children;
  }
  else{
    return <Navigate to='/login' replace></Navigate>
  }
}

export default App;
