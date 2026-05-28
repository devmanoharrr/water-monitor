package com.example.waterAPI.monitoring.controller;

import com.example.waterAPI.monitoring.model.WaterQualityRecordDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping({"/monitoring", "/api/v1/monitoring"})
public class MonitoringController {

    @Autowired
    private RestTemplate restTemplate;

    // Since this is a combined project, we can call the water quality endpoint directly
    private final String waterQualityServiceUrl = "http://localhost:8080/api/v1/waterquality/records/latest";

    // GET /monitoring/latest
    @GetMapping("/latest")
    public ResponseEntity<WaterQualityRecordDto> getLatestRecord() {
        try {
            WaterQualityRecordDto record = restTemplate.getForObject(waterQualityServiceUrl, WaterQualityRecordDto.class);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // GET /monitoring/analyze (optional analysis endpoint)
    @GetMapping("/analyze")
    public ResponseEntity<String> analyzeWaterQuality() {
        try {
            WaterQualityRecordDto record = restTemplate.getForObject(waterQualityServiceUrl, WaterQualityRecordDto.class);
            String analysis = analyzeRecord(record);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during analysis: " + e.getMessage());
        }
    }

    private String analyzeRecord(WaterQualityRecordDto record) {
        StringBuilder sb = new StringBuilder("Analysis: ");
        if (record.getPh() < 6.5 || record.getPh() > 8.5) {
            sb.append("pH out of range. ");
        } else {
            sb.append("pH is normal. ");
        }
        // Add additional analysis rules as needed.
        return sb.toString();
    }
}
