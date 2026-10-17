package com.job.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.request.SkillGapPlanRequest;
import com.job.exception.AiProviderException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

class SkillGapRecommendationServiceTest {

    private final SkillGapRecommendationService service =
            new SkillGapRecommendationService(new ObjectMapper(), "", "test-model");

    @Test
    void missingProviderConfigurationReturnsExplicitError() {
        SkillGapPlanRequest request = new SkillGapPlanRequest(
                "Frontend Engineer",
                List.of("React", "TypeScript"));

        assertThrows(AiProviderException.class, () -> service.recommend(request));
    }
}
