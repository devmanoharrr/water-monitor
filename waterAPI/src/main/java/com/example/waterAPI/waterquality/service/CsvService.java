package com.example.waterAPI.waterquality.service;

import com.example.waterAPI.waterquality.model.WaterQualityRecord;
import com.example.waterAPI.waterquality.repository.WaterQualityRecordRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;

@Service
public class CsvService implements CommandLineRunner {

    @Autowired
    private WaterQualityRecordRepository repository;

    @Override
    public void run(String... args) throws Exception {
        loadCsvData();
    }

    public void loadCsvData() {
        try {
            ClassPathResource resource = new ClassPathResource("1741330613928_River_Water_Quality_Monitoring (2).csv");
            CSVReader reader = new CSVReader(new InputStreamReader(resource.getInputStream()));
            String[] line;
            boolean skipHeader = true;
            LocalDate syntheticDate = LocalDate.of(2025, 1, 1);
            while ((line = reader.readNext()) != null) {
                if (skipHeader) {
                    skipHeader = false;
                    continue;
                }

                // Use safe parse methods to handle empty strings.
                int objectId = parseIntSafely(line[0], -1);  // or throw error if missing
                double ph = parseDoubleSafely(line[1], 0.0);
                double alkMgl = parseDoubleSafely(line[2], 0.0);
                double condUscm = parseDoubleSafely(line[3], 0.0);
                double bodMgl = parseDoubleSafely(line[4], 0.0);
                double no2NMgl = parseDoubleSafely(line[5], 0.0);
                Double cusol1Mgl = (line[6] == null || line[6].trim().isEmpty()) ? null : parseDoubleSafely(line[6], 0.0);
                double cusol2Ugl = parseDoubleSafely(line[7], 0.0);
                double fesol1Ugl = parseDoubleSafely(line[8], 0.0);
                double znSolUgl = parseDoubleSafely(line[9], 0.0);

                // Optionally, skip rows where required fields are invalid.
                if(objectId == -1) {
                    System.err.println("Skipping row due to invalid objectId");
                    continue;
                }

                WaterQualityRecord record = new WaterQualityRecord(objectId, ph, alkMgl, condUscm,
                        bodMgl, no2NMgl, cusol1Mgl, cusol2Ugl, fesol1Ugl, znSolUgl);
                record.setSampleDate(syntheticDate);
                syntheticDate = syntheticDate.plusDays(1);
                repository.save(record);
            }
            reader.close();
        } catch (IOException | CsvValidationException e) {
            System.err.println("Error loading CSV data: " + e.getMessage());
        }
    }

    private int parseIntSafely(String s, int defaultValue) {
        if (s == null || s.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private double parseDoubleSafely(String s, double defaultValue) {
        if (s == null || s.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
