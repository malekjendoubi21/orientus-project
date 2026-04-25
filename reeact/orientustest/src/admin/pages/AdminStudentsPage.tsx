import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import type { Student } from '../../services/adminService';

const AdminStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students from database
  useEffect(() => {
    let cancelled = false;
    const fetchStudents = async () => {
      try {
        const studentList = await adminService.getStudentList();
        if (!cancelled) {
          setStudents(studentList);
          setFilteredStudents(studentList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load students');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchStudents();
    return () => { cancelled = true; };
  }, []);

  // Filter students based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredStudents(
      students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, students]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl p-6 border border-violet-500/20"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Students Management 🎓
            </h1>
            <p className="text-slate-400 mt-1">
              View and manage all registered students.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30">
              Total: {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Students Table */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg font-medium">{error}</p>
            <p className="text-slate-500 text-sm mt-1">Please try again later.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 text-3xl">
              🔍
            </div>
            <p className="text-slate-400 text-lg font-medium">
              {searchQuery ? 'No students match your search' : 'No students registered yet'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search query.' : 'Students will appear here once they register.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Last Name</div>
              <div className="col-span-3">First Name</div>
              <div className="col-span-5">Contact Email</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-700/30">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors group"
                >
                  <div className="col-span-1 flex items-center">
                    <span className="text-slate-500 text-sm font-mono">
                      {index + 1}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.lastName?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-white font-medium truncate">
                        {student.lastName}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-slate-300 truncate">
                      {student.firstName}
                    </span>
                  </div>
                  <div className="col-span-5 flex items-center">
                    <a
                      href={`mailto:${student.email}`}
                      className="text-violet-400 hover:text-violet-300 transition-colors truncate text-sm"
                    >
                      {student.email}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Table Footer */}
            <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-700/50 text-sm text-slate-500">
              Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminStudentsPage;
