package com.job.dto.response;

import com.job.enums.VestingFrequency;
import com.job.enums.VestingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class VestingCalculationResponse {
    private final long totalUnits;
    private final long vestedUnits;
    private final long unvestedUnits;
    private final BigDecimal vestedPercentage;
    private final int completedMonths;
    private final int cliffMonths;
    private final int vestingMonths;
    private final VestingFrequency frequency;
    private final VestingStatus status;
}
