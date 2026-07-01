package com.hsbc.propertymarketanalysis.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

@Schema(description = "Batch house input for batch prediction (minimum 3 houses)")
public class BatchInput {

    @NotEmpty
    @Size(min = 3)
    @Valid
    @JsonProperty("houses")
    @Schema(description = "List of houses")
    private List<HouseInput> houses;

    public BatchInput() {
    }

    public BatchInput(List<HouseInput> houses) {
        this.houses = houses;
    }

    public List<HouseInput> getHouses() { return houses; }
    public void setHouses(List<HouseInput> houses) { this.houses = houses; }
}
