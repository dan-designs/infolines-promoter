import { useState } from 'react';
import { Lock } from 'lucide-react';
import logo from '../assets/logo.svg';
import { supabase } from '../lib/supabase';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Explicit Frontend Error Handling for Mismatched Passwords
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('PASSWORDS DO NOT MATCH. VERIFY INPUT.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('PASSWORD MUST BE AT LEAST 6 CHARACTERS.');
      return;
    }

    setStatus('loading');
    setMessage(null);

    // 2. Update the password via Supabase
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      // 3. Destroy the token session so they are forced to log in fresh
      await supabase.auth.signOut();
      
      // 4. Trigger the static success UI
      setStatus('success');
    }
  };

  return (
    <div className="min-h-screen flex scanlines crt-flicker bg-[#080808] text-[#00FF00] font-mono selection:bg-[#00FF00] selection:text-[#080808]">
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
          
          {/* Default Form State */}
          {status !== 'success' ? (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-pixel mb-3 tracking-wider">UPADATE_PASSWORD</h2>
                <p className="text-[#00FF00]/70 text-sm tracking-wide">Establish new operator passcode.</p>
              </div>

              {/* Error Display */}
              {status === 'error' && (
                <div className="mb-8 p-4 border-2 border-[#00FF00] bg-[#00FF00] text-[#080808] font-bold text-xs uppercase tracking-widest">
                  [ ERR ] {message}
                </div>
              )}

              <form className="space-y-8" onSubmit={handleUpdate}>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs opacity-80 uppercase tracking-widest font-bold">New Password</label>
                  <input 
                    id="password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] focus:ring-0 outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 transition-none font-mono tracking-widest rounded-none"
                    placeholder="••••••••"
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-xs opacity-80 uppercase tracking-widest font-bold">Confirm Password</label>
                  <input 
                    id="confirmPassword"
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] focus:ring-0 outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 transition-none font-mono tracking-widest rounded-none"
                    placeholder="••••••••"
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full bg-[#00FF00] text-[#080808] border-2 border-[#00FF00] hover:bg-[#080808] hover:text-[#00FF00] transition-none py-4 px-4 font-pixel text-xl tracking-widest flex items-center justify-center gap-2 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{status === 'loading' ? 'EXECUTING...' : 'COMMIT CHANGE'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            
            /* SUCCESS STATE: Static Routing Instructions */
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-pixel mb-3 tracking-wider text-[#00FF00]">SYSTEM_UPDATED</h2>
                <p className="text-[#00FF00]/70 text-sm tracking-wide">Your passcode has been securely rewritten.</p>
              </div>

              <div className="p-4 border-2 border-[#00FF00] text-[#00FF00] font-bold text-xs uppercase tracking-widest mb-8">
                [ OK ] CREDENTIALS ACCEPTED. SESSION CLEARED.
              </div>

              <div className="space-y-10 border-t-2 border-[#00FF00]/20 pt-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-pixel text-lg tracking-widest mb-3">PROMOTERS</h3>
                    <p className="text-sm opacity-80 font-mono leading-relaxed">
                      Navigate back to <span className="text-[#00FF00] font-bold">www.infolines.app</span> to authenticate with your new credentials.
                    </p>
                  </div>
                  <a 
                    href="https://www.infolines.app"
                    className="w-full bg-[#00FF00] text-[#080808] border-2 border-[#00FF00] hover:bg-[#080808] hover:text-[#00FF00] transition-none py-4 px-4 font-pixel text-xl tracking-widest flex items-center justify-center text-center rounded-none cursor-pointer block"
                  >
                    PROMOTER_LOGIN
                  </a>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-pixel text-lg tracking-widest mb-3">ATTENDEES</h3>
                    <p className="text-sm opacity-80 font-mono leading-relaxed">
                      Tap the ATTENDEE_LOGIN below to navigate back to the Infolines App.
                    </p>
                  </div>
                  <a 
                    href="infolines://"
                    className="w-full bg-[#00FF00] text-[#080808] border-2 border-[#00FF00] hover:bg-[#080808] hover:text-[#00FF00] transition-none py-4 px-4 font-pixel text-xl tracking-widest flex items-center justify-center text-center rounded-none cursor-pointer block"
                  >
                    ATTENDEE_LOGIN
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Blank/Decorative */}
      <div className="hidden lg:flex w-1/2 border-l-2 border-[#00FF00]/20 p-12 items-center justify-center relative z-10 bg-[#001100] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff000a_1px,transparent_1px),linear-gradient(to_bottom,#00ff000a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <Lock className="w-32 h-32 text-[#00FF00]/10" />
      </div>
    </div>
  );
}