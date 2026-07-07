"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

interface PredictionResult {
  predicted_price: number;
  input: HouseInput;
}

interface HouseInput {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

const fields: {
  key: keyof HouseInput;
  label: string;
  min: number;
  max: number;
  unit: string;
  icon: string;
}[] = [
  { key: "square_footage", label: "Square Footage", min: 500, max: 5000, unit: "sq ft", icon: "📐" },
  { key: "bedrooms", label: "Bedrooms", min: 1, max: 10, unit: "", icon: "🛏️" },
  { key: "bathrooms", label: "Bathrooms", min: 1, max: 10, unit: "", icon: "🚿" },
  { key: "year_built", label: "Year Built", min: 1950, max: 2026, unit: "", icon: "🏗️" },
  { key: "lot_size", label: "Lot Size", min: 500, max: 20000, unit: "sq ft", icon: "🌳" },
  { key: "distance_to_city_center", label: "Distance to City Center", min: 1, max: 10, unit: "/10", icon: "📍" },
  { key: "school_rating", label: "School Rating", min: 1, max: 10, unit: "/10", icon: "🎓" },
];

interface HistoryItem {
  id: string;
  timestamp: number;
  result: PredictionResult;
}

const HISTORY_STORAGE_KEY = "property-value-estimator-history";
const COMPARE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Dataset statistics derived from House Price Dataset.csv (50 records)
// Must stay in sync with /property-value-estimator page
const datasetStats: Record<keyof HouseInput, { min: number; max: number; avg: number }> = {
  square_footage:           { min: 980,  max: 2400, avg: 1680 },
  bedrooms:                 { min: 2,    max: 4,    avg: 2.96 },
  bathrooms:                { min: 1,    max: 3,    avg: 1.95 },
  year_built:               { min: 1978, max: 2012, avg: 1995.24 },
  lot_size:                 { min: 4400, max: 10500, avg: 7229 },
  distance_to_city_center:  { min: 1.0,  max: 10.0,  avg: 5.0 },
  school_rating:            { min: 1.0,  max: 10.0,  avg: 5.0 },
};

// Normalize: dataset min → 0, avg → 50, max → 100
const normalizeValue = (value: number, key: keyof HouseInput): number => {
  const stats = datasetStats[key];
  if (!stats || stats.max === stats.min) return 50;
  const { min, max, avg } = stats;

  let score: number;
  if (value >= avg) {
    score = 50 + ((value - avg) / (max - avg)) * 50;
  } else {
    score = 50 - ((avg - value) / (avg - min)) * 50;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  };

  // Remove item from history
  const removeFromHistory = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
    if (selectedId === id) setSelectedId(null);
    compareIds.delete(id);
    setCompareIds(new Set(compareIds));
  };

  // Clear all history
  const clearHistory = () => {
    saveHistory([]);
    setSelectedId(null);
    setCompareIds(new Set());
    setShowCompare(false);
  };

  // Toggle compare selection
  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 5) {
        next.add(id);
      }
      return next;
    });
  };

  const compareItems = history.filter((item) => compareIds.has(item.id));
  const selectedItem = history.find((item) => item.id === selectedId) ?? null;

  // Comparison radar chart data
  const getCompareRadarData = () => {
    return fields.map((field) => {
      const entry: Record<string, unknown> = {
        field: field.label.length > 10 ? field.label.substring(0, 10) + "..." : field.label,
      };
      compareItems.forEach((item, idx) => {
        const value = item.result.input[field.key];
        entry[`item${idx}`] = normalizeValue(value, field.key);
      });
      return entry;
    });
  };

  // Comparison bar chart data
  const getCompareBarData = () => {
    return fields.map((field) => {
      const entry: Record<string, unknown> = {
        name: field.label.length > 8 ? field.label.substring(0, 8) + "..." : field.label,
      };
      compareItems.forEach((item, idx) => {
        const value = item.result.input[field.key];
        entry[`item${idx}`] = normalizeValue(value, field.key);
      });
      return entry;
    });
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  // Show loading state while hydrating from localStorage
  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading history..." />
      </div>
    );
  }

  return (
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400 dark:text-zinc-500">
            <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium mb-1">No history yet</p>
            <p className="text-sm">Submit an estimation to see results here</p>
            <Link
              href="/property-value-estimator"
              className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
            >
              Go to Estimator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* History List */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      All Results
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {history.length} estimation{history.length !== 1 ? "s" : ""} recorded
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {compareIds.size >= 2 && (
                      <button
                        type="button"
                        onClick={() => setShowCompare(!showCompare)}
                        aria-expanded={showCompare}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Compare ({compareIds.size})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded-lg"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedId === item.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-500"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                              {formatPrice(item.result.predicted_price)}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {fields.slice(0, 4).map((field) => (
                              <span
                                key={field.key}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                              >
                                {field.icon} {item.result.input[field.key]}
                                {field.unit ? ` ${field.unit}` : ""}
                              </span>
                            ))}
                            {fields.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                                +{fields.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          {/* Compare checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleCompare(item.id)}
                            title={compareIds.has(item.id) ? "Remove from comparison" : "Add to comparison (max 5)"}
                            aria-label={compareIds.has(item.id) ? "Remove from comparison" : "Add to comparison"}
                            aria-pressed={compareIds.has(item.id)}
                            className={`p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                              compareIds.has(item.id)
                                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            }`}
                          >
                            <svg className="w-4 h-4" fill={compareIds.has(item.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </button>
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(item.id);
                            }}
                            aria-label="Delete this record"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Expanded detail view */}
                      {selectedId === item.id && (
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {fields.map((field) => (
                              <div key={field.key} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                  {field.icon} {field.label}
                                </div>
                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                  {item.result.input[field.key]}
                                  {field.unit ? ` ${field.unit}` : ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Item Detail / Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-10">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                    Detail View
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {selectedItem
                      ? "Selected estimation details"
                      : "Click a result to view details"}
                  </p>

                  {selectedItem ? (
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        {formatPrice(selectedItem.result.predicted_price)}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                        {formatTime(selectedItem.timestamp)}
                      </div>
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody>
                            {fields.map((field, index) => (
                              <tr
                                key={field.key}
                                className={`border-t border-zinc-100 dark:border-zinc-800 ${
                                  index % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"
                                }`}
                              >
                                <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">
                                  {field.icon} {field.label}
                                </td>
                                <td className="px-3 py-2.5 text-right font-medium text-zinc-900 dark:text-white">
                                  {selectedItem.result.input[field.key]}
                                  {field.unit ? ` ${field.unit}` : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-500">
                      <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">No selection</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison View */}
        {showCompare && compareItems.length >= 2 && (
          <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Property Comparison
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Comparing {compareItems.length} properties
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setCompareIds(new Set()); setShowCompare(false); }}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Clear Selection
              </button>
            </div>

            {/* Price Comparison */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
              {compareItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                  />
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    {formatTime(item.timestamp)}
                  </div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-white">
                    {formatPrice(item.result.predicted_price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                      <th className="text-left px-4 py-3 text-zinc-600 dark:text-zinc-400 font-medium sticky left-0 bg-zinc-50 dark:bg-zinc-800/50 min-w-[140px]">
                        Property
                      </th>
                      {compareItems.map((item, idx) => (
                        <th
                          key={item.id}
                          className="text-right px-4 py-3 font-medium min-w-[100px]"
                          style={{ color: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                        >
                          #{idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, fieldIdx) => {
                      const values = compareItems.map((item) => item.result.input[field.key]);
                      const maxVal = Math.max(...values);
                      const minVal = Math.min(...values);
                      return (
                        <tr
                          key={field.key}
                          className={`border-t border-zinc-100 dark:border-zinc-800 ${
                            fieldIdx % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"
                          }`}
                        >
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 sticky left-0 bg-inherit">
                            <span className="mr-2">{field.icon}</span>
                            {field.label}
                          </td>
                          {compareItems.map((item) => {
                            const val = item.result.input[field.key];
                            const isMax = val === maxVal && maxVal !== minVal;
                            const isMin = val === minVal && maxVal !== minVal;
                            return (
                              <td
                                key={item.id}
                                className={`px-4 py-3 text-right font-medium ${
                                  isMax
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : isMin
                                    ? "text-red-500 dark:text-red-400"
                                    : "text-zinc-900 dark:text-white"
                                }`}
                              >
                                {val}
                                {field.unit ? ` ${field.unit}` : ""}
                                {isMax && (
                                  <span className="ml-1 text-xs" title="Highest">▲</span>
                                )}
                                {isMin && (
                                  <span className="ml-1 text-xs" title="Lowest">▼</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {/* Price row */}
                    <tr className="border-t-2 border-zinc-200 dark:border-zinc-700 bg-blue-50/50 dark:bg-blue-900/10">
                      <td className="px-4 py-3 text-zinc-900 dark:text-white font-semibold sticky left-0 bg-blue-50/50 dark:bg-blue-900/10">
                        💰 Predicted Price
                      </td>
                      {compareItems.map((item) => {
                        const prices = compareItems.map((i) => i.result.predicted_price);
                        const maxPrice = Math.max(...prices);
                        const isMax = item.result.predicted_price === maxPrice;
                        return (
                          <td
                            key={item.id}
                            className={`px-4 py-3 text-right font-bold text-base ${
                              isMax
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-900 dark:text-white"
                            }`}
                          >
                            {formatPrice(item.result.predicted_price)}
                            {isMax && prices.some((p) => p !== maxPrice) && (
                              <span className="ml-1 text-xs">▲</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comparison Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grouped Bar Chart */}
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Value Distribution Comparison
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getCompareBarData()} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#71717a' }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10, fill: '#71717a' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      {compareItems.map((item, idx) => (
                        <Bar
                          key={item.id}
                          dataKey={`item${idx}`}
                          name={`#${idx + 1} ${formatPrice(item.result.predicted_price)}`}
                          fill={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Overlaid Radar Chart */}
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Property Profile Overlay
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getCompareRadarData()}>
                      <PolarGrid stroke="#e4e4e7" />
                      <PolarAngleAxis dataKey="field" tick={{ fontSize: 9, fill: '#71717a' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#a1a1aa' }} />
                      {compareItems.map((item, idx) => (
                        <Radar
                          key={item.id}
                          name={`#${idx + 1}`}
                          dataKey={`item${idx}`}
                          stroke={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                          fill={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                          fillOpacity={0.15}
                        />
                      ))}
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
