import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Calendar as CalendarIcon, Users, Settings as SettingsIcon, 
  User as UserIcon, Key, LogOut, Terminal, Edit3, ShieldAlert,
  Globe, Network, Users as TeamIcon, Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

import SettingsDrawer from '../components/SettingsDrawer';
import type { PromoterSettings } from '../components/SettingsDrawer';

export default function Settings() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<PromoterSettings | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'account' | 'events' | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email ?? 'operator@infolines.sys');
      
      const { data, error } = await supabase
        .from('promoters')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data && !error) {
        setSettings(data as PromoterSettings);
      } else if (error && error.code === 'PGRST116') {
        // No row exists yet, we initialize a default state locally
        setSettings({
          id: user.id,
          org_name: null,
          default_event_propagation: 'Always Visible',
          default_venue_reveal: 'Always Visible'
        });
      }
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const openDrawer = (section: 'account' | 'events') => {
    setActiveSection(section);
    setIsDrawerOpen(true);
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setPasswordMessage("RECOVERY_LINK_DISPATCHED");
      setTimeout(() => setPasswordMessage(null), 5000);
    } catch {
      // Opted for catch without (err) binding to satisfy strict ESLint rules
      setPasswordMessage("ERROR_DISPATCHING_LINK");
      setTimeout(() => setPasswordMessage(null), 5000);
    }
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
          <button onClick={() => navigate('/team')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 cursor-pointer">
            <Users className="w-5 h-5" />
          </button>
          {/* Active State */}
          <button onClick={() => navigate('/settings')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-black bg-terminal-green shadow-[0_0_10px_rgba(0,255,65,0.3)] cursor-pointer">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-terminal-dark/10 via-terminal-bg to-terminal-bg">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4105_1px,transparent_1px),linear-gradient(to_bottom,#00ff4105_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 border-b border-terminal-green/20 flex items-center justify-between px-4 sm:px-6 bg-terminal-bg/90 backdrop-blur-md relative z-20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-pixel text-base sm:text-lg tracking-widest mt-1">INFOLINES // SYSTEM_SETTINGS</h1>
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
          <div className="max-w-4xl mx-auto space-y-10 pb-24">
            
            {/* 1. USER & ACCOUNT */}
            <section className="relative group">
              <div className="border border-terminal-green/30 bg-terminal-green/5 p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 border-b border-terminal-green/20 pb-4">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-terminal-green" />
                    <h2 className="font-pixel text-xl sm:text-2xl tracking-widest mt-1">USER_AND_ACCOUNT</h2>
                  </div>
                  <button 
                    onClick={() => openDrawer('account')}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest border border-terminal-green/50 px-3 py-1.5 hover:bg-terminal-green/20 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> EDIT
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs opacity-60 tracking-widest uppercase mb-2">Organization_Name</p>
                    <p className="text-lg font-bold tracking-widest uppercase">{settings?.org_name || 'UNASSIGNED_ALIAS'}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-60 tracking-widest uppercase mb-2">Security_Protocol</p>
                    <button 
                      onClick={handlePasswordReset}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest bg-terminal-green/10 border border-terminal-green/50 px-4 py-2 hover:bg-terminal-green hover:text-black transition-colors cursor-pointer"
                    >
                      <Key className="w-4 h-4" /> DISPATCH_PASSWORD_RESET
                    </button>
                    {passwordMessage && (
                      <p className="text-[10px] text-terminal-green mt-2 uppercase tracking-widest animate-pulse">{passwordMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. EVENTS */}
            <section className="relative group">
              <div className="border border-terminal-green/30 bg-terminal-green/5 p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 border-b border-terminal-green/20 pb-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-terminal-green" />
                    <h2 className="font-pixel text-xl sm:text-2xl tracking-widest mt-1">EVENT_DEFAULTS</h2>
                  </div>
                  <button 
                    onClick={() => openDrawer('events')}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest border border-terminal-green/50 px-3 py-1.5 hover:bg-terminal-green/20 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> EDIT
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-xs opacity-60 tracking-widest uppercase mb-1">Feed_Propagation_Rule</p>
                    <p className="text-sm border-l-2 border-terminal-green/50 pl-3 py-1 bg-terminal-green/5 uppercase tracking-wider">{settings?.default_event_propagation}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-60 tracking-widest uppercase mb-1">Venue_Reveal_Rule</p>
                    <p className="text-sm border-l-2 border-terminal-green/50 pl-3 py-1 bg-terminal-green/5 uppercase tracking-wider">{settings?.default_venue_reveal}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. COMMUNITY */}
            <section className="relative group opacity-80">
              <div className="border border-dashed border-terminal-green/40 bg-terminal-bg/50 p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 border-b border-terminal-green/20 pb-4">
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-terminal-green" />
                    <h2 className="font-pixel text-xl sm:text-2xl tracking-widest mt-1">COMMUNITY_SCALING</h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest border border-terminal-green text-terminal-green px-2 py-1 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> COMING_SOON
                  </span>
                </div>
                
                <p className="text-xs opacity-60 uppercase tracking-widest mb-6 leading-relaxed">
                  Network expansion protocols are currently locked to Global Visibility during the initial onboarding phase.
                </p>

                <div className="space-y-4">
                  {/* Global Model */}
                  <label className="flex items-start gap-4 p-4 border border-terminal-green bg-terminal-green/10 cursor-not-allowed">
                    <div className="pt-0.5">
                      <input type="checkbox" checked readOnly className="appearance-none w-4 h-4 border border-terminal-green bg-terminal-green checked:bg-terminal-green outline-none" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4" />
                        <span className="font-bold tracking-widest uppercase text-sm">Global Visibility Model</span>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed">This model allows all Infolines attendee users to see your events as you build your community.</p>
                    </div>
                  </label>

                  {/* Community Model */}
                  <label className="flex items-start gap-4 p-4 border border-terminal-green/20 opacity-50 cursor-not-allowed">
                    <div className="pt-0.5">
                      <input type="checkbox" disabled className="appearance-none w-4 h-4 border border-terminal-green/50 outline-none" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold tracking-widest uppercase text-sm">Community Scale Model</span>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed">This model allows attendees to grant handshake permission to see your events in their feed. It is a great way to grow your community exponentially.</p>
                    </div>
                  </label>

                  {/* Team Model */}
                  <label className="flex items-start gap-4 p-4 border border-terminal-green/20 opacity-50 cursor-not-allowed">
                    <div className="pt-0.5">
                      <input type="checkbox" disabled className="appearance-none w-4 h-4 border border-terminal-green/50 outline-none" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TeamIcon className="w-4 h-4" />
                        <span className="font-bold tracking-widest uppercase text-sm">Team Scale Model</span>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed">This models empowers a core group of trusted sub-promoters to grant handshake permission to see your events in their feed. It is a great way to balance growth, safety, and crowd curation.</p>
                    </div>
                  </label>

                  {/* Solo Model */}
                  <label className="flex items-start gap-4 p-4 border border-terminal-green/20 opacity-50 cursor-not-allowed">
                    <div className="pt-0.5">
                      <input type="checkbox" disabled className="appearance-none w-4 h-4 border border-terminal-green/50 outline-none" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4" />
                        <span className="font-bold tracking-widest uppercase text-sm">Solo Scale Model</span>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed">This model keeps things locked down and only allows you as the organizer to grow your model and create the most hand-picked community based on your own judgement.</p>
                    </div>
                  </label>
                </div>
              </div>
            </section>

          </div>
        </div>

      </main>

      <SettingsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchSettings}
        activeSection={activeSection}
        currentSettings={settings}
      />
    </div>
  );
}