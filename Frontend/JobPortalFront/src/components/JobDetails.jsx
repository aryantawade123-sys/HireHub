import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaBookmark,
  FaRegBookmark,
  FaArrowLeft,
  FaBriefcase,
  FaCheckCircle,
  FaMoneyBillWave,
  FaRegClock,
  FaBolt,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaStar,
  FaBuilding,
  FaShareAlt,
  FaThumbsUp,
  FaSmile,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import {
  successToast,
  errorToast,
  infoToast,
} from "../utils/toastUtils";
import CompanyLogo from "./CompanyLogo";
import { getCompanyRating } from "../pages/Home";

export default function JobDetails({
  job,
  isSaved: propIsSaved,
  onToggleSave: propOnToggleSave,
  onBack,
}) {
  const navigate = useNavigate();

  const [internalSaved, setInternalSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isJobActive, setIsJobActive] = useState(job?.active !== false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const isSaved =
    propIsSaved !== undefined ? propIsSaved : internalSaved;

  const { rating, reviews } = getCompanyRating(job?.companyName);

  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    currentUser = null;
  }

  const userRole = String(currentUser?.role || "").toUpperCase();

  const isEmployer =
    userRole === "EMPLOYER" ||
    userRole === "ROLE_EMPLOYER";

  useEffect(() => {
    setIsJobActive(job?.active !== false);
  }, [job?.id, job?.active]);

  useEffect(() => {
    const fetchJobStatus = async () => {
      const token = localStorage.getItem("token");

      if (!token || !job?.id) return;

      try {
        if (propIsSaved === undefined) {
          const { data: savedJobs } =
            await apiClient.get("/user/saved-jobs");

          const list = Array.isArray(savedJobs)
            ? savedJobs
            : savedJobs?.content || [];

          setInternalSaved(
            list.some((s) => s.id === job.id)
          );
        }

        const { data: applied } =
          await apiClient.get(
            `/applications/has-applied/${job.id}`
          );

        setHasApplied(Boolean(applied));
      } catch (err) {
        console.error("Error fetching job status:", err);
      }
    };

    fetchJobStatus();
  }, [job?.id, propIsSaved]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";

    try {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      return new Date(dateStr).toLocaleDateString(
        undefined,
        options
      );
    } catch {
      return "Recently";
    }
  };

  const handleApply = () => {
    if (!job?.id) return;

    if (!isJobActive && !hasApplied) {
      infoToast("This job is no longer accepting applications.");
      return;
    }

    navigate(`/apply/${job.id}`);
  };

  const handleCompanyClick = () => {
    if (job?.companyName) {
      navigate(
        `/company/${encodeURIComponent(job.companyName)}`
      );
    }
  };

  const handleSaveToggle = async (e) => {
    if (propOnToggleSave) {
      propOnToggleSave(job.id, e);
      return;
    }

    if (!localStorage.getItem("token")) {
      infoToast("You need to be logged in to save jobs.");
      return;
    }

    setSaving(true);

    try {
      if (internalSaved) {
        await apiClient.delete(
          `/user/unsave-job/${job.id}`
        );

        setInternalSaved(false);

        successToast("Job removed from saved list.");
      } else {
        await apiClient.post(
          `/user/save-job/${job.id}`
        );

        setInternalSaved(true);

        successToast("Job saved successfully!");
      }
    } catch (err) {
      console.error(err);

      const errorMsg =
        err.response?.data?.message ||
        `Failed to ${
          internalSaved ? "unsave" : "save"
        } job.`;

      errorToast(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        window.location.href
      );

      successToast("Job link copied to clipboard!");
    }
  };

  const handleToggleJobStatus = async () => {
    if (!job?.id || !isEmployer) return;

    setTogglingStatus(true);

    try {
      const { data } = await apiClient.patch(
        `/jobs/${job.id}/toggle-status`
      );

      const newStatus =
        typeof data?.active === "boolean"
          ? data.active
          : !isJobActive;

      setIsJobActive(newStatus);

      successToast(
        newStatus
          ? "Job reopened successfully!"
          : "Job closed successfully!"
      );
    } catch (err) {
      console.error(
        "Failed to toggle job status:",
        err
      );

      const errorMsg =
        err.response?.data?.message ||
        "Failed to update job status.";

      errorToast(errorMsg);
    } finally {
      setTogglingStatus(false);
    }
  };

  if (!job) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <FaBriefcase className="text-2xl" />
        </div>

        <h3 className="text-lg font-bold text-gray-900">
          Select a job to view details
        </h3>

        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Choose any job card from the list on the left to
          see full salary insights, company reviews,
          qualifications, and 1-click Easy Apply.
        </p>
      </div>
    );
  }

  const salaryDisplay = job.salary
    ? `${job.salary} (Employer Est.)`
    : "$110,000 - $145,000 / yr (Glassdoor Est.)";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">

      {/* Back button for mobile view */}
      {onBack && (
        <div className="lg:hidden p-4 border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <FaArrowLeft className="text-xs" />
            Back to job list
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="p-6 border-b border-gray-100 bg-white">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-4 min-w-0">

            {/* Company Logo */}
            <button
              onClick={handleCompanyClick}
              title={`View ${job.companyName}`}
              className="hover:scale-105 transition cursor-pointer flex-shrink-0 mt-1"
            >
              <CompanyLogo
                companyName={job.companyName}
                logoUrl={job.profilePicture}
                size="xl"
              />
            </button>

            {/* Title & Company Info */}
            <div className="min-w-0">

              <div className="flex items-center gap-2 flex-wrap">

                <button
                  onClick={handleCompanyClick}
                  className="text-sm font-bold text-gray-700 hover:text-emerald-700 hover:underline transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{job.companyName}</span>
                  <FaExternalLinkAlt className="text-[10px] text-gray-400" />
                </button>

                {/* Rating Badge */}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ★ {rating}
                </span>

                <span className="text-xs text-gray-400">
                  ({reviews} reviews)
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug mt-1">
                {job.title}
              </h1>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600 flex-wrap">

                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-gray-400 text-xs" />
                  {job.location || "Remote"}
                </span>

                <span className="text-gray-300">•</span>

                <span className="text-gray-500">
                  Posted {formatDate(job.postedAt)}
                </span>

              </div>
            </div>
          </div>

        </div>

        {/* JOB STATUS */}
        <div className="flex flex-wrap items-center gap-2 mt-5">

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
              isJobActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isJobActive
                  ? "bg-emerald-500"
                  : "bg-gray-400"
              }`}
            />
            {isJobActive ? "Open" : "Closed"}
          </span>

          {!isJobActive && (
            <span className="text-xs font-medium text-gray-500">
              This job is no longer accepting applications.
            </span>
          )}

        </div>

        {/* EMPLOYER JOB CONTROL */}
        {isEmployer && (
          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div>
                <p className="text-sm font-bold text-gray-800">
                  Job Status
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  {isJobActive
                    ? "This job is currently accepting applications."
                    : "This job is closed and no longer accepting new applications."}
                </p>
              </div>

              <button
                onClick={handleToggleJobStatus}
                disabled={togglingStatus}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  isJobActive
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {togglingStatus ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : isJobActive ? (
                  <>
                    <FaTimesCircle />
                    Close Job
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Reopen Job
                  </>
                )}
              </button>

            </div>
          </div>
        )}

        {/* SALARY BENCHMARK CARD */}
        <div className="mt-5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <FaMoneyBillWave className="text-lg" />
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Salary Benchmark
              </p>

              <p className="text-base font-extrabold text-emerald-950">
                {salaryDisplay}
              </p>
            </div>

          </div>

          <div className="text-xs text-emerald-700 font-medium">
            Based on similar roles & market rates
          </div>

        </div>

        {/* Highlight Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">

          {isJobActive && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
              <FaBolt className="text-[10px]" />
              Easy Apply
            </span>
          )}

          {job.workMode && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {job.workMode}
            </span>
          )}

          {job.type && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {String(job.type).replace(/_/g, " ")}
            </span>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">

          <button
            onClick={handleApply}
            disabled={!isJobActive && !hasApplied}
            className={`flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm ${
              hasApplied
                ? "bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
                : !isJobActive
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white cursor-pointer shadow-md"
            }`}
          >
            <FaBolt className="text-xs" />

            {hasApplied
              ? "Applied – View Application"
              : !isJobActive
              ? "Applications Closed"
              : "Easy Apply"}
          </button>

          <button
            onClick={handleSaveToggle}
            disabled={saving}
            title={
              isSaved
                ? "Remove from saved"
                : "Save job"
            }
            className={`px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer ${
              isSaved
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : isSaved ? (
              <FaBookmark className="text-emerald-600" />
            ) : (
              <FaRegBookmark className="text-gray-500" />
            )}

            <span className="hidden sm:inline">
              {isSaved ? "Saved" : "Save"}
            </span>
          </button>

          <button
            onClick={handleShare}
            title="Share job"
            className="p-3.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            <FaShareAlt className="text-sm" />
          </button>

        </div>

        {/* Glassdoor Internal Tabs */}
        <div className="flex items-center gap-6 mt-6 border-t border-gray-100 pt-3 text-sm font-semibold">

          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 border-b-2 transition cursor-pointer ${
              activeTab === "overview"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Job Overview
          </button>

          <button
            onClick={() => setActiveTab("company")}
            className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "company"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Company Insights

            <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
              ★ {rating}
            </span>
          </button>

        </div>
      </div>

      {/* BODY SECTION */}
      <div className="p-6 space-y-8">

        {activeTab === "overview" ? (
          <>

            {/* JOB DESCRIPTION */}
            {job.description?.trim() && (
              <section>

                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaBriefcase className="text-emerald-600 text-sm" />
                  About the Role & Description
                </h2>

                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-5 rounded-xl border border-gray-100">
                  {job.description}
                </div>

              </section>
            )}

            {/* QUALIFICATIONS & SKILLS */}
            <section>

              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaGraduationCap className="text-emerald-600 text-base" />
                Required Skills & Qualifications
              </h2>

              {Array.isArray(job.requiredSkills) &&
              job.requiredSkills.length > 0 ? (
                <div>
                  <div className="flex flex-wrap gap-2">

                    {job.requiredSkills.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Refer to the role description above for
                  specific prerequisites.
                </p>
              )}

            </section>

            {/* RESPONSIBILITIES */}
            {Array.isArray(job.responsibilities) &&
              job.responsibilities.length > 0 && (
                <section>

                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-600 text-sm" />
                    Key Responsibilities
                  </h2>

                  <div className="space-y-2.5">

                    {job.responsibilities.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0 text-xs" />

                          <span className="leading-snug">
                            {item}
                          </span>
                        </div>
                      )
                    )}

                  </div>

                </section>
              )}

            {/* SCREENING QUESTIONS */}
            {Array.isArray(job.screeningQuestions) &&
              job.screeningQuestions.length > 0 && (
                <section>

                  <h2 className="text-base font-bold text-gray-900 mb-3">
                    Screening Questions for Applicants
                  </h2>

                  <div className="space-y-2.5">

                    {job.screeningQuestions.map(
                      (question, index) => (
                        <div
                          key={index}
                          className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 font-medium"
                        >
                          <span className="text-emerald-600 font-bold mr-2">
                            Q{index + 1}:
                          </span>

                          {question}
                        </div>
                      )
                    )}

                  </div>

                </section>
              )}

          </>
        ) : (

          /* GLASSDOOR COMPANY INSIGHTS TAB */
          <div className="space-y-6">

            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {job.companyName} Workplace Rating
                  </h3>

                  <p className="text-xs text-gray-500">
                    Based on {reviews} employee reviews on
                    HireHub
                  </p>

                </div>

                <div className="text-right">

                  <div className="text-3xl font-extrabold text-emerald-700">
                    {rating}{" "}
                    <span className="text-lg">★</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Out of 5.0
                  </div>

                </div>

              </div>

              {/* Sub-ratings breakdown */}
              <div className="space-y-3 mt-4 pt-4 border-t border-emerald-200/60 text-xs font-semibold text-gray-700">

                <div>

                  <div className="flex justify-between mb-1">
                    <span>Culture & Values</span>
                    <span className="text-emerald-700 font-bold">
                      4.6 ★
                    </span>
                  </div>

                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: "92%" }}
                    />
                  </div>

                </div>

                <div>

                  <div className="flex justify-between mb-1">
                    <span>
                      Compensation & Benefits
                    </span>

                    <span className="text-emerald-700 font-bold">
                      4.5 ★
                    </span>
                  </div>

                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: "90%" }}
                    />
                  </div>

                </div>

                <div>

                  <div className="flex justify-between mb-1">
                    <span>
                      Work / Life Balance
                    </span>

                    <span className="text-emerald-700 font-bold">
                      4.4 ★
                    </span>
                  </div>

                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: "88%" }}
                    />
                  </div>

                </div>

                <div>

                  <div className="flex justify-between mb-1">
                    <span>
                      Career Opportunities
                    </span>

                    <span className="text-emerald-700 font-bold">
                      4.3 ★
                    </span>
                  </div>

                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: "86%" }}
                    />
                  </div>

                </div>

              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-emerald-200/60 text-center">

                <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">

                  <div className="text-xl font-extrabold text-emerald-700">
                    89%
                  </div>

                  <div className="text-[11px] text-gray-600 flex items-center justify-center gap-1 mt-0.5">
                    <FaThumbsUp className="text-emerald-600" />
                    Recommend to a friend
                  </div>

                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">

                  <div className="text-xl font-extrabold text-emerald-700">
                    92%
                  </div>

                  <div className="text-[11px] text-gray-600 flex items-center justify-center gap-1 mt-0.5">
                    <FaSmile className="text-emerald-600" />
                    Positive business outlook
                  </div>

                </div>

              </div>

            </div>

            <div className="text-center pt-2">

              <button
                onClick={handleCompanyClick}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:border-emerald-600 text-gray-800 hover:text-emerald-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                View all open roles at{" "}
                {job.companyName} →
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}