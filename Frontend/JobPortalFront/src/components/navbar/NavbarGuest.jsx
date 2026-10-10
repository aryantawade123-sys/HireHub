import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown, FaBriefcase } from 'react-icons/fa';

export default function NavbarGuest({ onOpenJobSeeker, onOpenEmployer }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ── LEFT: Logo + Desktop Nav ── */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
            aria-label="HireHub home"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition">
              <FaBriefcase className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">HireHub</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <button
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
              onClick={() => navigate('/jobs')}
            >
              Find Jobs
            </button>
            <button
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
              onClick={onOpenEmployer}
            >
              For Employers
            </button>
          </div>
        </div>

        {/* ── RIGHT: Auth Buttons (Desktop) ── */}
        <div className="hidden md:flex items-center gap-3">
          {/* Login Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setLoginOpen(v => !v); setSignupOpen(false); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-sm font-medium text-gray-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              Sign In
              <FaChevronDown className="text-[9px] text-gray-400" />
            </button>
            {loginOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden min-w-[200px] z-50">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => { onOpenJobSeeker(); setLoginOpen(false); }}
                    className="w-full px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium text-gray-700 rounded-lg transition cursor-pointer"
                  >
                    👤 As Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => { onOpenEmployer(); setLoginOpen(false); }}
                    className="w-full px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium text-gray-700 rounded-lg transition cursor-pointer"
                  >
                    🏢 As Employer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sign Up Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setSignupOpen(v => !v); setLoginOpen(false); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Get Started
              <FaChevronDown className="text-[9px] text-blue-200" />
            </button>
            {signupOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden min-w-[200px] z-50">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => { onOpenJobSeeker(); setSignupOpen(false); }}
                    className="w-full px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium text-gray-700 rounded-lg transition cursor-pointer"
                  >
                    👤 As Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => { onOpenEmployer(); setSignupOpen(false); }}
                    className="w-full px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium text-gray-700 rounded-lg transition cursor-pointer"
                  >
                    🏢 As Employer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE: Buttons + Hamburger ── */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={onOpenJobSeeker}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Login
          </button>
          <button
            type="button"
            onClick={onOpenJobSeeker}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 ml-1 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <button
            type="button"
            className="text-left px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => { navigate('/jobs'); closeMenu(); }}
          >
            Find Jobs
          </button>
          <button
            type="button"
            className="text-left px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => { onOpenEmployer(); closeMenu(); }}
          >
            For Employers
          </button>
        </div>
      )}
    </nav>
  );
}