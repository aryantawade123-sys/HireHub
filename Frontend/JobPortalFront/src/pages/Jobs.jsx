import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaBriefcase,
  FaSearch,
  FaRedo,
  FaFilter,
  FaTimes,
  FaCompass,
} from "react-icons/fa";
import JobDetails from "../components/JobDetails";
import JobSearchBar from "../components/JobSearchBar";
import PaginatedJobList from "../components/PaginatedJobList";
import API_URL from "../api/config";
import apiClient from "../api/client";
import { successToast, errorToast, infoToast } from "../utils/toastUtils";

export default function Jobs() {
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [activeTab, setActiveTab] = useState("for-you");
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  // =========================================================
  // LOAD SAVED JOBS FOR USER
  // =========================================================
  const fetchSavedJobs = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await apiClient.get("/user/saved-jobs");
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];
      setSavedJobIds(new Set(list.map((job) => job.id)));
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  // =========================================================
  // TOGGLE SAVE / BOOKMARK
  // =========================================================
  const handleToggleSave = async (jobId, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    const token = localStorage.getItem("token");
    if (!token) {
      infoToast("You need to be logged in to save jobs.");
      return;
    }

    const isAlreadySaved = savedJobIds.has(jobId);

    try {
      if (isAlreadySaved) {
        await apiClient.delete(`/user/unsave-job/${jobId}`);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        successToast("Job removed from saved list.");
      } else {
        await apiClient.post(`/user/save-job/${jobId}`);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        successToast("Job saved successfully!");
      }
    } catch (err) {
      console.error("Save job error:", err);
      const errorMsg =
        err.response?.data?.message ||
        `Failed to ${isAlreadySaved ? "unsave" : "save"} job.`;
      errorToast(errorMsg);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    fetchAllJobs(0, 10, jobId);
  }, []);

  // =========================================================
  // FETCH NORMAL PAGINATED JOBS
  // =========================================================
  const fetchAllJobs = async (page = 0, size = 10, targetJobId = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/jobs?page=${page}&size=${size}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      const jobList = data.content || [];

      setJobs(jobList);
      setCurrentPage(data.currentPage ?? page);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? jobList.length);

      if (targetJobId) {
        const foundJob = jobList.find(
          (job) => String(job.id) === String(targetJobId)
        );

        if (foundJob) {
          setSelectedJob(foundJob);
          setShowMobileDetails(true);
        } else {
          try {
            const jobResponse = await fetch(`${API_URL}/jobs/${targetJobId}`, {
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (jobResponse.ok) {
              const singleJob = await jobResponse.json();
              setSelectedJob(singleJob);
              setShowMobileDetails(true);
            } else {
              setSelectedJob(jobList[0] || null);
            }
          } catch {
            setSelectedJob(jobList[0] || null);
          }
        }
      } else {
        setSelectedJob(jobList[0] || null);
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("Unable to load jobs. Please check your connection and try again.");
      setJobs([]);
      setSelectedJob(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH ALL JOBS SAFELY FOR SEARCH FILTERING
  // =========================================================
  const fetchAllJobsForSearch = async () => {
    const firstResponse = await fetch(`${API_URL}/jobs?page=0&size=10`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!firstResponse.ok) {
      throw new Error("Unable to fetch jobs");
    }

    const firstData = await firstResponse.json();
    let allJobs = firstData.content || [];
    const totalPagesFromApi = firstData.totalPages || 1;

    if (totalPagesFromApi > 1) {
      const pageRequests = [];
      for (let page = 1; page < totalPagesFromApi; page++) {
        pageRequests.push(
          fetch(`${API_URL}/jobs?page=${page}&size=10`, {
            headers: {
              "Content-Type": "application/json",
            },
          })
        );
      }

      const responses = await Promise.all(pageRequests);
      for (const response of responses) {
        if (!response.ok) {
          throw new Error("Unable to fetch all jobs");
        }
        const data = await response.json();
        allJobs = [...allJobs, ...(data.content || [])];
      }
    }

    return allJobs;
  };

  // =========================================================
  // TEXT HELPERS
  // =========================================================
  const normalizeText = (value) => {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ");
  };

  const getJobSkillsText = (job) => {
    if (Array.isArray(job?.requiredSkills)) {
      return job.requiredSkills.map((skill) => normalizeText(skill)).join(" ");
    }
    return normalizeText(job?.requiredSkills);
  };

  const levenshteinDistance = (a, b) => {
    const first = normalizeText(a);
    const second = normalizeText(b);

    if (!first) return second.length;
    if (!second) return first.length;

    const matrix = Array.from({ length: first.length + 1 }, () =>
      Array(second.length + 1).fill(0)
    );

    for (let i = 0; i <= first.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= second.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= first.length; i++) {
      for (let j = 1; j <= second.length; j++) {
        const cost = first[i - 1] === second[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[first.length][second.length];
  };

  const skillMatches = (requestedSkill, jobText) => {
    const skill = normalizeText(requestedSkill);
    if (!skill) return true;
    if (jobText.includes(skill)) return true;

    const words = jobText.split(/[\s,./()]+/).filter(Boolean);
    return words.some((word) => {
      if (Math.abs(word.length - skill.length) > 2) return false;
      const distance = levenshteinDistance(skill, word);
      if (skill.length <= 4) return distance <= 1;
      return distance <= 2;
    });
  };

  // =========================================================
  // SEARCH HANDLER
  // =========================================================
  const handleSearch = async (filters) => {
    const { title, location, type, workMode, skills } = filters;
    const cleanTitle = normalizeText(title);
    const cleanLocation = normalizeText(location);
    const cleanType = normalizeText(type);
    const cleanWorkMode = normalizeText(workMode);

    const requestedSkills = String(skills || "")
      .split(",")
      .map((skill) => normalizeText(skill))
      .filter(Boolean);

    const hasFilters =
      cleanTitle ||
      cleanLocation ||
      cleanType ||
      cleanWorkMode ||
      requestedSkills.length > 0;

    setActiveFilters(hasFilters ? filters : null);

    if (!hasFilters) {
      setActiveTab("for-you");
      fetchAllJobs(0, 10);
      return;
    }

    setActiveTab("search");
    setLoading(true);
    setError(null);

    try {
      let filteredJobs = await fetchAllJobsForSearch();

      if (cleanTitle) {
        filteredJobs = filteredJobs.filter((job) => {
          const searchableText = `
            ${normalizeText(job.title)}
            ${normalizeText(job.companyName)}
            ${normalizeText(job.description)}
            ${getJobSkillsText(job)}
          `;
          return searchableText.includes(cleanTitle);
        });
      }

      if (cleanLocation) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobLocation = normalizeText(job.location);
          return jobLocation.includes(cleanLocation);
        });
      }

      if (cleanType) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobType = normalizeText(job.type);
          return jobType === cleanType || jobType.includes(cleanType);
        });
      }

      if (cleanWorkMode) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobMode = normalizeText(job.workMode);
          if (cleanWorkMode === "remote") return jobMode.includes("remote");
          if (cleanWorkMode === "hybrid") return jobMode.includes("hybrid");
          if (cleanWorkMode === "onsite" || cleanWorkMode === "on site") {
            return jobMode.includes("onsite") || jobMode.includes("on site");
          }
          return jobMode === cleanWorkMode;
        });
      }

      if (requestedSkills.length > 0) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobSkills = getJobSkillsText(job);
          const searchableText = `
            ${jobSkills}
            ${normalizeText(job.title)}
            ${normalizeText(job.description)}
          `;
          return requestedSkills.every((skill) =>
            skillMatches(skill, searchableText)
          );
        });
      }

      setJobs(filteredJobs);
      setCurrentPage(0);
      setTotalPages(1);
      setTotalElements(filteredJobs.length);
      setSelectedJob(filteredJobs[0] || null);
    } catch (err) {
      console.error("Search error:", err);
      setError("Unable to search jobs right now. Please try again.");
      setJobs([]);
      setSelectedJob(null);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TAB HANDLER
  // =========================================================
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "for-you") {
      fetchAllJobs(0, 10);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setShowMobileDetails(true);
  };

  const handleBackToMobileList = () => {
    setShowMobileDetails(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-16">
      {/* ================= HERO & SEARCH HEADER ================= */}
      <section className="bg-white border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Find Your Next Career Move
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1.5">
                Explore thousands of verified tech, engineering, and product opportunities on HireHub.
              </p>
            </div>

            {/* Live Count Pill */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-blue-50 border border-blue-100 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{totalElements} opportunities active</span>
            </div>
          </div>

          {/* Search Bar */}
          <JobSearchBar onSearch={handleSearch} />

          {/* TABS: For You / Search */}
          <div className="flex items-center gap-8 mt-2 border-b border-gray-200">
            <button
              onClick={() => handleTabChange("for-you")}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
                activeTab === "for-you"
                  ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <FaCompass className={activeTab === "for-you" ? "text-blue-600" : "text-gray-400"} />
              For You
            </button>

            <button
              onClick={() => handleTabChange("search")}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
                activeTab === "search"
                  ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <FaSearch className={activeTab === "search" ? "text-blue-600" : "text-gray-400"} />
              Search Results
              {activeTab === "search" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                  {jobs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {activeTab === "search" ? "Search Results" : "Featured & Recommended Jobs"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
              {activeTab === "for-you" && totalElements > 0 ? ` of ${totalElements} total` : ""}
            </p>
          </div>

          {activeTab === "search" && activeFilters && (
            <button
              onClick={() => {
                setActiveFilters(null);
                handleTabChange("for-you");
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FaTimes className="text-[10px]" />
              Reset to For You feed
            </button>
          )}
        </div>

        {/* API ERROR STATE */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/80 p-6 text-red-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <FaTimes className="text-lg" />
              </div>
              <div>
                <h4 className="font-bold text-base text-red-900">
                  Unable to load job listings
                </h4>
                <p className="text-xs sm:text-sm text-red-700 mt-0.5">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchAllJobs(currentPage, 10)}
              className="self-start sm:self-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <FaRedo className="text-xs" />
              Retry
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[440px_minmax(0,1fr)] gap-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
                      <div className="h-3 bg-gray-100 rounded-md w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl p-8 animate-pulse h-96">
              <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/3 mb-8"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-100 rounded-md w-full"></div>
                <div className="h-3 bg-gray-100 rounded-md w-5/6"></div>
                <div className="h-3 bg-gray-100 rounded-md w-4/6"></div>
              </div>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No matching jobs found
            </h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              We couldn't find any opportunities matching your selected criteria. Try adjusting your keyword, removing location filters, or resetting to all jobs.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => {
                  setActiveFilters(null);
                  handleTabChange("for-you");
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                Show All Available Jobs
              </button>
            </div>
          </div>
        ) : (
          /* TWO-COLUMN LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-[440px_minmax(0,1fr)] gap-6 items-start">
            {/* LEFT COLUMN: Searchable Job Cards */}
            <div
              className={`min-w-0 ${
                showMobileDetails ? "hidden lg:block" : "block"
              }`}
            >
              <PaginatedJobList
                jobs={jobs}
                selectedJob={selectedJob}
                onSelect={handleSelectJob}
                savedJobIds={savedJobIds}
                onToggleSave={handleToggleSave}
              />

              {/* PAGINATION (For You tab) */}
              {activeTab === "for-you" && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                  <button
                    onClick={() => fetchAllJobs(currentPage - 1, 10)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition border border-gray-200 cursor-pointer"
                  >
                    Previous
                  </button>

                  <span className="text-xs font-medium text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => fetchAllJobs(currentPage + 1, 10)}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition border border-gray-200 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Selected Job Details */}
            <div
              className={`min-w-0 ${
                showMobileDetails ? "block" : "hidden lg:block"
              }`}
            >
              <div className="lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                <JobDetails
                  job={selectedJob}
                  isSaved={selectedJob ? savedJobIds.has(selectedJob.id) : false}
                  onToggleSave={handleToggleSave}
                  onBack={showMobileDetails ? handleBackToMobileList : null}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}