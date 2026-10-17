package com.job.dto.request;

import com.job.enums.VestingFrequency;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VestingCalculationRequest {

    @Min(value = 1, message = "Granted units must be greater than zero")
    @Max(value = 1_000_000_000L, message = "Granted units exceed the supported limit")
    private long totalUnits;

    @NotNull
    private LocalDate grantDate;

    @NotNull
    private LocalDate asOfDate;

    @Min(value = 0, message = "Cliff months cannot be negative")
    @Max(value = 600, message = "Cliff cannot exceed 600 months")
    private Integer cliffMonths;

    @Min(value = 1, message = "Vesting duration must be at least one month")
    @Max(value = 600, message = "Vesting duration cannot exceed 600 months")
    private Integer vestingMonths;

    @NotNull
    private VestingFrequency frequency;

    @AssertTrue(message = "Vesting dates, cliff, duration, and frequency must form a valid schedule")
    public boolean isVestingScheduleValid() {
        if (grantDate == null || asOfDate == null || cliffMonths == null || vestingMonths == null
                || frequency == null || asOfDate.isBefore(grantDate)
                || cliffMonths > vestingMonths) {
            return false;
        }
        int intervalMonths = frequency.getIntervalMonths();
        return vestingMonths % intervalMonths == 0
                && cliffMonths % intervalMonths == 0;
    }
}
