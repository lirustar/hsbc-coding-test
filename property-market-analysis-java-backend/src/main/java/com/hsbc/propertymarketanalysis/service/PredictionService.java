package com.hsbc.propertymarketanalysis.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.hsbc.propertymarketanalysis.client.PredictionApiClient;
import com.hsbc.propertymarketanalysis.dto.BatchInput;
import com.hsbc.propertymarketanalysis.dto.BatchResult;
import com.hsbc.propertymarketanalysis.dto.HouseInput;
import com.hsbc.propertymarketanalysis.dto.PredictionResult;

@Service
public class PredictionService {

    private final PredictionApiClient predictionApiClient;

    public PredictionService(PredictionApiClient predictionApiClient) {
        this.predictionApiClient = predictionApiClient;
    }

    @Cacheable(value = "prediction", key = "#houseInput")
    public PredictionResult predictSingle(HouseInput houseInput) {
        return predictionApiClient.predictSingle(houseInput);
    }

    public BatchResult predictBatch(BatchInput batchInput) {
        return predictionApiClient.predictBatch(batchInput);
    }

    public Object healthCheck() {
        return predictionApiClient.healthCheck();
    }

    public Object getModelInfo() {
        return predictionApiClient.getModelInfo();
    }
}
