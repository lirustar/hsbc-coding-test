package com.hsbc.propertymarketanalysis.dto;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Single house input for price prediction")
public class HouseInput {

    @NotNull
    @JsonProperty("square_footage")
    @Schema(description = "House area in square feet", example = "1550")
    private Double squareFootage;

    @NotNull
    @JsonProperty("bedrooms")
    @Schema(description = "Number of bedrooms", example = "3")
    private Integer bedrooms;

    @NotNull
    @JsonProperty("bathrooms")
    @Schema(description = "Number of bathrooms", example = "2.0")
    private Double bathrooms;

    @NotNull
    @JsonProperty("year_built")
    @Schema(description = "Year built", example = "1997")
    private Integer yearBuilt;

    @NotNull
    @JsonProperty("lot_size")
    @Schema(description = "Lot size in square feet", example = "6800")
    private Double lotSize;

    @NotNull
    @JsonProperty("distance_to_city_center")
    @Schema(description = "Distance to city center in miles", example = "4.1")
    private Double distanceToCityCenter;

    @NotNull
    @JsonProperty("school_rating")
    @Schema(description = "School rating (1-10)", example = "7.6")
    private Double schoolRating;

    public HouseInput() {
    }

    public HouseInput(Double squareFootage, Integer bedrooms, Double bathrooms,
                      Integer yearBuilt, Double lotSize, Double distanceToCityCenter,
                      Double schoolRating) {
        this.squareFootage = squareFootage;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.yearBuilt = yearBuilt;
        this.lotSize = lotSize;
        this.distanceToCityCenter = distanceToCityCenter;
        this.schoolRating = schoolRating;
    }

    public Double getSquareFootage() { return squareFootage; }
    public void setSquareFootage(Double squareFootage) { this.squareFootage = squareFootage; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Double getBathrooms() { return bathrooms; }
    public void setBathrooms(Double bathrooms) { this.bathrooms = bathrooms; }

    public Integer getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(Integer yearBuilt) { this.yearBuilt = yearBuilt; }

    public Double getLotSize() { return lotSize; }
    public void setLotSize(Double lotSize) { this.lotSize = lotSize; }

    public Double getDistanceToCityCenter() { return distanceToCityCenter; }
    public void setDistanceToCityCenter(Double distanceToCityCenter) { this.distanceToCityCenter = distanceToCityCenter; }

    public Double getSchoolRating() { return schoolRating; }
    public void setSchoolRating(Double schoolRating) { this.schoolRating = schoolRating; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HouseInput that = (HouseInput) o;
        return Objects.equals(squareFootage, that.squareFootage)
                && Objects.equals(bedrooms, that.bedrooms)
                && Objects.equals(bathrooms, that.bathrooms)
                && Objects.equals(yearBuilt, that.yearBuilt)
                && Objects.equals(lotSize, that.lotSize)
                && Objects.equals(distanceToCityCenter, that.distanceToCityCenter)
                && Objects.equals(schoolRating, that.schoolRating);
    }

    @Override
    public int hashCode() {
        return Objects.hash(squareFootage, bedrooms, bathrooms, yearBuilt,
                lotSize, distanceToCityCenter, schoolRating);
    }
}
