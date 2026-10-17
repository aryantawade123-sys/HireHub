package com.job.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record JobDescriptionDraftRequest(
        @NotBlank(message = "A role title is required")
        @Size(max = 200, message = "Role title must not exceed 200 characters")
        String title,
        @NotEmpty(message = "Provide at least one role tag")
        @Size(max = 20, message = "Use no more than 20 role tags")
        List<@NotBlank @Size(max = 80, message = "Each role tag must not exceed 80 characters") String> tags,
        @Size(max = 80, message = "Seniority must not exceed 80 characters")
        String seniority,
        @Size(max = 120, message = "Location must not exceed 120 characters")
        String location,
        @Size(max = 40, message = "Work mode must not exceed 40 characters")
        String workMode,
        @Size(max = 40, message = "Employment type must not exceed 40 characters")
        String employmentType
) {}
