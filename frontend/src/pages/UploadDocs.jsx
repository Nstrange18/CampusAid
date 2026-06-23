import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, API_URL } from '../api';
import { UploadCloud, FileText, ArrowLeft, Trash, Check, AlertCircle, ExternalLink } from 'lucide-react';

export const UploadDocs = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [documentType, setDocumentType] = useState("school_fee_invoice");
  const [selectedFile, setSelectedFile] = useState(null);

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
      setSelectedFile(null);
      
      // Reset input element
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";

      // Refresh data
      await fetchRequest();
    } catch (err) {
      setError(err.message || "Upload failed. Please verify file type and try again.");
    } finally {
      setUploading(false);
    }
  };

  const getDocLabel = (type) => {
    switch (type) {
      case 'school_fee_invoice': return 'School Fee Invoice';
      case 'student_id_card': return 'Student ID Card';
      case 'admission_letter': return 'Admission Letter';
      case 'fee_balance_evidence': return 'Fee Balance Evidence';
      case 'accommodation_bill': return 'Accommodation Bill';
      case 'medical_bill': return 'Medical Bill';
      case 'recommendation_letter': return 'Recommendation Letter';
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
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h4 className="font-bold text-red-800">Error Loading Application</h4>
        <p className="text-xs text-red-700">{error}</p>
        <button onClick={() => navigate('/student/dashboard')} className="px-4 py-2 bg-red-650 text-white rounded-lg text-xs font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Verification Document Upload</h3>
          <p className="text-xs text-slate-500">Application: <span className="font-semibold text-slate-700">{request.title}</span></p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <Check className="h-4.5 w-4.5 text-emerald-500" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Upload Supporting File</h4>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                  required
                >
                  <option value="school_fee_invoice">School Fee Invoice</option>
                  <option value="student_id_card">Student ID Card</option>
                  <option value="admission_letter">Admission/Offer Letter</option>
                  <option value="fee_balance_evidence">Fee Balance Evidence</option>
                  <option value="accommodation_bill">Accommodation/Hostel Bill</option>
                  <option value="medical_bill">Medical Bill (If Applicable)</option>
                  <option value="recommendation_letter">Adviser/HOD Recommendation</option>
                  <option value="other">Other Supporting Evidence</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-650">Select File</label>
                <div className="border-2 border-dashed border-slate-250 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/10 flex flex-col items-center justify-center space-y-2 relative">
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <UploadCloud className="h-8 w-8 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600">
                    {selectedFile ? selectedFile.name : "Drag & Drop or Click to browse"}
                  </p>
                  <p className="text-[9px] text-slate-400">PDF, PNG, JPG or DOCX up to 5MB</p>
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

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Finish & Done
            </button>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Currently Attached Documents</h4>

          {request.documents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-10 w-10 text-slate-350 mx-auto mb-2" />
              <p className="text-xs">No documents attached yet. Please upload supporting evidence to enable verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                    <th className="p-3 rounded-l-xl">Document Type</th>
                    <th className="p-3">Upload Date</th>
                    <th className="p-3 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {request.documents.map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-800 font-semibold">{getDocLabel(doc.document_type)}</td>
                      <td className="p-3 text-slate-500">{new Date(doc.upload_date).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <a
                          href={`${API_URL}${doc.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-bold hover:bg-blue-100/50 transition-all"
                        >
                          View File
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
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
