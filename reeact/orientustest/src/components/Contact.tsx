import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ContactCard from './ContactCard';
import GoogleMapComponent from './GoogleMapComponent';
import { officeService } from '../services/officeService';
import type { Office } from '../services/officeService';
import type { CountryContact } from '../data/countryContacts';
import { defaultContact } from '../data/countryContacts';

/**
 * Convert an Office entity from the backend into the CountryContact shape
 * used by GoogleMapComponent and ContactCard.
 */
const officeToCountryContact = (office: Office): CountryContact => ({
  id: String(office.id),
  name: office.name,
  city: office.city || '',
  address: office.address || '',
  phone: office.phone || '',
  email: office.email || '',
  workingHours: office.workingHours || '',
  website: office.website,
  facebook: office.facebook,
  instagram: office.instagram,
  coordinates: { lat: office.latitude, lng: office.longitude },
});

const Contact = () => {
  const [offices, setOffices] = useState<CountryContact[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryContact>(defaultContact);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');

  // Fetch offices from backend
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const data = await officeService.getAllOffices();
        const mapped = data.map(officeToCountryContact);
        setOffices(mapped);
        if (mapped.length > 0) {
          setSelectedCountry(mapped[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offices');
        // Fallback: keep using defaultContact
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffices();
  }, []);

  const handleCountryClick = (countryId: string) => {
    const country = offices.find(c => c.id === countryId);
    if (country) {
      setSelectedCountry(country);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormMessage('');
    try {
      const result = await officeService.submitContactForm(formData);
      setFormStatus('success');
      setFormMessage(result.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setFormStatus('error');
      setFormMessage(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Global Presence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a country on the map to view our local office contact information
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && offices.length === 0 && (
          <div className="text-center py-8 text-red-600 bg-red-50 rounded-xl mb-8">
            <p className="font-semibold">Unable to load offices</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Map + Contact Card Grid */}
        {!isLoading && offices.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Interactive World Map */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 border-2 border-blue-200 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Our Offices</h3>
                    <p className="text-sm text-gray-600">Click on a country marker to see contact details</p>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                </div>
              
                {/* Google Maps */}
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <GoogleMapComponent
                    countryContacts={offices}
                    selectedCountry={selectedCountry}
                    onCountryClick={handleCountryClick}
                  />
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-lg shadow-sm"></div>
                    <span className="text-gray-700 font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-300 rounded-lg shadow-sm"></div>
                    <span className="text-gray-700 font-medium">Hover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 rounded-lg shadow-sm border-2 border-yellow-900"></div>
                    <span className="text-gray-700 font-medium">Available</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <AnimatePresence mode="wait">
                <ContactCard key={selectedCountry.id} contact={selectedCountry} />
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Quick Contact List */}
        {!isLoading && offices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Quick Access to Our Offices</h3>
              <p className="text-gray-600">Select any location to view detailed contact information</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {offices.map((country, index) => (
                <motion.button
                  key={country.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCountryClick(country.id)}
                  className={`group relative p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                    selectedCountry.id === country.id
                      ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-blue-800 shadow-2xl'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-blue-400 hover:shadow-xl'
                  }`}
                >
                  {/* Background decoration */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-opacity ${
                    selectedCountry.id === country.id ? 'bg-white opacity-10' : 'bg-blue-200 opacity-0 group-hover:opacity-30'
                  }`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedCountry.id === country.id 
                          ? 'bg-white bg-opacity-20' 
                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        <svg className={`w-6 h-6 ${selectedCountry.id === country.id ? 'text-white' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      
                      {selectedCountry.id === country.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold"
                        >
                          Active
                        </motion.div>
                      )}
                    </div>
                    
                    <h4 className="text-xl font-bold mb-2">{country.name}</h4>
                    <p className={`text-sm mb-4 ${selectedCountry.id === country.id ? 'text-blue-100' : 'text-gray-600'}`}>
                      {country.address.split(',')[0]}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${selectedCountry.id === country.id ? 'text-blue-100' : 'text-blue-600'}`}>
                        View Details
                      </span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${selectedCountry.id === country.id ? '' : 'group-hover:translate-x-1'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================== */}
        {/* Contact Form Section */}
        {/* ======================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Send Us a Message</h3>
              <p className="text-gray-600">Have a question? Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-transparent rounded-tr-full opacity-60"></div>

              <form onSubmit={handleFormSubmit} className="relative z-10 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-800 placeholder-gray-400"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-bold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-800 bg-white"
                  >
                    <option value="">Select a subject...</option>
                    <option value="Study Abroad Inquiry">Study Abroad Inquiry</option>
                    <option value="Program Information">Program Information</option>
                    <option value="Application Assistance">Application Assistance</option>
                    <option value="Scholarship Information">Scholarship Information</option>
                    <option value="Visa Assistance">Visa Assistance</option>
                    <option value="Partnership Inquiry">Partnership Inquiry</option>
                    <option value="General Question">General Question</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-bold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    rows={5}
                    placeholder="Tell us about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-800 placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Status Messages */}
                {formStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-800"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{formMessage}</span>
                  </motion.div>
                )}

                {formStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{formMessage}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
