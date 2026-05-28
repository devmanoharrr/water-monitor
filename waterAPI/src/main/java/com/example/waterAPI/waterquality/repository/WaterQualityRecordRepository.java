package com.example.waterAPI.waterquality.repository;

import com.example.waterAPI.waterquality.model.WaterQualityRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WaterQualityRecordRepository extends JpaRepository<WaterQualityRecord, Integer> {
    WaterQualityRecord findTopByOrderByObjectIdDesc();
}
