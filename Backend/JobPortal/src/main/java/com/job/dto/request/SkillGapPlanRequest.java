package com.job.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SkillGapPlanRequest(
        @NotBlank(message = "A target role is required")
        @Size(max = 200, message = "Target role must not exceed 200 characters")
        String roleTitle,
        @NotEmpty(message = "Provide at least one skill to improve")
        @Size(max = 10, message = "A learning plan can cover up to 10 skills")
        List<@NotBlank @Size(max = 80, message = "Each skill must not exceed 80 characters") String> missingSkills
) {
}
