import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { supabase } from "../lib/supabase";

export default function ResumeForm() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Get selected PDF
      const file = data.resume?.[0];

      if (!file) {
        throw new Error("Please select a resume PDF.");
      }

      // Unique filename
      const fileName = `${Date.now()}-${file.name}`;

      // Upload PDF to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("resumes")
          .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Generate signed URL (valid for 1 hour)
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("resumes")
          .createSignedUrl(uploadData.path, 60 * 60);

      if (signedUrlError) {
        throw signedUrlError;
      }

      // Send data to n8n
      const response = await axios.post(
        import.meta.env.VITE_N8N_WEBHOOK_URL,
        {
          name: data.name,
          email: data.email,
          city: data.city,
          search_terms: data.search_terms,
          job_type: data.job_type,
          pdfUrl: signedUrlData.signedUrl,
        }
      );

      console.log("n8n Response:", response.data);

      alert("Resume uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);

      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl">
      <h1 className="text-3xl font-bold mb-2">
        AI Resume Job Matcher
      </h1>

      <p className="text-gray-500 mb-6">
        Upload your resume and receive personalized job recommendations.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <input
          {...register("name")}
          placeholder="Full Name"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("search_terms")}
          placeholder="Preferred Roles (Backend Engineer, AI Engineer...)"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("city")}
          placeholder="Preferred City"
          className="w-full border rounded-lg p-3"
        />
        <select
          {...register("job_type")}
          className="w-full border rounded-lg p-3"
          defaultValue=""
        >
          <option value="" disabled>
            Preferred Job Type
          </option>

          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
          <option value="Any">Any</option>
        </select>

        <input
          {...register("resume")}
          type="file"
          accept=".pdf"
          className="w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg p-3 font-semibold"
        >
          {loading ? "Uploading Resume..." : "Upload Resume"}
        </button>

      </form>
    </div>
  );
}