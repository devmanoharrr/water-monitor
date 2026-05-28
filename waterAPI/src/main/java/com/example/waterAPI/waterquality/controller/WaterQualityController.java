package com.example.waterAPI.waterquality.controller;

import com.example.waterAPI.waterquality.dto.LatestFlagResponse;
import com.example.waterAPI.waterquality.dto.MonthlyAverageResponse;
import com.example.waterAPI.waterquality.model.WaterQualityRecord;
import com.example.waterAPI.waterquality.repository.WaterQualityRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/waterquality", "/api/v1/waterquality"})
public class WaterQualityController {

    @Autowired
    private WaterQualityRecordRepository repository;

    private static final String DEFAULT_RIVER_NAME = "Tyne";

    // GET all records
    @GetMapping("/records")
    public ResponseEntity<List<WaterQualityRecord>> getAllRecords() {
        return ResponseEntity.ok(repository.findAll());
    }

    // GET record by objectId
    @GetMapping("/records/{objectId}")
    public ResponseEntity<WaterQualityRecord> getRecordById(@PathVariable int objectId) {
        return repository.findById(objectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET latest record
    @GetMapping("/records/latest")
    public ResponseEntity<WaterQualityRecord> getLatestRecord() {
        WaterQualityRecord latest = repository.findTopByOrderByObjectIdDesc();
        return latest != null ? ResponseEntity.ok(latest) : ResponseEntity.notFound().build();
    }

    // GET latest record (versioned alias required by plan)
    @GetMapping("/latest")
    public ResponseEntity<WaterQualityRecord> getLatestRecordAlias() {
        return getLatestRecord();
    }

    // GET latest safety flag (Green/Red)
    @GetMapping("/latest-flag")
    public ResponseEntity<LatestFlagResponse> getLatestFlag() {
        WaterQualityRecord latest = repository.findTopByOrderByObjectIdDesc();
        if (latest == null) {
            return ResponseEntity.notFound().build();
        }

        List<String> failed = new ArrayList<>();

        if (latest.getPh() < 6.5 || latest.getPh() > 8.5) {
            failed.add("pH");
        }

        if (latest.getAlkMgl() > 500) {
            failed.add("Alkalinity");
        }

        if (latest.getCondUscm() > 2000) {
            failed.add("Conductivity");
        }

        if (latest.getNo2NMgl() >= 1) {
            failed.add("Nitrite");
        }

        double tds =
                (latest.getCusol1Mgl() == null ? 0.0 : latest.getCusol1Mgl())
                        + (latest.getCusol2Ugl() / 1000.0)
                        + (latest.getFesol1Ugl() / 1000.0)
                        + (latest.getZnSolUgl() / 1000.0);

        if (tds > 1000) {
            failed.add("Total Dissolved Solids");
        }

        String flag = failed.isEmpty() ? "GREEN" : "RED";
        LatestFlagResponse resp = new LatestFlagResponse(
                DEFAULT_RIVER_NAME,
                flag,
                latest.getObjectId(),
                tds,
                failed
        );

        return ResponseEntity.ok(resp);
    }

    // GET monthly averages (Data View)
    @GetMapping("/monthly-averages")
    public ResponseEntity<List<MonthlyAverageResponse>> getMonthlyAverages() {
        List<WaterQualityRecord> records = repository.findAll();
        if (records.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        Map<String, List<WaterQualityRecord>> byMonth = records.stream()
                .filter(r -> r.getSampleDate() != null)
                .collect(Collectors.groupingBy(r -> String.format("%04d-%02d", r.getSampleDate().getYear(), r.getSampleDate().getMonthValue())));

        List<MonthlyAverageResponse> out = byMonth.entrySet().stream()
                .map(entry -> {
                    String month = entry.getKey();
                    List<WaterQualityRecord> monthRecords = entry.getValue();

                    double avgPh = monthRecords.stream().mapToDouble(WaterQualityRecord::getPh).average().orElse(0.0);
                    double avgAlk = monthRecords.stream().mapToDouble(WaterQualityRecord::getAlkMgl).average().orElse(0.0);
                    double avgCond = monthRecords.stream().mapToDouble(WaterQualityRecord::getCondUscm).average().orElse(0.0);
                    double avgNo2 = monthRecords.stream().mapToDouble(WaterQualityRecord::getNo2NMgl).average().orElse(0.0);
                    double avgTds = monthRecords.stream().mapToDouble(r ->
                            (r.getCusol1Mgl() == null ? 0.0 : r.getCusol1Mgl())
                                    + (r.getCusol2Ugl() / 1000.0)
                                    + (r.getFesol1Ugl() / 1000.0)
                                    + (r.getZnSolUgl() / 1000.0)
                    ).average().orElse(0.0);

                    return new MonthlyAverageResponse(month, DEFAULT_RIVER_NAME, avgPh, avgAlk, avgCond, avgNo2, avgTds);
                })
                .sorted(Comparator.comparing(MonthlyAverageResponse::getMonth))
                .collect(Collectors.toList());

        return ResponseEntity.ok(out);
    }

    // POST create a new record
    @PostMapping("/records")
    public ResponseEntity<WaterQualityRecord> createRecord(@RequestBody WaterQualityRecord record) {
        return ResponseEntity.ok(repository.save(record));
    }

    // PUT update an existing record
    @PutMapping("/records/{objectId}")
    public ResponseEntity<WaterQualityRecord> updateRecord(@PathVariable int objectId,
                                                           @RequestBody WaterQualityRecord updatedRecord) {
        return repository.findById(objectId)
                .map(record -> {
                    record.setPh(updatedRecord.getPh());
                    record.setAlkMgl(updatedRecord.getAlkMgl());
                    record.setCondUscm(updatedRecord.getCondUscm());
                    record.setBodMgl(updatedRecord.getBodMgl());
                    record.setNo2NMgl(updatedRecord.getNo2NMgl());
                    record.setCusol1Mgl(updatedRecord.getCusol1Mgl());
                    record.setCusol2Ugl(updatedRecord.getCusol2Ugl());
                    record.setFesol1Ugl(updatedRecord.getFesol1Ugl());
                    record.setZnSolUgl(updatedRecord.getZnSolUgl());
                    return ResponseEntity.ok(repository.save(record));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE a record
    @DeleteMapping("/records/{objectId}")
    public ResponseEntity<Void> deleteRecord(@PathVariable int objectId) {
        if (repository.existsById(objectId)) {
            repository.deleteById(objectId);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}