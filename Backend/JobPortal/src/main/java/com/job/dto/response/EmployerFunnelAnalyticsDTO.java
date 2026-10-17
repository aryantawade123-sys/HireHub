package com.job.dto.response;

import com.job.enums.ApplicationStatus;

import java.util.List;

public record EmployerFunnelAnalyticsDTO(
        long totalJobs,
        long totalApplications,
        double interviewRate,
        double offerRate,
        List<FunnelStage> stages
) {
    public record FunnelStage(ApplicationStatus status, long count, double percentOfApplications) {
    }
}
