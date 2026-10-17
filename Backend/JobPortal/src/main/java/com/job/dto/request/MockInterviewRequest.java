package com.job.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record MockInterviewRequest(
        @NotBlank(message = "Enter the role you want to practice for")
        @Size(max = 160, message = "Role title must not exceed 160 characters")
        String roleTitle,
        @Size(max = 2500, message = "Job description must not exceed 2500 characters")
        String jobDescription,
        @Size(max = 4, message = "Interview history must not exceed 4 completed answers")
        List<@Valid InterviewTurn> history,
        @Size(max = 800, message = "The current interview question must not exceed 800 characters")
        String currentQuestion,
        @Size(max = 2000, message = "Your answer must not exceed 2000 characters")
        String answer
) {
    public record InterviewTurn(
            @NotBlank @Size(max = 800, message = "An interview question must not exceed 800 characters")
            String question,
            @NotBlank @Size(max = 2000, message = "An interview answer must not exceed 2000 characters")
            String answer,
            @Size(max = 1000, message = "Interview feedback must not exceed 1000 characters")
            String feedback
    ) {
    }
}
