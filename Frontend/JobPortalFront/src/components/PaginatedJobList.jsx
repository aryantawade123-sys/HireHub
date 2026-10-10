import React from 'react';
import JobCard from './JobCard';

export default function PaginatedJobList({
  jobs,
  selectedJob,
  onSelect,
  savedJobIds,
  onToggleSave,
}) {
  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedJob?.id === job.id}
          onSelect={onSelect}
          isSaved={savedJobIds ? savedJobIds.has(job.id) : false}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
