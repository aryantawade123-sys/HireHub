import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import API_URL from '../api/config';

export default function JobSeekerModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [profilePic, setProfilePic] = useState(null);
  const [resume, setResume] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    dob: '',
    email: ''
  });

  const [signinData, setSigninData] = useState({
    username: '',
    password: ''
  });
  const [signingIn, setSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSigninChange = (e) => {
    setSigninData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePic(file);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const signupRes = await fetch(`${API_URL}/auth/signup/jobseeker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!signupRes.ok) {
        const errorData = await signupRes.json().catch(() => null);
        const message = errorData?.message || 'Signup failed. Please try again.';
        throw new Error(message);
      }

      toast.success("Account created. Now sign in to complete your registration.");
      setSigninData({
        username: formData.username,
        password: formData.password
      });
      setActiveTab("signin");
    } catch (err) {
      console.error(err);
      toast.error("Signup failed: " + err.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const loginRes = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData)
      });

      if (!loginRes.ok) throw new Error("Invalid credentials");

      const data = await loginRes.json();
      const token = data.token.replace(/\n/g, '');

      if (data.role !== "JOB_SEEKER") {
        toast.error("This account is not a job seeker!");
        return;
      }

      const warnings = [];

      if (profilePic) {
        const picForm = new FormData();
        picForm.append('file', profilePic);
        const picRes = await fetch(`${API_URL}/user/upload-profile-picture`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: picForm
        });
        if (!picRes.ok) {
          const errData = await picRes.json().catch(() => null);
          const msg = errData?.message || "Profile picture upload failed.";
          warnings.push(msg + " You can upload it later from your profile.");
        }
      }

      if (resume) {
        const resumeForm = new FormData();
        resumeForm.append('file', resume);
        const resumeRes = await fetch(`${API_URL}/user/jobseeker/upload-resume`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: resumeForm
        });
        if (!resumeRes.ok) {
          const errData = await resumeRes.json().catch(() => null);
          const msg = errData?.message || "Resume upload failed.";
          warnings.push(msg + " You can upload it later from your profile.");
        }
      }

      const meRes = await fetch(`${API_URL}/user/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!meRes.ok) throw new Error("Failed to fetch updated user");

      const updatedUser = await meRes.json();
      login(updatedUser, token);

      toast.success("Signed in!");
      warnings.forEach((w) => toast.warning(w));
      onClose();

      // Redirect to the page user was trying to access, or /jobs as fallback
      const redirectTo = localStorage.getItem('redirectAfterLogin') ||
        location.state?.from ||
        '/jobs';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } catch (err) {
      toast.error("Sign in failed: " + err.message);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">HireHub</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {activeTab === 'signin' ? 'Welcome back' : 'Join HireHub'}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            {activeTab === 'signin'
              ? 'Sign in to access your account.'
              : 'Create your free job seeker account.'}
          </p>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${activeTab === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${activeTab === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-6">
          {activeTab === 'signin' ? (
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <label htmlFor="js-username" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
                <input
                  id="js-username"
                  name="username"
                  onChange={handleSigninChange}
                  value={signinData.username}
                  type="text"
                  placeholder="Enter your username"
                  required
                  className="w-full border border-gray-300 px-3.5 py-3 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="js-password" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <input
                  id="js-password"
                  name="password"
                  onChange={handleSigninChange}
                  value={signinData.password}
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 px-3.5 py-3 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <button
                type="submit"
                disabled={signingIn}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-h-[46px] transition cursor-pointer"
              >
                {signingIn ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</>
                ) : 'Sign In'}
              </button>
              <p className="text-center text-xs text-gray-500">
                No account?{' '}
                <button type="button" onClick={() => setActiveTab('signup')} className="text-blue-600 font-semibold hover:underline cursor-pointer">
                  Sign up free
                </button>
              </p>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleSignUp}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="js-name" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    id="js-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label htmlFor="js-uname" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
                  <input
                    id="js-uname"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    type="text"
                    placeholder="johndoe"
                    required
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="js-email" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  id="js-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="john@email.com"
                  required
                  className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="js-pass" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                  <input
                    id="js-pass"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label htmlFor="js-dob" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Date of Birth</label>
                  <input
                    id="js-dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    type="date"
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Profile Picture <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                {!profilePic ? (
                  <input type="file" name="profilePicture" accept="image/*" onChange={handleProfileChange}
                    className="w-full border border-dashed border-gray-300 px-3 py-2 rounded-xl bg-gray-50 text-sm text-gray-500 cursor-pointer hover:border-blue-400 transition" />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-xs">
                    <span className="text-green-600">✓</span>
                    <span className="text-green-700 font-medium truncate">{profilePic.name}</span>
                    <button type="button" onClick={() => setProfilePic(null)} className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer">✕</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Resume PDF <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                {!resume ? (
                  <input type="file" name="resume" accept=".pdf" onChange={handleResumeChange}
                    className="w-full border border-dashed border-gray-300 px-3 py-2 rounded-xl bg-gray-50 text-sm text-gray-500 cursor-pointer hover:border-blue-400 transition" />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-xs">
                    <span className="text-green-600">✓</span>
                    <span className="text-green-700 font-medium truncate">{resume.name}</span>
                    <button type="button" onClick={() => setResume(null)} className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer">✕</button>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold min-h-[46px] transition cursor-pointer mt-1">
                Create Account
              </button>
              <p className="text-center text-xs text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => setActiveTab('signin')} className="text-blue-600 font-semibold hover:underline cursor-pointer">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

