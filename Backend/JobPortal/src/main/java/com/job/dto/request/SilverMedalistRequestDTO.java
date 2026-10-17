package com.job.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SilverMedalistRequestDTO {

    @NotNull(message = "Selection state is required")
    private Boolean selected;
}
