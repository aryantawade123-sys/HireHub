import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaArrowRight,
  FaTimesCircle,
} from "react-icons/fa";
import apiClient from "../api/client";

// Status badge component
function StatusBadge({ status }) {
  const map = {
    PENDING: { cls: "badge-pending", label: "Pending" },
    INTERVIEW: { cls: "badge-interview", label: "Interview" },
    OFFERED: { cls: "badge-accepted", label: "Offered" },
    REJECTED: { cls: "badge-rejected", label: "Rejected" },
  };

  const { cls = "badge-pending", label = status } = map[status] || {};

  return (
    <span
      className={`${cls} px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}
    >
      {label}
    </span>
  );
}

// Stat card component
function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        {icon}
      </div>

      <div className="text-2xl font-bold text-gray-900">{value}</div>

      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function EmployerDashboard() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const [allJobs, setAllJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [pending, setPending] = useState(0);
  const [interview, setInterview] = useState(0);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const { data } = await apiClient.get("/applications/employer");

        setApplications(data);

        setPending(
          data.filter((a) => a.status === "PENDING").length
        );

        setInterview(
          data.filter((a) => a.status === "INTERVIEW").length
        );

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.appliedAt) - new Date(a.appliedAt)
        );

        setRecentApplicants(sorted.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoadingApps(false);
      }
    }

    fetchApplications();
  }, []);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data } = await apiClient.get("/jobs/my");

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.postedAt) - new Date(a.postedAt)
        );

        setAllJobs(data);
        setRecentJobs(sorted.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    }

    fetchJobs();
  }, []);

  const isNew = (appliedAt) => {
    const daysAgo =
      (Date.now() - new Date(appliedAt)) /
      (1000 * 60 * 60 * 24);

    return daysAgo < 2;
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back,{" "}
              {user?.companyName || user?.name || "Employer"} 👋
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Here's an overview of your hiring activity.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-job")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm cursor-pointer"
          >
            <FaPlus className="text-xs" />
            Post a Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <StatCard
            icon={<FaBriefcase className="text-blue-600 text-lg" />}
            color="bg-blue-50"
            label="Jobs Posted"
            value={loadingJobs ? "—" : allJobs.length}
            onClick={() => navigate("/employer/jobs")}
          />

          <StatCard
            icon={<FaUsers className="text-emerald-600 text-lg" />}
            color="bg-emerald-50"
            label="Total Applications"
            value={loadingApps ? "—" : applications.length}
            onClick={() => navigate("/employer/applicants")}
          />

          <StatCard
            icon={<FaClock className="text-amber-600 text-lg" />}
            color="bg-amber-50"
            label="Pending Review"
            value={loadingApps ? "—" : pending}
            onClick={() => navigate("/employer/applicants")}
          />

          <StatCard
            icon={<FaCheckCircle className="text-violet-600 text-lg" />}
            color="bg-violet-50"
            label="Interviews Scheduled"
            value={loadingApps ? "—" : interview}
            onClick={() => navigate("/employer/applicants")}
          />

        </div>

        {/* Two Column: Recent Jobs + Recent Applicants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Recent Jobs
              </h2>

              <button
                onClick={() => navigate("/employer/jobs")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                View all
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">

              {loadingJobs ? (
                [1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="px-5 py-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))
              ) : recentJobs.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-400">
                  No jobs posted yet.{" "}
                  <button
                    onClick={() => navigate("/create-job")}
                    className="text-blue-600 font-semibold cursor-pointer hover:underline"
                  >
                    Post your first job
                  </button>
                </div>
              ) : (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() =>
                      navigate(`/employer/jobs/${job.id}`)
                    }
                    className="px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {job.title}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {job.location || "Location not set"}
                        </p>
                      </div>

                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                        {formatDate(job.postedAt)}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 mt-2">

                      {/* Dynamic Job Status */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          job.active
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {job.active ? "Open" : "Closed"}
                      </span>

                      {job.type && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {String(job.type).replace(/_/g, " ")}
                        </span>
                      )}

                    </div>
                  </div>
                ))
              )}

            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => navigate("/create-job")}
                className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer py-1"
              >
                + Post New Job
              </button>
            </div>

          </div>

          {/* Recent Applicants */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Recent Applicants
              </h2>

              <button
                onClick={() => navigate("/employer/applicants")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                View all
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">

              {loadingApps ? (
                [1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="px-5 py-4 animate-pulse flex gap-3"
                  >
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentApplicants.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-400">
                  No applications received yet.
                </div>
              ) : (
                recentApplicants.map((a, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      navigate(`/employer/applications/${a.id}`)
                    }
                    className="px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer flex items-center gap-3"
                  >

                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0 uppercase">
                      {(a.applicantUsername || "U")[0]}
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {a.applicantUsername}
                        </span>

                        {isNew(a.appliedAt) && (
                          <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full font-semibold">
                            New
                          </span>
                        )}

                      </div>

                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        Applied for{" "}
                        <strong className="text-gray-700">
                          {a.jobTitle}
                        </strong>
                      </p>

                    </div>

                    <div className="flex-shrink-0">
                      <StatusBadge status={a.status} />
                    </div>

                  </div>
                ))
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}