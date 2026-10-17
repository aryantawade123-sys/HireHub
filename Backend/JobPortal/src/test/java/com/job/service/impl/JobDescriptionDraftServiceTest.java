package com.job.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.request.JobDescriptionDraftRequest;
import com.job.exception.AiProviderException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

class JobDescriptionDraftServiceTest {

    private final JobDescriptionDraftService service =
            new JobDescriptionDraftService(new ObjectMapper(), "", "test-model");

    @Test
    void missingProviderConfigurationReturnsExplicitError() {
        JobDescriptionDraftRequest request = new JobDescriptionDraftRequest(
                "Frontend Engineer",
                List.of("React", "TypeScript"),
                "Mid-level",
                "Remote",
                "REMOTE",
                "FULL_TIME");

        assertThrows(AiProviderException.class, () -> service.generateDraft(request));
    }
}
