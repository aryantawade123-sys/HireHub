package com.job.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.request.RecruiterAgentRequest;
import com.job.entity.Employer;
import com.job.exception.AiProviderException;
import com.job.repository.ApplicationRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class RecruiterAgentServiceTest {

    private final RecruiterAgentService service = new RecruiterAgentService(
            mock(ApplicationRepository.class),
            new ObjectMapper(),
            "",
            "test-model");

    @Test
    void missingProviderConfigurationReturnsExplicitError() {
        RecruiterAgentRequest request = new RecruiterAgentRequest("Find recent candidates");

        assertThrows(AiProviderException.class, () -> service.respond(request, new Employer()));
    }
}
