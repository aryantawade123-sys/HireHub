package com.job.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.request.MockInterviewRequest;
import com.job.exception.AiProviderException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

class MockInterviewServiceTest {

    private final MockInterviewService service =
            new MockInterviewService(new ObjectMapper(), "", "test-model");

    @Test
    void missingProviderConfigurationReturnsExplicitError() {
        MockInterviewRequest request = new MockInterviewRequest(
                "Frontend Engineer",
                "",
                List.of(),
                "",
                "");

        assertThrows(AiProviderException.class, () -> service.nextTurn(request));
    }
}
