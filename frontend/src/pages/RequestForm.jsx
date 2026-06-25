import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Save, ArrowLeft, Send, Landmark, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const requestSchema = z.object({
  title: z.string().min(1, "Campaign title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  purpose: z.string().min(1, "Purpose/Category is required"),
  amountNeeded: z.coerce.number().positive("Amount needed must be a positive number"),
  urgencyLevel: z.enum(["low", "medium", "high"]),
  reasonForRequest: z.string().min(1, "Reason for request is required"),
  parentOccupation: z.string().min(1, "Parent/guardian occupation is required"),
  previousSupport: z.enum(["yes", "no"]),
  supportingStatement: z.string().min(1, "Supporting statement is required"),
  
  // Optional bank fields: if one is entered, all three must be entered.
  bankName: z.string().optional().or(z.literal("")),
  accountName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  const hasBank = (data.bankName && data.bankName.trim() !== "") || 
                  (data.accountName && data.accountName.trim() !== "") || 
                  (data.accountNumber && data.accountNumber.trim() !== "");
  if (hasBank) {
    if (!data.bankName || data.bankName.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bank name is required if entering details", path: ["bankName"] });
    }
    if (!data.accountName || data.accountName.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account name is required if entering details", path: ["accountName"] });
    }
    if (!data.accountNumber || data.accountNumber.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number is required if entering details", path: ["accountNumber"] });
    } else if (data.accountNumber.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number must be at least 10 digits", path: ["accountNumber"] });
    }
  }
});

export const RequestForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      purpose: "Tuition Fees",
      amountNeeded: "",
      urgencyLevel: "medium",
      reasonForRequest: "",
      parentOccupation: "",
      previousSupport: "no",
      supportingStatement: "",
      bankName: "",
      accountName: "",
      accountNumber: ""
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/students/requests", {
        title: data.title,
        description: data.description,
        purpose: data.purpose,
        amount_needed: data.amountNeeded,
        reason_for_request: data.reasonForRequest,
        urgency_level: data.urgencyLevel,
        student_bank_name: data.bankName || null,
        student_account_name: data.accountName || null,
        student_account_number: data.accountNumber || null,
        parent_or_guardian_occupation: data.parentOccupation,
        previous_support_received: data.previousSupport,
        supporting_statement: data.supportingStatement
      });

      // Redirect to upload documents page for this request
      toast.success("Fundraising request created successfully! Please upload verification documents.");
      navigate(`/student/requests/${response.request_id}/upload`);
    } catch (err) {
      const errorMsg = err.message || "Failed to submit request. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">New Fundraising Application</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Provide details of your financial need for administrator verification</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-400 text-xs font-semibold rounded-2xl animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Section 1: Campaign details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">1. Campaign Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. Help John Clear Final Semester CS Fees"
                {...register("title")}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.title 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.title && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Detailed Description</label>
              <textarea
                placeholder="Explain the background details of your academic and personal situation. This will be visible to donors if approved."
                {...register("description")}
                rows={4}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.description 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.description && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Funding Category / Purpose</label>
              <select
                {...register("purpose")}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all dark:text-slate-100"
              >
                <option>Tuition Fees</option>
                <option>Books & Materials</option>
                <option>Accommodation & Hostel</option>
                <option>Medical Aid</option>
                <option>General Welfare</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Urgency Level</label>
              <select
                {...register("urgencyLevel")}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all dark:text-slate-100"
              >
                <option value="low">Low - General Aid</option>
                <option value="medium">Medium - Required Within 1 Month</option>
                <option value="high">High - Urgent (Risk of Exclusion)</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Amount Needed (₦)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                {...register("amountNeeded")}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.amountNeeded 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.amountNeeded && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.amountNeeded.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Need verification */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">2. Indigent Verification Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Detailed Reason for Request (Private to Admin)</label>
              <textarea
                placeholder="What exactly led to this financial need? Explain clearly so the Administrator can understand your need."
                {...register("reasonForRequest")}
                rows={3}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.reasonForRequest 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.reasonForRequest && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.reasonForRequest.message}</p>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Parent or Guardian's Occupation</label>
              <input
                type="text"
                placeholder="e.g. Retired Civil Servant, Trader, Unemployed"
                {...register("parentOccupation")}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.parentOccupation 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.parentOccupation && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.parentOccupation.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Have you received support/scholarship previously?</label>
              <select
                {...register("previousSupport")}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all dark:text-slate-100"
              >
                <option value="no">No previous support received</option>
                <option value="yes">Yes, I have received support before</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Supporting Statement</label>
              <textarea
                placeholder="A brief message on how this funding will impact your academic studies."
                {...register("supportingStatement")}
                rows={3}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.supportingStatement 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.supportingStatement && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.supportingStatement.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Student bank details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">3. Private Disbursement Details (Optional)</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. GTBank, Access Bank"
                {...register("bankName")}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.bankName 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.bankName && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.bankName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Account Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                {...register("accountName")}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.accountName 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.accountName && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.accountName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Account Number</label>
              <input
                type="text"
                placeholder="e.g. 0123456789 (10 digits)"
                {...register("accountNumber")}
                maxLength={10}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.accountNumber 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.accountNumber && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.accountNumber.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 transform active:scale-98"
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
