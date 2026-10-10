import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
  FaCode,
} from "react-icons/fa";
import API_URL from "../api/config";
import CompanyLogo from "../components/CompanyLogo";

export default function CompanyProfile() {
  const { companyName } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const decodedCompanyName = decodeURIComponent(companyName || "");

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        setLoading(true);

        // First page
        const firstResponse = await fetch(
          `${API_URL}/jobs?page=0&size=10`
        );

        if (!firstResponse.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const firstData = await firstResponse.json();

        let allJobs = firstData.content || [];

        const totalPages = firstData.totalPages || 1;

        // Fetch remaining pages
        for (let page = 1; page < totalPages; page++) {
          const response = await fetch(
            `${API_URL}/jobs?page=${page}&size=10`
          );

          if (response.ok) {
            const data = await response.json();
            allJobs = [...allJobs, ...(data.content || [])];
          }
        }

        // Find jobs belonging to this company
        const companyJobs = allJobs.filter(
          (job) =>
            job.companyName?.trim().toLowerCase() ===
            decodedCompanyName.trim().toLowerCase()
        );

        setJobs(companyJobs);

      } catch (error) {
        console.error("Error loading company jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyJobs();
  }, [decodedCompanyName]);

  const locations = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.location)
          .filter(Boolean)
      ),
    ];
  }, [jobs]);

  const skills = useMemo(() => {
    const allSkills = jobs.flatMap(
      (job) => job.requiredSkills || []
    );

    return [...new Set(allSkills)].slice(0, 12);
  }, [jobs]);

  const jobTypes = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.type)
          .filter(Boolean)
      ),
    ];
  }, [jobs]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">

          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
          >
            <FaArrowLeft />
            Back to Jobs
          </button>

        </div>
      </div>


      {/* COMPANY HERO */}
      <section className="bg-white border-b border-gray-200">

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">

          <div className="flex flex-col md:flex-row md:items-center gap-6">

            {/* Company Avatar */}
            <CompanyLogo
              companyName={decodedCompanyName}
              size="xl"
              className="!w-24 !h-24 !min-w-24 !rounded-3xl shadow-md border-gray-200"
            />

            {/* Company Information */}
            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {decodedCompanyName}
                </h1>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  Technology Company
                </span>

              </div>

              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <FaBuilding className="text-blue-500" />
                Technology & Software Development
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Explore open positions and opportunities at{" "}
                {decodedCompanyName}.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* LEFT */}
          <div>

            {/* ABOUT */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-900">
                About {decodedCompanyName}
              </h2>

              <p className="text-gray-600 mt-3 leading-7">
                {decodedCompanyName} is a technology company offering
                opportunities across software development, engineering,
                cloud, data and other technology roles.
              </p>

              <p className="text-gray-600 mt-3 leading-7">
                Explore available positions below and discover roles
                that match your skills and career goals.
              </p>

            </section>


            {/* OPEN POSITIONS */}
            <section>

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Open Positions
                  </h2>

                  {!loading && (
                    <p className="text-sm text-gray-500 mt-1">
                      {jobs.length} available position
                      {jobs.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

              </div>


              {loading ? (

                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

                  <div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />

                  <p className="text-gray-500 mt-4">
                    Loading positions...
                  </p>

                </div>

              ) : jobs.length === 0 ? (

                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

                  <FaBriefcase className="mx-auto text-4xl text-gray-300" />

                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    No open positions
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    This company currently has no active job listings.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {jobs.map((job) => (

                    <Link
                      key={job.id}
                      to={`/jobs?jobId=${job.id}`}
                      className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                        <div className="min-w-0">

                          <h3 className="text-lg font-bold text-gray-900">
                            {job.title}
                          </h3>

                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">

                            <span className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-blue-500" />
                              {job.location}
                            </span>

                            <span className="flex items-center gap-2">
                              <FaBriefcase className="text-blue-500" />
                              {job.type?.replace("_", " ")}
                            </span>

                          </div>

                        </div>

                        <span className="self-start text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
                          {job.workMode}
                        </span>

                      </div>


                      {/* SKILLS */}
                      <div className="flex flex-wrap gap-2 mt-4">

                        {(job.requiredSkills || [])
                          .slice(0, 5)
                          .map((skill) => (

                            <span
                              key={skill}
                              className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
                            >
                              {skill}
                            </span>

                          ))}

                      </div>

                    </Link>

                  ))}

                </div>

              )}

            </section>

          </div>


          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">

            {/* OVERVIEW */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">

              <h3 className="font-bold text-gray-900 mb-5">
                Company Overview
              </h3>

              <div className="space-y-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FaBriefcase className="text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Open Positions
                    </p>

                    <p className="font-semibold text-gray-900">
                      {jobs.length}
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Locations
                    </p>

                    <p className="font-semibold text-gray-900">
                      {locations.length}
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FaCode className="text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Job Categories
                    </p>

                    <p className="font-semibold text-gray-900">
                      {jobTypes.length}
                    </p>
                  </div>

                </div>

              </div>

            </section>


            {/* LOCATIONS */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">

              <h3 className="font-bold text-gray-900 mb-4">
                Hiring Locations
              </h3>

              <div className="flex flex-wrap gap-2">

                {locations.map((location) => (

                  <span
                    key={location}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {location}
                  </span>

                ))}

              </div>

            </section>


            {/* SKILLS */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">

              <h3 className="font-bold text-gray-900 mb-4">
                Popular Skills
              </h3>

              <div className="flex flex-wrap gap-2">

                {skills.map((skill) => (

                  <span
                    key={skill}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            </section>

          </aside>

        </div>

      </main>

    </div>
  );
}