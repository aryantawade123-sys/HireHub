package com.job.service.impl;

import com.job.dto.request.VestingCalculationRequest;
import com.job.dto.response.VestingCalculationResponse;
import com.job.enums.VestingStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
public class EsopVestingService {

    public VestingCalculationResponse calculate(VestingCalculationRequest request) {
        int completedMonths = completedMonths(request.getGrantDate(), request.getAsOfDate(),
                request.getVestingMonths());
        long vestedUnits = calculateVestedUnits(request, completedMonths);
        VestingStatus status = getStatus(request, completedMonths);
        BigDecimal vestedPercentage = BigDecimal.valueOf(vestedUnits)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(request.getTotalUnits()), 2, RoundingMode.HALF_UP);

        return new VestingCalculationResponse(
                request.getTotalUnits(),
                vestedUnits,
                request.getTotalUnits() - vestedUnits,
                vestedPercentage,
                completedMonths,
                request.getCliffMonths(),
                request.getVestingMonths(),
                request.getFrequency(),
                status);
    }

    private int completedMonths(LocalDate grantDate, LocalDate asOfDate, int vestingMonths) {
        int completed = 0;
        while (completed < vestingMonths && !grantDate.plusMonths(completed + 1L).isAfter(asOfDate)) {
            completed++;
        }
        return completed;
    }

    private long calculateVestedUnits(VestingCalculationRequest request, int completedMonths) {
        if (completedMonths < request.getCliffMonths()) {
            return 0;
        }
        if (completedMonths >= request.getVestingMonths()) {
            return request.getTotalUnits();
        }
        int intervalMonths = request.getFrequency().getIntervalMonths();
        int completedIntervals = completedMonths / intervalMonths;
        int totalIntervals = request.getVestingMonths() / intervalMonths;
        return request.getTotalUnits() * completedIntervals / totalIntervals;
    }

    private VestingStatus getStatus(VestingCalculationRequest request, int completedMonths) {
        if (completedMonths < request.getCliffMonths()) {
            return VestingStatus.PRE_CLIFF;
        }
        if (completedMonths >= request.getVestingMonths()) {
            return VestingStatus.FULLY_VESTED;
        }
        return VestingStatus.VESTING;
    }
}
