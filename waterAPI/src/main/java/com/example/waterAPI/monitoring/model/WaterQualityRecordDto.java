package com.example.waterAPI.monitoring.model;

public class WaterQualityRecordDto {
    private int objectId;
    private double ph;
    private double alkMgl;
    private double condUscm;
    private double bodMgl;
    private double no2NMgl;
    private Double cusol1Mgl;
    private double cusol2Ugl;
    private double fesol1Ugl;
    private double znSolUgl;

    public WaterQualityRecordDto() {}

    // Getters and setters
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
}