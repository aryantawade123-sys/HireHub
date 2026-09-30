import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiMapPin,
  FiClock,
} from "react-icons/fi";

import ScreeningQuestions from "../components/ScreeningQuestions";
import ApplicationDetails from "../components/ApplicationDetails";
import JobDetails from "../components/JobDetails";
import apiClient from "../api/client";

export default function ApplyPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [step, setStep] = useState(1);
  const [screeningAnswers, setScreeningAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH JOB
  // =========================================================
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiClient.get(`/jobs/${jobId}`);

        const data = res.data;

        setJob(data);

        // No screening questions = directly go to step 2
        if (
          !data.screeningQuestions ||
          data.screeningQuestions.length === 0
        ) {
          setStep(2);
        }
      } catch (err) {
        console.error("Error loading job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // =========================================================
  // SCREENING QUESTIONS → APPLICATION DETAILS
  // =========================================================
  const handleNextStep = (answers) => {
    setScreeningAnswers(answers);
    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-sm text-gray-500">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // JOB NOT FOUND
  // =========================================================
  if (!job) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-md w-full shadow-sm">

          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Job not found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            We couldn't load this job. Please go back and try again.
          </p>

          <button
            onClick={() => navigate("/jobs")}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            <FiArrowLeft />
            Back to Jobs
          </button>

        </div>
      </div>
    );
  }

  const hasScreeningQuestions =
    job.screeningQuestions &&
    job.screeningQuestions.length > 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* =====================================================
          TOP BAR
      ====================================================== */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            <FiArrowLeft />
            Back
          </button>

        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* HEADER */}
        <div className="mb-8">

          <div className="flex items-center gap-3 mb-3">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiBriefcase className="text-xl" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Job Application
              </p>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Apply for this position
              </h1>
            </div>

          </div>

          <p className="text-gray-500 text-sm md:text-base">
            Complete the application below to apply for{" "}
            <span className="font-semibold text-gray-700">
              {job.title}
            </span>
            .
          </p>

        </div>

        {/* =====================================================
            APPLICATION PROGRESS
        ====================================================== */}
        {hasScreeningQuestions && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Application progress
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {step === 1
                    ? "Answer the screening questions"
                    : "Complete your application details"}
                </p>
              </div>

              <span className="text-xs font-semibold text-gray-500">
                Step {step} of 2
              </span>

            </div>

            <div className="flex items-center">

              {/* STEP 1 */}
              <div className="flex items-center gap-2">

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    step >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > 1 ? (
                    <FiCheck />
                  ) : (
                    "1"
                  )}
                </div>

                <span
                  className={`hidden sm:block text-sm font-medium ${
                    step >= 1
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  Screening
                </span>

              </div>

              {/* CONNECTOR */}
              <div
                className={`flex-1 h-1 mx-3 rounded-full transition ${
                  step >= 2
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              />

              {/* STEP 2 */}
              <div className="flex items-center gap-2">

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    step >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  2
                </div>

                <span
                  className={`hidden sm:block text-sm font-medium ${
                    step >= 2
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  Application
                </span>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            TWO COLUMN LAYOUT
        ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">

          {/* ===================================================
              LEFT — APPLICATION FORM
          ==================================================== */}
          <div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              {/* FORM HEADER */}
              <div className="px-6 md:px-8 py-6 border-b border-gray-100">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">
                      {step === 1
                        ? "Screening Questions"
                        : "Application Details"}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {step === 1
                        ? "Help the employer understand your experience and skills."
                        : "Provide your details to complete your application."}
                    </p>

                  </div>

                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-500">
                    {step === 1 ? "01" : "02"}
                  </div>

                </div>

              </div>

              {/* FORM CONTENT */}
              <div className="p-6 md:p-8">

                {step === 1 && (
                  <ScreeningQuestions
                    questions={job.screeningQuestions || []}
                    onNext={handleNextStep}
                  />
                )}

                {step === 2 && (
                  <ApplicationDetails
                    jobId={job.id}
                    screeningAnswers={screeningAnswers}
                  />
                )}

              </div>

            </div>

          </div>

          {/* ===================================================
              RIGHT — JOB SUMMARY
          ==================================================== */}
          <div className="lg:sticky lg:top-6">

            {/* JOB SUMMARY CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">

              <div className="p-6">

                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
                  You're applying for
                </p>

                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {job.title}
                </h2>

                <p className="text-sm font-medium text-gray-600 mt-2">
                  {job.companyName}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">

                  {job.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-xs font-medium">
                      <FiMapPin />
                      {job.location}
                    </span>
                  )}

                  {job.type && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      <FiBriefcase />
                      {String(job.type).replaceAll("_", " ")}
                    </span>
                  )}

                  {job.workMode && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      <FiClock />
                      {String(job.workMode).replaceAll("_", " ")}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* FULL JOB DETAILS */}
            <JobDetails job={job} />

          </div>

        </div>

      </main>
    </div>
  );
}