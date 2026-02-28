
import React, { useState } from 'react';
import { AuthRole, User } from '../types';

interface LoginProps {
  role: AuthRole;
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ role, onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock authentication logic
    setTimeout(() => {
      if (role === 'admin' && email === 'admin@mats.com' && password === 'admin123') {
        onLogin({ id: 'u1', email, role: 'admin', name: 'HQ Dispatcher' });
      } else if (role === 'vendor' && email === 'driver@mats.com' && password === 'driver123') {
        onLogin({ id: 'u2', email, role: 'vendor', name: 'John Doe', unitId: 'AMB-001' });
      } else {
        setError('Invalid credentials for this portal access.');
      }
      setLoading(false);
    }, 800);
  };

  const is_admin = role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className={`p-8 ${is_admin ? 'bg-rose-600' : 'bg-blue-600'} text-white`}>
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <i className="fa-solid fa-arrow-left"></i>
              Back to selection
            </button>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              {is_admin ? 'Dispatcher' : 'Vendor'} Login
            </h2>
            <p className="text-white/70 text-sm mt-1">Authorized access to {is_admin ? 'HQ Command' : 'Fleet Operations'}.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Registered Email</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={is_admin ? "admin@mats.com" : "driver@mats.com"}
                  className="w-full bg-slate-800 border-none rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Security Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border-none rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                is_admin ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? (
                <i className="fa-solid fa-spinner animate-spin text-lg"></i>
              ) : (
                <>
                  <span>Authenticating</span>
                  <i className="fa-solid fa-shield-check"></i>
                </>
              )}
            </button>

            <div className="text-center">
              <a href="#" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase font-bold tracking-widest">
                Forgot access credentials?
              </a>
            </div>
          </form>
        </div>
        
        <p className="text-center mt-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Secure Link • AES-256 Encrypted Traffic
        </p>
      </div>
    </div>
  );
};

export default Login;
