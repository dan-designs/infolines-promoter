import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.svg';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('success');
      setMessage('IF VERIFIED, RECOVERY SIGNAL SENT TO INBOX.');
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
          <div className="mb-10">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 mb-6 transition-none cursor-pointer"
            >
              <ArrowLeft size={12} /> ABORT_AND_RETURN
            </button>
            <h2 className="text-3xl font-pixel mb-3 tracking-wider">SYSTEM_RECOVERY</h2>
            <p className="text-[#00FF00]/70 text-sm tracking-wide">Initiate mainframe credential reset.</p>
          </div>

          {/* Status Display */}
          {status === 'error' && (
            <div className="mb-8 p-4 border-2 border-[#00FF00] bg-[#00FF00] text-[#080808] font-bold text-xs uppercase tracking-widest">
              [ ERR ] {message}
            </div>
          )}
          {status === 'success' && (
            <div className="mb-8 p-4 border-2 border-[#00FF00] text-[#00FF00] font-bold text-xs uppercase tracking-widest">
              [ OK ] {message}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleReset}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs opacity-80 uppercase tracking-widest font-bold">Operator Email</label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] focus:ring-0 outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 transition-none font-mono rounded-none"
                placeholder="operator@infolines.sys"
                required
                disabled={status === 'success' || status === 'loading'}
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={status === 'loading' || status === 'success'}
                className="w-full bg-[#00FF00] text-[#080808] border-2 border-[#00FF00] hover:bg-[#080808] hover:text-[#00FF00] transition-none py-4 px-4 font-pixel text-xl tracking-widest flex items-center justify-center gap-2 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{status === 'loading' ? 'TRANSMITTING...' : 'SEND SIGNAL'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Blank/Decorative for Recovery */}
      <div className="hidden lg:flex w-1/2 border-l-2 border-[#00FF00]/20 p-12 items-center justify-center relative z-10 bg-[#001100] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff000a_1px,transparent_1px),linear-gradient(to_bottom,#00ff000a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <Terminal className="w-32 h-32 text-[#00FF00]/10" />
      </div>
    </div>
  );
}