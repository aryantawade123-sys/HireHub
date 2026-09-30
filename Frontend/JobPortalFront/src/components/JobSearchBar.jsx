import { useState } from 'react';
import { FiSearch, FiSliders } from 'react-icons/fi';
import { GoLocation } from 'react-icons/go';
import { FaTimes } from 'react-icons/fa';
import Select from 'react-select';

const jobTypeOptions = [
  { value: '', label: 'All types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const workModeOptions = [
  { value: '', label: 'All work modes' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    border: 'none',
    boxShadow: 'none',
    background: 'transparent',
    minHeight: '42px',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }),

  valueContainer: (base) => ({
    ...base,
    padding: '0 4px',
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    padding: '10px 12px',
    backgroundColor: state.isSelected
      ? '#2563eb'
      : state.isFocused
        ? '#eff6ff'
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
  }),
};

export default function JobSearchBar({ onSearch }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState(jobTypeOptions[0]);
  const [workMode, setWorkMode] = useState(workModeOptions[0]);
  const [skills, setSkills] = useState('');

  const handleClick = () => {
    onSearch({
      title: title.trim(),
      location: location.trim(),
      type: type.value,
      workMode: workMode.value,
      skills: skills.trim(),
    });
  };

  const handleClear = () => {
    setTitle('');
    setLocation('');
    setType(jobTypeOptions[0]);
    setWorkMode(workModeOptions[0]);
    setSkills('');

    onSearch({
      title: '',
      location: '',
      type: '',
      workMode: '',
      skills: '',
    });
  };

  const hasValue =
    title ||
    location ||
    type.value ||
    workMode.value ||
    skills;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  return (
    <div className="flex justify-center my-8 px-4 relative z-20">
      <div className="w-full max-w-6xl">

        {/* Main Search Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-visible">

          {/* Search Row */}
          <div className="flex flex-col lg:flex-row lg:items-center">

            {/* Keyword */}
            <div className="flex items-center px-5 py-4 w-full lg:w-[28%] border-b lg:border-b-0 border-gray-200">
              <FiSearch className="text-gray-400 mr-3 flex-shrink-0 text-lg" />

              <div className="w-full">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Keyword
                </label>

                <input
                  type="text"
                  placeholder="Job title, skills..."
                  className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder:text-gray-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center px-5 py-4 w-full lg:w-[24%] border-b lg:border-b-0 lg:border-l border-gray-200">
              <GoLocation className="text-gray-400 mr-3 flex-shrink-0 text-lg" />

              <div className="w-full">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Location
                </label>

                <input
                  type="text"
                  placeholder="City or country"
                  className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder:text-gray-400"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Job Type */}
            <div className="px-4 py-2 w-full lg:w-[19%] border-b lg:border-b-0 lg:border-l border-gray-200">
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-1 ml-1">
                Job Type
              </label>

              <Select
                value={type}
                onChange={setType}
                options={jobTypeOptions}
                className="text-sm"
                classNamePrefix="react-select"
                menuPortalTarget={
                  typeof window !== 'undefined'
                    ? document.body
                    : null
                }
                styles={selectStyles}
              />
            </div>

            {/* Work Mode */}
            <div className="px-4 py-2 w-full lg:w-[19%] border-b lg:border-b-0 lg:border-l border-gray-200">
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-1 ml-1">
                Work Mode
              </label>

              <Select
                value={workMode}
                onChange={setWorkMode}
                options={workModeOptions}
                className="text-sm"
                classNamePrefix="react-select"
                menuPortalTarget={
                  typeof window !== 'undefined'
                    ? document.body
                    : null
                }
                styles={selectStyles}
              />
            </div>

            {/* Search Button */}
            <div className="p-3 lg:pr-3">
              <button
                onClick={handleClick}
                className="bg-blue-600 text-white px-6 py-3 min-h-[46px] w-full lg:w-auto text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <FiSearch className="text-base" />
                Search
              </button>
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="border-t border-gray-100 px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">

            <div className="flex items-center gap-2 text-gray-500 flex-shrink-0">
              <FiSliders className="text-blue-600" />
              <span className="text-xs font-semibold">
                Advanced filter
              </span>
            </div>

            {/* Skills */}
            <div className="flex items-center flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition">
              <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">
                Skills
              </span>

              <input
                type="text"
                placeholder="Java, Spring Boot, React..."
                className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Clear Filters */}
            {hasValue && (
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition whitespace-nowrap"
                title="Clear all filters"
              >
                <FaTimes className="text-[11px]" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Summary */}
        {hasValue && (
          <div className="flex flex-wrap items-center gap-2 mt-3 px-1">

            {title && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                Keyword: {title}
              </span>
            )}

            {location && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                Location: {location}
              </span>
            )}

            {type.value && (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                {type.label}
              </span>
            )}

            {workMode.value && (
              <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                {workMode.label}
              </span>
            )}

            {skills && (
              <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                Skills: {skills}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}