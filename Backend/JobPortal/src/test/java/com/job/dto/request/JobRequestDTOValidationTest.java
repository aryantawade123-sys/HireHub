package com.job.dto.request;

import com.job.enums.CompensationPeriod;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JobRequestDTOValidationTest {

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
    void acceptsJobsWithoutCompensationAndCompleteValidRanges() {
        JobRequestDTO withoutCompensation = validJobRequest();
        assertTrue(validator.validate(withoutCompensation).isEmpty());

        JobRequestDTO withCompensation = validJobRequest();
        withCompensation.setCompensationMinimum(new BigDecimal("100.00"));
        withCompensation.setCompensationMaximum(new BigDecimal("150.00"));
        withCompensation.setCompensationCurrency("usd");
        withCompensation.setCompensationPeriod(CompensationPeriod.ANNUAL);
        assertTrue(validator.validate(withCompensation).isEmpty());

        JobRequestDTO threeFractionDigits = validJobRequest();
        threeFractionDigits.setCompensationMinimum(new BigDecimal("100.125"));
        threeFractionDigits.setCompensationMaximum(new BigDecimal("150.375"));
        threeFractionDigits.setCompensationCurrency("KWD");
        threeFractionDigits.setCompensationPeriod(CompensationPeriod.ANNUAL);
        assertTrue(validator.validate(threeFractionDigits).isEmpty());
    }

    @Test
    void rejectsIncompleteInvalidAndCurrencyPrecisionViolatingRanges() {
        JobRequestDTO incomplete = validJobRequest();
        incomplete.setCompensationMinimum(new BigDecimal("100.00"));
        assertFalse(validator.validate(incomplete).isEmpty());

        JobRequestDTO invalidCurrency = validJobRequest();
        setRange(invalidCurrency, "100.00", "150.00", "ZZZ", CompensationPeriod.ANNUAL);
        assertFalse(validator.validate(invalidCurrency).isEmpty());

        JobRequestDTO reversedRange = validJobRequest();
        setRange(reversedRange, "200.00", "150.00", "USD", CompensationPeriod.ANNUAL);
        assertFalse(validator.validate(reversedRange).isEmpty());

        JobRequestDTO invalidPrecision = validJobRequest();
        setRange(invalidPrecision, "100.01", "150.00", "JPY", CompensationPeriod.ANNUAL);
        assertFalse(validator.validate(invalidPrecision).isEmpty());
    }

    private JobRequestDTO validJobRequest() {
        JobRequestDTO dto = new JobRequestDTO();
        dto.setTitle("Software Engineer");
        dto.setDescription("Build reliable software.");
        dto.setLocation("Remote");
        return dto;
    }

    private void setRange(JobRequestDTO dto, String minimum, String maximum, String currency,
                          CompensationPeriod period) {
        dto.setCompensationMinimum(new BigDecimal(minimum));
        dto.setCompensationMaximum(new BigDecimal(maximum));
        dto.setCompensationCurrency(currency);
        dto.setCompensationPeriod(period);
    }
}
