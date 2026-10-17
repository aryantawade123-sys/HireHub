package com.job.dto.response;

import com.job.enums.CompensationPeriod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CompensationBenchmarkDTO {
    private final String currency;
    private final CompensationPeriod period;
    private final BigDecimal minimum;
    private final BigDecimal averageRangeMidpoint;
    private final BigDecimal maximum;
    private final long sampleCount;
    private final String methodology;
}
