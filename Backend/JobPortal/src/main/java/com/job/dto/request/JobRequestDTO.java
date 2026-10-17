package com.job.dto.request;

import com.job.enums.JobType;
import com.job.enums.CompensationPeriod;
import com.job.enums.WorkMode;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.List;
import java.util.Locale;

@Getter
@Setter
public class JobRequestDTO {

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    @Size(max = 5000, message = "Job description must not exceed 5000 characters")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    private JobType type;
    private WorkMode workMode;

    @DecimalMin(value = "0.00", message = "Minimum compensation cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Minimum compensation must have at most 12 integer digits and 3 decimals")
    private BigDecimal compensationMinimum;

    @DecimalMin(value = "0.00", message = "Maximum compensation cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Maximum compensation must have at most 12 integer digits and 3 decimals")
    private BigDecimal compensationMaximum;

    @Pattern(regexp = "[A-Za-z]{3}", message = "Compensation currency must be a three-letter ISO currency code")
    private String compensationCurrency;

    private CompensationPeriod compensationPeriod;

    private List<String> responsibilities;
    private List<String> requiredSkills;
    @Size(max = 20, message = "No more than 20 screening questions are allowed")
    private List<@NotBlank(message = "Screening questions cannot be blank")
                 @Size(max = 500, message = "Screening questions must not exceed 500 characters") String> screeningQuestions;

    @AssertTrue(message = "Provide a valid currency, period, and complete non-negative compensation range")
    public boolean isCompensationRangeValid() {
        boolean hasMinimum = compensationMinimum != null;
        boolean hasMaximum = compensationMaximum != null;
        boolean hasCurrency = compensationCurrency != null && !compensationCurrency.isBlank();
        boolean hasPeriod = compensationPeriod != null;

        if (!hasMinimum && !hasMaximum && !hasCurrency && !hasPeriod) {
            return true;
        }
        if (!hasMinimum || !hasMaximum || !hasCurrency || !hasPeriod
                || compensationMinimum.compareTo(compensationMaximum) > 0) {
            return false;
        }
        try {
            int fractionDigits = Currency.getInstance(compensationCurrency.toUpperCase(Locale.ROOT))
                    .getDefaultFractionDigits();
            return fractionDigits >= 0 && fractionDigits <= 3
                    && compensationMinimum.stripTrailingZeros().scale() <= fractionDigits
                    && compensationMaximum.stripTrailingZeros().scale() <= fractionDigits;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}