import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';

const Login = ({ onLogin, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      await signIn({ username: email, password });
      onLogin(); // Successful sign in
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="w-full max-w-md">
        
        {/* Header / Logo Area */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gradient mb-2 tracking-tighter">
            OmniSync
          </h1>
          <p className="text-textSecondary text-lg font-light tracking-wide">
            Secure Merchant Portal
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-card p-10 relative group">
          {/* Subtle glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-at via-telecel to-mtn rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 -z-10"></div>
          
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm relative z-10">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-wide text-textSecondary uppercase ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bgDeep/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-at/50 focus:ring-1 focus:ring-at/50 transition-all font-sans"
                placeholder="merchant@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold tracking-wide text-textSecondary uppercase">
                  Password
                </label>
                <a href="#" className="text-xs text-mtn hover:text-white transition-colors">Forgot?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-bgDeep/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-at/50 focus:ring-1 focus:ring-at/50 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full bg-gradient-to-r from-at to-telecel text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center relative z-10">
            <button 
              type="button"
              onClick={() => onSwitchToSignUp()} 
              className="text-textSecondary hover:text-white text-sm transition-colors"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="text-center mt-8 text-sm text-textSecondary font-light">
          Protected by OmniSync Security
        </div>
      </div>
    </div>
  );
};

export default Login;
