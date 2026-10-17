package com.job.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApplicationRequestDTO {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @Size(max = 20, message = "No more than 20 screening answers are allowed")
    private List<@NotBlank(message = "Screening answers cannot be blank")
                 @Size(max = 2000, message = "Screening answers must not exceed 2000 characters") String> screeningAnswers;
}