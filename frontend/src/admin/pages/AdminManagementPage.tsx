import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { adminService } from '../../services/adminService';
import type { Admin, CreateAdminRequest } from '../../services/adminService';

type ActiveTab = 'admins' | 'agencies';

const AdminManagementPage = () => {
  const { admin, isOwner } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('admins');

  // Admins state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  // Agencies state
  const [agencies, setAgencies] = useState<Admin[]>([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false);

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Admin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateAdminRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    nationality: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const signal = { cancelled: false };
    fetchAdmins(signal);
    return () => { signal.cancelled = true; };
  }, [admin?.email]);

  useEffect(() => {
    if (activeTab === 'agencies' && admin?.email && agencies.length === 0) {
      fetchAgencies();
    }
  }, [activeTab]);

  const fetchAdmins = async (signal?: { cancelled: boolean }) => {
    try {
      setIsLoadingAdmins(true);
      setError('');
      const list = await adminService.getAdminList();
      if (!signal?.cancelled) setAdmins(list);
    } catch (err) {
      if (!signal?.cancelled) setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      if (!signal?.cancelled) setIsLoadingAdmins(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      setIsLoadingAgencies(true);
      setError('');
      const list = await adminService.getAgencyList();
      setAgencies(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agencies');
    } finally {
      setIsLoadingAgencies(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalide';
    if (!formData.password) errors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) errors.password = 'Minimum 6 caractères';
    if (!formData.firstName?.trim()) errors.firstName = 'Prénom requis';
    if (!formData.lastName?.trim()) errors.lastName = 'Nom requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', nationality: '' });
    setFormErrors({});
    setShowPassword(false);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError('');
    try {
      if (activeTab === 'admins') {
        await adminService.createAdmin(formData);
        setSuccess('Administrateur créé avec succès !');
        fetchAdmins();
      } else {
        await adminService.createAgencyPartner(formData);
        setSuccess('Compte agence partenaire créé avec succès !');
        fetchAgencies();
      }
      setShowCreateModal(false);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    setError('');
    try {
      if (activeTab === 'admins') {
        await adminService.deleteAdmin(selectedItem.id);
        setSuccess('Administrateur supprimé avec succès !');
        fetchAdmins();
      } else {
        await adminService.deleteAgency(selectedItem.id);
        setSuccess('Compte agence supprimé avec succès !');
        fetchAgencies();
      }
      setShowDeleteModal(false);
      setSelectedItem(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (item: Admin) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
    setError('');
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setError('');
  };

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Accès refusé</h2>
          <p className="text-slate-400 mt-2">Seul le OWNER peut gérer les comptes</p>
        </div>
      </div>
    );
  }

  const isLoading = activeTab === 'admins' ? isLoadingAdmins : isLoadingAgencies;
  const list = activeTab === 'admins' ? admins : agencies;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des comptes</h1>
          <p className="text-slate-400 mt-1">Créer et gérer les administrateurs et agences partenaires</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowCreateModal(true); setError(''); setFormErrors({}); }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {activeTab === 'admins' ? 'Ajouter un Admin' : 'Ajouter une Agence'}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1.5 border border-slate-700/50 inline-flex gap-1">
        <button
          onClick={() => handleTabChange('admins')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'admins'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Administrateurs
          <span className="bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded-full">{admins.length}</span>
        </button>
        <button
          onClick={() => handleTabChange('agencies')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'agencies'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Agences Partenaires
          <span className="bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded-full">{agencies.length}</span>
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-400 text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{activeTab === 'admins' ? 'Total Admins' : 'Agences Partenaires'}</p>
              <p className="text-3xl font-bold text-white mt-1">{list.length}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeTab === 'admins' ? 'bg-violet-500/20' : 'bg-indigo-500/20'}`}>
              <svg className={`w-6 h-6 ${activeTab === 'admins' ? 'text-violet-400' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Votre rôle</p>
              <p className="text-xl font-bold text-amber-400 mt-1">OWNER</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Accès</p>
              <p className="text-xl font-bold text-green-400 mt-1">Contrôle total</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {activeTab === 'admins' ? 'Liste des administrateurs' : 'Liste des agences partenaires'}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-400">
              {activeTab === 'admins' ? 'Aucun administrateur trouvé' : 'Aucune agence partenaire trouvée'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Cliquez sur "Ajouter" pour en créer un
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {activeTab === 'admins' ? 'Administrateur' : 'Agence'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {list.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                          activeTab === 'agencies'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-br from-violet-500 to-purple-600'
                        }`}>
                          {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.firstName} {item.lastName}</p>
                          <p className="text-slate-500 text-xs">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-300">{item.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.role?.toUpperCase() === 'OWNER'
                          ? 'bg-amber-500/20 text-amber-400'
                          : item.role?.toUpperCase() === 'AGENCY_PARTNER'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-violet-500/20 text-violet-400'
                      }`}>
                        {item.role?.toUpperCase() === 'AGENCY_PARTNER' ? '🤝 Agence' : item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {item.role?.toUpperCase() !== 'OWNER' && (
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'agencies' ? 'bg-indigo-500/20' : 'bg-violet-500/20'}`}>
                    <svg className={`w-5 h-5 ${activeTab === 'agencies' ? 'text-indigo-400' : 'text-violet-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {activeTab === 'admins' ? 'Créer un administrateur' : 'Créer un compte agence'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {activeTab === 'admins'
                        ? 'Ajouter un nouvel administrateur à la plateforme'
                        : 'Créer un compte pour une agence partenaire'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                  <input type="email" value={formData.email}
                    onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); setFormErrors(p => ({ ...p, email: '' })); }}
                    className={`w-full px-4 py-2.5 bg-slate-700/50 border ${formErrors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                    placeholder={activeTab === 'agencies' ? 'agence@exemple.com' : 'admin@orientus.com'}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={(e) => { setFormData(p => ({ ...p, password: e.target.value })); setFormErrors(p => ({ ...p, password: '' })); }}
                      className={`w-full px-4 py-2.5 bg-slate-700/50 border ${formErrors.password ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 pr-10`}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.password && <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>}
                </div>

                {/* First / Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Prénom *</label>
                    <input type="text" value={formData.firstName}
                      onChange={(e) => { setFormData(p => ({ ...p, firstName: e.target.value })); setFormErrors(p => ({ ...p, firstName: '' })); }}
                      className={`w-full px-4 py-2.5 bg-slate-700/50 border ${formErrors.firstName ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                      placeholder={activeTab === 'agencies' ? 'Nom agence' : 'Prénom'}
                    />
                    {formErrors.firstName && <p className="mt-1 text-sm text-red-400">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nom *</label>
                    <input type="text" value={formData.lastName}
                      onChange={(e) => { setFormData(p => ({ ...p, lastName: e.target.value })); setFormErrors(p => ({ ...p, lastName: '' })); }}
                      className={`w-full px-4 py-2.5 bg-slate-700/50 border ${formErrors.lastName ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                      placeholder={activeTab === 'agencies' ? 'Partenaire' : 'Nom'}
                    />
                    {formErrors.lastName && <p className="mt-1 text-sm text-red-400">{formErrors.lastName}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone <span className="text-slate-500">(Optionnel)</span></label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="+213 600 000 000"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {activeTab === 'agencies' ? 'Pays' : 'Nationalité'} <span className="text-slate-500">(Optionnel)</span>
                  </label>
                  <input type="text" value={formData.nationality}
                    onChange={(e) => setFormData(p => ({ ...p, nationality: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder={activeTab === 'agencies' ? 'Algérie' : 'Algérienne'}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 flex gap-3">
                <button onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                  Annuler
                </button>
                <button onClick={handleCreate} disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${
                    activeTab === 'agencies'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90'
                  }`}>
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? 'Création...' : activeTab === 'admins' ? 'Créer l\'admin' : 'Créer le compte agence'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
                <p className="text-slate-400 mb-2">
                  Êtes-vous sûr de vouloir supprimer ce compte ?
                </p>
                <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                  <p className="text-white font-medium">{selectedItem.firstName} {selectedItem.lastName}</p>
                  <p className="text-slate-400 text-sm">{selectedItem.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    selectedItem.role?.toUpperCase() === 'AGENCY_PARTNER'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-violet-500/20 text-violet-400'
                  }`}>
                    {selectedItem.role?.toUpperCase() === 'AGENCY_PARTNER' ? 'Agence Partenaire' : selectedItem.role}
                  </span>
                </div>
                <p className="text-red-400 text-sm mb-6">Cette action est irréversible.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleDelete} disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {isSubmitting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminManagementPage;
