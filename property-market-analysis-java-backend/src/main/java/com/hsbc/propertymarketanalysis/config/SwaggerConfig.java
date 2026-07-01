package com.hsbc.propertymarketanalysis.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Property Market Analysis API")
                        .version("1.0.0")
                        .description("Housing price prediction and property market analysis REST API")
                        .contact(new Contact()
                                .name("HSBC")
                                .email("support@hsbc.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8001").description("Local Development Server")
                ));
    }
}
