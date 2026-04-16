import { useEffect, useState, useCallback } from 'react';
import { 
  Home, Calendar as CalendarIcon, Users, Settings, 
  Search, User as UserIcon, Plus, Clock, Key, LogOut, MoreVertical
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// TYPE ISOLATION: Explicitly imports the type for Vercel's strict verbatimModuleSyntax
import EventDrawer from '../components/EventDrawer';
import type { EventRecord } from '../components/EventDrawer';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toISOString().split('T')[0];
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
};

// Internal EventCard Component
function EventCard({ 
  event, 
  opacity = "opacity-100", 
  borderStyle = "border-solid", 
  isReadOnly = false,
  onEdit,
  onDelete
}: { 
  event: EventRecord, 
  opacity?: string, 
  borderStyle?: string,
  isReadOnly?: boolean,
  onEdit?: (event: EventRecord) => void,
  onDelete?: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    if (menuOpen) window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [menuOpen]);

  // Strip interactivity if it is historical/read-only
  const interactiveStyles = isReadOnly 
    ? 'cursor-default' 
    : 'cursor-pointer hover:bg-terminal-green/10';

  return (
    <div className={`border border-terminal-green/30 ${borderStyle} p-5 bg-terminal-green/5 transition-colors relative group ${interactiveStyles} ${opacity}`}>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-terminal-green"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-terminal-green"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-terminal-green"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-terminal-green"></div>
      
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-bold tracking-wider truncate pr-2 text-lg uppercase">{event.event_name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 border border-terminal-green/50 bg-terminal-green/10 tracking-widest uppercase">
            {event.status}
          </span>
          
          {/* Action Menu (Hidden if Read-Only) */}
          {!isReadOnly && (
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="w-8 h-8 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-terminal-green/20 transition-colors cursor-pointer"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 w-32 border border-terminal-green/50 bg-terminal-bg shadow-[0_0_15px_rgba(0,255,65,0.2)] z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit?.(event); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold tracking-widest hover:bg-terminal-green/10 transition-colors cursor-pointer"
                  >
                    EDIT_DATA
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(event.id); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold tracking-widest text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    PURGE_EVENT
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm opacity-80 font-mono">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-4 h-4 text-terminal-green/70" />
          <span>{formatDate(event.start_time)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-terminal-green/70" />
          <span>{formatTime(event.start_time)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [eventToEdit, setEventToEdit] = useState<EventRecord | null>(null);

  const fetchEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setUserEmail(user.email ?? 'operator@infolines.sys');

    // Strict boundary: Only fetches events owned by the authenticated UUID
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('promoter_id', user.id)
      .order('start_time', { ascending: true });

    if (data && !error) {
      setEvents(data as EventRecord[]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) await fetchEvents();
    };
    loadData();
    return () => { mounted = false; };
  }, [fetchEvents]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateNew = () => {
    setEventToEdit(null);
    setIsDrawerOpen(true);
  };

  const handleEditEvent = (event: EventRecord) => {
    setEventToEdit(event);
    setIsDrawerOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("WARNING: Confirm deletion of this event record? This cannot be undone.")) {
      await supabase.from('events').delete().eq('id', id);
      fetchEvents();
    }
  };

  const now = new Date();
  
  const futureEvents = events.filter(e => new Date(e.start_time) >= now && e.status !== 'cancelled');
  const history = events.filter(e => new Date(e.start_time) < now || e.status === 'cancelled');

  return (
    <div className="h-screen flex scanlines crt-flicker bg-terminal-bg text-terminal-green font-mono selection:bg-terminal-green selection:text-black overflow-hidden">
      
      {/* Left Nav Rail */}
      <aside className="w-16 border-r border-terminal-green/20 flex flex-col items-center py-4 gap-8 z-20 bg-terminal-bg relative hidden sm:flex">
        <div className="w-10 h-10 flex items-center justify-center border border-terminal-green bg-terminal-green/10 mb-4 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
          <img src="https://res.cloudinary.com/datad8tms/image/upload/q_auto/f_auto/v1775571098/infolines-logo-bit_d1jmgr.svg" alt="Infolines" className="w-6 h-6 [image-rendering:pixelated]" />
        </div>
        <nav className="flex flex-col gap-4 w-full items-center">
          <button className="w-10 h-10 flex items-center justify-center transition-colors relative group text-black bg-terminal-green shadow-[0_0_10px_rgba(0,255,65,0.3)] cursor-pointer">
            <Home className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 cursor-pointer">
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 cursor-pointer">
            <Users className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 mt-auto cursor-pointer">
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-terminal-dark/10 via-terminal-bg to-terminal-bg">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff4105_1px,transparent_1px),linear-gradient(to_bottom,#00ff4105_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

        <header className="h-16 border-b border-terminal-green/20 flex items-center justify-between px-4 sm:px-6 bg-terminal-bg/90 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-4">
            <h1 className="font-pixel text-base sm:text-lg tracking-widest mt-1">INFOLINES // DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input 
                type="text" 
                placeholder="SEARCH_EVENTS..." 
                className="w-full bg-terminal-green/5 border border-terminal-green/30 pl-10 pr-4 py-1.5 text-sm focus:border-terminal-green focus:bg-terminal-green/10 focus:outline-none placeholder-terminal-green/30 transition-all font-mono" 
              />
            </div>
            
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

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 relative z-10">
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 pb-24">
            
            <section>
              <div className="flex items-center gap-4 mb-6 border-b border-terminal-green/20 pb-3">
                <div className="w-2 h-2 bg-terminal-green animate-pulse"></div>
                <h2 className="font-pixel text-lg sm:text-xl tracking-widest mt-1">FUTURE_EVENTS</h2>
              </div>
              {futureEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {futureEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEdit={handleEditEvent} 
                      onDelete={handleDeleteEvent} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-50 font-mono tracking-widest border border-dashed border-terminal-green/30 p-8 text-center bg-terminal-green/5">NO_ACTIVE_SIGNALS_DETECTED</p>
              )}
            </section>

            <section>
              <div className="flex items-center gap-4 mb-6 border-b border-terminal-green/20 pb-3 opacity-60">
                <div className="w-2 h-2 bg-terminal-green/50"></div>
                <h2 className="font-pixel text-lg sm:text-xl tracking-widest mt-1">EVENT_HISTORY</h2>
              </div>
              {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {history.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      opacity="opacity-50 grayscale" 
                      isReadOnly={true} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-50 font-mono tracking-widest border border-dashed border-terminal-green/30 p-8 text-center bg-terminal-green/5">NO_ARCHIVE_DATA_FOUND</p>
              )}
            </section>
            
          </div>
        </div>

        <button 
          onClick={handleCreateNew}
          className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 bg-terminal-green text-black flex items-center justify-center hover:bg-[#00cc33] transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:shadow-[0_0_30px_rgba(0,255,65,0.6)] z-30 group cursor-pointer"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </main>

      <EventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={fetchEvents}
        eventToEdit={eventToEdit}
      />
      
    </div>
  );
}