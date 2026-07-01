package com.hsbc.propertymarketanalysis.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Query parameters for the property data table endpoint.
 * Supports filtering by property categories, sorting, and pagination.
 */
@Schema(description = "Query parameters for property table: filters, sorting, and pagination")
public class PropertyTableQuery {

    // --- Filters ---
    @Schema(description = "Filter by exact number of bedrooms", example = "3")
    private Integer bedrooms;

    @Schema(description = "Minimum price filter", example = "150000")
    private Double minPrice;

    @Schema(description = "Maximum price filter", example = "400000")
    private Double maxPrice;

    @Schema(description = "Minimum square footage filter", example = "1000")
    private Double minSquareFootage;

    @Schema(description = "Maximum square footage filter", example = "2500")
    private Double maxSquareFootage;

    @Schema(description = "Minimum year built filter", example = "1990")
    private Integer minYearBuilt;

    @Schema(description = "Maximum year built filter", example = "2010")
    private Integer maxYearBuilt;

    @Schema(description = "Minimum distance to city center filter (miles)", example = "2.0")
    private Double minDistance;

    @Schema(description = "Maximum distance to city center filter (miles)", example = "5.0")
    private Double maxDistance;

    @Schema(description = "Minimum school rating filter", example = "7.0")
    private Double minSchoolRating;

    @Schema(description = "Maximum school rating filter", example = "9.0")
    private Double maxSchoolRating;

    // --- Sorting ---
    @Schema(description = "Field to sort by: price, squareFootage, bedrooms, bathrooms, yearBuilt, lotSize, distanceToCityCenter, schoolRating",
            example = "price")
    private String sortBy;

    @Schema(description = "Sort direction: asc or desc", example = "asc", allowableValues = {"asc", "desc"})
    private String sortOrder = "asc";

    // --- Pagination ---
    @Schema(description = "Page number (0-based)", example = "0")
    private int page = 0;

    @Schema(description = "Page size", example = "10")
    private int size = 10;

    // Getters and Setters
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Double getMinPrice() { return minPrice; }
    public void setMinPrice(Double minPrice) { this.minPrice = minPrice; }

    public Double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }

    public Double getMinSquareFootage() { return minSquareFootage; }
    public void setMinSquareFootage(Double minSquareFootage) { this.minSquareFootage = minSquareFootage; }

    public Double getMaxSquareFootage() { return maxSquareFootage; }
    public void setMaxSquareFootage(Double maxSquareFootage) { this.maxSquareFootage = maxSquareFootage; }

    public Integer getMinYearBuilt() { return minYearBuilt; }
    public void setMinYearBuilt(Integer minYearBuilt) { this.minYearBuilt = minYearBuilt; }

    public Integer getMaxYearBuilt() { return maxYearBuilt; }
    public void setMaxYearBuilt(Integer maxYearBuilt) { this.maxYearBuilt = maxYearBuilt; }

    public Double getMinDistance() { return minDistance; }
    public void setMinDistance(Double minDistance) { this.minDistance = minDistance; }

    public Double getMaxDistance() { return maxDistance; }
    public void setMaxDistance(Double maxDistance) { this.maxDistance = maxDistance; }

    public Double getMinSchoolRating() { return minSchoolRating; }
    public void setMinSchoolRating(Double minSchoolRating) { this.minSchoolRating = minSchoolRating; }

    public Double getMaxSchoolRating() { return maxSchoolRating; }
    public void setMaxSchoolRating(Double maxSchoolRating) { this.maxSchoolRating = maxSchoolRating; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortOrder() { return sortOrder; }
    public void setSortOrder(String sortOrder) { this.sortOrder = sortOrder; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}
