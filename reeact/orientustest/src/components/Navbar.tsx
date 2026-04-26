import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import { useWebSocket } from '../hooks/useWebSocket';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isStudent = isAuthenticated && user && user.role === 'STUDENT';
  const userId = user?.id as number | undefined;
  const { subscribe, unsubscribe } = useWebSocket(isStudent ? userId : undefined);

  // Fetch unread count for students
  const fetchUnread = useCallback(async () => {
    if (!isStudent || !userId) return;
    try {
      const data = await messageService.getStudentUnreadCount(userId);
      setUnreadCount(data.unreadCount);
    } catch { /* silent */ }
  }, [isStudent, userId]);

  useEffect(() => {
    fetchUnread();
    if (!isStudent || !userId) return;
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread, isStudent, userId]);

  // WebSocket: conversation updates → refresh unread
  useEffect(() => {
    if (!isStudent || !userId) return;
    const dest = `/topic/student/${userId}/conversation-update`;
    subscribe(dest, () => { fetchUnread(); });
    return () => unsubscribe(dest);
  }, [isStudent, userId, subscribe, unsubscribe, fetchUnread]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer"
            onClick={goToHome}
          >
            <img 
              src="/black.png" 
              alt="Orientus Logo" 
              className="h-16 md:h-20 w-auto"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </motion.button>
            </Link>
            <Link to="/programs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Programs
              </motion.button>
            </Link>
            <Link to="/recommendations">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                🎯 Recommandations
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </motion.button>
            </Link>
          </div>

          {/* Messages button (STUDENT only) */}
          {isStudent && (
            <div className="hidden md:flex items-center">
              <Link to="/messages">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-gray-700 hover:text-blue-600 font-medium transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </motion.button>
              </Link>
            </div>
          )}

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border-2 border-gray-200 hover:border-blue-400 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user.firstName}</span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      {/* User info header */}
                      <div className="px-5 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="py-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">My Profile</p>
                            <p className="text-xs text-gray-400">View & edit your info</p>
                          </div>
                        </Link>
                        <Link
                          to="/my-applications"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">My Applications</p>
                            <p className="text-xs text-gray-400">Track your submissions</p>
                          </div>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1.5">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <p className="font-medium">Logout</p>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4 space-y-2"
          >
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">Home</Link>
            <Link to="/programs" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">Programs</Link>
            <Link to="/recommendations" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">🎯 Recommandations</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">Contact</Link>
            {isStudent && (
              <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Messages
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated && user ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">My Profile</Link>
                <Link to="/my-applications" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">My Applications</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
