import { useNavigate } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mb-4 cursor-pointer"
              aria-label="HireHub home"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <FaBriefcase className="text-white text-base" />
              </div>
              <span className="text-xl font-bold text-gray-900">HireHub</span>
            </button>
            <p className="text-sm text-gray-500 leading-relaxed">
              A modern job portal connecting talented professionals with great companies.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Job Seekers
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigate('/jobs')}
                  className="text-sm text-gray-500 hover:text-blue-600 transition cursor-pointer"
                >
                  Browse Jobs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/myjobs')}
                  className="text-sm text-gray-500 hover:text-blue-600 transition cursor-pointer"
                >
                  My Applications
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm text-gray-500 hover:text-blue-600 transition cursor-pointer"
                >
                  My Profile
                </button>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Employers
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-gray-500 hover:text-blue-600 transition cursor-pointer"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/create-job')}
                  className="text-sm text-gray-500 hover:text-blue-600 transition cursor-pointer"
                >
                  Post a Job
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/employer/applicants')}
                  className="text-sm text-gray-500 hover:text-blue-600 transition cursor-pointer"
                >
                  Manage Applicants
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-gray-500">About HireHub</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} HireHub. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built with ❤️ for modern hiring teams
          </p>
        </div>
      </div>
    </footer>
  );
}
