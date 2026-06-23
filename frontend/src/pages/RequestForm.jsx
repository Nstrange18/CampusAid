import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FileText, Save, ArrowLeft, Send, Landmark, HelpCircle } from 'lucide-react';

export const RequestForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("Tuition Fees"); // Default category
  const [amountNeeded, setAmountNeeded] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("medium"); // low, medium, high
  
  const [reasonForRequest, setReasonForRequest] = useState("");
  const [parentOccupation, setParentOccupation] = useState("");
  const [previousSupport, setPreviousSupport] = useState("no"); // yes/no
  const [supportingStatement, setSupportingStatement] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end validations
    if (!title || !description || !amountNeeded || !reasonForRequest || !parentOccupation || !supportingStatement || !bankName || !accountName || !accountNumber) {
      setError("Please fill in all required fields.");
      return;
    }

    const parsedAmount = parseFloat(amountNeeded);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid fundraising target amount (greater than zero).");
      return;
    }

    if (accountNumber.length < 10) {
      setError("Bank account number should be a valid NUBAN (minimum 10 digits).");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/students/requests", {
        title: title,
        description: description,
        purpose: purpose,
        amount_needed: parsedAmount,
        reason_for_request: reasonForRequest,
        urgency_level: urgencyLevel,
        student_bank_name: bankName,
        student_account_name: accountName,
        student_account_number: accountNumber,
        parent_or_guardian_occupation: parentOccupation,
        previous_support_received: previousSupport,
        supporting_statement: supportingStatement
      });

      // Redirect to upload documents page for this request
      navigate(`/student/requests/${response.request_id}/upload`);
    } catch (err) {
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <h3 className="text-lg font-bold text-slate-800">New Fundraising Application</h3>
          <p className="text-xs text-slate-500">Provide details of your financial need for administrator verification</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Campaign details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">1. Campaign Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-650">Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. Help John Clear Final Semester CS Fees"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-655">Detailed Description</label>
              <textarea
                placeholder="Explain the background details of your academic and personal situation. This will be visible to donors if approved."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650">Funding Category / Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              >
                <option>Tuition Fees</option>
                <option>Books & Materials</option>
                <option>Accommodation & Hostel</option>
                <option>Medical Aid</option>
                <option>General Welfare</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650">Urgency Level</label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              >
                <option value="low">Low - General Aid</option>
                <option value="medium">Medium - Required Within 1 Month</option>
                <option value="high">High - Urgent (Risk of Exclusion)</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-650">Amount Needed (₦)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={amountNeeded}
                onChange={(e) => setAmountNeeded(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Need verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">2. Indigent Verification Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-650">Detailed Reason for Request (Private to Admin)</label>
              <textarea
                placeholder="What exactly led to this financial need? Explain clearly so the Administrator can understand your need."
                value={reasonForRequest}
                onChange={(e) => setReasonForRequest(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650">Parent or Guardian's Occupation</label>
              <input
                type="text"
                placeholder="e.g. Retired Civil Servant, Trader, Unemployed"
                value={parentOccupation}
                onChange={(e) => setParentOccupation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650">Have you received support/scholarship previously?</label>
              <select
                value={previousSupport}
                onChange={(e) => setPreviousSupport(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              >
                <option value="no">No previous support received</option>
                <option value="yes">Yes, I have received support before</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-650">Supporting Statement</label>
              <textarea
                placeholder="A brief message on how this funding will impact your academic studies."
                value={supportingStatement}
                onChange={(e) => setSupportingStatement(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Student bank details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Landmark className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">3. Personal Disbursement Bank Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. GTBank, Access Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650">Account Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650">Account Number</label>
              <input
                type="text"
                placeholder="e.g. 0123456789 (10 digits)"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength={10}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>

      </form>
    </div>
  );
};
export default RequestForm;
