"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "../components/LoadingSpinner";

// Types
interface HousingRecord {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
}

interface FieldStats {
  count: number;
  avg: number;
  min: number;
  max: number;
  sum: number;
}

interface OverallStats {
  totalProperties: number;
  price: FieldStats;
  squareFootage: FieldStats;
  lotSize: FieldStats;
  distanceToCityCenter: FieldStats;
  schoolRating: FieldStats;
  medianPrice: number;
  bedroomDistribution: Record<string, number>;
}

interface BedroomStat {
  bedrooms: number;
  avgPrice: number;
  count: number;
  avgSquareFootage?: number;
}

interface SchoolRatingStat {
  avgPrice: number;
  count: number;
  minPrice?: number;
  maxPrice?: number;
}

interface DistanceStat {
  avgPrice: number;
  count: number;
  minPrice?: number;
  maxPrice?: number;
}

interface PropertyTableQuery {
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  minDistance?: number;
  maxDistance?: number;
  minSchoolRating?: number;
  maxSchoolRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  size?: number;
}

interface PagedResult {
  data: HousingRecord[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

interface WhatIfInput {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

interface PredictionResult {
  predicted_price: number;
  input: WhatIfInput;
}

const API_BASE = "/api/property-market-analysis";

export default function MarketAnalysisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);

  const [bedroomStats, setBedroomStats] = useState<BedroomStat[]>([]);
  const [schoolStats, setSchoolStats] = useState<
    Record<string, SchoolRatingStat>
  >({});
  const [distanceStats, setDistanceStats] = useState<
    Record<string, DistanceStat>
  >({});
  const [topExpensive, setTopExpensive] = useState<HousingRecord[]>([]);
  const [topAffordable, setTopAffordable] = useState<HousingRecord[]>([]);

  // Table state
  const [tableData, setTableData] = useState<PagedResult | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableQuery, setTableQuery] = useState<PropertyTableQuery>({
    sortBy: "price",
    sortOrder: "desc",
    page: 0,
    size: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  // What-If Analysis state
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [whatIfForm, setWhatIfForm] = useState<WhatIfInput>({
    square_footage: 1500,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2000,
    lot_size: 7000,
    distance_to_city_center: 5,
    school_rating: 7,
  });
  const [whatIfResult, setWhatIfResult] = useState<PredictionResult | null>(
    null,
  );
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfActualPrice, setWhatIfActualPrice] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        statsRes,
        bedroomRes,
        schoolRes,
        distanceRes,
        expensiveRes,
        affordableRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/api/market/statistics`),

        fetch(`${API_BASE}/api/market/statistics/by-bedroom`),
        fetch(`${API_BASE}/api/market/statistics/by-school-rating`),
        fetch(`${API_BASE}/api/market/statistics/by-distance`),
        fetch(`${API_BASE}/api/market/top-expensive?limit=5`),
        fetch(`${API_BASE}/api/market/top-affordable?limit=5`),
      ]);

      if (!statsRes.ok) throw new Error("Failed to fetch statistics");

      setOverallStats(await statsRes.json());

      setBedroomStats(await bedroomRes.json());
      setSchoolStats(await schoolRes.json());
      setDistanceStats(await distanceRes.json());
      setTopExpensive(await expensiveRes.json());
      setTopAffordable(await affordableRes.json());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load market data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch table data
  const fetchTableData = async (query: PropertyTableQuery) => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
      const res = await fetch(
        `${API_BASE}/api/market/properties/table?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch table data");
      setTableData(await res.json());
    } catch (err) {
      console.error("Table fetch error:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch table data on mount
  useEffect(() => {
    fetchTableData(tableQuery);
  }, []);

  const handleTableQueryChange = (newQuery: Partial<PropertyTableQuery>) => {
    const updatedQuery = { ...tableQuery, ...newQuery };
    setTableQuery(updatedQuery);
    fetchTableData(updatedQuery);
  };

  const handleSort = (field: string) => {
    const newOrder =
      tableQuery.sortBy === field && tableQuery.sortOrder === "asc"
        ? "desc"
        : "asc";
    handleTableQueryChange({ sortBy: field, sortOrder: newOrder, page: 0 });
  };

  const handleResetFilters = () => {
    const resetQuery: PropertyTableQuery = {
      sortBy: tableQuery.sortBy,
      sortOrder: tableQuery.sortOrder,
      page: 0,
      size: tableQuery.size,
    };
    setTableQuery(resetQuery);
    fetchTableData(resetQuery);
  };

  // Export table data to CSV
  const handleExportCSV = async () => {
    try {
      // Fetch all records with current filters (no pagination limit)
      const params = new URLSearchParams();
      Object.entries(tableQuery).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && key !== "page" && key !== "size") {
          params.append(key, String(value));
        }
      });
      params.append("page", "0");
      params.append("size", "10000");
      const res = await fetch(
        `${API_BASE}/api/market/properties/table?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch data for export");
      const allData: PagedResult = await res.json();

      const headers = [
        "ID",
        "Price",
        "Bedrooms",
        "Bathrooms",
        "Square Footage",
        "Year Built",
        "Lot Size",
        "Distance to City Center",
        "School Rating",
      ];
      const rows = allData.data.map((r) => [
        r.id,
        r.price,
        r.bedrooms,
        r.bathrooms,
        r.squareFootage,
        r.yearBuilt,
        r.lotSize,
        r.distanceToCityCenter,
        r.schoolRating,
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `property-data-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export error:", err);
    }
  };

  // What-If Analysis handlers
  const openWhatIf = (record: HousingRecord) => {
    setWhatIfForm({
      square_footage: record.squareFootage,
      bedrooms: record.bedrooms,
      bathrooms: record.bathrooms,
      year_built: record.yearBuilt,
      lot_size: record.lotSize,
      distance_to_city_center: record.distanceToCityCenter,
      school_rating: record.schoolRating,
    });
    setWhatIfActualPrice(record.price);
    setWhatIfResult(null);
    setWhatIfOpen(true);
  };

  const handleWhatIfSubmit = async () => {
    setWhatIfLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whatIfForm),
      });
      if (!res.ok) throw new Error("Prediction failed");
      setWhatIfResult(await res.json());
    } catch (err) {
      console.error("What-if prediction error:", err);
    } finally {
      setWhatIfLoading(false);
    }
  };

  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useCallback(async () => {
    if (!printAreaRef.current) return;
    const btn = document.getElementById("export-pdf-btn");
    if (btn) btn.style.display = "none";

    try {
      // Dynamic imports to avoid SSR issues
      const [{ toCanvas }, jsPDFModule] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      const jsPDF = jsPDFModule.jsPDF;

      const canvas = await toCanvas(printAreaRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const w = imgWidth * ratio;
      const h = imgHeight * ratio;
      const x = (pdfWidth - w) / 2;
      const y = (pdfHeight - h) / 2;

      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.98),
        "JPEG",
        x,
        y,
        w,
        h
      );
      pdf.save(`market-analysis-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      if (btn) btn.style.display = "";
    }
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);

  const formatDecimal = (num: number, digits = 1) => num.toFixed(digits);

  // Compute range for a nested stat field
  const getRange = (
    field: keyof Pick<
      OverallStats,
      | "price"
      | "squareFootage"
      | "lotSize"
      | "distanceToCityCenter"
      | "schoolRating"
    >,
  ) => {
    const stats = overallStats?.[field];
    if (stats) return { min: stats.min, max: stats.max };
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading market data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Unable to load data
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const schoolChartData = Object.entries(schoolStats).map(
    ([rating, stats]) => ({
      rating: `${rating}`,
      avgPrice: stats.avgPrice,
      count: stats.count,
    }),
  );

  const distanceChartData = Object.entries(distanceStats).map(
    ([range, stats]) => ({
      range: `${range}`.replace(/\s*miles?/gi, "").trim(),
      avgPrice: stats.avgPrice,
      count: stats.count,
    }),
  );

  return (
    <div ref={printAreaRef} className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Market Analysis Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Explore real estate market trends and property statistics
          </p>
        </div>
        <button
          id="export-pdf-btn"
          type="button"
          onClick={handleExportPDF}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Total Properties"
          value={
            overallStats?.totalProperties
              ? formatNumber(overallStats.totalProperties)
              : "N/A"
          }
          icon="🏠"
        />
        <StatCard
          title="Median Price"
          value={
            overallStats?.medianPrice
              ? formatPrice(overallStats.medianPrice)
              : "N/A"
          }
          icon="📊"
          range={(() => {
            const r = getRange("price");
            return r
              ? `${formatPrice(r.min)} - ${formatPrice(r.max)}`
              : undefined;
          })()}
        />
        <StatCard
          title="Avg Sq Ft"
          value={
            overallStats?.squareFootage?.avg
              ? formatDecimal(overallStats.squareFootage.avg)
              : "N/A"
          }
          icon="📐"
          range={(() => {
            const r = getRange("squareFootage");
            return r
              ? `${formatNumber(r.min)} - ${formatNumber(r.max)}`
              : undefined;
          })()}
        />
        <StatCard
          title="Avg Lot Size"
          value={
            overallStats?.lotSize?.avg
              ? formatNumber(overallStats.lotSize.avg)
              : "N/A"
          }
          icon="🌳"
          range={(() => {
            const r = getRange("lotSize");
            return r
              ? `${formatNumber(r.min)} - ${formatNumber(r.max)}`
              : undefined;
          })()}
        />
        <StatCard
          title="Avg Distance"
          value={
            overallStats?.distanceToCityCenter?.avg !== undefined
              ? `${formatDecimal(overallStats.distanceToCityCenter.avg)} mi`
              : "N/A"
          }
          icon="📍"
          range={(() => {
            const r = getRange("distanceToCityCenter");
            return r
              ? `${formatDecimal(r.min)} - ${formatDecimal(r.max)} mi`
              : undefined;
          })()}
        />
        <StatCard
          title="Avg School"
          value={
            overallStats?.schoolRating?.avg !== undefined
              ? formatDecimal(overallStats.schoolRating.avg)
              : "N/A"
          }
          icon="🎓"
          range={(() => {
            const r = getRange("schoolRating");
            return r
              ? `${formatDecimal(r.min)} - ${formatDecimal(r.max)}`
              : undefined;
          })()}
        />
      </div>

      {/* Property Data Table - Full Width */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
        {/* Filter Controls */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Property Data
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {showFilters ? "Hide" : "Filter"}
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <FilterInput
                label="Bedrooms"
                type="number"
                value={tableQuery.bedrooms ?? ""}
                onChange={(v) =>
                  handleTableQueryChange({
                    bedrooms: v ? Number(v) : undefined,
                    page: 0,
                  })
                }
                placeholder="Any"
              />
              <FilterInput
                label="Min Price"
                type="number"
                value={tableQuery.minPrice ?? ""}
                onChange={(v) =>
                  handleTableQueryChange({
                    minPrice: v ? Number(v) : undefined,
                    page: 0,
                  })
                }
                placeholder="$0"
              />
              <FilterInput
                label="Max Price"
                type="number"
                value={tableQuery.maxPrice ?? ""}
                onChange={(v) =>
                  handleTableQueryChange({
                    maxPrice: v ? Number(v) : undefined,
                    page: 0,
                  })
                }
                placeholder="No limit"
              />
              <FilterInput
                label="Min Sq Ft"
                type="number"
                value={tableQuery.minSquareFootage ?? ""}
                onChange={(v) =>
                  handleTableQueryChange({
                    minSquareFootage: v ? Number(v) : undefined,
                    page: 0,
                  })
                }
                placeholder="Any"
              />
              <FilterInput
                label="Max Sq Ft"
                type="number"
                value={tableQuery.maxSquareFootage ?? ""}
                onChange={(v) =>
                  handleTableQueryChange({
                    maxSquareFootage: v ? Number(v) : undefined,
                    page: 0,
                  })
                }
                placeholder="No limit"
              />
              <FilterInput
                label="School Rating"
                type="number"
                value={tableQuery.minSchoolRating ?? ""}
                onChange={(v) =>
                  handleTableQueryChange({
                    minSchoolRating: v ? Number(v) : undefined,
                    page: 0,
                  })
                }
                placeholder="Any"
              />
            </div>
          )}
        </div>

        {/* Compact Table */}
        {tableLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="md" label="Loading..." />
          </div>
        ) : tableData && tableData.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <SortableHeader
                      label="Price"
                      field="price"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Bed"
                      field="bedrooms"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Bath"
                      field="bathrooms"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Sq Ft"
                      field="squareFootage"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Year"
                      field="yearBuilt"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Lot Size"
                      field="lotSize"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Distance"
                      field="distanceToCityCenter"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="School"
                      field="schoolRating"
                      currentSort={tableQuery.sortBy}
                      order={tableQuery.sortOrder}
                      onSort={handleSort}
                    />
                    <th className="px-3 py-2.5 text-left">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                        Action
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {tableData.data.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                        {formatPrice(record.price)}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {record.bedrooms}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {record.bathrooms}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {formatNumber(record.squareFootage)}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {record.yearBuilt}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {formatNumber(record.lotSize)}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {record.distanceToCityCenter}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {record.schoolRating}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => openWhatIf(record)}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          What-If
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {tableData.page * tableData.size + 1}-
                {Math.min(
                  (tableData.page + 1) * tableData.size,
                  tableData.totalElements,
                )}
                /{formatNumber(tableData.totalElements)}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={tableData.page === 0}
                  onClick={() =>
                    handleTableQueryChange({ page: tableQuery.page! - 1 })
                  }
                  className="px-2 py-1 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  ‹
                </button>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 px-1">
                  {tableData.page + 1}/{tableData.totalPages}
                </span>
                <button
                  type="button"
                  disabled={tableData.page >= tableData.totalPages - 1}
                  onClick={() =>
                    handleTableQueryChange({ page: tableQuery.page! + 1 })
                  }
                  className="px-2 py-1 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-500">
            <p className="text-sm font-medium mb-1">No properties found</p>
            <p className="text-xs">Try adjusting filters</p>
          </div>
        )}
      </div>

      {/* What-If Analysis Panel */}
      {whatIfOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>🔮</span> What-If Analysis
              </h2>
              <button
                type="button"
                onClick={() => setWhatIfOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                aria-label="Close what-if analysis"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Adjust property features below to predict price using the ML model
            </p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
              <WhatIfField
                label="Sq Ft"
                type="number"
                value={whatIfForm.square_footage}
                onChange={(v) =>
                  setWhatIfForm({
                    ...whatIfForm,
                    square_footage: Number(v) || 0,
                  })
                }
              />
              <WhatIfField
                label="Bedrooms"
                type="number"
                value={whatIfForm.bedrooms}
                onChange={(v) =>
                  setWhatIfForm({ ...whatIfForm, bedrooms: Number(v) || 0 })
                }
              />
              <WhatIfField
                label="Bathrooms"
                type="number"
                value={whatIfForm.bathrooms}
                onChange={(v) =>
                  setWhatIfForm({ ...whatIfForm, bathrooms: Number(v) || 0 })
                }
              />
              <WhatIfField
                label="Year Built"
                type="number"
                value={whatIfForm.year_built}
                onChange={(v) =>
                  setWhatIfForm({ ...whatIfForm, year_built: Number(v) || 0 })
                }
              />
              <WhatIfField
                label="Lot Size"
                type="number"
                value={whatIfForm.lot_size}
                onChange={(v) =>
                  setWhatIfForm({ ...whatIfForm, lot_size: Number(v) || 0 })
                }
              />
              <WhatIfField
                label="Distance (mi)"
                type="number"
                value={whatIfForm.distance_to_city_center}
                onChange={(v) =>
                  setWhatIfForm({
                    ...whatIfForm,
                    distance_to_city_center: Number(v) || 0,
                  })
                }
              />
              <WhatIfField
                label="School Rating"
                type="number"
                value={whatIfForm.school_rating}
                onChange={(v) =>
                  setWhatIfForm({
                    ...whatIfForm,
                    school_rating: Number(v) || 0,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleWhatIfSubmit}
                disabled={whatIfLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
              >
                {whatIfLoading ? "Predicting..." : "Predict Price"}
              </button>

              {whatIfResult && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Predicted:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(whatIfResult.predicted_price)}
                    </span>
                  </div>
                  {whatIfActualPrice !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Actual:
                      </span>
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        {formatPrice(whatIfActualPrice)}
                      </span>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          whatIfResult.predicted_price > whatIfActualPrice
                            ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                            : whatIfResult.predicted_price < whatIfActualPrice
                              ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {whatIfResult.predicted_price > whatIfActualPrice
                          ? `+${formatPrice(whatIfResult.predicted_price - whatIfActualPrice)}`
                          : whatIfResult.predicted_price < whatIfActualPrice
                            ? `-${formatPrice(whatIfActualPrice - whatIfResult.predicted_price)}`
                            : "Exact"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid - 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Price by Bedrooms */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
            Avg Price by Bedrooms
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bedroomStats}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                opacity={0.2}
              />
              <XAxis dataKey="bedrooms" stroke="#71717a" fontSize={12} />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
                formatter={(value) => [formatPrice(Number(value)), "Avg Price"]}
              />
              <Bar dataKey="avgPrice" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price by Distance */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
            Avg Price by Distance to City
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distanceChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                opacity={0.2}
              />
              <XAxis dataKey="range" stroke="#71717a" fontSize={12} />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
                formatter={(value) => [formatPrice(Number(value)), "Avg Price"]}
              />
              <Bar dataKey="avgPrice" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price by School Rating */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
            Price by School Rating
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={schoolChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                opacity={0.2}
              />
              <XAxis dataKey="rating" stroke="#71717a" fontSize={12} />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
                formatter={(value) => [formatPrice(Number(value)), "Avg Price"]}
              />
              <Bar dataKey="avgPrice" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Property Count by Bedrooms */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
            Property Count by Bedrooms
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bedroomStats}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                opacity={0.2}
              />
              <XAxis dataKey="bedrooms" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Expensive & Affordable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expensive */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-red-500">🔺</span> Most Expensive
          </h2>
          <div className="space-y-3">
            {topExpensive.map((property, index) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {property.bedrooms} bed / {property.bathrooms} bath
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatNumber(property.squareFootage)} sqft · Built{" "}
                      {property.yearBuilt}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {formatPrice(property.price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Affordable */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-green-500">🔻</span> Most Affordable
          </h2>
          <div className="space-y-3">
            {topAffordable.map((property, index) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {property.bedrooms} bed / {property.bathrooms} bath
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatNumber(property.squareFootage)} sqft · Built{" "}
                      {property.yearBuilt}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatPrice(property.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  range,
}: {
  title: string;
  value: string;
  icon: string;
  range?: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{title}</p>
      </div>
      <p className="text-lg font-bold text-zinc-900 dark:text-white">{value}</p>
      {range && (
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          {range}
        </p>
      )}
    </div>
  );
}

// Filter Input Component
function FilterInput({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
      />
    </div>
  );
}

// Sortable Table Header Component
function SortableHeader({
  label,
  field,
  currentSort,
  order,
  onSort,
}: {
  label: string;
  field: string;
  currentSort?: string;
  order?: string;
  onSort: (field: string) => void;
}) {
  const isActive = currentSort === field;
  return (
    <th
      className="px-3 py-2.5 text-left cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase">
          {label}
        </span>
        {isActive && (
          <span className="text-blue-500" aria-hidden="true">
            {order === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );
}

// What-If Field Component
function WhatIfField({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
      />
    </div>
  );
}
