"use client";

import { useEffect, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

interface EmergencyRequest {
  id: number;
  sender: string;
  mobile: string | null;
  raw_message: string;
  location: string | null;
  urgency: string;
  needs: string[] | string | null;
  summary: string | null;
  status: string;
  created_at?: string;
}

export default function AwadiDashboard() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  // Laravel GET /api/emergency-requests eken active records tika gannawa
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/emergency-requests`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const json = await res.json();
      const list: EmergencyRequest[] = Array.isArray(json) ? json : json.data || [];
      setRequests(list);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (error) {
      console.error("Failed to fetch emergency requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Udaw karapu kena "Complete" click kalama status = COMPLETED karala table eken ain karanawa
  const handleComplete = async (id: number) => {
    setCompletingId(id);
    try {
      const res = await fetch(`${API_URL}/emergency-requests/${id}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (res.ok) {
        // Click karapu gaman table eken ain karanawa (aaye load wenne na)
        setRequests((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error completing request:", error);
    } finally {
      setCompletingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const urgencyRank = (urgency: string) => {
    switch ((urgency || "").toUpperCase()) {
      case "CRITICAL":
        return 1;
      case "HIGH":
        return 2;
      case "MEDIUM":
        return 3;
      default:
        return 4;
    }
  };

  // Critical udinma pennanna auto-sort karanawa
  const sortedRequests = [...requests]
    .filter((r) => {
      if (filter === "CRITICAL") return (r.urgency || "").toUpperCase() === "CRITICAL";
      if (filter === "HIGH") return (r.urgency || "").toUpperCase() === "HIGH";
      return true;
    })
    .sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency));

  const topEmergency = [...requests].sort(
    (a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency)
  )[0];

  const parseNeeds = (needs: string[] | string | null): string[] => {
    if (!needs) return ["General Help"];
    if (Array.isArray(needs)) return needs.length > 0 ? needs : ["General Help"];
    return needs
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch ((urgency || "").toUpperCase()) {
      case "CRITICAL":
        return "bg-red-600 text-white border-red-700 shadow-xs";
      case "HIGH":
        return "bg-orange-500 text-white border-orange-600";
      case "MEDIUM":
        return "bg-amber-100 text-amber-900 border-amber-300";
      default:
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
  };

  const criticalCount = requests.filter((r) => (r.urgency || "").toUpperCase() === "CRITICAL").length;
  const highCount = requests.filter((r) => (r.urgency || "").toUpperCase() === "HIGH").length;

  return (
    <div className={`${jakarta.className} min-h-screen bg-slate-50 text-slate-900`}>
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Awadi
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                  Live Help Queue
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                උදව් අවශ්‍ය පුද්ගලයින්ගේ සජීවී ලැයිස්තුව — උදව් ලබා දුන් පසු Complete කරන්න
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span className="text-xs font-bold text-emerald-800">
              LIVE {lastUpdated && <span className="font-normal text-emerald-700">• {lastUpdated}</span>}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Priority Banner (Danma udaw karanna ona #1 kenawa highlight karanawa) */}
        {topEmergency && (
          <div className="mb-6 rounded-2xl bg-red-50 border-2 border-red-300 border-l-8 border-l-red-600 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wide rounded-md bg-red-600 text-white">
                  🚨 වහාම උදව් අවශ්‍යයි ({topEmergency.urgency})
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {topEmergency.sender}
                </span>
                {topEmergency.mobile && (
                  <a
                    href={`tel:${topEmergency.mobile}`}
                    className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-white text-slate-800 border border-slate-300 hover:bg-slate-100"
                  >
                    📞 {topEmergency.mobile}
                  </a>
                )}
                {topEmergency.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      topEmergency.location
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    📍 {topEmergency.location} ↗
                  </a>
                )}
              </div>

              <p className="text-lg font-bold text-slate-950 leading-snug">
                {topEmergency.summary || topEmergency.raw_message}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-red-900 uppercase">අවශ්‍ය දෑ (Needs):</span>
                {parseNeeds(topEmergency.needs).map((need, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-0.5 text-xs font-bold rounded-full bg-white text-red-700 border border-red-300"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleComplete(topEmergency.id)}
              disabled={completingId === topEmergency.id}
              className="shrink-0 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm transition cursor-pointer shadow-xs"
            >
              {completingId === topEmergency.id ? "Updating..." : "✓ Complete (උදව් කළා)"}
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "ALL", label: `උදව් අවශ්‍ය සියල්ල (${requests.length})` },
            { key: "CRITICAL", label: `Critical - ඉතා හදිසි (${criticalCount})` },
            { key: "HIGH", label: `High Priority (${highCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                filter === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Light Clean Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Sender & Location</th>
                  <th className="py-3.5 px-4">Summary & Raw Message</th>
                  <th className="py-3.5 px-4">Needs (අවශ්‍ය දෑ)</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                      දත්ත ලබා ගනිමින් පවතී (Loading)...
                    </td>
                  </tr>
                ) : sortedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                      දැනට උදව් අවශ්‍ය වාර්තා කිසිවක් නොමැත (All requests completed!).
                    </td>
                  </tr>
                ) : (
                  sortedRequests.map((item) => {
                    const isCritical = (item.urgency || "").toUpperCase() === "CRITICAL";
                    const isHigh = (item.urgency || "").toUpperCase() === "HIGH";

                    return (
                      <tr
                        key={item.id}
                        className={`transition ${
                          isCritical
                            ? "bg-red-50/75 hover:bg-red-50 border-l-4 border-l-red-600"
                            : isHigh
                            ? "bg-orange-50/45 hover:bg-orange-50/75 border-l-4 border-l-orange-500"
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        {/* 1. Urgency */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${getUrgencyBadge(
                              item.urgency
                            )}`}
                          >
                            {item.urgency}
                          </span>
                          <div className="text-xs font-semibold text-slate-500 mt-1.5">
                            #{item.id} • {item.status}
                          </div>
                        </td>

                        {/* 2. Sender, Mobile & Location */}
                        <td className="py-4 px-4 align-top min-w-[200px]">
                          <div className="font-bold text-slate-900 text-base">
                            {item.sender}
                          </div>
                          {item.mobile && (
                            <div className="mt-1">
                              <a
                                href={`tel:${item.mobile}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-300"
                              >
                                📞 {item.mobile}
                              </a>
                            </div>
                          )}
                          {item.location ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                item.location
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
                            >
                              📍 {item.location} ↗
                            </a>
                          ) : (
                            <span className="inline-block mt-1.5 text-xs text-slate-400">
                              Location not provided
                            </span>
                          )}
                        </td>

                        {/* 3. Summary & Raw Message */}
                        <td className="py-4 px-4 align-top max-w-md">
                          <p className="font-bold text-slate-900 text-base leading-snug">
                            {item.summary || item.raw_message}
                          </p>
                          <p className="text-xs text-slate-600 mt-1.5 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                            “{item.raw_message}”
                          </p>
                        </td>

                        {/* 4. Needs */}
                        <td className="py-4 px-4 align-top min-w-[180px]">
                          <div className="flex flex-wrap gap-1.5">
                            {parseNeeds(item.needs).map((need, index) => (
                              <span
                                key={index}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                  isCritical
                                    ? "bg-red-100 text-red-800 border-red-300"
                                    : "bg-amber-50 text-amber-900 border-amber-300"
                                }`}
                              >
                                {need}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* 5. Complete Button */}
                        <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                          <button
                            onClick={() => handleComplete(item.id)}
                            disabled={completingId === item.id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            {completingId === item.id ? "Saving..." : "✓ Complete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}