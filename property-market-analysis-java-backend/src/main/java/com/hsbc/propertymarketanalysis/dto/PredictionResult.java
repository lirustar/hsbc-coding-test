package com.hsbc.propertymarketanalysis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Single prediction result returned by the prediction API")
public class PredictionResult {

    @JsonProperty("predicted_price")
    @Schema(description = "Predicted price in USD")
    private Double predictedPrice;

    @JsonProperty("input")
    @Schema(description = "Original input")
    private HouseInput input;

    public PredictionResult() {
    }

    public Double getPredictedPrice() { return predictedPrice; }
    public void setPredictedPrice(Double predictedPrice) { this.predictedPrice = predictedPrice; }

    public HouseInput getInput() { return input; }
    public void setInput(HouseInput input) { this.input = input; }
}
