package com.job.service.impl;

import com.job.dto.request.JobRequestDTO;
import com.job.dto.response.CompensationBenchmarkDTO;
import com.job.dto.response.JobResponseDTO;
import com.job.dto.response.PageResponseDTO;
import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.enums.CompensationPeriod;
import com.job.enums.JobType;
import com.job.enums.WorkMode;
import com.job.exception.BadRequestException;
import com.job.exception.ResourceNotFoundException;
import com.job.exception.TenantContextException;
import com.job.exception.UnauthorizedException;
import com.job.repository.JobRepository;
import com.job.service.interfaces.IJobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Currency;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements IJobService {

    private static final long MINIMUM_BENCHMARK_SAMPLE_COUNT = 3;
    private static final String BENCHMARK_METHODOLOGY =
            "Based on active job postings that disclose compensation; average is the mean of each posting's range midpoint.";

    private final JobRepository jobRepository;

    @Override
    @Transactional
    public Job createJob(JobRequestDTO dto, Employer employer) {
        log.info("Creating job '{}' for employer: {}", dto.getTitle(), employer.getUsername());
        Job job = new Job();

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setType(dto.getType() != null ? dto.getType() : JobType.FULL_TIME); // Default type
        job.setWorkMode(dto.getWorkMode() != null ? dto.getWorkMode() : WorkMode.HYBRID); // Default work mode
        applyCompensation(job, dto);
        job.setResponsibilities(dto.getResponsibilities());
        job.setRequiredSkills(dto.getRequiredSkills());
        job.setScreeningQuestions(dto.getScreeningQuestions()); // Optional field
        job.setPostedAt(LocalDateTime.now());
        job.setEmployer(employer);
        if (employer.getTenant() == null) {
            throw new TenantContextException("The employer account is not assigned to a company tenant.");
        }
        job.setTenant(employer.getTenant());

        return jobRepository.save(job);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<JobResponseDTO> getAllJobsSortedByDate(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postedAt").descending());
        return toPageResponse(jobRepository.findAllWithEmployer(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<JobResponseDTO> searchByTitle(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return toPageResponse(jobRepository.findByTitleContainingIgnoreCaseWithEmployer(keyword, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<JobResponseDTO> searchByType(String type, int page, int size) {
        try {
            JobType jobType = JobType.valueOf(type.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            return toPageResponse(jobRepository.findByTypeWithEmployer(jobType, pageable));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid job type provided: {}", type);
            throw new BadRequestException("Invalid job type: " + type);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<JobResponseDTO> searchByLocation(String location, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return toPageResponse(jobRepository.findByLocationContainingIgnoreCaseWithEmployer(location, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<JobResponseDTO> searchByWorkMode(String workMode, int page, int size) {
        try {
            WorkMode mode = WorkMode.valueOf(workMode.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            return toPageResponse(jobRepository.findByWorkModeWithEmployer(mode, pageable));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid work mode provided: {}", workMode);
            throw new BadRequestException("Invalid work mode: " + workMode);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponseDTO getJobById(Long id) {
        Job job = jobRepository.findByIdWithEmployer(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        return mapToDTO(job);
    }

    @Override
    @Transactional
    public JobResponseDTO updateJob(Long id, JobRequestDTO dto, Employer employer) {
        log.info("Updating job id: {} by employer: {}", id, employer.getUsername());
        Job job = jobRepository.findByIdWithEmployer(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("You are not authorized to update this job");
        }

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setType(dto.getType());
        job.setWorkMode(dto.getWorkMode());
        applyCompensation(job, dto);
        job.setRequiredSkills(dto.getRequiredSkills());
        job.setResponsibilities(dto.getResponsibilities());
        job.setScreeningQuestions(dto.getScreeningQuestions());

        Job updated = jobRepository.save(job);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, Employer employer) {
        log.info("Deleting job id: {} by employer: {}", jobId, employer.getUsername());
        Job job = jobRepository.findByIdWithEmployer(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDTO> getJobsByEmployer(Employer employer) {
        return jobRepository.findByEmployerWithEmployer(employer).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<JobResponseDTO> searchJobs(String keyword, String location, String type, String workMode, Boolean active, int page, int size) {
        JobType jobType = null;
        if (type != null && !type.isBlank()) {
            try {
                jobType = JobType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        WorkMode mode = null;
        if (workMode != null && !workMode.isBlank()) {
            try {
                mode = WorkMode.valueOf(workMode.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("postedAt").descending());
        return toPageResponse(jobRepository.searchJobs(keyword, location, jobType, mode, active, pageable));
    }

    @Override
    @Transactional
    public JobResponseDTO toggleJobStatus(Long jobId, Employer employer) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("You are not authorized to update this job");
        }

        job.setActive(!job.isActive());
        Job saved = jobRepository.save(job);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CompensationBenchmarkDTO getCompensationBenchmark(String titleKeyword, String location, String currency,
                                                              CompensationPeriod period) {
        String normalizedLocation = location == null || location.isBlank() ? null : location.trim();
        String normalizedCurrency = currency.toUpperCase(Locale.ROOT);
        Currency currencyUnit;
        try {
            currencyUnit = Currency.getInstance(normalizedCurrency);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Unsupported compensation currency");
        }
        int fractionDigits = currencyUnit.getDefaultFractionDigits();
        if (fractionDigits < 0 || fractionDigits > 3) {
            throw new BadRequestException("Unsupported compensation currency");
        }
        JobRepository.CompensationBenchmarkAggregate result = jobRepository.findCompensationBenchmark(
                titleKeyword.trim(), normalizedLocation, normalizedCurrency, period);
        long sampleCount = result.getSampleCount();
        if (sampleCount < MINIMUM_BENCHMARK_SAMPLE_COUNT) {
            throw new ResourceNotFoundException("A compensation benchmark is not available for this selection");
        }

        return new CompensationBenchmarkDTO(
                normalizedCurrency,
                period,
                toMoney(result.getMinimum(), fractionDigits),
                toMoney(result.getAverageRangeMidpoint(), fractionDigits),
                toMoney(result.getMaximum(), fractionDigits),
                sampleCount,
                BENCHMARK_METHODOLOGY);
    }

    private PageResponseDTO<JobResponseDTO> toPageResponse(Page<Job> page) {
        List<JobResponseDTO> content = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();
        return new PageResponseDTO<>(
                content,
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.getSize(),
                page.isLast()
        );
    }

    private JobResponseDTO mapToDTO(Job job) {
        JobResponseDTO dto = new JobResponseDTO();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setLocation(job.getLocation());
        dto.setPostedAt(job.getPostedAt());
        dto.setCompanyName(job.getEmployer().getCompanyName());
        dto.setType(job.getType());
        dto.setWorkMode(job.getWorkMode());
        dto.setCompensationMinimum(job.getCompensationMinimum());
        dto.setCompensationMaximum(job.getCompensationMaximum());
        dto.setCompensationCurrency(job.getCompensationCurrency());
        dto.setCompensationPeriod(job.getCompensationPeriod());
        dto.setProfilePicture(job.getEmployer().getProfilePictureUrl());
        dto.setEmployerId(job.getEmployer().getId());
        dto.setActive(job.isActive());
        dto.setResponsibilities(new ArrayList<>(job.getResponsibilities() != null ? job.getResponsibilities() : List.of()));
        dto.setRequiredSkills(new ArrayList<>(job.getRequiredSkills() != null ? job.getRequiredSkills() : List.of()));
        dto.setScreeningQuestions(new ArrayList<>(job.getScreeningQuestions() != null ? job.getScreeningQuestions() : List.of()));
        return dto;
    }

    private void applyCompensation(Job job, JobRequestDTO dto) {
        job.setCompensationMinimum(dto.getCompensationMinimum());
        job.setCompensationMaximum(dto.getCompensationMaximum());
        job.setCompensationCurrency(dto.getCompensationCurrency() == null
                ? null : dto.getCompensationCurrency().toUpperCase(Locale.ROOT));
        job.setCompensationPeriod(dto.getCompensationPeriod());
    }

    private BigDecimal toMoney(Object value, int fractionDigits) {
        if (value instanceof BigDecimal amount) {
            return amount.setScale(fractionDigits, RoundingMode.HALF_UP);
        }
        return new BigDecimal(value.toString()).setScale(fractionDigits, RoundingMode.HALF_UP);
    }
}
