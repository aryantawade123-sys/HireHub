package com.job.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SkillPathRequest(
        @Size(max = 25, message = "Use at most 25 skills already identified in your resume")
        List<@NotBlank @Size(max = 80, message = "Each skill must not exceed 80 characters") String> knownSkills,
        @NotEmpty(message = "Provide at least one target skill")
        @Size(max = 10, message = "A skill path can cover up to 10 target skills")
        List<@NotBlank @Size(max = 80, message = "Each skill must not exceed 80 characters") String> targetSkills
) {
}
