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
  supportNeedDescription: z.string().min(20, "Please describe the support you need"),
  functionalImpact: z.string().min(20, "Please describe how the disability affects your studies"),
  requestedSupportType: z.string().min(1, "Support type is required"),
  publicStory: z.string().min(20, "Please provide a short public campaign story"),
  displayPreference: z.enum(["full_name", "first_name_initial", "anonymous"]),
  publicConsent: z.literal(true, { error: "Consent is required before a campaign can be published" }),
  
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
      supportNeedDescription: "",
      functionalImpact: "",
      requestedSupportType: "Assistive technology",
      publicStory: "",
      displayPreference: "first_name_initial",
      publicConsent: false,
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
        reason_for_request: data.supportNeedDescription,
        urgency_level: data.urgencyLevel,
        student_bank_name: data.bankName || null,
        student_account_name: data.accountName || null,
        student_account_number: data.accountNumber || null,
        supporting_statement: data.publicStory,
        support_need_description: data.supportNeedDescription,
        functional_impact: data.functionalImpact,
        requested_support_type: data.requestedSupportType,
        public_story: data.publicStory,
        public_display_preference: data.displayPreference,
        public_consent: data.publicConsent
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Describe the disability-related support you need for your studies</p>
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
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Application Background (Private to Administrators)</label>
              <textarea
                placeholder="Give administrators any additional context needed to review this application. Donors will see only the separate public campaign story below."
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
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">2. Disability Support Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Support Needed (Private to Administrators)</label>
              <textarea
                placeholder="Describe the equipment, service, accommodation, or other support you need."
                {...register("supportNeedDescription")}
                rows={3}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.supportNeedDescription
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.supportNeedDescription && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.supportNeedDescription.message}</p>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Functional Impact (Private to Administrators)</label>
              <textarea
                placeholder="Explain how the disability or physical barrier affects learning, mobility, communication, or campus access."
                {...register("functionalImpact")}
                rows={3}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.functionalImpact
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.functionalImpact && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.functionalImpact.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Requested Support Type</label>
              <select
                {...register("requestedSupportType")}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all dark:text-slate-100"
              >
                <option>Assistive technology</option>
                <option>Mobility support</option>
                <option>Accessible learning materials</option>
                <option>Medical or rehabilitation support</option>
                <option>Accessible accommodation</option>
                <option>Other disability-related support</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Public Campaign Story</label>
              <textarea
                placeholder="Describe the support and its expected impact without including diagnoses or private medical details."
                {...register("publicStory")}
                rows={3}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.publicStory
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              {errors.publicStory && (
                <p className="text-[10px] text-red-500 font-bold animate-fade-in">{errors.publicStory.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Public Name Display</label>
              <select {...register("displayPreference")} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-100">
                <option value="first_name_initial">First name and last initial</option>
                <option value="full_name">Full name</option>
                <option value="anonymous">Anonymous student</option>
              </select>
            </div>

            <label className="md:col-span-2 flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <input type="checkbox" {...register("publicConsent")} className="mt-0.5 h-4 w-4" />
              <span>I consent to the approved public story and selected name format being shown to donors. My private evidence and functional-impact statement must remain restricted to authorized administrators.</span>
            </label>
            {errors.publicConsent && <p className="md:col-span-2 text-[10px] text-red-500 font-bold">{errors.publicConsent.message}</p>}
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
