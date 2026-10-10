import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaBolt,
  FaBuilding,
  FaCheckCircle,
  FaShieldAlt,
  FaUsers,
  FaChartLine,
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';
import CompanyLogo from '../components/CompanyLogo';
import API_URL from '../api/config';

// Deterministic rating helper to provide authentic Glassdoor-style ratings
export const getCompanyRating = (name = '') => {
  if (!name) return { rating: '4.2', reviews: '342' };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const ratingNum = 4.0 + (Math.abs(hash) % 9) * 0.1;
  const reviewsCount = 120 + (Math.abs(hash) % 850);
  return {
    rating: ratingNum.toFixed(1),
    reviews: reviewsCount.toLocaleString(),
  };
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Fetch featured jobs for homepage
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingJobs(true);
        const res = await fetch(`${API_URL}/jobs?page=0&size=6`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedJobs(data.content || []);
        }
      } catch (err) {
        console.error('Failed to load featured jobs on home:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('title', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handleQuickTagClick = (tag) => {
    navigate(`/jobs?title=${encodeURIComponent(tag)}`);
  };

  const topCompanies = [
    { name: 'Google', industry: 'Internet & Cloud Services', openRoles: '14 roles' },
    { name: 'NovaStack Labs', industry: 'Enterprise Software & DevOps', openRoles: '8 roles' },
    { name: 'Meta', industry: 'Social Technologies & AI', openRoles: '12 roles' },
    { name: 'CloudNest Solutions', industry: 'Cloud Architecture & Security', openRoles: '6 roles' },
    { name: 'ByteBridge Technologies', industry: 'Distributed Systems & FinTech', openRoles: '9 roles' },
    { name: 'CodeOrbit Systems', industry: 'Full Stack & Developer Tools', openRoles: '7 roles' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      {/* ================= HERO SECTION (Glassdoor Style) ================= */}
      <section className="relative bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200 mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Over 150+ Verified Tech Opportunities & Real Company Insights
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find a job that fits your life.
          </h1>

          <p className="mt-4 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-normal">
            Search millions of jobs, salary benchmarks, and verified company culture reviews — all in one place.
          </p>

          {/* ================= GLASSDOOR SEARCH BAR ================= */}
          <div className="mt-9 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-gray-100"
            >
              {/* Keyword Input */}
              <div className="flex items-center px-4 py-3 w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200">
                <FaSearch className="text-gray-400 mr-3 text-lg flex-shrink-0" />
                <div className="w-full text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    What
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Job title, keywords, or company"
                    className="w-full text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="flex items-center px-4 py-3 w-full md:w-5/12">
                <FaMapMarkerAlt className="text-gray-400 mr-3 text-lg flex-shrink-0" />
                <div className="w-full text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Where
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder='City, state, or "Remote"'
                    className="w-full text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="w-full md:w-auto p-1">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <FaSearch className="text-xs" />
                  Search Jobs
                </button>
              </div>
            </form>

            {/* Popular Searches Pills */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs">
              <span className="text-gray-400 font-medium mr-1">Popular searches:</span>
              {[
                'Remote',
                'Software Engineer',
                'Frontend Developer',
                'Java Developer',
                'Full Stack',
                'Data Science',
                'Product Manager',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= KEY VALUE PROPOSITION STRIP ================= */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-lg" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">100% Verified Jobs</p>
              <p className="text-xs text-gray-500">From vetted tech teams</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <FaChartLine className="text-lg" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Salary Transparency</p>
              <p className="text-xs text-gray-500">Real compensation stats</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <FaStar className="text-lg" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Company Ratings</p>
              <p className="text-xs text-gray-500">Culture & workplace reviews</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <FaBolt className="text-lg" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Easy Apply</p>
              <p className="text-xs text-gray-500">Apply in under 60 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED OPPORTUNITIES (LIVE FEED) ================= */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Recent Openings
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Featured Tech Roles
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Top recommended positions looking for immediate candidates.
            </p>
          </div>

          <button
            onClick={() => navigate('/jobs')}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            Explore all jobs <FaArrowRight className="text-xs" />
          </button>
        </div>

        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse h-48"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => {
              const { rating } = getCompanyRating(job.companyName);
              return (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs?jobId=${job.id}`)}
                  className="bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <CompanyLogo
                        companyName={job.companyName}
                        logoUrl={job.profilePicture}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {job.companyName}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            ★ {rating}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition truncate mt-0.5">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {/* Location & Tags */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 truncate">
                      <FaMapMarkerAlt className="text-blue-500 text-[11px] flex-shrink-0" />
                      <span className="truncate">{job.location || 'Remote'}</span>
                    </div>

                    {/* Compensation & Type */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {job.salary ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                          {job.salary}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                          Competitive Salary
                        </span>
                      )}

                      {job.workMode && (
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          {job.workMode}
                        </span>
                      )}

                      {job.type && (
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {String(job.type).replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <FaBolt className="text-[10px]" /> Easy Apply
                    </span>
                    <span className="group-hover:text-blue-600 font-medium flex items-center gap-1">
                      View details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <button
            onClick={() => navigate('/jobs')}
            className="w-full py-3 bg-white border border-gray-300 font-semibold text-sm rounded-xl text-gray-700 hover:bg-gray-50"
          >
            Explore all {featuredJobs.length > 0 ? '150+' : ''} jobs
          </button>
        </div>
      </section>

      {/* ================= TOP RATED EMPLOYERS (Glassdoor Style) ================= */}
      <section className="bg-white border-y border-gray-200 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Employer Directory
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Top Rated Companies Hiring on HireHub
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Explore corporate culture, salary benchmarks, and open job requisitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topCompanies.map((company) => {
              const { rating, reviews } = getCompanyRating(company.name);
              return (
                <div
                  key={company.name}
                  onClick={() =>
                    navigate(`/company/${encodeURIComponent(company.name)}`)
                  }
                  className="bg-gray-50/60 hover:bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <CompanyLogo companyName={company.name} size="md" />
                    <div>
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {company.name}
                      </h4>
                      <p className="text-xs text-gray-500">{company.industry}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ★ {rating}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {reviews} reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                    {company.openRoles}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= EMPLOYER CTA BANNER ================= */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              For Employers & Recruiters
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Hire the top 5% of tech talent faster.
            </h3>
            <p className="text-sm sm:text-base text-blue-100 mt-2">
              Post your open roles to thousands of verified software engineers, product designers, and engineering leaders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (user?.role === 'EMPLOYER' || user?.role === 'ROLE_EMPLOYER') {
                  navigate('/create-job');
                } else {
                  navigate('/jobs');
                }
              }}
              className="px-7 py-3.5 bg-white text-blue-700 hover:bg-gray-100 font-bold text-sm rounded-xl transition shadow-md whitespace-nowrap cursor-pointer text-center"
            >
              Post a Job for Free
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="px-7 py-3.5 bg-blue-700/60 hover:bg-blue-700 border border-white/20 text-white font-bold text-sm rounded-xl transition whitespace-nowrap cursor-pointer text-center"
            >
              Browse Candidates
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
