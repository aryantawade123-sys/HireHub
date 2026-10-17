package com.job.dto.request;

import com.job.enums.VestingFrequency;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VestingCalculationRequestValidationTest {

    private ValidatorFactory validatorFactory;
    private Validator validator;

    @BeforeEach
    void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterEach
    void tearDown() {
        validatorFactory.close();
    }

    @Test
    void acceptsMonthlyAndQuarterlyVestingTerms() {
        assertTrue(validator.validate(request(VestingFrequency.MONTHLY, 48, 12)).isEmpty());
        assertTrue(validator.validate(request(VestingFrequency.QUARTERLY, 48, 12)).isEmpty());
    }

    @Test
    void rejectsInvalidDateOrderingAndFrequencyAlignment() {
        VestingCalculationRequest reversedDates = request(VestingFrequency.MONTHLY, 48, 12);
        reversedDates.setAsOfDate(reversedDates.getGrantDate().minusDays(1));
        assertFalse(validator.validate(reversedDates).isEmpty());

        assertFalse(validator.validate(request(VestingFrequency.QUARTERLY, 47, 12)).isEmpty());
        assertFalse(validator.validate(request(VestingFrequency.QUARTERLY, 48, 10)).isEmpty());
    }

    private VestingCalculationRequest request(VestingFrequency frequency, int vestingMonths, int cliffMonths) {
        VestingCalculationRequest request = new VestingCalculationRequest();
        request.setTotalUnits(1_000);
        request.setGrantDate(LocalDate.of(2024, 1, 1));
        request.setAsOfDate(LocalDate.of(2025, 1, 1));
        request.setCliffMonths(cliffMonths);
        request.setVestingMonths(vestingMonths);
        request.setFrequency(frequency);
        return request;
    }
}
