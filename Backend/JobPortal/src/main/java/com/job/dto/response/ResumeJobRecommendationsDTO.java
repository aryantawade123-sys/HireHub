package com.job.dto.response;

import java.util.List;

public record ResumeJobRecommendationsDTO(
        String summary,
        int jobsAnalyzed,
        List<ResumeJobRecommendationDTO> recommendations
) {}
