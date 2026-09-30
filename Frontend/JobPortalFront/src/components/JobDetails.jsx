import {
  FaBuilding,
  FaMapMarkerAlt,
  FaBookmark,
  FaRegBookmark,
  FaArrowLeft,
  FaBriefcase,
  FaCheckCircle,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  successToast,
  errorToast,
  infoToast,
} from "../utils/toastUtils";

import apiClient from "../api/client";

export default function JobDetails({ job }) {
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saving, setSaving] = useState(false);

  const getInitials = (companyName = "") => {
    const words = companyName.trim().split(/\s+/);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return companyName.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      const token = localStorage.getItem("token");

      if (!token || !job) return;

      try {
        const { data: savedJobs } =
          await apiClient.get("/user/saved-jobs");

        setSaved(
          savedJobs.some(
            (savedJob) => savedJob.id === job.id
          )
        );

        const { data: applied } =
          await apiClient.get(
            `/applications/has-applied/${job.id}`
          );

        setHasApplied(applied);

      } catch (err) {
        console.error(
          "Error fetching job status:",
          err
        );
      }
    };

    fetchStatuses();
  }, [job]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Date(dateStr).toLocaleDateString(
      undefined,
      options
    );
  };

  const handleApply = () => {
    navigate(`/apply/${job.id}`);
  };

  const handleCompanyClick = () => {
    navigate(
      `/company/${encodeURIComponent(
        job.companyName
      )}`
    );
  };

  const toggleSave = async () => {
    if (!localStorage.getItem("token")) {
      infoToast(
        "You need to be logged in to save jobs."
      );
      return;
    }

    setSaving(true);

    try {
      if (saved) {
        await apiClient.delete(
          `/user/unsave-job/${job.id}`
        );

        setSaved(false);

        successToast(
          "Job removed from saved list."
        );
      } else {
        await apiClient.post(
          `/user/save-job/${job.id}`
        );

        setSaved(true);

        successToast(
          "Job saved successfully!"
        );
      }

    } catch (err) {
      console.error(err);

      const errorMsg =
        err.response?.data?.message ||
        `Failed to ${
          saved ? "unsave" : "save"
        } job.`;

      errorToast(errorMsg);

    } finally {
      setSaving(false);
    }
  };

  if (!job) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <FaBriefcase className="mx-auto text-4xl text-gray-300" />

        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          Select a job
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Select a job from the list to view its details.
        </p>
      </div>
    );
  }

  const companyInitials = getInitials(
    job.companyName
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* ================= HEADER ================= */}

      <div className="p-5 md:p-6 border-b border-gray-100">

        {/* Back */}

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-5 transition"
        >
          <FaArrowLeft size={12} />
          Back
        </button>


        {/* Company + Job */}

        <div className="flex items-start gap-4">

          {/* Company Avatar */}

          <button
            onClick={handleCompanyClick}
            title={`View ${job.companyName}`}
            className="w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-gray-200 flex items-center justify-center hover:shadow-md hover:scale-105 transition"
          >
            <span className="text-xl font-bold text-blue-700">
              {companyInitials}
            </span>
          </button>


          {/* Title */}

          <div className="flex-1 min-w-0">

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {job.title}
            </h1>

            <button
              onClick={handleCompanyClick}
              className="mt-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:underline transition"
            >
              {job.companyName}
            </button>

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <FaMapMarkerAlt className="text-blue-500" />
              {job.location}
            </div>

          </div>

        </div>


        {/* Meta */}

        <div className="flex flex-wrap gap-2 mt-5">

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">
            {job.type?.replace("_", " ")}
          </span>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
            {job.workMode}
          </span>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            Posted {formatDate(job.postedAt)}
          </span>

        </div>


        {/* Actions */}

        <div className="flex gap-3 mt-5">

          <button
            onClick={handleApply}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold transition ${
              hasApplied
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {hasApplied
              ? "Applied – View Application"
              : "Apply Now"}
          </button>


          <button
            onClick={toggleSave}
            disabled={saving}
            className={`px-4 py-2.5 rounded-xl border font-semibold transition flex items-center gap-2 ${
              saved
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >

            {saving ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <FaBookmark />
            ) : (
              <FaRegBookmark />
            )}

            <span className="hidden sm:inline">
              {saved ? "Saved" : "Save"}
            </span>

          </button>

        </div>

      </div>


      {/* ================= BODY ================= */}

      <div className="p-5 md:p-6">


        {/* DESCRIPTION */}

        {job.description?.trim() && (
          <section className="mb-7">

            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Job Description
            </h2>

            <p className="text-sm text-gray-600 leading-7">
              {job.description}
            </p>

          </section>
        )}


        {/* RESPONSIBILITIES */}

        {Array.isArray(job.responsibilities) &&
          job.responsibilities.length > 0 && (

          <section className="mb-7">

            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Responsibilities
            </h2>

            <div className="space-y-3">

              {job.responsibilities.map(
                (item, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >

                    <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />

                    <span>{item}</span>

                  </div>

                )
              )}

            </div>

          </section>
        )}


        {/* SKILLS */}

        {Array.isArray(job.requiredSkills) &&
          job.requiredSkills.length > 0 && (

          <section className="mb-7">

            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Required Skills
            </h2>

            <div className="flex flex-wrap gap-2">

              {job.requiredSkills.map(
                (skill, index) => (

                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"
                  >
                    {skill}
                  </span>

                )
              )}

            </div>

          </section>
        )}


        {/* SCREENING QUESTIONS */}

        {Array.isArray(job.screeningQuestions) &&
          job.screeningQuestions.length > 0 && (

          <section>

            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Screening Questions
            </h2>

            <div className="space-y-3">

              {job.screeningQuestions.map(
                (question, index) => (

                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >

                    <p className="text-sm font-medium text-gray-700">
                      {index + 1}. {question}
                    </p>

                  </div>

                )
              )}

            </div>

          </section>
        )}

      </div>

    </div>
  );
}