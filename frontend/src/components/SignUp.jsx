import React, { useState } from 'react';
import { signUp, confirmSignUp } from 'aws-amplify/auth';

const SignUp = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('SIGN_UP'); // SIGN_UP or CONFIRM
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      setStep('CONFIRM');
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during sign up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      // Verification successful, switch to login
      onSwitchToLogin(true); // pass true to indicate successful signup
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during confirmation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gradient mb-2 tracking-tighter">
            OmniSync
          </h1>
          <p className="text-textSecondary text-lg font-light tracking-wide">
            Create Merchant Account
          </p>
        </div>

        <div className="glass-card p-10 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-at via-telecel to-mtn rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 -z-10"></div>
          
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm relative z-10">
              {errorMsg}
            </div>
          )}

          {step === 'SIGN_UP' ? (
            <form onSubmit={handleSignUp} className="flex flex-col gap-6 relative z-10">
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
                <label className="text-sm font-semibold tracking-wide text-textSecondary uppercase ml-1">
                  Password (min 8 chars, num, symbol, uppercase)
                </label>
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
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="flex flex-col gap-6 relative z-10">
              <div className="text-center text-white mb-2">
                We sent a verification code to <br/><span className="font-semibold text-at">{email}</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-textSecondary uppercase ml-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-bgDeep/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-at/50 focus:ring-1 focus:ring-at/50 transition-all font-sans text-center tracking-widest text-xl"
                  placeholder="123456"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-4 w-full bg-gradient-to-r from-success to-mtn text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1'}`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center relative z-10">
            <button 
              type="button"
              onClick={() => onSwitchToLogin()} 
              className="text-textSecondary hover:text-white text-sm transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignUp;
