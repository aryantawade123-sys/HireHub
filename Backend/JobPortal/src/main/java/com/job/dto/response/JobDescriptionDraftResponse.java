package com.job.dto.response;

import java.util.List;

public record JobDescriptionDraftResponse(
        String title,
        String description,
        List<String> responsibilities,
        List<String> requiredSkills
) {}
