package com.hsbc.propertymarketanalysis.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hsbc.propertymarketanalysis.dto.HousingRecord;
import com.hsbc.propertymarketanalysis.dto.PagedResult;
import com.hsbc.propertymarketanalysis.dto.PropertyTableQuery;
import com.hsbc.propertymarketanalysis.service.MarketAnalysisService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/market")
@Tag(name = "Market Analysis", description = "Property market analysis and aggregate statistics APIs")
public class MarketAnalysisController {

    private final MarketAnalysisService marketAnalysisService;

    public MarketAnalysisController(MarketAnalysisService marketAnalysisService) {
        this.marketAnalysisService = marketAnalysisService;
    }

    @GetMapping("/properties")
    @Operation(summary = "Get all properties", description = "Returns all housing records from the dataset")
    @ApiResponse(responseCode = "200", description = "List of all housing records")
    public ResponseEntity<List<HousingRecord>> getAllProperties() {
        return ResponseEntity.ok(marketAnalysisService.getAllRecords());
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get overall statistics", description = "Returns aggregate statistics: avg/min/max price, square footage, lot size, median price, bedroom distribution, etc.")
    @ApiResponse(responseCode = "200", description = "Overall aggregate statistics")
    public ResponseEntity<Map<String, Object>> getOverallStatistics() {
        return ResponseEntity.ok(marketAnalysisService.getOverallStatistics());
    }

    @GetMapping("/statistics/by-bedroom")
    @Operation(summary = "Statistics by bedrooms", description = "Returns price and size statistics grouped by number of bedrooms")
    @ApiResponse(responseCode = "200", description = "Statistics grouped by bedroom count")
    public ResponseEntity<List<Map<String, Object>>> getStatisticsByBedrooms() {
        return ResponseEntity.ok(marketAnalysisService.getStatisticsByBedrooms());
    }

    @GetMapping("/statistics/by-distance")
    @Operation(summary = "Statistics by distance", description = "Returns price statistics grouped by distance to city center (0-3, 3-5, 5-7, 7+ miles)")
    @ApiResponse(responseCode = "200", description = "Price statistics by distance range")
    public ResponseEntity<Map<String, Object>> getPriceByDistance() {
        return ResponseEntity.ok(marketAnalysisService.getPriceByDistance());
    }

    @GetMapping("/statistics/by-school-rating")
    @Operation(summary = "Statistics by school rating", description = "Returns price statistics grouped by school rating (6.0-7.0, 7.0-8.0, 8.0-9.0, 9.0+)")
    @ApiResponse(responseCode = "200", description = "Price statistics by school rating range")
    public ResponseEntity<Map<String, Object>> getPriceBySchoolRating() {
        return ResponseEntity.ok(marketAnalysisService.getPriceBySchoolRating());
    }

    @GetMapping("/statistics/by-year")
    @Operation(summary = "Statistics by year built", description = "Returns price and size statistics grouped by year built")
    @ApiResponse(responseCode = "200", description = "Statistics grouped by construction year")
    public ResponseEntity<List<Map<String, Object>>> getYearBuiltAnalysis() {
        return ResponseEntity.ok(marketAnalysisService.getYearBuiltAnalysis());
    }

    @GetMapping("/top-expensive")
    @Operation(summary = "Top expensive properties", description = "Returns the top N most expensive properties")
    @ApiResponse(responseCode = "200", description = "List of most expensive properties")
    public ResponseEntity<List<HousingRecord>> getTopExpensive(
            @Parameter(description = "Number of top properties to return", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(marketAnalysisService.getTopExpensive(limit));
    }

    @GetMapping("/top-affordable")
    @Operation(summary = "Top affordable properties", description = "Returns the top N most affordable properties")
    @ApiResponse(responseCode = "200", description = "List of most affordable properties")
    public ResponseEntity<List<HousingRecord>> getTopAffordable(
            @Parameter(description = "Number of top properties to return", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(marketAnalysisService.getTopAffordable(limit));
    }

    @GetMapping("/properties/table")
    @Operation(summary = "Property data table",
            description = "Query property data with filtering, sorting, and pagination. " +
                    "Supported filters: bedrooms, minPrice/maxPrice, minSquareFootage/maxSquareFootage, " +
                    "minYearBuilt/maxYearBuilt, minDistance/maxDistance, minSchoolRating/maxSchoolRating. " +
                    "Supported sortBy fields: price, squareFootage, bedrooms, bathrooms, yearBuilt, lotSize, distanceToCityCenter, schoolRating.")
    @ApiResponse(responseCode = "200", description = "Paginated and filtered property data")
    public ResponseEntity<PagedResult<HousingRecord>> getPropertyTable(PropertyTableQuery query) {
        return ResponseEntity.ok(marketAnalysisService.queryPropertyTable(query));
    }
}
