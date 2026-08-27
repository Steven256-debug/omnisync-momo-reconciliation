import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import SignUp from './components/SignUp'
import { Amplify } from 'aws-amplify'
import { signOut, getCurrentUser } from 'aws-amplify/auth'

// Configure Amplify using outputs from our AWS deployment
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'REGION_XXXXX',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    }
  }
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  React.useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSignOut = async () => {
    // Force UI and local cleanup immediately so it feels instant
    setIsAuthenticated(false);
    localStorage.clear(); 
    
    try {
      await signOut(); 
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a14]">
        <div className="text-white text-xl font-light">Loading session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showSignUp) {
      return <SignUp onSwitchToLogin={(success) => {
        setShowSignUp(false);
        // If success is true, they still need to login with the new credentials
      }} />;
    }
    return <Login onLogin={() => setIsAuthenticated(true)} onSwitchToSignUp={() => setShowSignUp(true)} />;
  }

  return (
    <div className="max-w-[1300px] mx-auto px-8 py-12 animate-[fadeIn_0.8s_ease-out]">
      <header className="text-center mb-16 relative">
        <div className="absolute right-0 top-0 z-50">
          <button 
            onClick={handleSignOut}
            className="text-textSecondary hover:text-white text-sm transition-colors px-4 py-2 rounded-lg border border-transparent hover:border-white/10 cursor-pointer"
          >
            Log Out
          </button>
        </div>
        <h1 className="text-6xl font-extrabold text-gradient mb-2 tracking-tighter">
          OmniSync MoMo
        </h1>
        <p className="text-textSecondary text-xl font-light">
          Serverless Multi-Network Mobile Money Reconciliation
        </p>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  )
}

export default App
