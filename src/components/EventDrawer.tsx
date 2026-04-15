import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Save, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface EventRecord {
  id: string;
  promoter_id: string;
  event_name: string;
  venue_name: string;
  address: string;
  start_time: string;
  end_time: string;
  artists: string;
  genres: string | null;
  event_description: string | null;
  arrival_instructions: string | null;
  ticket_link: string | null;
  status: string;
}

interface EventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: EventRecord | null;
}

// FIX: Moved outside the component to satisfy the exhaustive-deps linter
const defaultFormState = {
  event_name: '', venue_name: '', address: '', startDate: '', startTime: '', 
  endDate: '', endTime: '', artists: '', genres: '', event_description: '', 
  arrival_instructions: '', ticket_link: '', status: 'published',
};

export default function EventDrawer({ isOpen, onClose, onSuccess, eventToEdit }: EventDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormState);

  const parseLocalTime = (isoString: string) => {
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset() * 60000;
    const localISO = (new Date(d.getTime() - offset)).toISOString().slice(0, -1);
    return {
      date: localISO.split('T')[0],
      time: localISO.split('T')[1].substring(0, 5)
    };
  };

  useEffect(() => {
    if (isOpen && eventToEdit) {
      const start = parseLocalTime(eventToEdit.start_time);
      const end = parseLocalTime(eventToEdit.end_time);

      setFormData({
        event_name: eventToEdit.event_name,
        venue_name: eventToEdit.venue_name,
        address: eventToEdit.address,
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        artists: eventToEdit.artists,
        genres: eventToEdit.genres || '',
        event_description: eventToEdit.event_description || '',
        arrival_instructions: eventToEdit.arrival_instructions || '',
        ticket_link: eventToEdit.ticket_link || '',
        status: eventToEdit.status,
      });
      setError(null);
    } else if (isOpen && !eventToEdit) {
      setFormData(defaultFormState);
      setError(null);
    }
  }, [isOpen, eventToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Authentication error. Please log in again.');

      const start_time = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const end_time = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      const payload = {
        promoter_id: user.id,
        event_name: formData.event_name,
        venue_name: formData.venue_name,
        address: formData.address,
        start_time,
        end_time,
        artists: formData.artists,
        genres: formData.genres || null,
        event_description: formData.event_description || null,
        arrival_instructions: formData.arrival_instructions || null,
        ticket_link: formData.ticket_link || null,
        status: formData.status,
      };

      if (eventToEdit) {
        const { error: updateError } = await supabase.from('events').update(payload).eq('id', eventToEdit.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('events').insert([payload]);
        if (insertError) throw insertError;
      }

      setFormData(defaultFormState);
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save event data.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[#080808]/80 backdrop-blur-sm z-40" onClick={onClose} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#080808] border-l border-[#00FF00]/40 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.8)] text-[#00FF00] font-mono ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-[#00FF00]/20 flex justify-between items-center bg-[#00FF00]/5 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/50 to-[#00FF00]/0"></div>
          <h2 className="font-pixel text-2xl sm:text-3xl tracking-widest mt-1">
            {eventToEdit ? 'EDIT_EVENT' : 'CREATE_EVENT'}
          </h2>
          <button onClick={onClose} className="hover:text-[#080808] hover:bg-[#00FF00] p-2 transition-none cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 sm:p-8 scanlines relative">
          {error && (
            <div className="mb-6 p-4 border-2 border-[#00FF00] bg-[#00FF00] text-[#080808] font-bold text-xs uppercase tracking-widest relative z-10">
              [ ERR ] {error}
            </div>
          )}

          <form id="event-form" onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Event_Name *</label>
                <input 
                  type="text" name="event_name" required value={formData.event_name} onChange={handleChange}
                  className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 font-mono text-sm transition-none rounded-none" 
                  placeholder="OPERATION_NAME" 
                />
              </div>
              <div>
                <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Artists *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input 
                    type="text" name="artists" required value={formData.artists} onChange={handleChange}
                    className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 pl-10 pr-4 text-[#00FF00] placeholder-[#00FF00]/30 font-mono text-sm transition-none rounded-none" 
                    placeholder="COMMA_SEPARATED_LIST" 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 border-t-2 border-[#00FF00]/20 pt-6">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Start_Date *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                    <input 
                      type="date" name="startDate" required value={formData.startDate} onChange={handleChange}
                      className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 pl-10 pr-3 text-[#00FF00] font-mono text-sm [color-scheme:dark] transition-none rounded-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Start_Time *</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                    <input 
                      type="time" name="startTime" required value={formData.startTime} onChange={handleChange}
                      className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 pl-10 pr-3 text-[#00FF00] font-mono text-sm [color-scheme:dark] transition-none rounded-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">End_Date *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                    <input 
                      type="date" name="endDate" required value={formData.endDate} onChange={handleChange}
                      className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 pl-10 pr-3 text-[#00FF00] font-mono text-sm [color-scheme:dark] transition-none rounded-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">End_Time *</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                    <input 
                      type="time" name="endTime" required value={formData.endTime} onChange={handleChange}
                      className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 pl-10 pr-3 text-[#00FF00] font-mono text-sm [color-scheme:dark] transition-none rounded-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-[#00FF00]/20 pt-6">
              <div>
                <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Venue_Name *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                  <input 
                    type="text" name="venue_name" required value={formData.venue_name} onChange={handleChange}
                    className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 pl-10 pr-4 text-[#00FF00] placeholder-[#00FF00]/30 font-mono text-sm transition-none rounded-none" 
                    placeholder="SECURE_LOCATION_ID" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Address *</label>
                <input 
                  type="text" name="address" required value={formData.address} onChange={handleChange}
                  className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 font-mono text-sm transition-none rounded-none" 
                  placeholder="PHYSICAL_COORDINATES" 
                />
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-[#00FF00]/20 pt-6">
              <div>
                <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Description</label>
                <textarea 
                  name="event_description" rows={3} value={formData.event_description} onChange={handleChange}
                  className="w-full bg-transparent border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 px-4 text-[#00FF00] placeholder-[#00FF00]/30 font-mono text-sm resize-none transition-none rounded-none" 
                  placeholder="MISSION_DETAILS..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Status</label>
                <select 
                  name="status" value={formData.status} onChange={handleChange}
                  className="w-full bg-[#080808] border-2 border-[#00FF00]/50 focus:border-[#00FF00] outline-none py-3 px-4 text-[#00FF00] font-mono text-sm transition-none rounded-none appearance-none cursor-pointer"
                >
                  <option value="published">PUBLISHED</option>
                  <option value="draft">DRAFT</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t-2 border-[#00FF00]/20 bg-[#080808] relative z-10">
          <button 
            type="submit" form="event-form" disabled={isLoading}
            className="w-full bg-[#00FF00] text-[#080808] border-2 border-[#00FF00] hover:bg-[#080808] hover:text-[#00FF00] transition-none py-4 px-4 font-pixel text-xl sm:text-2xl tracking-widest flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-6 h-6" />
            <span className="mt-1">{isLoading ? 'EXECUTING...' : 'COMMIT_DATA'}</span>
          </button>
        </div>
      </div>
    </>
  );
}