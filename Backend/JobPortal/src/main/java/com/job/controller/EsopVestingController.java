package com.job.controller;

import com.job.dto.request.VestingCalculationRequest;
import com.job.dto.response.VestingCalculationResponse;
import com.job.service.impl.EsopVestingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/offers/vesting")
@RequiredArgsConstructor
public class EsopVestingController {

    private final EsopVestingService esopVestingService;

    @PostMapping("/calculate")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<VestingCalculationResponse> calculateVesting(
            @RequestBody @Valid VestingCalculationRequest request) {
        return ResponseEntity.ok(esopVestingService.calculate(request));
    }
}
