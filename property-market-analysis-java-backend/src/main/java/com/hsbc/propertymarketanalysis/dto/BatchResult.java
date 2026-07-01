package com.hsbc.propertymarketanalysis.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Batch prediction result returned by the prediction API")
public class BatchResult {

    @JsonProperty("results")
    @Schema(description = "List of prediction results")
    private List<PredictionResult> results;

    @JsonProperty("total")
    @Schema(description = "Total count")
    private Integer total;

    public BatchResult() {
    }

    public List<PredictionResult> getResults() { return results; }
    public void setResults(List<PredictionResult> results) { this.results = results; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
}
