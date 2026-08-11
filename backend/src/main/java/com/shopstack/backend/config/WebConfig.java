package com.shopstack.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/products}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadUri = uploadPath.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }
        
        // Serve specific products directory at /uploads/products/**
        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(uploadUri);

        // General /uploads/** fallback handler
        Path rootUploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        String rootUploadUri = rootUploadPath.toUri().toString();
        if (!rootUploadUri.endsWith("/")) {
            rootUploadUri += "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(rootUploadUri);
    }
}
