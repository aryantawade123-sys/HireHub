import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API_URL from "../api/config";

const openResume = (url) => {
  if (!url) return;
  window.open(
    `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`,
    "_blank"
  );
};

export default function ApplicationDetails({ jobId, screeningAnswers = [] }) {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const token = localStorage.getItem("token");

  const [fullName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [existingResume] = useState(user?.resume || null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const uploadResume = async () => {
    if (!uploadedFile) {
      throw new Error("Please select a resume.");
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    console.log("📄 Resume upload started");
    console.log("File name:", uploadedFile.name);
    console.log("File type:", uploadedFile.type);
    console.log("File size:", uploadedFile.size);

    const res = await fetch(`${API_URL}/user/jobseeker/upload-resume`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await res.text();

    console.log("📡 Resume upload status:", res.status);
    console.log("📡 Resume upload response:", responseText);

    if (!res.ok) {
      let message = responseText;

      try {
        const errorData = JSON.parse(responseText);
        message =
          errorData?.message ||
          errorData?.error ||
          errorData?.detail ||
          responseText;
      } catch {
        // Response wasn't JSON; use the raw response.
      }

      throw new Error(
        message || `Resume upload failed with status ${res.status}`
      );
    }

    return responseText;
  };

  const handleSubmit = async () => {
    if (!existingResume && !uploadedFile) {
      toast.error("Please upload a resume before applying.");
      return;
    }

    try {
      setSubmitting(true);

      // Upload the newly selected resume first.
      if (uploadedFile) {
        await uploadResume();
        toast.success("Resume uploaded successfully!");
      }

      // Submit the actual application.
      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          screeningAnswers,
        }),
      });

      const responseText = await response.text();

      console.log("📡 Application status:", response.status);
      console.log("📡 Application response:", responseText);

      if (!response.ok) {
        let message = responseText;

        try {
          const errorData = JSON.parse(responseText);
          message =
            errorData?.message ||
            errorData?.error ||
            errorData?.detail ||
            responseText;
        } catch {
          // Response wasn't JSON.
        }

        throw new Error(
          message || `Application failed with status ${response.status}`
        );
      }

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Application submitted, but server returned an invalid response.");
      }

      const applicationId = data.applicationId;

      toast.success(
        <div>
          <p className="text-[#256029] font-semibold">
            ✅ Application submitted! A confirmation email has been sent to
            your inbox.
          </p>

          {applicationId && (
            <button
              onClick={() => navigate(`/applications/${applicationId}`)}
              className="mt-1 text-blue-600 underline hover:text-blue-800 text-sm"
            >
              Show Application Details
            </button>
          )}
        </div>,
        {
          autoClose: false,
          closeOnClick: false,
          pauseOnHover: true,
        }
      );
    } catch (err) {
      console.error("❌ Application Error:", err);

      toast.error(
        `Failed to submit application: ${err.message}`,
        {
          autoClose: 8000,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-gray-800">
          Full Name
        </label>

        <input
          type="text"
          className="w-full border border-gray-300 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-[#6B3F27]/30 focus:border-[#6B3F27] transition"
          value={fullName}
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Email
        </label>

        <input
          type="email"
          className="w-full border border-gray-300 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-[#6B3F27]/30 focus:border-[#6B3F27] transition"
          value={email}
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Phone Number
        </label>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +20 123456789"
          required
          className="w-full border border-gray-300 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-[#6B3F27]/30 focus:border-[#6B3F27] transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Resume
        </label>

        {existingResume ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              Using your saved resume:{" "}
              <span className="font-medium text-gray-900">
                My Resume
              </span>{" "}
              <button
                type="button"
                onClick={() => openResume(existingResume)}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Preview
              </button>
            </div>

            <div className="border-t pt-3 text-sm text-gray-600">
              <p className="mb-2">
                Upload a different resume:
              </p>

              <label
                htmlFor="resume-upload"
                className="flex items-center justify-center w-full sm:w-auto min-h-[44px] bg-white border border-gray-300 px-4 py-2 rounded cursor-pointer text-[#6B3F27] hover:bg-[#f8f4f2] font-medium text-sm"
              >
                Choose File

                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) =>
                    setUploadedFile(e.target.files?.[0] || null)
                  }
                />
              </label>

              {uploadedFile && (
                <div className="mt-1 text-green-700 text-sm font-medium">
                  ✅ Selected: {uploadedFile.name}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-amber-700">
              No resume on file — please upload one to apply.
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setUploadedFile(e.target.files?.[0] || null)
              }
              className="w-full border border-gray-300 px-3 py-3 rounded-md bg-gray-50 text-sm min-h-[44px]"
            />

            {uploadedFile && (
              <p className="text-sm text-green-700 font-medium">
                ✅ Selected: {uploadedFile.name}
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`w-full sm:w-fit px-6 py-2.5 min-h-[44px] rounded-md text-white font-medium transition-all ${
          submitting
            ? "bg-[#6B3F27]/60 cursor-not-allowed"
            : "bg-[#6B3F27] hover:bg-[#5C3421]"
        }`}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Application"
        )}
      </button>
    </div>
  );
}