import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";

export default function NavbarGuest({
  onOpenJobSeeker,
  onOpenEmployer,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="flex justify-between items-center">

        {/* =====================================================
            LEFT - LOGO + DESKTOP NAV
        ====================================================== */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-800">

          {/* Logo */}
          <span
            className="text-xl font-bold text-black cursor-pointer"
            onClick={() => navigate("/")}
          >
            HireHub
          </span>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">

            <button
              className="hover:text-blue-600 transition"
              onClick={() => navigate("/jobs")}
            >
              Jobs
            </button>

            <button
              className="hover:text-blue-600 transition"
              onClick={() => navigate("/jobs")}
            >
              Companies
            </button>

            <button
              className="hover:text-blue-600 transition"
              onClick={onOpenEmployer}
            >
              For Employers
            </button>

            <button
              className="hover:text-blue-600 transition"
              onClick={onOpenJobSeeker}
            >
              For Professionals
            </button>

          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="flex items-center gap-3 text-gray-700">

          {/* =================================================
              DESKTOP
          ================================================== */}
          <div className="hidden md:flex items-center gap-3">

            {/* =================================================
                LOGIN DROPDOWN
            ================================================== */}
            <div className="relative group">

              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-sm font-medium transition flex items-center gap-2"
              >
                Login
                <FaChevronDown className="text-[10px] text-gray-400" />
              </button>

              {/* Hover bridge + dropdown */}
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block">

                <div className="bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden min-w-[180px]">

                  <button
                    type="button"
                    onClick={onOpenJobSeeker}
                    className="w-full px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium transition"
                  >
                    As Job Seeker
                  </button>

                  <button
                    type="button"
                    onClick={onOpenEmployer}
                    className="w-full px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium transition"
                  >
                    As Employer
                  </button>

                </div>

              </div>
            </div>

            {/* =================================================
                SIGN UP DROPDOWN
            ================================================== */}
            <div className="relative group">

              <button
                type="button"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition flex items-center gap-2"
              >
                Sign Up
                <FaChevronDown className="text-[10px] text-gray-300" />
              </button>

              {/* Hover bridge + dropdown */}
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block">

                <div className="bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden min-w-[180px]">

                  <button
                    type="button"
                    onClick={onOpenJobSeeker}
                    className="w-full px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium transition"
                  >
                    As Job Seeker
                  </button>

                  <button
                    type="button"
                    onClick={onOpenEmployer}
                    className="w-full px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-left text-sm font-medium transition"
                  >
                    As Employer
                  </button>

                </div>

              </div>
            </div>

          </div>

          {/* =================================================
              MOBILE
          ================================================== */}
          <div className="flex md:hidden items-center gap-2">

            <button
              type="button"
              onClick={onOpenJobSeeker}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Login
            </button>

            <button
              type="button"
              onClick={onOpenJobSeeker}
              className="px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-xl p-2 ml-1 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>

          </div>

        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      {menuOpen && (
        <div className="md:hidden mt-4 border-t border-gray-200 pt-4 pb-2 flex flex-col gap-1 text-sm font-medium text-gray-800">

          <button
            type="button"
            className="text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition"
            onClick={() => {
              navigate("/jobs");
              closeMenu();
            }}
          >
            Jobs
          </button>

          <button
            type="button"
            className="text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition"
            onClick={() => {
              navigate("/jobs");
              closeMenu();
            }}
          >
            Companies
          </button>

          <button
            type="button"
            className="text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition"
            onClick={() => {
              onOpenEmployer();
              closeMenu();
            }}
          >
            For Employers
          </button>

          <button
            type="button"
            className="text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition"
            onClick={() => {
              onOpenJobSeeker();
              closeMenu();
            }}
          >
            For Professionals
          </button>

        </div>
      )}

    </nav>
  );
}