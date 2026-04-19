import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Calendar as CalendarIcon, Users, Settings, 
  User as UserIcon, Key, LogOut, Terminal, Shield, Fingerprint
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Team() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? 'operator@infolines.sys');
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="h-screen flex scanlines crt-flicker bg-terminal-bg text-terminal-green font-mono selection:bg-terminal-green selection:text-black overflow-hidden">
      
      {/* Left Nav Rail */}
      <aside className="w-16 border-r border-terminal-green/20 flex flex-col items-center py-4 gap-8 z-20 bg-terminal-bg relative hidden sm:flex">
        <div className="w-10 h-10 flex items-center justify-center border border-terminal-green bg-terminal-green/10 mb-4 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
          <img src="https://res.cloudinary.com/datad8tms/image/upload/q_auto/f_auto/v1775571098/infolines-logo-bit_d1jmgr.svg" alt="Infolines" className="w-6 h-6 [image-rendering:pixelated]" />
        </div>
        <nav className="flex flex-col gap-4 w-full items-center">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 cursor-pointer">
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/calendar')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 cursor-pointer">
            <CalendarIcon className="w-5 h-5" />
          </button>
          {/* Active State */}
          <button onClick={() => navigate('/team')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-black bg-terminal-green shadow-[0_0_10px_rgba(0,255,65,0.3)] cursor-pointer">
            <Users className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 mt-auto cursor-pointer">
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-terminal-dark/10 via-terminal-bg to-terminal-bg">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4105_1px,transparent_1px),linear-gradient(to_bottom,#00ff4105_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 border-b border-terminal-green/20 flex items-center justify-between px-4 sm:px-6 bg-terminal-bg/90 backdrop-blur-md relative z-20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-pixel text-base sm:text-lg tracking-widest mt-1">INFOLINES // TEAM_MATRIX</h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
                className="w-9 h-9 border border-terminal-green/50 flex items-center justify-center hover:bg-terminal-green/20 transition-colors bg-terminal-green/10 cursor-pointer"
              >
                <UserIcon className="w-5 h-5" />
              </button>
              
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 border border-terminal-green/50 bg-terminal-bg shadow-[0_0_15px_rgba(0,255,65,0.2)] z-50">
                    <div className="p-4 border-b border-terminal-green/20 bg-terminal-green/5">
                      <p className="text-xs opacity-70 tracking-widest mb-1">LOGGED_IN_AS</p>
                      <p className="text-sm font-bold truncate">{userEmail}</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-terminal-green/10 transition-colors flex items-center gap-3 tracking-wider cursor-pointer">
                        <Key className="w-4 h-4 opacity-70" /> UPDATE_KEY
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-terminal-green/10 transition-colors flex items-center gap-3 text-red-500 hover:text-red-400 tracking-wider cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 opacity-70" /> DISCONNECT
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Active User Card */}
            <div className="border border-terminal-green/50 bg-terminal-green/5 p-6 relative group">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-terminal-green"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-terminal-green"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-terminal-green"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-terminal-green"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 border border-terminal-green/50 bg-terminal-green/10 flex items-center justify-center">
                  <Fingerprint className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Shield className="w-4 h-4 text-terminal-green" />
                      <span className="text-[10px] sm:text-xs tracking-widest uppercase bg-terminal-green text-black px-2 py-0.5">LEAD_OPERATOR</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-widest uppercase truncate">{userEmail}</h2>
                  </div>
                  
                  <div className="pt-2 border-t border-terminal-green/20">
                    <p className="text-xs opacity-60 tracking-widest uppercase mb-1">SYSTEM_UUID</p>
                    <p className="text-xs font-mono opacity-80 truncate">{userId || 'AUTHENTICATING...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Under Construction Notice */}
            <div className="border border-dashed border-terminal-green/30 p-12 bg-terminal-bg/50 text-center flex flex-col items-center justify-center relative">
              <Terminal className="w-12 h-12 mb-6 opacity-50 animate-pulse" />
              <h3 className="font-pixel text-xl sm:text-2xl tracking-widest mb-2 opacity-80">SUB-PROMOTER_MATRIX_OFFLINE</h3>
              <p className="text-sm opacity-50 tracking-widest max-w-md mx-auto leading-relaxed">
                Network expansion protocols are currently locked. Hierarchical team management and attendee virality controls are slated for upcoming deployment.
              </p>
              
              <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 bg-terminal-green/50 animate-ping"></div>
                <div className="w-2 h-2 bg-terminal-green/50 animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-terminal-green/50 animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}