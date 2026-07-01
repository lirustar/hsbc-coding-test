package com.hsbc.propertymarketanalysis.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.DoubleSummaryStatistics;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.hsbc.propertymarketanalysis.dto.HousingRecord;
import com.hsbc.propertymarketanalysis.dto.PagedResult;
import com.hsbc.propertymarketanalysis.dto.PropertyTableQuery;

import jakarta.annotation.PostConstruct;

import java.util.function.Predicate;

@Service
public class MarketAnalysisService {

    private List<HousingRecord> records = new ArrayList<>();

    @PostConstruct
    public void loadDataset() {
        try {
            ClassPathResource resource = new ClassPathResource("House Price Dataset.csv");
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                // Skip header
                reader.readLine();
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty()) continue;
                    String[] parts = line.split(",");
                    HousingRecord record = new HousingRecord(
                            Integer.parseInt(parts[0].trim()),
                            Double.parseDouble(parts[1].trim()),
                            Integer.parseInt(parts[2].trim()),
                            Double.parseDouble(parts[3].trim()),
                            Integer.parseInt(parts[4].trim()),
                            Double.parseDouble(parts[5].trim()),
                            Double.parseDouble(parts[6].trim()),
                            Double.parseDouble(parts[7].trim()),
                            Double.parseDouble(parts[8].trim())
                    );
                    records.add(record);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load housing dataset", e);
        }
    }

    public List<HousingRecord> getAllRecords() {
        return records;
    }

    public Map<String, Object> getOverallStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProperties", records.size());

        DoubleSummaryStatistics priceStats = records.stream()
                .mapToDouble(HousingRecord::getPrice)
                .summaryStatistics();
        stats.put("price", buildStatsMap(priceStats));

        DoubleSummaryStatistics sqftStats = records.stream()
                .mapToDouble(HousingRecord::getSquareFootage)
                .summaryStatistics();
        stats.put("squareFootage", buildStatsMap(sqftStats));

        DoubleSummaryStatistics lotStats = records.stream()
                .mapToDouble(HousingRecord::getLotSize)
                .summaryStatistics();
        stats.put("lotSize", buildStatsMap(lotStats));

        DoubleSummaryStatistics distStats = records.stream()
                .mapToDouble(HousingRecord::getDistanceToCityCenter)
                .summaryStatistics();
        stats.put("distanceToCityCenter", buildStatsMap(distStats));

        DoubleSummaryStatistics schoolStats = records.stream()
                .mapToDouble(HousingRecord::getSchoolRating)
                .summaryStatistics();
        stats.put("schoolRating", buildStatsMap(schoolStats));

        // Median price
        List<Double> sortedPrices = records.stream()
                .mapToDouble(HousingRecord::getPrice)
                .sorted()
                .boxed()
                .collect(Collectors.toList());
        stats.put("medianPrice", calculateMedian(sortedPrices));

        // Bedroom distribution
        Map<Integer, Long> bedroomCounts = records.stream()
                .collect(Collectors.groupingBy(HousingRecord::getBedrooms, Collectors.counting()));
        stats.put("bedroomDistribution", bedroomCounts);

        return stats;
    }

    public List<Map<String, Object>> getStatisticsByBedrooms() {
        Map<Integer, List<HousingRecord>> grouped = records.stream()
                .collect(Collectors.groupingBy(HousingRecord::getBedrooms,
                        LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> result = new ArrayList<>();
        grouped.forEach((bedrooms, group) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("bedrooms", bedrooms);
            entry.put("count", group.size());

            DoubleSummaryStatistics priceStats = group.stream()
                    .mapToDouble(HousingRecord::getPrice)
                    .summaryStatistics();
            entry.put("avgPrice", Math.round(priceStats.getAverage() * 100.0) / 100.0);
            entry.put("minPrice", priceStats.getMin());
            entry.put("maxPrice", priceStats.getMax());

            DoubleSummaryStatistics sqftStats = group.stream()
                    .mapToDouble(HousingRecord::getSquareFootage)
                    .summaryStatistics();
            entry.put("avgSquareFootage", Math.round(sqftStats.getAverage() * 100.0) / 100.0);

            result.add(entry);
        });
        return result;
    }

    public Map<String, Object> getPriceByDistance() {
        // Group by distance ranges
        Map<String, List<HousingRecord>> grouped = new LinkedHashMap<>();
        grouped.put("0-3 miles", new ArrayList<>());
        grouped.put("3-5 miles", new ArrayList<>());
        grouped.put("5-7 miles", new ArrayList<>());
        grouped.put("7+ miles", new ArrayList<>());

        for (HousingRecord r : records) {
            double dist = r.getDistanceToCityCenter();
            if (dist <= 3) grouped.get("0-3 miles").add(r);
            else if (dist <= 5) grouped.get("3-5 miles").add(r);
            else if (dist <= 7) grouped.get("5-7 miles").add(r);
            else grouped.get("7+ miles").add(r);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        grouped.forEach((range, group) -> {
            if (!group.isEmpty()) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("count", group.size());
                DoubleSummaryStatistics priceStats = group.stream()
                        .mapToDouble(HousingRecord::getPrice)
                        .summaryStatistics();
                entry.put("avgPrice", Math.round(priceStats.getAverage() * 100.0) / 100.0);
                entry.put("minPrice", priceStats.getMin());
                entry.put("maxPrice", priceStats.getMax());
                result.put(range, entry);
            }
        });
        return result;
    }

    public Map<String, Object> getPriceBySchoolRating() {
        // Group by school rating ranges
        Map<String, List<HousingRecord>> grouped = new LinkedHashMap<>();
        grouped.put("6.0-7.0", new ArrayList<>());
        grouped.put("7.0-8.0", new ArrayList<>());
        grouped.put("8.0-9.0", new ArrayList<>());
        grouped.put("9.0+", new ArrayList<>());

        for (HousingRecord r : records) {
            double rating = r.getSchoolRating();
            if (rating <= 7.0) grouped.get("6.0-7.0").add(r);
            else if (rating <= 8.0) grouped.get("7.0-8.0").add(r);
            else if (rating <= 9.0) grouped.get("8.0-9.0").add(r);
            else grouped.get("9.0+").add(r);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        grouped.forEach((range, group) -> {
            if (!group.isEmpty()) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("count", group.size());
                DoubleSummaryStatistics priceStats = group.stream()
                        .mapToDouble(HousingRecord::getPrice)
                        .summaryStatistics();
                entry.put("avgPrice", Math.round(priceStats.getAverage() * 100.0) / 100.0);
                entry.put("minPrice", priceStats.getMin());
                entry.put("maxPrice", priceStats.getMax());
                result.put(range, entry);
            }
        });
        return result;
    }

    public List<Map<String, Object>> getYearBuiltAnalysis() {
        Map<Integer, List<HousingRecord>> grouped = records.stream()
                .collect(Collectors.groupingBy(HousingRecord::getYearBuilt,
                        TreeMap::new, Collectors.toList()));

        List<Map<String, Object>> result = new ArrayList<>();
        grouped.forEach((year, group) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("yearBuilt", year);
            entry.put("count", group.size());
            DoubleSummaryStatistics priceStats = group.stream()
                    .mapToDouble(HousingRecord::getPrice)
                    .summaryStatistics();
            entry.put("avgPrice", Math.round(priceStats.getAverage() * 100.0) / 100.0);
            entry.put("avgSquareFootage", Math.round(
                    group.stream().mapToDouble(HousingRecord::getSquareFootage).average().orElse(0) * 100.0) / 100.0);
            result.add(entry);
        });
        return result;
    }

    public List<HousingRecord> getTopExpensive(int limit) {
        return records.stream()
                .sorted(Comparator.comparingDouble(HousingRecord::getPrice).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<HousingRecord> getTopAffordable(int limit) {
        return records.stream()
                .sorted(Comparator.comparingDouble(HousingRecord::getPrice))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Query property table with filtering, sorting, and pagination.
     */
    public PagedResult<HousingRecord> queryPropertyTable(PropertyTableQuery query) {
        // 1. Apply filters
        List<HousingRecord> filtered = records.stream()
                .filter(buildFilterPredicate(query))
                .collect(Collectors.toList());

        // 2. Apply sorting
        if (query.getSortBy() != null && !query.getSortBy().isBlank()) {
            Comparator<HousingRecord> comparator = getComparator(query.getSortBy());
            if ("desc".equalsIgnoreCase(query.getSortOrder())) {
                comparator = comparator.reversed();
            }
            filtered.sort(comparator);
        }

        // 3. Pagination
        long totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / query.getSize());
        int fromIndex = Math.min(query.getPage() * query.getSize(), filtered.size());
        int toIndex = Math.min(fromIndex + query.getSize(), filtered.size());
        List<HousingRecord> pageData = filtered.subList(fromIndex, toIndex);

        return new PagedResult<>(pageData, totalElements, totalPages, query.getPage(), query.getSize());
    }

    private Predicate<HousingRecord> buildFilterPredicate(PropertyTableQuery q) {
        Predicate<HousingRecord> predicate = r -> true;

        if (q.getBedrooms() != null)
            predicate = predicate.and(r -> r.getBedrooms() == q.getBedrooms());
        if (q.getMinPrice() != null)
            predicate = predicate.and(r -> r.getPrice() >= q.getMinPrice());
        if (q.getMaxPrice() != null)
            predicate = predicate.and(r -> r.getPrice() <= q.getMaxPrice());
        if (q.getMinSquareFootage() != null)
            predicate = predicate.and(r -> r.getSquareFootage() >= q.getMinSquareFootage());
        if (q.getMaxSquareFootage() != null)
            predicate = predicate.and(r -> r.getSquareFootage() <= q.getMaxSquareFootage());
        if (q.getMinYearBuilt() != null)
            predicate = predicate.and(r -> r.getYearBuilt() >= q.getMinYearBuilt());
        if (q.getMaxYearBuilt() != null)
            predicate = predicate.and(r -> r.getYearBuilt() <= q.getMaxYearBuilt());
        if (q.getMinDistance() != null)
            predicate = predicate.and(r -> r.getDistanceToCityCenter() >= q.getMinDistance());
        if (q.getMaxDistance() != null)
            predicate = predicate.and(r -> r.getDistanceToCityCenter() <= q.getMaxDistance());
        if (q.getMinSchoolRating() != null)
            predicate = predicate.and(r -> r.getSchoolRating() >= q.getMinSchoolRating());
        if (q.getMaxSchoolRating() != null)
            predicate = predicate.and(r -> r.getSchoolRating() <= q.getMaxSchoolRating());

        return predicate;
    }

    private Comparator<HousingRecord> getComparator(String sortBy) {
        return switch (sortBy) {
            case "price" -> Comparator.comparingDouble(HousingRecord::getPrice);
            case "squareFootage" -> Comparator.comparingDouble(HousingRecord::getSquareFootage);
            case "bedrooms" -> Comparator.comparingInt(HousingRecord::getBedrooms);
            case "bathrooms" -> Comparator.comparingDouble(HousingRecord::getBathrooms);
            case "yearBuilt" -> Comparator.comparingInt(HousingRecord::getYearBuilt);
            case "lotSize" -> Comparator.comparingDouble(HousingRecord::getLotSize);
            case "distanceToCityCenter" -> Comparator.comparingDouble(HousingRecord::getDistanceToCityCenter);
            case "schoolRating" -> Comparator.comparingDouble(HousingRecord::getSchoolRating);
            default -> Comparator.comparingDouble(HousingRecord::getPrice);
        };
    }

    private Map<String, Object> buildStatsMap(DoubleSummaryStatistics stats) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("count", stats.getCount());
        map.put("avg", Math.round(stats.getAverage() * 100.0) / 100.0);
        map.put("min", stats.getMin());
        map.put("max", stats.getMax());
        map.put("sum", stats.getSum());
        return map;
    }

    private double calculateMedian(List<Double> sorted) {
        int n = sorted.size();
        if (n % 2 == 0) {
            return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
        } else {
            return sorted.get(n / 2);
        }
    }
}
