package com.job.dto.response;

import java.util.List;

public record MockInterviewResponse(
        String question,
        String feedback,
        Integer communicationScore,
        List<String> strengths,
        List<String> improvements,
        boolean complete
) {
}
