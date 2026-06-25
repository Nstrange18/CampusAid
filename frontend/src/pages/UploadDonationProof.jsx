import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { UploadCloud, ArrowLeft, Send, Check, ShieldAlert, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const UploadDonationProof = () => {
  const { id } = useParams(); // request_id
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);

  // Form states
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await api.get(`/campaigns/${id}`);
        setCampaign(data.campaign);
      } catch (err) {
        setError(err.message || "Failed to load campaign metadata");
      } finally {
        setLoadingCampaign(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount || !reference || !selectedFile) {
      setError("Please fill in all fields and select a receipt screenshot.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid donation amount (greater than zero).");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create donation record
      const donationRecord = await api.post("/donors/donations", {
        request_id: parseInt(id),
        amount: parsedAmount,
        transaction_reference: reference
      });

      // Step 2: Upload receipt file for the created donation ID
      const donationId = donationRecord.donation_id;
      await api.uploadFile(`/donors/donations/${donationId}/proof`, selectedFile);

      setSuccess("Your donation proof has been uploaded! The administrator will review and verify it shortly.");
      toast.success("Donation proof uploaded successfully!");
      
      // Redirect to donor history after a small delay
      setTimeout(() => {
        navigate('/donor/history');
      }, 2500);
    } catch (err) {
      const errorMsg = err.message || "Failed to submit donation record. Ensure transaction reference is unique.";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (loadingCampaign) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm text-slate-500">Loading campaign info...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/campaigns/${id}`)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Submit Donation Record</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Campaign: <span className="font-semibold text-slate-700 dark:text-slate-300">{campaign?.title}</span></p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-2 transition-colors duration-300">
          <Check className="h-4.5 w-4.5 text-emerald-500" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2 transition-colors duration-300">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 dark:text-red-450 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Warning */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-1 transition-colors duration-300">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-blue-600 dark:text-blue-450" />
            Verification Notice
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Double Check Details:
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            Ensure the transaction reference and amount precisely match the details on your payment receipt. Upload a clear receipt image (PDF, PNG or JPG).
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            Any mismatch will cause the administrator to decline the proof, postponing student disbursement.
          </p>
        </div>

        {/* Proof Submission Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-5 transition-colors duration-300">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">Payment Record Fields</h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Amount Transferred (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Transaction Reference / ID</label>
                <input
                  type="text"
                  placeholder="Bank ref, e.g. TR-90281-22"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Upload Receipt Screenshot</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/20 hover:bg-blue-50/10 flex flex-col items-center justify-center space-y-2 relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <UploadCloud className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedFile ? selectedFile.name : "Select receipt file"}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">PDF, PNG or JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate(`/campaigns/${id}`)}
                className="px-6 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                {loading ? "Submitting Record..." : "Confirm & Send"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
export default UploadDonationProof;
