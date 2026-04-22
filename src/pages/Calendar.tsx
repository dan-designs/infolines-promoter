import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Calendar as CalendarIcon, Users, Settings, 
  User as UserIcon, Plus, Key, LogOut, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// TYPE ISOLATION: Explicit import for verbatimModuleSyntax
import EventDrawer from '../components/EventDrawer';
import type { EventRecord } from '../components/EventDrawer';

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function CalendarView() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [eventToEdit, setEventToEdit] = useState<EventRecord | null>(null);
  
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setUserEmail(user.email ?? 'operator@infolines.sys');

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('promoter_id', user.id);

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

  // --- CALENDAR LOGIC ---
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarCells = [];
  
  // Fill empty padding days before the 1st of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  
  // Fill actual calendar days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(year, month, i));
  }

  // Fill empty padding days AFTER the end of the month to complete the visual grid
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  // Filter and chronologically sort events for a specific day cell
  const getEventsForDay = (day: Date) => {
    if (!day) return [];
    return events.filter(e => {
      const eDate = new Date(e.start_time);
      return eDate.getDate() === day.getDate() &&
             eDate.getMonth() === day.getMonth() &&
             eDate.getFullYear() === day.getFullYear();
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  return (
    <div className="h-screen flex scanlines crt-flicker bg-terminal-bg text-terminal-green font-mono selection:bg-terminal-green selection:text-black overflow-hidden">
      
      {/* Left Nav Rail */}
      <aside className="w-16 border-r border-terminal-green/20 flex flex-col items-center py-4 gap-8 z-20 bg-terminal-bg relative hidden sm:flex">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 flex items-center justify-center border border-terminal-green bg-terminal-green/10 mb-4 shadow-[0_0_10px_rgba(0,255,65,0.2)] cursor-pointer hover:bg-terminal-green/30 transition-colors"
        >
          <img src="https://res.cloudinary.com/datad8tms/image/upload/q_auto/f_auto/v1775571098/infolines-logo-bit_d1jmgr.svg" alt="Infolines" className="w-6 h-6 [image-rendering:pixelated]" />
        </button>
        <nav className="flex flex-col gap-4 w-full items-center">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 cursor-pointer">
            <Home className="w-5 h-5" />
          </button>
          {/* Active Nav State */}
          <button onClick={() => navigate('/calendar')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-black bg-terminal-green shadow-[0_0_10px_rgba(0,255,65,0.3)] cursor-pointer">
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/team')} className="w-10 h-10 flex items-center justify-center transition-colors relative group text-terminal-green hover:bg-terminal-green/20 cursor-pointer">
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

        <header className="h-16 border-b border-terminal-green/20 flex items-center justify-between px-4 sm:px-6 bg-terminal-bg/90 backdrop-blur-md relative z-20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-pixel text-base sm:text-lg tracking-widest mt-1">INFOLINES // CALENDAR</h1>
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
                        <Key className="w-4 h-4 opacity-70" /> UPDATE_PASSWORD
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

        {/* Calendar Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 relative z-10 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6">
            
            {/* Controls */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 border border-terminal-green/50 hover:bg-terminal-green/20 transition-colors cursor-pointer shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-2 border border-terminal-green/50 hover:bg-terminal-green/20 transition-colors cursor-pointer shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Month & Year Jump Pickers */}
                <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
                  <div className="relative flex items-center">
                    <select 
                      value={month} 
                      onChange={(e) => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(parseInt(e.target.value));
                        setCurrentDate(newDate);
                      }}
                      className="appearance-none bg-transparent border border-terminal-green/50 px-4 py-2 pr-8 hover:bg-terminal-green/10 text-terminal-green text-xs font-bold tracking-widest uppercase outline-none cursor-pointer transition-colors text-center"
                    >
                      {MONTH_NAMES.map((m, i) => (
                        <option key={m} value={i} className="bg-terminal-bg text-sm font-mono">{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                  </div>
                  <div className="relative flex items-center">
                    <select 
                      value={year} 
                      onChange={(e) => {
                        const newDate = new Date(currentDate);
                        newDate.setFullYear(parseInt(e.target.value));
                        setCurrentDate(newDate);
                      }}
                      className="appearance-none bg-transparent border border-terminal-green/50 px-4 py-2 pr-8 hover:bg-terminal-green/10 text-terminal-green text-xs font-bold tracking-widest uppercase outline-none cursor-pointer transition-colors text-center"
                    >
                      {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                        <option key={y} value={y} className="bg-terminal-bg text-sm font-mono">{y}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                  </div>
                </div>
              </div>
              <button 
                onClick={jumpToToday}
                className="px-4 py-2 border border-terminal-green/50 text-terminal-green text-xs font-bold tracking-widest uppercase hover:bg-terminal-green/10 transition-colors cursor-pointer hidden sm:block shrink-0"
              >
                RETURN_TO_PRESENT
              </button>
            </div>

            {/* Grid Container */}
            <div className="flex-1 flex flex-col min-h-[600px] lg:min-h-0 border border-terminal-green/30 bg-terminal-green/5">
              
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-terminal-green/30 bg-terminal-green/10 shrink-0">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="py-3 text-center text-xs font-bold tracking-widest uppercase border-r border-terminal-green/30 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Day Cells */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr h-full">
                {calendarCells.map((day, index) => {
                  const isToday = day && 
                    day.getDate() === new Date().getDate() && 
                    day.getMonth() === new Date().getMonth() && 
                    day.getFullYear() === new Date().getFullYear();

                  const dayEvents = day ? getEventsForDay(day) : [];

                  return (
                    <div 
                      key={index} 
                      className={`border-r border-b border-terminal-green/20 min-h-[100px] sm:min-h-[130px] p-1.5 sm:p-2.5 relative flex flex-col ${!day ? 'bg-terminal-bg/50' : 'hover:bg-terminal-green/10'} transition-colors`}
                    >
                      {day && (
                        <>
                          <span className={`text-[10px] sm:text-xs font-bold tracking-widest mb-1.5 inline-block w-max ${isToday ? 'bg-terminal-green text-black px-1.5 py-0.5' : 'opacity-70'}`}>
                            {day.getDate()}
                          </span>
                          
                          {/* Event Blocks Container */}
                          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {dayEvents.map((evt) => (
                              <div 
                                key={evt.id}
                                onClick={() => handleEditEvent(evt)}
                                className={`text-[10px] sm:text-xs border p-1 sm:p-1.5 truncate cursor-pointer transition-colors ${
                                  evt.status === 'cancelled' 
                                    ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' 
                                    : 'border-terminal-green/50 bg-terminal-green/10 hover:bg-terminal-green/30'
                                }`}
                                title={`${new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${evt.event_name}`}
                              >
                                <span className="opacity-70 mr-1.5">
                                  {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(' ', '')}
                                </span>
                                <span className="uppercase tracking-wider">{evt.event_name}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Scrollbar Styling for dense calendar days */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.3); }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.6); }
            `}</style>
          </div>
        </div>

        {/* Global FAB */}
        <button 
          onClick={handleCreateNew}
          className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 bg-terminal-green text-black flex items-center justify-center hover:bg-[#00cc33] transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:shadow-[0_0_30px_rgba(0,255,65,0.6)] z-30 group cursor-pointer"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </main>

      {/* Global Drawer */}
      <EventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={fetchEvents}
        eventToEdit={eventToEdit}
      />
      
    </div>
  );
}