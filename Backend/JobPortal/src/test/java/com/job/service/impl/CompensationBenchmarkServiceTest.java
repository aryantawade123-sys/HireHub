package com.job.service.impl;

import com.job.dto.response.CompensationBenchmarkDTO;
import com.job.enums.CompensationPeriod;
import com.job.exception.ResourceNotFoundException;
import com.job.repository.JobRepository;
import com.job.repository.JobRepository.CompensationBenchmarkAggregate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompensationBenchmarkServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobServiceImpl jobService;

    @Test
    void normalizesSearchInputsAndReturnsRoundedAggregate() {
        CompensationBenchmarkAggregate aggregate = aggregate(
                new BigDecimal("100.00"), new BigDecimal("150.005"), new BigDecimal("200.00"), 3L);
        when(jobRepository.findCompensationBenchmark(
                "Engineer", null, "USD", CompensationPeriod.ANNUAL))
                .thenReturn(aggregate);

        CompensationBenchmarkDTO result = jobService.getCompensationBenchmark(
                " Engineer ", " ", "usd", CompensationPeriod.ANNUAL);

        assertEquals("USD", result.getCurrency());
        assertEquals(CompensationPeriod.ANNUAL, result.getPeriod());
        assertEquals(new BigDecimal("100.00"), result.getMinimum());
        assertEquals(new BigDecimal("150.01"), result.getAverageRangeMidpoint());
        assertEquals(new BigDecimal("200.00"), result.getMaximum());
        assertEquals(3L, result.getSampleCount());
        verify(jobRepository).findCompensationBenchmark("Engineer", null, "USD", CompensationPeriod.ANNUAL);
    }

    @Test
    void suppressesBenchmarksBelowMinimumSampleCount() {
        CompensationBenchmarkAggregate aggregate = mock(CompensationBenchmarkAggregate.class);
        when(aggregate.getSampleCount()).thenReturn(2L);
        when(jobRepository.findCompensationBenchmark(
                "Engineer", null, "USD", CompensationPeriod.ANNUAL))
                .thenReturn(aggregate);

        assertThrows(ResourceNotFoundException.class, () -> jobService.getCompensationBenchmark(
                "Engineer", null, "USD", CompensationPeriod.ANNUAL));
    }

    private CompensationBenchmarkAggregate aggregate(
            BigDecimal minimum, Number average, BigDecimal maximum, long sampleCount) {
        CompensationBenchmarkAggregate aggregate = mock(CompensationBenchmarkAggregate.class);
        when(aggregate.getMinimum()).thenReturn(minimum);
        when(aggregate.getAverageRangeMidpoint()).thenReturn(average);
        when(aggregate.getMaximum()).thenReturn(maximum);
        when(aggregate.getSampleCount()).thenReturn(sampleCount);
        return aggregate;
    }
}
