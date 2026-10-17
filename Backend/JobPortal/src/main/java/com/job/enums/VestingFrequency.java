package com.job.enums;

public enum VestingFrequency {
    MONTHLY(1),
    QUARTERLY(3);

    private final int intervalMonths;

    VestingFrequency(int intervalMonths) {
        this.intervalMonths = intervalMonths;
    }

    public int getIntervalMonths() {
        return intervalMonths;
    }
}
