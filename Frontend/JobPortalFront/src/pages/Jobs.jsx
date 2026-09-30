import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobDetails from "../components/JobDetails";
import JobSearchBar from "../components/JobSearchBar";
import PaginatedJobList from "../components/PaginatedJobList";
import API_URL from "../api/config";

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
  const fetchAllJobs = async (
    page = 0,
    size = 10,
    targetJobId = null
  ) => {
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
        } else {
          try {
            const jobResponse = await fetch(
              `${API_URL}/jobs/${targetJobId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (jobResponse.ok) {
              const singleJob = await jobResponse.json();
              setSelectedJob(singleJob);
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

      setError("Unable to load jobs. Please try again.");
      setJobs([]);
      setSelectedJob(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH ALL JOBS SAFELY
  // Fetches 10 jobs per request instead of size=150
  // =========================================================
  const fetchAllJobsForSearch = async () => {
    const firstResponse = await fetch(
      `${API_URL}/jobs?page=0&size=10`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!firstResponse.ok) {
      throw new Error("Unable to fetch jobs");
    }

    const firstData = await firstResponse.json();

    let allJobs = firstData.content || [];

    const totalPagesFromApi = firstData.totalPages || 1;

    // Fetch remaining pages
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

        allJobs = [
          ...allJobs,
          ...(data.content || []),
        ];
      }
    }

    return allJobs;
  };

  // =========================================================
  // NORMALIZE TEXT
  // =========================================================
  const normalizeText = (value) => {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ");
  };

  // =========================================================
  // JOB SKILLS
  // =========================================================
  const getJobSkillsText = (job) => {
    if (Array.isArray(job?.requiredSkills)) {
      return job.requiredSkills
        .map((skill) => normalizeText(skill))
        .join(" ");
    }

    return normalizeText(job?.requiredSkills);
  };

  // =========================================================
  // SKILL TYPO MATCHING
  // =========================================================
  const levenshteinDistance = (a, b) => {
    const first = normalizeText(a);
    const second = normalizeText(b);

    if (!first) return second.length;
    if (!second) return first.length;

    const matrix = Array.from(
      { length: first.length + 1 },
      () => Array(second.length + 1).fill(0)
    );

    for (let i = 0; i <= first.length; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= second.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= first.length; i++) {
      for (let j = 1; j <= second.length; j++) {
        const cost =
          first[i - 1] === second[j - 1] ? 0 : 1;

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

    if (!skill) {
      return true;
    }

    if (jobText.includes(skill)) {
      return true;
    }

    const words = jobText
      .split(/[\s,./()]+/)
      .filter(Boolean);

    return words.some((word) => {
      if (Math.abs(word.length - skill.length) > 2) {
        return false;
      }

      const distance = levenshteinDistance(
        skill,
        word
      );

      if (skill.length <= 4) {
        return distance <= 1;
      }

      return distance <= 2;
    });
  };

  // =========================================================
  // SEARCH + FILTER
  // =========================================================
  const handleSearch = async ({
    title,
    location,
    type,
    workMode,
    skills,
  }) => {
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

    // =======================================================
    // NO FILTERS
    // =======================================================
    if (!hasFilters) {
      setActiveTab("for-you");
      fetchAllJobs(0, 10);
      return;
    }

    setActiveTab("search");
    setLoading(true);
    setError(null);

    try {
      // Get all jobs safely, 10 per API request
      let filteredJobs = await fetchAllJobsForSearch();

      // =====================================================
      // KEYWORD
      // =====================================================
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

      // =====================================================
      // LOCATION
      // =====================================================
      if (cleanLocation) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobLocation = normalizeText(
            job.location
          );

          return jobLocation.includes(cleanLocation);
        });
      }

      // =====================================================
      // JOB TYPE
      // =====================================================
      if (cleanType) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobType = normalizeText(job.type);

          return (
            jobType === cleanType ||
            jobType.includes(cleanType)
          );
        });
      }

      // =====================================================
      // WORK MODE
      // =====================================================
      if (cleanWorkMode) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobMode = normalizeText(
            job.workMode
          );

          if (cleanWorkMode === "remote") {
            return jobMode.includes("remote");
          }

          if (cleanWorkMode === "hybrid") {
            return jobMode.includes("hybrid");
          }

          if (
            cleanWorkMode === "onsite" ||
            cleanWorkMode === "on site"
          ) {
            return (
              jobMode.includes("onsite") ||
              jobMode.includes("on site")
            );
          }

          return jobMode === cleanWorkMode;
        });
      }

      // =====================================================
      // SKILLS
      // =====================================================
      if (requestedSkills.length > 0) {
        filteredJobs = filteredJobs.filter((job) => {
          const jobSkills = getJobSkillsText(job);

          const searchableText = `
            ${jobSkills}
            ${normalizeText(job.title)}
            ${normalizeText(job.description)}
          `;

          return requestedSkills.every((skill) =>
            skillMatches(
              skill,
              searchableText
            )
          );
        });
      }

      // =====================================================
      // FINAL RESULTS
      // =====================================================
      setJobs(filteredJobs);
      setCurrentPage(0);
      setTotalPages(1);
      setTotalElements(filteredJobs.length);
      setSelectedJob(filteredJobs[0] || null);

    } catch (err) {
      console.error("Search error:", err);

      setError(
        "Unable to search jobs right now. Please try again."
      );

      setJobs([]);
      setSelectedJob(null);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TAB CHANGE
  // =========================================================
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "for-you") {
      fetchAllJobs(0, 10);
    }
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* HERO */}
      <section className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-6">

          <div className="mb-6">

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Find your next opportunity
            </h1>

            <p className="text-gray-500 mt-2">
              Discover jobs that match your skills and career goals.
            </p>

          </div>

          <JobSearchBar onSearch={handleSearch} />

          {/* TABS */}
          <div className="flex items-center gap-8 mt-4 border-b border-gray-200">

            <button
              onClick={() =>
                handleTabChange("for-you")
              }
              className={`pb-3 text-sm font-semibold transition ${
                activeTab === "for-you"
                  ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              For You
            </button>

            <button
              onClick={() =>
                handleTabChange("search")
              }
              className={`pb-3 text-sm font-semibold transition ${
                activeTab === "search"
                  ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Search Results
            </button>

          </div>

        </div>

      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* RESULT HEADER */}
        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === "search"
                ? "Search Results"
                : "Jobs For You"}
            </h2>

            {!loading && (
              <p className="text-sm text-gray-500 mt-1">
                {totalElements}{" "}
                {totalElements === 1
                  ? "job"
                  : "jobs"}{" "}
                available
              </p>
            )}

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (

          <div className="flex justify-center items-center py-24">

            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2563eb] rounded-full animate-spin"></div>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] gap-6">

            {/* LEFT */}
            <div className="min-w-0">

              <div className="space-y-3">

                {jobs.length > 0 ? (

                  <PaginatedJobList
                    jobs={jobs}
                    selectedJob={selectedJob}
                    onSelect={setSelectedJob}
                  />

                ) : (

                  <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

                    <div className="text-5xl mb-4">
                      🔍
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800">
                      No jobs found
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      Try changing your search filters.
                    </p>

                  </div>

                )}

              </div>

              {/* PAGINATION */}
              {activeTab === "for-you" &&
                totalPages > 1 && (

                  <div className="flex items-center justify-between mt-5 bg-white border border-gray-200 rounded-xl p-3">

                    <button
                      onClick={() =>
                        fetchAllJobs(
                          currentPage - 1,
                          10
                        )
                      }
                      disabled={currentPage === 0}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="text-sm text-gray-500">
                      Page {currentPage + 1} of{" "}
                      {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        fetchAllJobs(
                          currentPage + 1,
                          10
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages - 1
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>

                  </div>

                )}

            </div>

            {/* RIGHT */}
            <div className="min-w-0">

              <div className="lg:sticky lg:top-24">

                {selectedJob ? (

                  <JobDetails job={selectedJob} />

                ) : (

                  <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

                    <div className="text-5xl mb-4">
                      🔍
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800">
                      No jobs found
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      Try changing your search filters.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}