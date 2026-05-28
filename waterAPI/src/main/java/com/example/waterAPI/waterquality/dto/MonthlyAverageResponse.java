package com.example.waterAPI.waterquality.dto;

public class MonthlyAverageResponse {
    private String month;
    private String river;
    private double averagePh;
    private double averageAlkalinity;
    private double averageConductivity;
    private double averageNitrite;
    private double averageTds;

    public MonthlyAverageResponse() {}

    public MonthlyAverageResponse(String month, String river, double averagePh, double averageAlkalinity,
                                  double averageConductivity, double averageNitrite, double averageTds) {
        this.month = month;
        this.river = river;
        this.averagePh = averagePh;
        this.averageAlkalinity = averageAlkalinity;
        this.averageConductivity = averageConductivity;
        this.averageNitrite = averageNitrite;
        this.averageTds = averageTds;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public String getRiver() {
        return river;
    }

    public void setRiver(String river) {
        this.river = river;
    }

    public double getAveragePh() {
        return averagePh;
    }

    public void setAveragePh(double averagePh) {
        this.averagePh = averagePh;
    }

    public double getAverageAlkalinity() {
        return averageAlkalinity;
    }

    public void setAverageAlkalinity(double averageAlkalinity) {
        this.averageAlkalinity = averageAlkalinity;
    }

    public double getAverageConductivity() {
        return averageConductivity;
    }

    public void setAverageConductivity(double averageConductivity) {
        this.averageConductivity = averageConductivity;
    }

    public double getAverageNitrite() {
        return averageNitrite;
    }

    public void setAverageNitrite(double averageNitrite) {
        this.averageNitrite = averageNitrite;
    }

    public double getAverageTds() {
        return averageTds;
    }

    public void setAverageTds(double averageTds) {
        this.averageTds = averageTds;
    }
}
