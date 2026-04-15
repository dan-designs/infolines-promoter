import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Bell } from 'lucide-react';
import logo from '../assets/logo.svg';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  
  // State for the form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // The Supabase Auth Trigger
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
    // Note: If successful, we don't need to manually navigate. 
    // App.tsx is listening globally and will instantly route to /dashboard.
  };

  return (
    <div className="min-h-screen flex scanlines crt-flicker bg-[#080808] text-[#00FF00] font-mono selection:bg-[#00FF00] selection:text-[#080808]">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 md:p-16 lg:p-24 justify-center relative z-10">
        
        {/* Header / Logo Group */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <img src={logo} alt="Infolines Logo" className="w-6 h-6 [image-rendering:pixelated]" />
          <div>
            <h1 className="font-pixel text-xl tracking-widest leading-none mt-1">INFOLINES</h1>
            <p className="text-[10px] tracking-widest opacity-80 mt-1">SYS.VER.1.0.0</p>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto mt-24 lg:mt-0">
          <div className="mb-10">
            <h2 className="text-3xl font-pixel mb-3 tracking-wider">SYSTEM_LOGIN</h2>
            <p className="text-[#00FF00]/70 text-sm tracking-wide">Authenticate to access the mainframe.</p>
          </div>

          {/* Hardware Error Display */}
          {error && (
            <div className="mb-8 p-4 border-2 border-[#00FF00] bg-[#00FF00] text-[#080808] font-bold text-xs uppercase tracking-widest">
              [ ERR ] {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs opacity-80 uppercase tracking-widest font-bold">Email</label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] focus:ring-0 outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 transition-none font-mono rounded-none"
                placeholder="operator@infolines.sys"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label htmlFor="password" className="block text-xs opacity-80 uppercase tracking-widest font-bold">Password</label>
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] hover:bg-[#00FF00] hover:text-[#080808] opacity-70 hover:opacity-100 uppercase tracking-widest p-1 transition-none border border-transparent hover:border-[#00FF00] cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] focus:ring-0 outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 transition-none font-mono tracking-widest rounded-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#00FF00] text-[#080808] border-2 border-[#00FF00] hover:bg-[#080808] hover:text-[#00FF00] transition-none py-4 px-4 font-pixel text-xl tracking-widest flex items-center justify-center gap-2 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'EXECUTING...' : 'SIGN IN'}</span>
              </button>
              
              <button type="button" className="w-full bg-transparent text-[#00FF00] hover:bg-[#00FF00]/10 transition-none py-3 px-4 font-pixel text-sm tracking-widest border-b-2 border-[#00FF00] rounded-none cursor-pointer text-center uppercase">
                Learn More
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Feature Highlight */}
      <div className="hidden lg:flex w-1/2 border-l-2 border-[#00FF00]/20 p-12 items-center justify-center relative z-10 bg-[#001100] overflow-hidden">
        
        {/* Decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff000a_1px,transparent_1px),linear-gradient(to_bottom,#00ff000a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="max-w-lg w-full border-2 border-[#00FF00]/20 p-10 relative bg-[#080808]/90 backdrop-blur-sm rounded-none">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00FF00]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00FF00]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00FF00]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00FF00]"></div>

          <div className="flex justify-between items-start mb-8">
            <Bell className="w-8 h-8 text-[#00FF00]" />
            <Bell className="w-8 h-8 text-[#00FF00]/10" />
          </div>

          <p className="text-lg leading-relaxed opacity-90 font-mono">
            No spam, no algorithmic sorting. Just the signal. Receive direct,
            secure drops from the organizers you trust. When the pager goes off,
            the move is happening.
          </p>

          <div className="mt-12 flex items-center gap-4 border-t-2 border-[#00FF00]/20 pt-8">
            <div className="w-12 h-12 border-2 border-[#00FF00] flex items-center justify-center bg-[#00FF00]/10 rounded-none">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider">@sysadmin</p>
              <p className="text-xs opacity-70 tracking-widest mt-1">SECURE_CHANNEL_ACTIVE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}