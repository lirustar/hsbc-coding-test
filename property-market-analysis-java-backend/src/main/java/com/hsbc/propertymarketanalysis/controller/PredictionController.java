package com.hsbc.propertymarketanalysis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hsbc.propertymarketanalysis.dto.BatchInput;
import com.hsbc.propertymarketanalysis.dto.BatchResult;
import com.hsbc.propertymarketanalysis.dto.HouseInput;
import com.hsbc.propertymarketanalysis.dto.PredictionResult;
import com.hsbc.propertymarketanalysis.service.PredictionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@Tag(name = "Prediction", description = "Housing price prediction APIs (proxied to downstream service)")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Service health check endpoint")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<Object> healthCheck() {
        return ResponseEntity.ok(predictionService.healthCheck());
    }

    @PostMapping("/predict")
    @Operation(summary = "Predict single price", description = "Predict price for a single house based on property features")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Prediction successful"),
            @ApiResponse(responseCode = "422", description = "Validation error")
    })
    public ResponseEntity<PredictionResult> predictSingle(@Valid @RequestBody HouseInput houseInput) {
        PredictionResult result = predictionService.predictSingle(houseInput);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/predict/batch")
    @Operation(summary = "Predict batch prices", description = "Predict prices for multiple houses (minimum 3)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch prediction successful"),
            @ApiResponse(responseCode = "422", description = "Validation error")
    })
    public ResponseEntity<BatchResult> predictBatch(@Valid @RequestBody BatchInput batchInput) {
        BatchResult result = predictionService.predictBatch(batchInput);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/model-info")
    @Operation(summary = "Get model info", description = "Query model name, training parameters, evaluation metrics and feature importance")
    @ApiResponse(responseCode = "200", description = "Model information retrieved")
    public ResponseEntity<Object> getModelInfo() {
        return ResponseEntity.ok(predictionService.getModelInfo());
    }
}
