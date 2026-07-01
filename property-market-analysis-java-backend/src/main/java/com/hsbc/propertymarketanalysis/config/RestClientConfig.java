package com.hsbc.propertymarketanalysis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${prediction.api.base-url:http://localhost:8000}")
    private String predictionApiBaseUrl;

    @Bean
    public RestClient predictionRestClient() {
        return RestClient.builder()
                .baseUrl(predictionApiBaseUrl)
                .build();
    }
}
