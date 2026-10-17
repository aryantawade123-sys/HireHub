package com.job.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RecruiterAgentRequest(
        @NotBlank(message = "Enter a request for the recruiter assistant")
        @Size(max = 1500, message = "The request must not exceed 1500 characters")
        String prompt
) {
}
