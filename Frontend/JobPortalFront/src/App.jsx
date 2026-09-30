// src/App.jsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import CompanyProfile from "./pages/CompanyProfile";

import JobDetails from "./components/JobDetails";

import Navbar from "./components/navbar/Navbar";
import JobSeekerModal from "./modals/JobSeekerModal";
import EmployerModal from "./modals/EmployerModal";

import ApplyPage from "./pages/ApplyPage";
import MyJobsPage from "./pages/MyJobsPage";
import JobSeekerProfilePage from "./pages/JobSeekerProfilePage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";

import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerJobsPage from "./pages/EmployerJobsPage";
import EmployerJobDetailsPage from "./pages/EmployerJobDetailsPage";
import CreateJobPage from "./pages/CreateJobPage";
import UpdateJobPage from "./pages/UpdateJobPage";
import EmployerApplicantsPage from "./pages/EmployerApplicantsPage";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import ApplicationDetailsEmployerPage from "./pages/ApplicationDetailsEmployerPage";

import NotificationToastManager from "./components/NotificationToastManager";
import RequireRole from "./components/RequireRole";
import ErrorBoundary from "./components/ErrorBoundary";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import API_URL from "./api/config";

/*
 * ============================================================
 * JOB DETAILS ROUTE
 * ============================================================
 *
 * JobDetails.jsx expects:
 *
 * <JobDetails job={job} />
 *
 * So this wrapper gets the jobId from the URL,
 * fetches the job from backend,
 * and passes it to JobDetails.
 */

function JobDetailsRoute() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setError("Job ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/jobs/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load job. Status: ${response.status}`
          );
        }

        const data = await response.json();

        setJob(data);
      } catch (err) {
        console.error("Error loading job details:", err);

        setJob(null);
        setError(
          "Unable to load this job. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />

          <p className="mt-4 text-sm text-gray-500">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Job not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "The requested job could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <JobDetails job={job} />;
}

function App() {
  const [showJobSeekerModal, setShowJobSeekerModal] =
    useState(false);

  const [showEmployerModal, setShowEmployerModal] =
    useState(false);

  return (
    <Router>
      <Navbar
        onOpenJobSeeker={() =>
          setShowJobSeekerModal(true)
        }
        onOpenEmployer={() =>
          setShowEmployerModal(true)
        }
      />

      <ToastContainer
        position="top-center"
        autoClose={2000}
        pauseOnHover
      />

      <NotificationToastManager />

      <ErrorBoundary>
        <Routes>

          {/* ==================================================
              PUBLIC ROUTES
          ================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/jobs"
            element={<Jobs />}
          />

          <Route
            path="/jobs/:id"
            element={<JobDetailsRoute />}
          />

          <Route
            path="/company/:companyName"
            element={<CompanyProfile />}
          />


          {/* ==================================================
              JOB SEEKER ROUTES
          ================================================== */}

          <Route
            path="/myjobs"
            element={
              <RequireRole role="JOB_SEEKER">
                <MyJobsPage />
              </RequireRole>
            }
          />

          <Route
            path="/apply/:jobId"
            element={
              <RequireRole role="JOB_SEEKER">
                <ApplyPage />
              </RequireRole>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireRole role="JOB_SEEKER">
                <JobSeekerProfilePage />
              </RequireRole>
            }
          />

          <Route
            path="/applications/:id"
            element={
              <RequireRole role="JOB_SEEKER">
                <ApplicationDetailsPage />
              </RequireRole>
            }
          />


          {/* ==================================================
              EMPLOYER ROUTES
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <RequireRole role="EMPLOYER">
                <EmployerDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/employer/jobs"
            element={
              <RequireRole role="EMPLOYER">
                <EmployerJobsPage />
              </RequireRole>
            }
          />

          <Route
            path="/employer/jobs/:jobId"
            element={
              <RequireRole role="EMPLOYER">
                <EmployerJobDetailsPage />
              </RequireRole>
            }
          />

          <Route
            path="/create-job"
            element={
              <RequireRole role="EMPLOYER">
                <CreateJobPage />
              </RequireRole>
            }
          />

          <Route
            path="/employer/jobs/update/:jobId"
            element={
              <RequireRole role="EMPLOYER">
                <UpdateJobPage />
              </RequireRole>
            }
          />

          <Route
            path="/employer/applicants"
            element={
              <RequireRole role="EMPLOYER">
                <EmployerApplicantsPage />
              </RequireRole>
            }
          />

          <Route
            path="/employer/jobs/:jobId/applicants"
            element={
              <RequireRole role="EMPLOYER">
                <JobApplicantsPage />
              </RequireRole>
            }
          />

          <Route
            path="/employer/applications/:id"
            element={
              <RequireRole role="EMPLOYER">
                <ApplicationDetailsEmployerPage />
              </RequireRole>
            }
          />

        </Routes>
      </ErrorBoundary>


      {/* ==================================================
          MODALS
      ================================================== */}

      <JobSeekerModal
        isOpen={showJobSeekerModal}
        onClose={() =>
          setShowJobSeekerModal(false)
        }
      />

      <EmployerModal
        isOpen={showEmployerModal}
        onClose={() =>
          setShowEmployerModal(false)
        }
      />

    </Router>
  );
}

export default App;