import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, API_URL } from '../api';
import { UploadCloud, FileText, ArrowLeft, Trash, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

export const UploadDocs = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [documentType, setDocumentType] = useState("university_support_office");
  const [selectedFile, setSelectedFile] = useState(null);

  const openPrivateDocument = async (documentId) => {
    try {
      const access = await api.get(`/students/documents/${documentId}/access`);
      const url = access.url.startsWith('http') ? access.url : `${API_URL}${access.url}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const message = err.message || "Unable to open this private document";
      setError(message);
      toast.error(message);
    }
  };

  const fetchRequest = async () => {
    try {
      const data = await api.get(`/students/requests/${id}`);
      setRequest(data);
    } catch (err) {
      setError(err.message || "Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await api.uploadFile(`/students/requests/${id}/documents`, selectedFile, {
        document_type: documentType
      });
      setSuccess("Document uploaded successfully!");
      toast.success("Document uploaded successfully!");
      setSelectedFile(null);
      
      // Reset input element
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";

      // Refresh data
      await fetchRequest();
    } catch (err) {
      const errorMsg = err.message || "Upload failed. Please verify file type and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const getDocLabel = (type) => {
    switch (type) {
      case 'student_id_card': return 'Student ID Card';
      case 'university_support_office': return 'University Support Office Confirmation';
      case 'medical_professional_report': return 'Medical or Rehabilitation Professional Report';
      case 'government_disability_certificate': return 'Government Disability Certificate';
      case 'accessibility_assessment': return 'Accessibility Assessment';
      case 'assistive_device_quote': return 'Assistive Device Quote';
      case 'support_cost_quote': return 'Support Cost Quote';
      case 'approved_alternative': return 'Approved Alternative Evidence';
      default: return 'Supporting Document';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm text-slate-500">Loading application details...</p>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/40 text-center space-y-4 max-w-md mx-auto transition-colors duration-300">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h4 className="font-bold text-red-800 dark:text-red-400">Error Loading Application</h4>
        <p className="text-xs text-red-700 dark:text-slate-350">{error}</p>
        <button onClick={() => navigate('/student/dashboard')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verification Document Upload</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Application: <span className="font-semibold text-slate-700 dark:text-slate-300">{request.title}</span></p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-2 transition-colors duration-300">
          <Check className="h-4.5 w-4.5 text-emerald-500" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-400 text-xs font-semibold rounded-2xl transition-colors duration-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between transition-colors duration-300">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">Upload Supporting File</h4>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all cursor-pointer"
                  required
                >
                  <option value="student_id_card">Student ID Card</option>
                  <option value="university_support_office">University Disability/Support Office Confirmation</option>
                  <option value="medical_professional_report">Medical or Rehabilitation Professional Report</option>
                  <option value="government_disability_certificate">Government Disability Certificate</option>
                  <option value="accessibility_assessment">Accessibility or Assistive-needs Assessment</option>
                  <option value="assistive_device_quote">Assistive Device Quote</option>
                  <option value="support_cost_quote">Support Cost Quote</option>
                  <option value="approved_alternative">Administrator-approved Alternative Evidence</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select File</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/20 hover:bg-blue-50/10 flex flex-col items-center justify-center space-y-2 relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    id="file-input"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <UploadCloud className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate w-full max-w-[200px] px-2">
                    {selectedFile ? selectedFile.name : "Drag & Drop or Click to browse"}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">PDF, PNG, JPG or JPEG up to 5MB</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Upload File
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-950 dark:hover:bg-slate-950/80 dark:border dark:border-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Finish & Done
            </button>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4 transition-colors duration-300">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">Currently Attached Documents</h4>

          {request.documents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <FileText className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs">No documents attached yet. Please upload supporting evidence to enable verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 rounded-l-xl">Document Type</th>
                    <th className="p-3">Upload Date</th>
                    <th className="p-3 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-350">
                  {request.documents.map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 text-slate-800 dark:text-slate-100 font-semibold">{getDocLabel(doc.document_type)}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{new Date(doc.upload_date).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => openPrivateDocument(doc.document_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-lg font-bold hover:bg-blue-100/50 dark:hover:bg-blue-800/60 transition-all"
                        >
                          View File
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default UploadDocs;
