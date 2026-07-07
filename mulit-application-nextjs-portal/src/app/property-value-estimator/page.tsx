"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
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

const initialForm: HouseInput = {
  square_footage: 1500,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 2000,
  lot_size: 6000,
  distance_to_city_center: 5.0,
  school_rating: 5.0,
};

const fields: {
  key: keyof HouseInput;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: string;
}[] = [
  {
    key: "square_footage",
    label: "Square Footage",
    description: "House area in square feet",
    min: 500,
    max: 5000,
    step: 1,
    unit: "sq ft",
    icon: "📐",
  },
  {
    key: "bedrooms",
    label: "Bedrooms",
    description: "Number of bedrooms",
    min: 1,
    max: 10,
    step: 1,
    unit: "",
    icon: "🛏️",
  },
  {
    key: "bathrooms",
    label: "Bathrooms",
    description: "Number of bathrooms",
    min: 1,
    max: 10,
    step: 0.5,
    unit: "",
    icon: "🚿",
  },
  {
    key: "year_built",
    label: "Year Built",
    description: "Year the property was built",
    min: 1950,
    max: 2026,
    step: 1,
    unit: "",
    icon: "🏗️",
  },
  {
    key: "lot_size",
    label: "Lot Size",
    description: "Lot size in square feet",
    min: 500,
    max: 20000,
    step: 1,
    unit: "sq ft",
    icon: "🌳",
  },
  {
    key: "distance_to_city_center",
    label: "Distance to City Center",
    description: "Distance rating",
    min: 1,
    max: 10,
    step: 0.1,
    unit: "/10",
    icon: "📍",
  },
  {
    key: "school_rating",
    label: "School Rating",
    description: "School rating",
    min: 1,
    max: 10,
    step: 0.1,
    unit: "/10",
    icon: "🎓",
  },
];

interface HistoryItem {
  id: string;
  timestamp: number;
  result: PredictionResult;
}

const HISTORY_STORAGE_KEY = "property-value-estimator-history";
const MAX_HISTORY_ITEMS = 10;

// Dataset statistics derived from House Price Dataset.csv (50 records)
const datasetStats: Record<keyof HouseInput, { min: number; max: number; avg: number }> = {
  square_footage:           { min: 980,  max: 2400, avg: 1680 },
  bedrooms:                 { min: 2,    max: 4,    avg: 2.96 },
  bathrooms:                { min: 1,    max: 3,    avg: 1.95 },
  year_built:               { min: 1978, max: 2012, avg: 1995.24 },
  lot_size:                 { min: 4400, max: 10500, avg: 7229 },
  distance_to_city_center:  { min: 1.0,  max: 10.0,  avg: 5.0 },
  school_rating:            { min: 1.0,  max: 10.0,  avg: 5.0 },
};

export default function PropertyValueEstimator() {
  const [form, setForm] = useState<HouseInput>(initialForm);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof HouseInput, string>>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount (for count badge)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  // Add result to history
  const addToHistory = (predictionResult: PredictionResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      result: predictionResult,
    };
    const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  };

  // Normalize: CSV dataset min → 0, avg → 50 (center), max → 100
  const normalizeValue = (value: number, key: keyof HouseInput): number => {
    const stats = datasetStats[key];
    if (!stats || stats.max === stats.min) return 50;
    const { min, max, avg } = stats;

    let score: number;
    // min → 0; avg → 50; max → 100
    if (value >= avg) {
      score = 50 + ((value - avg) / (max - avg)) * 50;
    } else {
      score = 50 - ((avg - value) / (avg - min)) * 50;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Get comparison level label based on dataset average
  const getComparisonLabel = (value: number, key: keyof HouseInput): string => {
    const stats = datasetStats[key];
    if (!stats) return "";
    return value >= stats.avg ? "Above avg" : "Below avg";
  };

  const validateField = (key: keyof HouseInput, value: number): string | null => {
    const field = fields.find((f) => f.key === key);
    if (!field) return null;

    if (isNaN(value) || value === null || value === undefined) {
      return `${field.label} is required`;
    }

    if (value <= 0 && field.min > 0) {
      return `${field.label} must be greater than 0`;
    }

    if (value < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }

    if (value > field.max) {
      return `${field.label} must be at most ${field.max}`;
    }

    if (field.key === "bedrooms" && !Number.isInteger(value)) {
      return `Bedrooms must be a whole number`;
    }

    if (field.key === "year_built" && !Number.isInteger(value)) {
      return `Year Built must be a whole number`;
    }

    return null;
  };

  const handleChange = (key: keyof HouseInput, value: string) => {
    const numValue = Number(value);
    setForm((prev) => ({ ...prev, [key]: numValue }));

    // Clear error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    // Only validate if it's a complete, valid number (skip empty, "-", etc.)
    if (value === "" || value === "-" || value === "." || value === "-.") {
      return;
    }

    // Validate on change
    const error = validateField(key, numValue);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof HouseInput, string>> = {};
    let isValid = true;

    for (const field of fields) {
      const error = validateField(field.key, form[field.key]);
      if (error) {
        errors[field.key] = error;
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setError("Please fix the errors above before submitting");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/property-value-estimator/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData?.detail?.[0]?.msg || `Request failed (${res.status})`
        );
      }

      const data: PredictionResult = await res.json();
      setResult(data);
      addToHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError(null);
    setFieldErrors({});
  };

  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  // Normalize values to 0-100 scale based on dataset min/max
  const getNormalizedData = () => {
    if (!result) return [];
    return fields.map((field) => {
      const value = result.input[field.key];
      const score = normalizeValue(value, field.key);
      const stats = datasetStats[field.key];
      return {
        field: field.label,
        value: score,
        rawValue: value,
        avg: stats.avg,
        unit: field.unit,
        comparison: getComparisonLabel(value, field.key),
      };
    });
  };

  // Bar chart data (dataset-relative percentile)
  const getBarChartData = () => {
    if (!result) return [];
    return fields.map((field) => {
      const value = result.input[field.key];
      const score = normalizeValue(value, field.key);
      const stats = datasetStats[field.key];
      return {
        name: field.label.length > 12 ? field.label.substring(0, 12) + "..." : field.label,
        value: score,
        rawValue: value,
        avg: stats.avg,
        unit: field.unit,
        comparison: getComparisonLabel(value, field.key),
      };
    });
  };

  return (
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                <div className="mb-1">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Property Details
                  </h2>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                  Enter the property information below to get an estimated
                  value.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label htmlFor={`field-${field.key}`} className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        <span aria-hidden="true">{field.icon}</span>
                        {field.label}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id={`field-${field.key}`}
                          type="number"
                          value={form[field.key]}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          aria-invalid={!!fieldErrors[field.key]}
                          aria-describedby={fieldErrors[field.key] ? `error-${field.key}` : `desc-${field.key}`}
                          aria-required="true"
                          className={`flex-1 h-11 px-4 rounded-xl border ${
                            fieldErrors[field.key]
                              ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                              : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                          } text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                            fieldErrors[field.key]
                              ? "focus:ring-red-500/40 focus:border-red-500"
                              : "focus:ring-blue-500/40 focus:border-blue-500"
                          } transition-all`}
                        />
                        {field.unit && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap" aria-hidden="true">
                            {field.unit}
                          </span>
                        )}
                      </div>
                      {fieldErrors[field.key] ? (
                        <p id={`error-${field.key}`} className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors[field.key]}
                        </p>
                      ) : (
                        <p id={`desc-${field.key}`} className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                          {field.description} ({field.min} - {field.max})
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" label="" className="flex-row gap-2" />
                        Estimating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        Estimate Value
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="h-11 px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400/50 focus:ring-offset-2"
                  >
                    Reset
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm" role="alert">
                    {error}
                  </div>
                )}
              </div>


            </div>

            {/* Result Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-10">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6" role="region" aria-label="Estimated value result">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                    Estimated Value
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {result
                      ? "Based on your input"
                      : "Submit the form to see the result"}
                  </p>

                  {result ? (
                    <div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6" aria-live="polite">
                        {formatPrice(result.predicted_price)}
                      </div>

                      {/* View Toggle */}
                      <div className="flex items-center gap-2 mb-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setViewMode("table")}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            viewMode === "table"
                              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Table
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("chart")}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            viewMode === "chart"
                              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Chart
                        </button>
                      </div>

                      {/* Table View */}
                      {viewMode === "table" && (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                                <th className="text-left px-4 py-3 text-zinc-600 dark:text-zinc-400 font-medium">
                                  Property
                                </th>
                                <th className="text-right px-4 py-3 text-zinc-600 dark:text-zinc-400 font-medium">
                                  Value
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {fields.map((field, index) => (
                                <tr
                                  key={field.key}
                                  className={`border-t border-zinc-100 dark:border-zinc-800 ${
                                    index % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/20"
                                  }`}
                                >
                                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                                    <span className="mr-2">{field.icon}</span>
                                    {field.label}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-white">
                                    {result.input[field.key]}
                                    {field.unit ? ` ${field.unit}` : ""}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Chart View */}
                      {viewMode === "chart" && (
                        <div className="space-y-6">
                          {/* Bar Chart */}
                          <div>
                            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                              Dataset Relative Score (0–100)
                            </h3>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getBarChartData()} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#71717a' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                  />
                                  <YAxis
                                    tick={{ fontSize: 10, fill: '#71717a' }}
                                    domain={[0, 100]}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#18181b',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      color: '#fff',
                                    }}
                                    formatter={(value, name, props) => [
                                      `${props.payload.rawValue} ${props.payload.unit} (avg: ${props.payload.avg})`,
                                      props.payload.name,
                                    ]}
                                  />
                                  <Bar
                                    dataKey="value"
                                    fill="url(#colorGradient)"
                                    radius={[4, 4, 0, 0]}
                                  />
                                  <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#3b82f6" />
                                      <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                  </defs>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Radar Chart */}
                          <div>
                            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                              Property Profile
                            </h3>
                            <div className="h-56">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={getNormalizedData()}>
                                  <PolarGrid stroke="#e4e4e7" />
                                  <PolarAngleAxis
                                    dataKey="field"
                                    tick={{ fontSize: 10, fill: '#71717a' }}
                                  />
                                  <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fontSize: 9, fill: '#a1a1aa' }}
                                  />
                                  <Radar
                                    name="Value"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.3}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#18181b',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      color: '#fff',
                                    }}
                                    formatter={(value, name, props) => [
                                      `${props.payload.rawValue} ${props.payload.unit} (avg: ${props.payload.avg}) — ${props.payload.comparison}`,
                                      props.payload.field,
                                    ]}
                                  />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-500">
                      <svg
                        className="w-16 h-16 mb-4 opacity-30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">No estimate yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
  );
}
