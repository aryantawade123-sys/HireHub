package com.job.dto.response;

import java.util.List;

public record SkillGapPlanResponse(List<SkillRecommendation> recommendations) {
    public record SkillRecommendation(
            String skill,
            String learningFocus,
            String courseOutline,
            String projectIdea,
            String estimatedEffort
    ) {
    }
}
