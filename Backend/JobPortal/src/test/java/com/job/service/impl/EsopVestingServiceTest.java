package com.job.service.impl;

import com.job.dto.request.VestingCalculationRequest;
import com.job.dto.response.VestingCalculationResponse;
import com.job.enums.VestingFrequency;
import com.job.enums.VestingStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EsopVestingServiceTest {

    private final EsopVestingService service = new EsopVestingService();

    @Test
    void appliesTwelveMonthCliffAndMonthlyVesting() {
        VestingCalculationResponse beforeCliff = service.calculate(request(11, VestingFrequency.MONTHLY));
        assertEquals(0L, beforeCliff.getVestedUnits());
        assertEquals(VestingStatus.PRE_CLIFF, beforeCliff.getStatus());

        VestingCalculationResponse atCliff = service.calculate(request(12, VestingFrequency.MONTHLY));
        assertEquals(250L, atCliff.getVestedUnits());
        assertEquals(VestingStatus.VESTING, atCliff.getStatus());
        assertEquals(25.00, atCliff.getVestedPercentage().doubleValue());
    }

    @Test
    void fullyVestsAtTheEndOfTermAndCapsCompletedMonths() {
        VestingCalculationResponse result = service.calculate(request(60, VestingFrequency.MONTHLY));

        assertEquals(1_000L, result.getVestedUnits());
        assertEquals(0L, result.getUnvestedUnits());
        assertEquals(48, result.getCompletedMonths());
        assertEquals(VestingStatus.FULLY_VESTED, result.getStatus());
    }

    @Test
    void usesWholeQuarterIntervalsForQuarterlySchedule() {
        VestingCalculationRequest request = request(15, VestingFrequency.QUARTERLY);
        request.setCliffMonths(12);
        VestingCalculationResponse result = service.calculate(request);

        assertEquals(312L, result.getVestedUnits());
        assertEquals(31.20, result.getVestedPercentage().doubleValue());
    }

    private VestingCalculationRequest request(int monthsAfterGrant, VestingFrequency frequency) {
        VestingCalculationRequest request = new VestingCalculationRequest();
        request.setTotalUnits(1_000);
        request.setGrantDate(LocalDate.of(2024, 1, 31));
        request.setAsOfDate(request.getGrantDate().plusMonths(monthsAfterGrant));
        request.setCliffMonths(12);
        request.setVestingMonths(48);
        request.setFrequency(frequency);
        return request;
    }
}
