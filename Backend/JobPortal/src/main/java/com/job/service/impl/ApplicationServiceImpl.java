package com.job.service.impl;

import com.job.designpatterns.Observer.ApplicationObserver;
import com.job.dto.request.ApplicationRequestDTO;
import com.job.dto.response.ApplicationResponseDTO;
import com.job.dto.response.ApplicationViewForEmployerDTO;
import com.job.dto.response.EmployerFunnelAnalyticsDTO;
import com.job.dto.response.PageResponseDTO;
import com.job.dto.response.ScreeningAnswerDTO;
import com.job.entity.Application;
import com.job.entity.ApplicationScreeningAnswer;
import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.entity.JobSeeker;
import com.job.enums.ApplicationStatus;
import com.job.exception.BadRequestException;
import com.job.exception.DuplicateResourceException;
import com.job.exception.ResourceNotFoundException;
import com.job.exception.UnauthorizedException;
import com.job.repository.ApplicationRepository;
import com.job.repository.JobRepository;
import com.job.service.interfaces.EmailService;
import com.job.service.interfaces.IApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.EnumMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements IApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final List<ApplicationObserver> observers;
    private final EmailService emailService;

    @Override
    @Transactional
    public ApplicationResponseDTO applyToJob(ApplicationRequestDTO dto, JobSeeker jobSeeker) {
        log.info("Job seeker {} applying to job id: {}", jobSeeker.getUsername(), dto.getJobId());
        if (jobSeeker.getResumeUrl() == null || jobSeeker.getResumeUrl().isBlank()) {
            throw new BadRequestException("You must upload a resume before applying to a job.");
        }

        Job job = jobRepository.findById(dto.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.isActive()) {
            throw new BadRequestException("This job is no longer accepting applications.");
        }

        boolean alreadyApplied = applicationRepository.existsByJobAndJobSeeker(job, jobSeeker);
        if (alreadyApplied) {
            throw new DuplicateResourceException("You have already applied for this job");
        }

        List<String> screeningQs = job.getScreeningQuestions() == null ? List.of() : job.getScreeningQuestions();
        List<String> screeningAnswers = dto.getScreeningAnswers() == null ? List.of() : dto.getScreeningAnswers();
        if (screeningQs.size() != screeningAnswers.size()) {
            if (!screeningQs.isEmpty()) {
                throw new BadRequestException("You must answer all required screening questions.");
            }
            throw new BadRequestException("This job does not accept screening answers.");
        }
        if (screeningAnswers.stream().anyMatch(answer -> answer == null || answer.isBlank())) {
            throw new BadRequestException("Screening answers cannot be blank.");
        }

        Application application = new Application();
        application.setJob(job);
        application.setJobSeeker(jobSeeker);
        application.setTenant(job.getTenant());
        application.setResumeUrl(jobSeeker.getResumeUrl());
        application.setStatus(ApplicationStatus.PENDING);
        List<ApplicationScreeningAnswer> savedAnswers = new java.util.ArrayList<>();
        for (int i = 0; i < screeningAnswers.size(); i++) {
            savedAnswers.add(new ApplicationScreeningAnswer(screeningQs.get(i), screeningAnswers.get(i).trim()));
        }
        application.setScreeningAnswers(savedAnswers);

        applicationRepository.save(application);

        emailService.sendApplicationConfirmation(
                jobSeeker.getEmail(),
                jobSeeker.getName(),
                job.getTitle(),
                job.getEmployer().getCompanyName()
        );

        return mapToDTO(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationViewForEmployerDTO> getAllApplicationsForEmployer(Employer employer, ApplicationStatus status) {
        List<Application> applications;

        if (status == null) {
            applications = applicationRepository.findByJob_Employer(employer);
        } else {
            applications = applicationRepository.findByJob_EmployerAndStatus(employer, status);
        }

        return applications.stream()
                .map(this::mapToEmployerDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ApplicationResponseDTO> getMyApplications(JobSeeker jobSeeker, int page, int size) {
        Page<Application> result = applicationRepository.findByJobSeeker(jobSeeker, PageRequest.of(page, size));
        List<ApplicationResponseDTO> content = result.getContent().stream()
                .map(this::mapToDTO)
                .toList();
        return new PageResponseDTO<>(content, result.getNumber(), result.getTotalPages(),
                result.getTotalElements(), result.getSize(), result.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponseDTO getApplicationById(Long id, JobSeeker requester) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJobSeeker().getId().equals(requester.getId())) {
            throw new UnauthorizedException("Unauthorized access to application");
        }

        return mapToDTO(app);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long id, JobSeeker requester) {
        log.info("Job seeker {} withdrawing application id: {}", requester.getUsername(), id);
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJobSeeker().getId().equals(requester.getId())) {
            throw new UnauthorizedException("Unauthorized to withdraw this application");
        }

        applicationRepository.delete(app);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationViewForEmployerDTO> getApplicationsForJob(Long jobId, Employer employer) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("Unauthorized to view applications for this job");
        }

        List<Application> applications = applicationRepository.findByJob(job);

        return applications.stream()
                .map(this::mapToEmployerDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationViewForEmployerDTO getApplicationViewForEmployer(Long id, Employer employer) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("Unauthorized to view this application");
        }

        return mapToEmployerDTO(app);
    }

    @Override
    @Transactional
    public void updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, Employer employer) {
        log.info("Employer {} updating application id: {} to status: {}", employer.getUsername(), applicationId, newStatus);
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("Unauthorized to update this application");
        }

        app.setStatus(newStatus);
        if (newStatus != ApplicationStatus.REJECTED) {
            app.setSilverMedalist(false);
        }
        applicationRepository.save(app);
        notifyObservers(app.getJobSeeker(), app);

        emailService.sendApplicationStatusUpdate(
                app.getJobSeeker().getEmail(),
                app.getJobSeeker().getName(),
                app.getJob().getTitle(),
                newStatus.toString()
        );
    }

    @Override
    @Transactional
    public ApplicationViewForEmployerDTO updateSilverMedalist(
            Long applicationId, boolean selected, Employer employer) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedException("Unauthorized to update this application");
        }
        if (selected && app.getStatus() != ApplicationStatus.REJECTED) {
            throw new BadRequestException("Only rejected applications can be added to the silver-medalist pool.");
        }

        app.setSilverMedalist(selected);
        applicationRepository.save(app);
        return mapToEmployerDTO(app);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationViewForEmployerDTO> getSilverMedalistsForEmployer(Employer employer) {
        return applicationRepository
                .findByJob_EmployerAndStatusAndSilverMedalistTrue(employer, ApplicationStatus.REJECTED)
                .stream()
                .map(this::mapToEmployerDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUserAppliedToJob(Long jobId, JobSeeker jobSeeker) {
        return applicationRepository.existsByJobIdAndJobSeeker(jobId, jobSeeker);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployerFunnelAnalyticsDTO getEmployerFunnelAnalytics(Employer employer) {
        Map<ApplicationStatus, Long> counts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            counts.put(status, 0L);
        }
        long totalApplications = 0;
        for (ApplicationRepository.ApplicationStatusCount row : applicationRepository.countByStatusForEmployer(employer)) {
            counts.put(row.getStatus(), row.getApplicationCount());
            totalApplications += row.getApplicationCount();
        }
        long applicationTotal = totalApplications;

        List<EmployerFunnelAnalyticsDTO.FunnelStage> stages = java.util.Arrays.stream(ApplicationStatus.values())
                .map(status -> new EmployerFunnelAnalyticsDTO.FunnelStage(
                        status,
                        counts.get(status),
                        applicationTotal == 0 ? 0.0 : roundPercent(counts.get(status) * 100.0 / applicationTotal)))
                .toList();
        long interviewCount = counts.get(ApplicationStatus.INTERVIEW);
        long offerCount = counts.get(ApplicationStatus.OFFERED);
        double interviewRate = totalApplications == 0 ? 0.0 : roundPercent(interviewCount * 100.0 / totalApplications);
        double offerRate = totalApplications == 0 ? 0.0 : roundPercent(offerCount * 100.0 / totalApplications);

        return new EmployerFunnelAnalyticsDTO(
                jobRepository.countByEmployer(employer),
                totalApplications,
                interviewRate,
                offerRate,
                stages);
    }

    private double roundPercent(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private ApplicationResponseDTO mapToDTO(Application application) {
        ApplicationResponseDTO dto = new ApplicationResponseDTO();

        dto.setApplicationId(application.getId());
        dto.setUsername(application.getJobSeeker().getUsername());
        dto.setStatus(application.getStatus());
        dto.setAppliedAt(application.getAppliedAt());

        Job job = application.getJob();
        dto.setJobId(job.getId());
        dto.setJobTitle(job.getTitle());
        dto.setJobType(job.getType().toString());
        dto.setWorkMode(job.getWorkMode().toString());
        dto.setLocation(job.getLocation());
        dto.setJobDescription(job.getDescription());

        Employer employer = job.getEmployer();
        dto.setCompanyName(employer.getCompanyName());
        dto.setCompanyLogoUrl(employer.getProfilePictureUrl());

        dto.setResumeUrl(application.getResumeUrl());

        return dto;
    }

    private ApplicationViewForEmployerDTO mapToEmployerDTO(Application app) {
        JobSeeker applicant = app.getJobSeeker();
        Job job = app.getJob();

        ApplicationViewForEmployerDTO dto = new ApplicationViewForEmployerDTO();
        dto.setApplicantUsername(applicant.getUsername());
        dto.setApplicantDOB(applicant.getDob());
        dto.setApplicantEmail(applicant.getEmail());
        dto.setId(app.getId());
        dto.setResumeUrl(app.getResumeUrl());
        dto.setApplicantName(applicant.getName());
        dto.setApplicantProfilePicture(applicant.getProfilePictureUrl());
        dto.setStatus(app.getStatus());
        dto.setSilverMedalist(app.isSilverMedalist());
        dto.setAppliedAt(app.getAppliedAt());

        dto.setJobTitle(job.getTitle());
        dto.setScreeningAnswers(app.getScreeningAnswers() == null
                ? List.of()
                : app.getScreeningAnswers().stream()
                        .map(answer -> new ScreeningAnswerDTO(answer.getQuestion(), answer.getAnswer()))
                        .toList());

        return dto;
    }

    private void notifyObservers(JobSeeker jobSeeker, Application application) {
        for (ApplicationObserver observer : observers) {
            observer.notify(jobSeeker, application);
        }
    }
}
