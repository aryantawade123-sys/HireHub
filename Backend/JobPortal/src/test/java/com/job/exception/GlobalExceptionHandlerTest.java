package com.job.exception;

import com.job.entity.Employer;
import com.job.security.TenantFilterInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.mockito.Mockito.mock;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void tenantContextFailureReturnsStructuredSanitizedForbiddenResponse() {
        HttpServletRequest request = new MockHttpServletRequest("GET", "/jobs/my");
        TenantContextException exception = new TenantContextException("internal tenant id 123 is missing");

        var response = handler.handleTenantContext(exception, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("TENANT_CONTEXT_REQUIRED", response.getBody().error());
        assertEquals("This employer account is not assigned to a company tenant", response.getBody().message());
        assertEquals("/jobs/my", response.getBody().path());
        assertFalse(response.getBody().message().contains("123"));
    }

    @Test
    void interceptorTenantFailureIsHandledAsStructuredForbiddenResponse() throws Exception {
        MockMvc mockMvc = standaloneSetup(new TenantTestController())
                .addInterceptors(new TenantFilterInterceptor(mock(jakarta.persistence.EntityManager.class)))
                .setControllerAdvice(handler)
                .build();

        mockMvc.perform(get("/tenant-check")
                        .requestAttr("user", new Employer())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("TENANT_CONTEXT_REQUIRED"))
                .andExpect(jsonPath("$.message")
                        .value("This employer account is not assigned to a company tenant"));
    }

    @RestController
    private static class TenantTestController {
        @GetMapping("/tenant-check")
        public String checkTenant() {
            return "ok";
        }
    }
}
