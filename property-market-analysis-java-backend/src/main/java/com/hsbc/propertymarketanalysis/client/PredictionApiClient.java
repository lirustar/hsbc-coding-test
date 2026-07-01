package com.hsbc.propertymarketanalysis.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.hsbc.propertymarketanalysis.dto.BatchInput;
import com.hsbc.propertymarketanalysis.dto.BatchResult;
import com.hsbc.propertymarketanalysis.dto.HouseInput;
import com.hsbc.propertymarketanalysis.dto.PredictionResult;

/**
 * Client for the Housing Price Prediction API.
 */
@Component
public class PredictionApiClient {

    private final RestClient restClient;

    public PredictionApiClient(RestClient predictionRestClient) {
        this.restClient = predictionRestClient;
    }

    /**
     * Predict price for a single house.
     */
    public PredictionResult predictSingle(HouseInput houseInput) {
        return restClient.post()
                .uri("/predict")
                .body(houseInput)
                .retrieve()
                .body(PredictionResult.class);
    }

    /**
     * Predict prices for a batch of houses.
     */
    public BatchResult predictBatch(BatchInput batchInput) {
        return restClient.post()
                .uri("/predict/batch")
                .body(batchInput)
                .retrieve()
                .body(BatchResult.class);
    }

    /**
     * Health check - root endpoint.
     */
    public Object healthCheck() {
        return restClient.get()
                .uri("/")
                .retrieve()
                .body(Object.class);
    }

    /**
     * Get model information.
     */
    public Object getModelInfo() {
        return restClient.get()
                .uri("/model-info")
                .retrieve()
                .body(Object.class);
    }
}
