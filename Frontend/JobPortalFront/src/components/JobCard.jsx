import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaBookmark,
  FaRegBookmark,
  FaRegClock,
  FaBolt,
} from 'react-icons/fa';
import CompanyLogo from './CompanyLogo';
import { getCompanyRating } from '../pages/Home';

// Glassdoor-style salary estimation fallback if employer hasn't specified exact salary
const getSalaryEstimate = (job) => {
  if (job.salary) {
    return `${job.salary} (Employer Est.)`;
  }
  const title = (job.title || '').toLowerCase();
  if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
    return '$135K - $175K (Est.)';
  }
  if (title.includes('architect') || title.includes('manager') || title.includes('director')) {
    return '$155K - $210K (Est.)';
  }
  if (title.includes('junior') || title.includes('intern') || title.includes('associate')) {
    return '$65K - $90K (Est.)';
  }
  if (title.includes('frontend') || title.includes('react') || title.includes('ui')) {
    return '$105K - $140K (Est.)';
  }
  if (title.includes('backend') || title.includes('java') || title.includes('cloud') || title.includes('devops')) {
    return '$115K - $155K (Est.)';
  }
  if (title.includes('data') || title.includes('ai') || title.includes('machine learning')) {
    return '$125K - $165K (Est.)';
  }
  return '$95K - $135K (Est.)';
};

export default function JobCard({
  job,
  isSelected,
  onSelect,
  isSaved = false,
  onToggleSave,
}) {
  const navigate = useNavigate();
  const { rating } = getCompanyRating(job.companyName);
  const salaryText = getSalaryEstimate(job);

  const handleCompanyClick = (e) => {
    e.stopPropagation();
    if (job.companyName) {
      navigate(`/company/${encodeURIComponent(job.companyName)}`);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(job.id, e);
    }
  };

  const formatPostedDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return '1d';
      if (diffDays < 30) return `${diffDays}d`;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className={`relative group p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'border-emerald-600 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500 border-l-4 border-l-emerald-600'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Company Logo */}
        <button
          type="button"
          onClick={handleCompanyClick}
          className="hover:scale-105 transition-transform cursor-pointer flex-shrink-0 mt-0.5"
          title={`View ${job.companyName}`}
        >
          <CompanyLogo
            companyName={job.companyName}
            logoUrl={job.profilePicture}
            size="md"
          />
        </button>

        {/* Core Info */}
        <div className="flex-1 min-w-0 pr-7">
          {/* Company Name + Rating (Glassdoor Signature) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompanyClick}
              className="text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:underline truncate transition-colors text-left cursor-pointer"
            >
              {job.companyName}
            </button>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex-shrink-0">
              ★ {rating}
            </span>
          </div>

          {/* Job Title */}
          <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate mt-0.5">
            {job.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 truncate">
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0 text-[11px]" />
            <span className="truncate">{job.location || 'Remote'}</span>
          </div>

          {/* Salary (Glassdoor Style) */}
          <div className="text-xs font-bold text-emerald-800 mt-1.5 truncate">
            {salaryText}
          </div>

          {/* Badges: Job Type, Work Mode, Easy Apply */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200">
              <FaBolt className="text-[9px]" /> Easy Apply
            </span>

            {job.workMode && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                {job.workMode}
              </span>
            )}

            {job.type && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                {String(job.type).replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Posted Date Footer */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <FaRegClock className="text-gray-400 text-[10px]" />
              {formatPostedDate(job.postedAt)}
            </span>

            {isSelected && (
              <span className="text-xs font-bold text-emerald-700">
                Selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bookmark Button (Top Right) */}
      <button
        type="button"
        onClick={handleBookmarkClick}
        title={isSaved ? 'Remove from saved' : 'Save job'}
        aria-label={isSaved ? 'Remove from saved' : 'Save job'}
        className={`absolute top-3.5 right-3.5 p-2 rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer ${
          isSaved
            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            : 'text-gray-400 hover:text-emerald-700 hover:bg-gray-100'
        }`}
      >
        {isSaved ? (
          <FaBookmark className="text-sm text-emerald-600" />
        ) : (
          <FaRegBookmark className="text-sm" />
        )}
      </button>
    </div>
  );
}