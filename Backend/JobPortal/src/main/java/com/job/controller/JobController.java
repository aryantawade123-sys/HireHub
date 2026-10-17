package com.job.controller;

import com.job.dto.request.JobRequestDTO;
import com.job.dto.response.CompensationBenchmarkDTO;
import com.job.dto.response.JobResponseDTO;
import com.job.dto.response.PageResponseDTO;
import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.entity.User;
import com.job.enums.CompensationPeriod;
import com.job.service.interfaces.IJobService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@Validated
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final IJobService jobService;

    // ── EMPLOYER-ONLY endpoints ────────────────────────────────────────────

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody @Valid JobRequestDTO dto,
                                       @RequestAttribute("user") User user) {
        Employer employer = (Employer) user;
        log.info("Creating job '{}' for employer: {}", dto.getTitle(), employer.getUsername());
        Job createdJob = jobService.createJob(dto, employer);
        log.info("Job created with id: {} by employer: {}", createdJob.getId(), employer.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Job created successfully.", "jobId", createdJob.getId()));
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @GetMapping("/my")
    public ResponseEntity<List<JobResponseDTO>> getMyJobs(@RequestAttribute("user") User user) {
        Employer employer = (Employer) user;
        return ResponseEntity.ok(jobService.getJobsByEmployer(employer));
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody @Valid JobRequestDTO jobRequestDTO,
            @RequestAttribute("user") User user) {
        Employer employer = (Employer) user;
        log.info("Updating job id: {} by employer: {}", id, employer.getUsername());
        JobResponseDTO updatedJob = jobService.updateJob(id, jobRequestDTO, employer);
        return ResponseEntity.ok(updatedJob);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id,
            @RequestAttribute("user") User user) {
        Employer employer = (Employer) user;
        log.info("Deleting job id: {} by employer: {}", id, employer.getUsername());
        jobService.deleteJob(id, employer);
        return ResponseEntity.ok("Job deleted successfully.");
    }

    // ── PUBLIC endpoints ───────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<PageResponseDTO<JobResponseDTO>> getAllJobs(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(jobService.getAllJobsSortedByDate(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponseDTO> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/search/title")
    public ResponseEntity<PageResponseDTO<JobResponseDTO>> searchByTitle(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(jobService.searchByTitle(keyword, page, size));
    }

    @GetMapping("/search/type")
    public ResponseEntity<PageResponseDTO<JobResponseDTO>> searchByType(
            @RequestParam String type,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(jobService.searchByType(type, page, size));
    }

    @GetMapping("/search/location")
    public ResponseEntity<PageResponseDTO<JobResponseDTO>> searchByLocation(
            @RequestParam String location,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(jobService.searchByLocation(location, page, size));
    }

    @GetMapping("/search/workmode")
    public ResponseEntity<PageResponseDTO<JobResponseDTO>> searchByWorkMode(
            @RequestParam String workMode,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(jobService.searchByWorkMode(workMode, page, size));
    }

    @GetMapping("/compensation/benchmark")
    public ResponseEntity<CompensationBenchmarkDTO> getCompensationBenchmark(
            @RequestParam @NotBlank @Size(max = 200) String title,
            @RequestParam(required = false) @Size(max = 200) String location,
            @RequestParam @Pattern(regexp = "[A-Za-z]{3}") String currency,
            @RequestParam CompensationPeriod period) {
        return ResponseEntity.ok(jobService.getCompensationBenchmark(title, location, currency, period));
    }
}
