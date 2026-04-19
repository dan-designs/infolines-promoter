import { useState, useEffect } from 'react';
import { X, Save, Building, Globe, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface PromoterSettings {
  id: string;
  org_name: string | null;
  default_event_propagation: string;
  default_venue_reveal: string;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeSection: 'account' | 'events' | null;
  currentSettings: PromoterSettings | null;
}

const PROPAGATION_OPTIONS = [
  "Always Visible", "3 Days", "5 Days", "1 Week", "2 Weeks", 
  "3 Weeks", "4 Weeks", "1 Month", "2 Months", "3 Months"
];

const VENUE_REVEAL_OPTIONS = [
  "Always Visible", "1 Hour", "3 Hours", "5 Hours", "8 Hours", 
  "12 Hours", "24 Hours", "2 Days", "3 Days", "5 Days", 
  "1 Week", "2 Weeks", "3 Weeks", "4 Weeks", "1 Month", "2 Months", "3 Months"
];

export default function SettingsDrawer({ isOpen, onClose, onSuccess, activeSection, currentSettings }: SettingsDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    org_name: '',
    default_event_propagation: 'Always Visible',
    default_venue_reveal: 'Always Visible',
  });

  useEffect(() => {
    if (isOpen && currentSettings) {
      setFormData({
        org_name: currentSettings.org_name || '',
        default_event_propagation: currentSettings.default_event_propagation || 'Always Visible',
        default_venue_reveal: currentSettings.default_venue_reveal || 'Always Visible',
      });
      setError(null);
    }
  }, [isOpen, currentSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication error.');

      // UPSERT the promoter settings
      const { error: upsertError } = await supabase
        .from('promoters')
        .upsert({
          id: user.id, // Primary key
          org_name: formData.org_name,
          default_event_propagation: formData.default_event_propagation,
          default_venue_reveal: formData.default_venue_reveal,
        });

      if (upsertError) throw upsertError;

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-terminal-bg border-l border-terminal-green/40 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.8)] text-terminal-green font-mono ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-terminal-green/20 flex justify-between items-center bg-terminal-green/5 relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-terminal-green/0 via-terminal-green/50 to-terminal-green/0"></div>
          <h2 className="font-pixel text-lg sm:text-xl tracking-widest mt-1 uppercase">
            UPDATE_{activeSection === 'account' ? 'ACCOUNT' : 'EVENTS'}
          </h2>
          <button onClick={onClose} className="hover:text-black hover:bg-terminal-green p-2 transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 sm:p-8 scanlines relative">
          {error && (
            <div className="mb-6 p-4 border border-terminal-green bg-terminal-green text-black font-bold text-xs uppercase tracking-widest relative z-10">
              [ ERR ] {error}
            </div>
          )}

          <form id="settings-form" onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* ACCOUNT SECTION FIELDS */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Organization_Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input 
                      type="text" name="org_name" value={formData.org_name} onChange={handleChange}
                      className="w-full bg-terminal-green/5 border border-terminal-green/50 focus:border-terminal-green focus:bg-terminal-green/10 outline-none py-3 pl-10 pr-4 text-terminal-green placeholder-terminal-green/30 font-mono text-sm transition-all rounded-none" 
                      placeholder="ENTER_PROMOTER_ALIAS" 
                    />
                  </div>
                  <p className="mt-2 text-[10px] opacity-60 uppercase tracking-widest">This alias will be visible to attendees on your event pages.</p>
                </div>
              </div>
            )}

            {/* EVENTS SECTION FIELDS */}
            {activeSection === 'events' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Default Event Feed Propagation</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                    <select 
                      name="default_event_propagation" value={formData.default_event_propagation} onChange={handleChange}
                      className="w-full bg-terminal-bg border border-terminal-green/50 focus:border-terminal-green focus:bg-terminal-green/10 outline-none py-3 pl-10 pr-4 text-terminal-green font-mono text-sm transition-all rounded-none appearance-none cursor-pointer"
                    >
                      {PROPAGATION_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-[10px] opacity-60 uppercase tracking-widest leading-relaxed">
                    Determines how far in advance an event appears on the attendee feed.
                  </p>
                </div>

                <div className="border-t border-terminal-green/20 pt-6">
                  <label className="block text-xs mb-2 opacity-80 tracking-widest uppercase">Default Venue/Address Reveal</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                    <select 
                      name="default_venue_reveal" value={formData.default_venue_reveal} onChange={handleChange}
                      className="w-full bg-terminal-bg border border-terminal-green/50 focus:border-terminal-green focus:bg-terminal-green/10 outline-none py-3 pl-10 pr-4 text-terminal-green font-mono text-sm transition-all rounded-none appearance-none cursor-pointer"
                    >
                      {VENUE_REVEAL_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-[10px] opacity-60 uppercase tracking-widest leading-relaxed">
                    Determines when precise coordinate data is decrypted for attendees. Prior to this, the location reads "Hidden By Organizer // Standby!".
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="p-6 border-t border-terminal-green/20 bg-terminal-bg relative z-10 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              className="col-span-2 sm:col-span-1 bg-transparent text-terminal-green border border-terminal-green/50 hover:bg-terminal-green/10 transition-colors py-3 px-4 font-pixel text-xs sm:text-sm tracking-widest disabled:opacity-50 cursor-pointer"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              form="settings-form"
              disabled={isLoading}
              className="col-span-2 sm:col-span-1 bg-terminal-green text-black border border-terminal-green hover:bg-[#00cc33] transition-colors py-3 px-4 font-pixel text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} /> 
              {isLoading ? 'EXECUTING...' : 'SAVE_CHANGES'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}