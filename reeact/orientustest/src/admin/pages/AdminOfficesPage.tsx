import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { officeService } from '../../services/officeService';
import type { Office, OfficeRequest, ContactMessage } from '../../services/officeService';

/** Pre-defined country list with capital cities and map coordinates */
const COUNTRY_DATA: { code: string; name: string; city: string; lat: number; lng: number }[] = [
  { code: 'AF', name: 'Afghanistan', city: 'Kabul', lat: 34.5553, lng: 69.2075 },
  { code: 'AL', name: 'Albania', city: 'Tirana', lat: 41.3275, lng: 19.8189 },
  { code: 'DZ', name: 'Algeria', city: 'Algiers', lat: 36.7538, lng: 3.0588 },
  { code: 'AD', name: 'Andorra', city: 'Andorra la Vella', lat: 42.5063, lng: 1.5218 },
  { code: 'AO', name: 'Angola', city: 'Luanda', lat: -8.8390, lng: 13.2894 },
  { code: 'AR', name: 'Argentina', city: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { code: 'AM', name: 'Armenia', city: 'Yerevan', lat: 40.1792, lng: 44.4991 },
  { code: 'AU', name: 'Australia', city: 'Canberra', lat: -35.2809, lng: 149.1300 },
  { code: 'AT', name: 'Austria', city: 'Vienna', lat: 48.2082, lng: 16.3738 },
  { code: 'AZ', name: 'Azerbaijan', city: 'Baku', lat: 40.4093, lng: 49.8671 },
  { code: 'BH', name: 'Bahrain', city: 'Manama', lat: 26.2285, lng: 50.5860 },
  { code: 'BD', name: 'Bangladesh', city: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { code: 'BY', name: 'Belarus', city: 'Minsk', lat: 53.9006, lng: 27.5590 },
  { code: 'BE', name: 'Belgium', city: 'Brussels', lat: 50.8503, lng: 4.3517 },
  { code: 'BA', name: 'Bosnia and Herzegovina', city: 'Sarajevo', lat: 43.8563, lng: 18.4131 },
  { code: 'BR', name: 'Brazil', city: 'Brasília', lat: -15.7975, lng: -47.8919 },
  { code: 'BG', name: 'Bulgaria', city: 'Sofia', lat: 42.6977, lng: 23.3219 },
  { code: 'CA', name: 'Canada', city: 'Ottawa', lat: 45.4215, lng: -75.6972 },
  { code: 'CL', name: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
  { code: 'CN', name: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { code: 'CO', name: 'Colombia', city: 'Bogotá', lat: 4.7110, lng: -74.0721 },
  { code: 'HR', name: 'Croatia', city: 'Zagreb', lat: 45.8150, lng: 15.9819 },
  { code: 'CY', name: 'Cyprus', city: 'Nicosia', lat: 35.1856, lng: 33.3823 },
  { code: 'CZ', name: 'Czech Republic', city: 'Prague', lat: 50.0755, lng: 14.4378 },
  { code: 'DK', name: 'Denmark', city: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
  { code: 'EG', name: 'Egypt', city: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { code: 'EE', name: 'Estonia', city: 'Tallinn', lat: 59.4370, lng: 24.7536 },
  { code: 'FI', name: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
  { code: 'FR', name: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
  { code: 'GE', name: 'Georgia', city: 'Tbilisi', lat: 41.7151, lng: 44.8271 },
  { code: 'DE', name: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { code: 'GR', name: 'Greece', city: 'Athens', lat: 37.9838, lng: 23.7275 },
  { code: 'HU', name: 'Hungary', city: 'Budapest', lat: 47.4979, lng: 19.0402 },
  { code: 'IS', name: 'Iceland', city: 'Reykjavik', lat: 64.1466, lng: -21.9426 },
  { code: 'IN', name: 'India', city: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { code: 'ID', name: 'Indonesia', city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { code: 'IR', name: 'Iran', city: 'Tehran', lat: 35.6892, lng: 51.3890 },
  { code: 'IQ', name: 'Iraq', city: 'Baghdad', lat: 33.3152, lng: 44.3661 },
  { code: 'IE', name: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
  { code: 'IL', name: 'Israel', city: 'Jerusalem', lat: 31.7683, lng: 35.2137 },
  { code: 'IT', name: 'Italy', city: 'Rome', lat: 41.9028, lng: 12.4964 },
  { code: 'JP', name: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { code: 'JO', name: 'Jordan', city: 'Amman', lat: 31.9454, lng: 35.9284 },
  { code: 'KZ', name: 'Kazakhstan', city: 'Astana', lat: 51.1694, lng: 71.4491 },
  { code: 'KE', name: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { code: 'KR', name: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780 },
  { code: 'KW', name: 'Kuwait', city: 'Kuwait City', lat: 29.3759, lng: 47.9774 },
  { code: 'KG', name: 'Kyrgyzstan', city: 'Bishkek', lat: 42.8746, lng: 74.5698 },
  { code: 'LV', name: 'Latvia', city: 'Riga', lat: 56.9496, lng: 24.1052 },
  { code: 'LB', name: 'Lebanon', city: 'Beirut', lat: 33.8938, lng: 35.5018 },
  { code: 'LY', name: 'Libya', city: 'Tripoli', lat: 32.9866, lng: 13.1897 },
  { code: 'LT', name: 'Lithuania', city: 'Vilnius', lat: 54.6872, lng: 25.2797 },
  { code: 'LU', name: 'Luxembourg', city: 'Luxembourg', lat: 49.6117, lng: 6.1319 },
  { code: 'MY', name: 'Malaysia', city: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
  { code: 'MT', name: 'Malta', city: 'Valletta', lat: 35.8989, lng: 14.5146 },
  { code: 'MX', name: 'Mexico', city: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { code: 'MD', name: 'Moldova', city: 'Chișinău', lat: 47.0105, lng: 28.8638 },
  { code: 'MN', name: 'Mongolia', city: 'Ulaanbaatar', lat: 47.8864, lng: 106.9057 },
  { code: 'ME', name: 'Montenegro', city: 'Podgorica', lat: 42.4304, lng: 19.2594 },
  { code: 'MA', name: 'Morocco', city: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { code: 'NL', name: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { code: 'NZ', name: 'New Zealand', city: 'Wellington', lat: -41.2865, lng: 174.7762 },
  { code: 'NG', name: 'Nigeria', city: 'Abuja', lat: 9.0579, lng: 7.4951 },
  { code: 'MK', name: 'North Macedonia', city: 'Skopje', lat: 41.9973, lng: 21.4280 },
  { code: 'NO', name: 'Norway', city: 'Oslo', lat: 59.9139, lng: 10.7522 },
  { code: 'OM', name: 'Oman', city: 'Muscat', lat: 23.5880, lng: 58.3829 },
  { code: 'PK', name: 'Pakistan', city: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { code: 'PS', name: 'Palestine', city: 'Ramallah', lat: 31.9038, lng: 35.2034 },
  { code: 'PE', name: 'Peru', city: 'Lima', lat: -12.0464, lng: -77.0428 },
  { code: 'PH', name: 'Philippines', city: 'Manila', lat: 14.5995, lng: 120.9842 },
  { code: 'PL', name: 'Poland', city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
  { code: 'PT', name: 'Portugal', city: 'Lisbon', lat: 38.7223, lng: -9.1393 },
  { code: 'QA', name: 'Qatar', city: 'Doha', lat: 25.2854, lng: 51.5310 },
  { code: 'RO', name: 'Romania', city: 'Bucharest', lat: 44.4268, lng: 26.1025 },
  { code: 'RU', name: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { code: 'SA', name: 'Saudi Arabia', city: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { code: 'SN', name: 'Senegal', city: 'Dakar', lat: 14.7167, lng: -17.4677 },
  { code: 'RS', name: 'Serbia', city: 'Belgrade', lat: 44.7866, lng: 20.4489 },
  { code: 'SG', name: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { code: 'SK', name: 'Slovakia', city: 'Bratislava', lat: 48.1486, lng: 17.1077 },
  { code: 'SI', name: 'Slovenia', city: 'Ljubljana', lat: 46.0569, lng: 14.5058 },
  { code: 'ZA', name: 'South Africa', city: 'Pretoria', lat: -25.7479, lng: 28.2293 },
  { code: 'ES', name: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { code: 'SD', name: 'Sudan', city: 'Khartoum', lat: 15.5007, lng: 32.5599 },
  { code: 'SE', name: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { code: 'CH', name: 'Switzerland', city: 'Bern', lat: 46.9480, lng: 7.4474 },
  { code: 'SY', name: 'Syria', city: 'Damascus', lat: 33.5138, lng: 36.2765 },
  { code: 'TJ', name: 'Tajikistan', city: 'Dushanbe', lat: 38.5598, lng: 68.7738 },
  { code: 'TH', name: 'Thailand', city: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { code: 'TN', name: 'Tunisia', city: 'Tunis', lat: 36.8065, lng: 10.1815 },
  { code: 'TR', name: 'Turkey', city: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { code: 'TM', name: 'Turkmenistan', city: 'Ashgabat', lat: 37.9601, lng: 58.3261 },
  { code: 'UA', name: 'Ukraine', city: 'Kyiv', lat: 50.4501, lng: 30.5234 },
  { code: 'AE', name: 'United Arab Emirates', city: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
  { code: 'GB', name: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
  { code: 'US', name: 'United States', city: 'Washington D.C.', lat: 38.9072, lng: -77.0369 },
  { code: 'UZ', name: 'Uzbekistan', city: 'Tashkent', lat: 41.2995, lng: 69.2401 },
  { code: 'VN', name: 'Vietnam', city: 'Hanoi', lat: 21.0278, lng: 105.8342 },
  { code: 'YE', name: 'Yemen', city: 'Sana\'a', lat: 15.3694, lng: 44.1910 },
];

const emptyForm: OfficeRequest = {
  name: '', city: '', address: '', phone: '', email: '',
  workingHours: '', website: '', facebook: '', instagram: '',
  latitude: 0, longitude: 0,
};

const AdminOfficesPage = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'offices' | 'messages'>('offices');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [formData, setFormData] = useState<OfficeRequest>(emptyForm);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchOffices();
    fetchMessages();
  }, []);

  const fetchOffices = async () => {
    try {
      const data = await officeService.getAllOffices();
      setOffices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offices');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await officeService.getAllMessages();
      setMessages(data);
    } catch { /* silent */ }
  };

  const openCreateModal = () => {
    setEditingOffice(null);
    setFormData(emptyForm);
    setSelectedCountryCode('');
    setShowModal(true);
  };

  const openEditModal = (office: Office) => {
    setEditingOffice(office);
    setFormData({
      name: office.name, city: office.city, address: office.address,
      phone: office.phone, email: office.email, workingHours: office.workingHours,
      website: office.website || '', facebook: office.facebook || '',
      instagram: office.instagram || '', latitude: office.latitude, longitude: office.longitude,
    });
    // Try to match existing office to a country code
    const match = COUNTRY_DATA.find(c => c.name === office.name);
    setSelectedCountryCode(match?.code || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (editingOffice) {
        await officeService.updateOffice(editingOffice.id, formData);
        setSuccess('Office updated successfully!');
      } else {
        await officeService.createOffice(formData);
        setSuccess('Office created successfully!');
      }
      setShowModal(false);
      await fetchOffices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save office');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await officeService.deleteOffice(id);
      setSuccess('Office deleted successfully!');
      setDeleteConfirm(null);
      await fetchOffices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete office');
    }
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleMarkRead = async (id: number) => {
    try {
      await officeService.markMessageAsRead(id);
      await fetchMessages();
    } catch { /* silent */ }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      await officeService.deleteMessage(id);
      await fetchMessages();
    } catch { /* silent */ }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountryCode(code);
    const country = COUNTRY_DATA.find(c => c.code === code);
    if (country) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || country.name,
        city: prev.city || country.city,
        latitude: country.lat,
        longitude: country.lng,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Management</h1>
          <p className="text-slate-400 mt-1">Manage office locations and contact messages</p>
        </div>
        {activeTab === 'offices' && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-violet-500/25 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Office
          </motion.button>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-medium">
          ✅ {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium">
          ❌ {error}
          <button onClick={() => setError('')} className="ml-3 text-red-300 hover:text-white">✕</button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl w-fit">
        {(['offices', 'messages'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}>
            {tab === 'offices' ? `📍 Offices (${offices.length})` : `📧 Messages (${messages.filter(m => m.status === 'NEW').length})`}
          </button>
        ))}
      </div>

      {/* OFFICES TAB */}
      {activeTab === 'offices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {offices.map(office => (
            <motion.div key={office.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-violet-500/30 transition-all">
              <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 px-5 py-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{office.name}</h3>
                  <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">{office.city}</span>
                </div>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {office.address && <p className="text-slate-300 flex items-start gap-2"><span className="text-slate-500">📍</span>{office.address}</p>}
                {office.phone && <p className="text-slate-300 flex items-center gap-2"><span className="text-slate-500">📞</span>{office.phone}</p>}
                {office.email && <p className="text-slate-300 flex items-center gap-2"><span className="text-slate-500">✉️</span>{office.email}</p>}
                <p className="text-slate-400 text-xs">Lat: {office.latitude}, Lng: {office.longitude}</p>
                <div className="flex items-center gap-2 pt-2">
                  {office.facebook && <a href={office.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs">Facebook</a>}
                  {office.instagram && <a href={office.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 text-xs">Instagram</a>}
                </div>
              </div>
              <div className="px-5 pb-4 flex gap-2">
                <button onClick={() => openEditModal(office)}
                  className="flex-1 px-3 py-2 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600/30 transition-colors text-sm font-medium">
                  ✏️ Edit
                </button>
                {deleteConfirm === office.id ? (
                  <>
                    <button onClick={() => handleDelete(office.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                      Confirm
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(office.id)}
                    className="flex-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium">
                    🗑️ Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {offices.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <p className="text-4xl mb-4">🏢</p>
              <p className="text-lg font-medium">No offices yet</p>
              <p className="text-sm mt-1">Click "Add Office" to create your first office location.</p>
            </div>
          )}
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="space-y-3">
          {messages.map(msg => (
            <motion.div key={msg.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`bg-slate-800/50 rounded-xl border p-5 ${msg.status === 'NEW' ? 'border-violet-500/30' : 'border-slate-700/50'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{msg.name}</h4>
                    {msg.status === 'NEW' && <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full font-medium">NEW</span>}
                    <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-1">📧 {msg.email}</p>
                  <p className="text-sm text-violet-400 font-medium mb-2">Subject: {msg.subject}</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {msg.status === 'NEW' && (
                    <button onClick={() => handleMarkRead(msg.id)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Mark as read">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  )}
                  <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Reply">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </a>
                  <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-lg font-medium">No messages yet</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-white">{editingOffice ? 'Edit Office' : 'Add New Office'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Country Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">🌍 Select Country *</label>
                  <select value={selectedCountryCode} onChange={handleCountrySelect}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all">
                    <option value="">-- Choose a country --</option>
                    {COUNTRY_DATA.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.city})</option>
                    ))}
                  </select>
                  {selectedCountryCode && (
                    <p className="mt-1.5 text-xs text-violet-400">
                      📍 Coordinates auto-filled: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                {/* Office Name & City (auto-filled but editable) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Office Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Morocco"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Casablanca"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all" />
                  </div>
                </div>

                {/* Other fields */}
                {([
                  { label: 'Address', name: 'address', type: 'text', placeholder: 'Full address...' },
                  { label: 'Phone', name: 'phone', type: 'text', placeholder: '+212 5XX XXX XXX' },
                  { label: 'Email', name: 'email', type: 'email', placeholder: 'office@orientus.com' },
                  { label: 'Working Hours', name: 'workingHours', type: 'text', placeholder: 'Mon-Fri: 9AM - 6PM' },
                  { label: 'Website', name: 'website', type: 'url', placeholder: 'https://...' },
                  { label: 'Facebook URL', name: 'facebook', type: 'url', placeholder: 'https://facebook.com/...' },
                  { label: 'Instagram URL', name: 'instagram', type: 'url', placeholder: 'https://instagram.com/...' },
                ] as const).map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
                    <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" />
                  </div>
                ))}
              </div>
              <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 font-medium">Cancel</button>
                <button onClick={handleSave} disabled={isSaving || !formData.name}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 hover:shadow-lg transition-all">
                  {isSaving ? 'Saving...' : editingOffice ? 'Update Office' : 'Create Office'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminOfficesPage;
