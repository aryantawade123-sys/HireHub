import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import defaultAvatar from '../../pics/deafult-avatar.png';
import { FaBriefcase, FaBars, FaTimes, FaSignOutAlt, FaChartBar, FaPlus } from 'react-icons/fa';

export default function NavbarEmployer() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const profileImageUrl = user?.profilePicture || defaultAvatar;
  const closeMenu = () => setMenuOpen(false);
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLink = (path, label) => (
    <button
      onClick={() => navigate(path)}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition cursor-pointer ${
        isActive(path)
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ── LEFT: Logo + Links ── */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
            aria-label="HireHub home"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition">
              <FaBriefcase className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">HireHub</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navLink('/dashboard', 'Dashboard')}
            {navLink('/employer/jobs', 'My Jobs')}
            {navLink('/employer/applicants', 'Applicants')}
          </div>
        </div>

        {/* ── RIGHT: Post Job + Profile ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/create-job')}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-sm"
          >
            <FaPlus className="text-xs" /> Post Job
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <img
                src={profileImageUrl}
                alt={user?.name || 'Profile'}
                className="w-8 h-8 rounded-full border-2 border-gray-200 object-cover flex-shrink-0"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[110px] truncate">
                {user?.companyName || user?.name || 'Employer'}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl min-w-[200px] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.companyName || user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Employer Account</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { navigate('/dashboard'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  >
                    <FaChartBar className="text-gray-400 text-xs" /> Dashboard
                  </button>
                  <button
                    onClick={() => { navigate('/create-job'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  >
                    <FaPlus className="text-gray-400 text-xs" /> Post a Job
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => { handleLogout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <FaSignOutAlt className="text-red-400 text-xs" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 ml-1 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <div className="px-3 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
            {user?.companyName || 'Employer'}
          </div>
          <button
            className="text-left px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => { navigate('/dashboard'); closeMenu(); }}
          >
            Dashboard
          </button>
          <button
            className="text-left px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => { navigate('/employer/jobs'); closeMenu(); }}
          >
            My Jobs
          </button>
          <button
            className="text-left px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => { navigate('/employer/applicants'); closeMenu(); }}
          >
            Applicants
          </button>
          <button
            className="text-left px-3 py-3 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
            onClick={() => { navigate('/create-job'); closeMenu(); }}
          >
            + Post a Job
          </button>
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              className="text-left px-3 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 cursor-pointer w-full"
              onClick={() => { handleLogout(); closeMenu(); }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
