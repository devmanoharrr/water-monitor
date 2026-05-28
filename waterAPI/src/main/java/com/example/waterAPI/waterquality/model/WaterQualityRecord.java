package com.example.waterAPI.waterquality.model;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "water_quality_records")
public class WaterQualityRecord {

    @Id
    @Column(name = "object_id")
    private int objectId;

    @Column(name = "pH")
    private double ph;

    @Column(name = "alk_mgl")
    private double alkMgl;

    @Column(name = "cond_uscm")
    private double condUscm;

    @Column(name = "bod_mgl")
    private double bodMgl;

    @Column(name = "no2_n_mgl")
    private double no2NMgl;

    @Column(name = "cusol1_mgl")
    private Double cusol1Mgl;

    @Column(name = "cusol2_ugl")
    private double cusol2Ugl;

    @Column(name = "fesol1_ugl")
    private double fesol1Ugl;

    @Column(name = "zn_sol_ugl")
    private double znSolUgl;

    @Column(name = "sample_date")
    private LocalDate sampleDate;

    public WaterQualityRecord() {
    }

    public WaterQualityRecord(int objectId, double ph, double alkMgl, double condUscm,
                              double bodMgl, double no2NMgl, Double cusol1Mgl,
                              double cusol2Ugl, double fesol1Ugl, double znSolUgl) {
        this.objectId = objectId;
        this.ph = ph;
        this.alkMgl = alkMgl;
        this.condUscm = condUscm;
        this.bodMgl = bodMgl;
        this.no2NMgl = no2NMgl;
        this.cusol1Mgl = cusol1Mgl;
        this.cusol2Ugl = cusol2Ugl;
        this.fesol1Ugl = fesol1Ugl;
        this.znSolUgl = znSolUgl;
    }

    // Getters and setters (generate them in IntelliJ)
    public int getObjectId() {
        return objectId;
    }

    public void setObjectId(int objectId) {
        this.objectId = objectId;
    }

    public double getPh() {
        return ph;
    }

    public void setPh(double ph) {
        this.ph = ph;
    }

    public double getAlkMgl() {
        return alkMgl;
    }

    public void setAlkMgl(double alkMgl) {
        this.alkMgl = alkMgl;
    }

    public double getCondUscm() {
        return condUscm;
    }

    public void setCondUscm(double condUscm) {
        this.condUscm = condUscm;
    }

    public double getBodMgl() {
        return bodMgl;
    }

    public void setBodMgl(double bodMgl) {
        this.bodMgl = bodMgl;
    }

    public double getNo2NMgl() {
        return no2NMgl;
    }

    public void setNo2NMgl(double no2NMgl) {
        this.no2NMgl = no2NMgl;
    }

    public Double getCusol1Mgl() {
        return cusol1Mgl;
    }

    public void setCusol1Mgl(Double cusol1Mgl) {
        this.cusol1Mgl = cusol1Mgl;
    }

    public double getCusol2Ugl() {
        return cusol2Ugl;
    }

    public void setCusol2Ugl(double cusol2Ugl) {
        this.cusol2Ugl = cusol2Ugl;
    }

    public double getFesol1Ugl() {
        return fesol1Ugl;
    }

    public void setFesol1Ugl(double fesol1Ugl) {
        this.fesol1Ugl = fesol1Ugl;
    }

    public double getZnSolUgl() {
        return znSolUgl;
    }

    public void setZnSolUgl(double znSolUgl) {
        this.znSolUgl = znSolUgl;
    }

    public LocalDate getSampleDate() {
        return sampleDate;
    }

    public void setSampleDate(LocalDate sampleDate) {
        this.sampleDate = sampleDate;
    }
}