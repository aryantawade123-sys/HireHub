import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

const getToken = () => localStorage.getItem("token");

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const getApplicationStatus = (application) => {
  return String(
    application?.status ??
      application?.applicationStatus ??
      application?.application_status ??
      "PENDING"
  ).toUpperCase();
};

const getJob = (application) => {
  return application?.job ?? application?.jobPost ?? application?.jobDetails ?? application;
};

const getJobTitle = (application) => {
  const job = getJob(application);

  return (
    job?.title ??
    job?.jobTitle ??
    application?.jobTitle ??
    application?.title ??
    "Untitled Job"
  );
};

const getCompanyName = (application) => {
  const job = getJob(application);

  return (
    job?.companyName ??
    job?.company?.name ??
    application?.companyName ??
    application?.company ??
    "Company"
  );
};

const getLocation = (application) => {
  const job = getJob(application);

  return (
    job?.location ??
    job?.jobLocation ??
    application?.location ??
    "Location not specified"
  );
};

const getWorkMode = (application) => {
  const job = getJob(application);

  return job?.workMode ?? job?.work_mode ?? application?.workMode ?? "";
};

const getJobType = (application) => {
  const job = getJob(application);

  return job?.jobType ?? job?.job_type ?? application?.jobType ?? "";
};

const getApplicationId = (application) => {
  return (
    application?.id ??
    application?.applicationId ??
    application?.application_id
  );
};

const getJobId = (application) => {
  const job = getJob(application);

  return (
    job?.id ??
    job?.jobId ??
    job?.job_id ??
    application?.jobId ??
    application?.job_id
  );
};

const getCompanyInitials = (companyName) => {
  if (!companyName) return "CO";

  const words = companyName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const getCompanyImage = (application) => {
  const job = getJob(application);

  return (
    job?.companyLogo ??
    job?.companyImage ??
    job?.company?.logo ??
    job?.company?.image ??
    application?.companyLogo ??
    application?.companyImage ??
    ""
  );
};

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.applications)) return data.applications;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.savedJobs)) return data.savedJobs;

  return [];
};

const statusStyles = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  REVIEWED: {
    label: "Reviewed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: FileText,
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: CheckCircle2,
  },
  INTERVIEW: {
    label: "Interview",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: CalendarDays,
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const config =
    statusStyles[status] ?? statusStyles.PENDING;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

function CompanyLogo({ application }) {
  const [imageFailed, setImageFailed] = useState(false);

  const companyName = getCompanyName(application);
  const image = getCompanyImage(application);

  if (!image || imageFailed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
        {getCompanyInitials(companyName)}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={companyName}
      className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-cover"
      onError={() => setImageFailed(true)}
    />
  );
}

function EmptyState({ type }) {
  const config = {
    saved: {
      icon: Bookmark,
      title: "No saved jobs",
      text: "Jobs you save will appear here.",
      button: "Browse Jobs",
      link: "/jobs",
    },
    applied: {
      icon: BriefcaseBusiness,
      title: "No applications yet",
      text: "Jobs you apply to will appear here.",
      button: "Find Jobs",
      link: "/jobs",
    },
    interviews: {
      icon: CalendarDays,
      title: "No interviews scheduled",
      text: "Applications moved to interview status will appear here.",
      button: "View Applications",
      link: "/my-jobs",
    },
  };

  const item = config[type] ?? config.applied;
  const Icon = item.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon size={28} className="text-slate-500" />
      </div>

      <h3 className="text-lg font-bold text-slate-900">
        {item.title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        {item.text}
      </p>

      <Link
        to={item.link}
        className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {item.button}
      </Link>
    </div>
  );
}

function AppliedJobCard({
  application,
  onWithdraw,
}) {
  const navigate = useNavigate();

  const jobId = getJobId(application);
  const applicationId = getApplicationId(application);

  const jobTitle = getJobTitle(application);
  const companyName = getCompanyName(application);
  const location = getLocation(application);
  const workMode = getWorkMode(application);
  const jobType = getJobType(application);
  const status = getApplicationStatus(application);

  const handleOpen = () => {
    if (jobId) {
      navigate(`/jobs/${jobId}`);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div
          className="flex min-w-0 cursor-pointer gap-4"
          onClick={handleOpen}
        >
          <CompanyLogo application={application} />

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900">
              {jobTitle}
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-600">
              {companyName}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {location}
              </span>

              {workMode && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {workMode}
                </span>
              )}

              {jobType && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {jobType}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Application ID:{" "}
          <span className="font-medium text-slate-700">
            {applicationId ?? "N/A"}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpen}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Job
          </button>

          {status === "PENDING" && (
            <button
              type="button"
              onClick={() => onWithdraw(application)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={15} />
              Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SavedJobCard({
  job,
  onRemove,
}) {
  const navigate = useNavigate();

  const jobId = job?.id ?? job?.jobId;
  const title = job?.title ?? job?.jobTitle ?? "Untitled Job";
  const company =
    job?.companyName ??
    job?.company?.name ??
    "Company";
  const location =
    job?.location ??
    job?.jobLocation ??
    "Location not specified";
  const workMode =
    job?.workMode ??
    job?.work_mode ??
    "";
  const jobType =
    job?.jobType ??
    job?.job_type ??
    "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          {getCompanyInitials(company)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {company}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              {location}
            </span>

            {workMode && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1">
                {workMode}
              </span>
            )}

            {jobType && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1">
                {jobType}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(job)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          title="Remove saved job"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            if (jobId) navigate(`/jobs/${jobId}`);
          }}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View Job
        </button>
      </div>
    </div>
  );
}

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState("applied");

  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadingApplied, setLoadingApplied] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const fetchSavedJobs = async () => {
    try {
      setLoadingSaved(true);

      const response = await axios.get(
        `${API_BASE_URL}/user/saved-jobs`,
        {
          headers: getAuthHeaders(),
        }
      );

      setSavedJobs(normalizeArrayResponse(response.data));
    } catch (err) {
      console.error("Failed to fetch saved jobs:", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      setLoadingApplied(true);

      const response = await axios.get(
        `${API_BASE_URL}/applications/my`,
        {
          headers: getAuthHeaders(),
        }
      );

      setAppliedJobs(normalizeArrayResponse(response.data));
    } catch (err) {
      console.error("Failed to fetch applications:", err);

      setError(
        err?.response?.data?.message ??
          "Unable to load your applications."
      );
    } finally {
      setLoadingApplied(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      setLoadingSaved(false);
      setLoadingApplied(false);
      setError("Please sign in to view your jobs.");
      return;
    }

    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

  const interviewApplications = useMemo(() => {
    return appliedJobs.filter((application) => {
      const status = String(
        application?.status ??
          application?.applicationStatus ??
          application?.application_status ??
          ""
      ).toUpperCase();

      return status === "INTERVIEW";
    });
  }, [appliedJobs]);

  const pendingApplications = useMemo(() => {
    return appliedJobs.filter(
      (application) =>
        getApplicationStatus(application) === "PENDING"
    );
  }, [appliedJobs]);

  const filteredSavedJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return savedJobs;

    return savedJobs.filter((job) => {
      const text = [
        job?.title,
        job?.jobTitle,
        job?.companyName,
        job?.company?.name,
        job?.location,
        job?.workMode,
        job?.jobType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [savedJobs, searchTerm]);

  const filteredAppliedJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return appliedJobs;

    return appliedJobs.filter((application) => {
      const text = [
        getJobTitle(application),
        getCompanyName(application),
        getLocation(application),
        getWorkMode(application),
        getJobType(application),
        getApplicationStatus(application),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [appliedJobs, searchTerm]);

  const filteredInterviewApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return interviewApplications;

    return interviewApplications.filter((application) => {
      const text = [
        getJobTitle(application),
        getCompanyName(application),
        getLocation(application),
        getWorkMode(application),
        getJobType(application),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [interviewApplications, searchTerm]);

  const withdrawApplication = async (application) => {
    const applicationId = getApplicationId(application);

    if (!applicationId) {
      alert("Application ID not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/applications/${applicationId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setAppliedJobs((current) =>
        current.filter(
          (item) => getApplicationId(item) !== applicationId
        )
      );
    } catch (err) {
      console.error("Failed to withdraw application:", err);

      alert(
        err?.response?.data?.message ??
          "Unable to withdraw application."
      );
    }
  };

  const removeSavedJob = async (job) => {
    const jobId = job?.id ?? job?.jobId;

    if (!jobId) {
      alert("Job ID not found.");
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/user/saved-jobs/${jobId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setSavedJobs((current) =>
        current.filter(
          (item) =>
            (item?.id ?? item?.jobId) !== jobId
        )
      );
    } catch (err) {
      console.error("Failed to remove saved job:", err);

      alert(
        err?.response?.data?.message ??
          "Unable to remove saved job."
      );
    }
  };

  const renderContent = () => {
    if (activeTab === "saved") {
      if (loadingSaved) {
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading saved jobs...
          </div>
        );
      }

      if (filteredSavedJobs.length === 0) {
        return <EmptyState type="saved" />;
      }

      return (
        <div className="grid gap-4">
          {filteredSavedJobs.map((job, index) => (
            <SavedJobCard
              key={job?.id ?? job?.jobId ?? index}
              job={job}
              onRemove={removeSavedJob}
            />
          ))}
        </div>
      );
    }

    if (activeTab === "interviews") {
      if (loadingApplied) {
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading interviews...
          </div>
        );
      }

      if (filteredInterviewApplications.length === 0) {
        return <EmptyState type="interviews" />;
      }

      return (
        <div className="grid gap-4">
          {filteredInterviewApplications.map(
            (application, index) => (
              <AppliedJobCard
                key={
                  getApplicationId(application) ??
                  index
                }
                application={application}
                onWithdraw={withdrawApplication}
              />
            )
          )}
        </div>
      );
    }

    if (loadingApplied) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading applications...
        </div>
      );
    }

    if (filteredAppliedJobs.length === 0) {
      return <EmptyState type="applied" />;
    }

    return (
      <div className="grid gap-4">
        {filteredAppliedJobs.map((application, index) => (
          <AppliedJobCard
            key={
              getApplicationId(application) ??
              index
            }
            application={application}
            onWithdraw={withdrawApplication}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Jobs
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your saved jobs, applications and interviews.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveTab("applied")}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Applications
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {appliedJobs.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness size={21} />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("interviews")}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Interviews
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {interviewApplications.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CalendarDays size={21} />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Saved Jobs
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {savedJobs.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Bookmark size={21} />
              </div>
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search your jobs..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "saved"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Saved
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "saved"
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {savedJobs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("applied")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "applied"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Applied
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "applied"
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {appliedJobs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("interviews")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "interviews"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Interviews
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "interviews"
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {interviewApplications.length}
              </span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </main>
    </div>
  );
}