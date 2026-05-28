package com.example.waterAPI.waterquality.dto;

import java.util.List;

public class LatestFlagResponse {
    private String river;
    private String flag;
    private int latestRecordId;
    private double tds;
    private List<String> failedParameters;

    public LatestFlagResponse() {}

    public LatestFlagResponse(String river, String flag, int latestRecordId, double tds, List<String> failedParameters) {
        this.river = river;
        this.flag = flag;
        this.latestRecordId = latestRecordId;
        this.tds = tds;
        this.failedParameters = failedParameters;
    }

    public String getRiver() {
        return river;
    }

    public void setRiver(String river) {
        this.river = river;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public int getLatestRecordId() {
        return latestRecordId;
    }

    public void setLatestRecordId(int latestRecordId) {
        this.latestRecordId = latestRecordId;
    }

    public double getTds() {
        return tds;
    }

    public void setTds(double tds) {
        this.tds = tds;
    }

    public List<String> getFailedParameters() {
        return failedParameters;
    }

    public void setFailedParameters(List<String> failedParameters) {
        this.failedParameters = failedParameters;
    }
}
