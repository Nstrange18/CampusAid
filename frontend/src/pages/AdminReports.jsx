import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { FileBarChart, Plus, Check, Calendar, FileText, Sparkles } from 'lucide-react';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // New report form states
  const [reportType, setReportType] = useState("System Overview");
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = async () => {
    try {
      const data = await api.get("/admin/reports");
      setReports(data);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!description) {
      setError("Please describe the scope of the report to generate.");
      return;
    }

    setGenerating(true);
    try {
      await api.post("/admin/reports", {
        report_type: reportType,
        report_description: description
      });
      setSuccess("Report generated successfully!");
      setDescription("");
      fetchReports();
    } catch (err) {
      setError(err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">System Reports</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Analyze overall fundraising metrics and donation performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Report generator panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 animate-pulse" />
            Generate New Report
          </h4>

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-300 dark:border-emerald-900/30 rounded-xl flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-955/20 text-red-800 dark:text-red-400 text-[10px] font-semibold border border-red-200 dark:border-red-900/30 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Report Scope</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all cursor-pointer text-slate-700 dark:text-slate-300 font-semibold"
                required
              >
                <option className="dark:bg-slate-900">System Overview</option>
                <option className="dark:bg-slate-900">Donor Contributions Statistics</option>
                <option className="dark:bg-slate-900">Student Allocations Summary</option>
                <option className="dark:bg-slate-900">Pending Audit Performance</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Report Description</label>
              <textarea
                placeholder="Detail the parameters of this report compilation (e.g. 'Overview of all active campaigns as of June 2026, total funds cleared...')"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-slate-700 dark:text-slate-300 font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {generating ? "Compiling Data..." : "Compile Report"}
            </button>
          </form>
        </div>

        {/* Generated Reports List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4 transition-colors duration-300">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <FileBarChart className="h-4.5 w-4.5 text-blue-600 dark:text-blue-450" />
            Historical Compilations
          </h4>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-slate-400 dark:text-slate-655" />
              <p className="text-xs">No reports compiled yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.report_id} className="p-4 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-all flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{r.report_type}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(r.date_generated).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold break-words">{r.report_description}</p>
                    <div className="pt-2 text-[9px] text-slate-400 dark:text-slate-500">Compiled by Staff Admin ID: {r.admin_id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default AdminReports;
