package com.job.dto.response;

import java.util.List;

public record ResumeJobRecommendationDTO(
        JobResponseDTO job,
        int matchScore,
        String matchReason,
        List<String> matchedSkills,
        List<String> skillGaps
) {}
