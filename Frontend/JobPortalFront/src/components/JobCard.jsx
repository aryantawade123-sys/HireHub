import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';

export default function JobCard({ job, isSelected, onSelect }) {
  const navigate = useNavigate();

  const getInitials = (companyName = '') => {
    const words = companyName.trim().split(' ');

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return companyName.substring(0, 2).toUpperCase();
  };

  const companyInitials = getInitials(job.companyName);

  const handleCompanyClick = (e) => {
    e.stopPropagation();

    navigate(
      `/company/${encodeURIComponent(job.companyName)}`
    );
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className={`flex items-center gap-4 p-4 mb-4 cursor-pointer rounded-2xl border transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 shadow-md ring-1 ring-blue-200'
          : 'border-gray-200'
      } hover:shadow-lg hover:-translate-y-[1px] bg-white`}
    >

      {/* Company Logo */}
      <button
        type="button"
        onClick={handleCompanyClick}
        className="w-16 h-16 flex-shrink-0 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
        title={`View ${job.companyName}`}
      >
        <span className="text-lg font-bold text-blue-700">
          {companyInitials}
        </span>
      </button>

      {/* Job Info */}
      <div className="flex-1 min-w-0">

        {/* Job Title */}
        <h2 className="text-lg font-bold text-gray-900 truncate">
          {job.title}
        </h2>

        {/* Company */}
        <button
          type="button"
          onClick={handleCompanyClick}
          className="text-sm text-gray-600 flex items-center mt-1 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <FaBriefcase className="mr-2 text-blue-600 flex-shrink-0" />

          <span className="truncate hover:underline">
            {job.companyName}
          </span>
        </button>

        {/* Location */}
        <div className="text-sm text-gray-600 flex items-center mt-1">
          <FaMapMarkerAlt className="mr-2 text-blue-600 flex-shrink-0" />
          <span>{job.location}</span>
        </div>

        {/* Job Type + Work Mode */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            {job.type?.replace('_', ' ')}
          </span>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            {job.workMode}
          </span>

        </div>

      </div>
    </div>
  );
}