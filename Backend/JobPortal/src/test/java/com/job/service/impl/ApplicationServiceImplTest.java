package com.job.service.impl;

import com.job.dto.request.ApplicationRequestDTO;
import com.job.entity.Application;
import com.job.entity.CompanyTenant;
import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.entity.JobSeeker;
import com.job.enums.ApplicationStatus;
import com.job.enums.JobType;
import com.job.enums.WorkMode;
import com.job.exception.BadRequestException;
import com.job.repository.ApplicationRepository;
import com.job.repository.JobRepository;
import com.job.service.interfaces.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ApplicationServiceImplTest {

    private final ApplicationRepository applicationRepository = mock(ApplicationRepository.class);
    private final JobRepository jobRepository = mock(JobRepository.class);
    private final EmailService emailService = mock(EmailService.class);
    private final ApplicationServiceImpl service =
            new ApplicationServiceImpl(applicationRepository, jobRepository, List.of(), emailService);

    private JobSeeker jobSeeker;
    private Job job;

    @BeforeEach
    void setUp() {
        jobSeeker = new JobSeeker();
        jobSeeker.setId(10L);
        jobSeeker.setUsername("candidate");
        jobSeeker.setName("Candidate");
        jobSeeker.setEmail("candidate@example.test");
        jobSeeker.setResumeUrl("https://files.example.test/resume.pdf");

        Employer employer = new Employer();
        employer.setId(20L);
        employer.setCompanyName("HireHub Test Co");
        CompanyTenant tenant = new CompanyTenant("HireHub Test Co");
        tenant.setId(40L);
        employer.setTenant(tenant);

        job = new Job();
        job.setId(30L);
        job.setTitle("Frontend Engineer");
        job.setDescription("Build accessible interfaces.");
        job.setLocation("Remote");
        job.setType(JobType.FULL_TIME);
        job.setWorkMode(WorkMode.REMOTE);
        job.setEmployer(employer);
        job.setTenant(tenant);
        job.setActive(true);
        job.setScreeningQuestions(List.of("Which UI framework have you used?", "How do you test accessibility?"));
        when(jobRepository.findById(30L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByJobAndJobSeeker(job, jobSeeker)).thenReturn(false);
    }

    @Test
    void rejectsApplicationsToInactiveJobs() {
        job.setActive(false);

        assertThrows(BadRequestException.class, () -> service.applyToJob(request(List.of()), jobSeeker));

        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void rejectsMissingScreeningAnswers() {
        assertThrows(BadRequestException.class, () -> service.applyToJob(request(List.of()), jobSeeker));

        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void persistsScreeningQuestionsAndAnswersWithTheApplication() {
        service.applyToJob(request(List.of("React and Vue", "Automated keyboard testing")), jobSeeker);

        var applicationCaptor = org.mockito.ArgumentCaptor.forClass(Application.class);
        verify(applicationRepository).save(applicationCaptor.capture());
        List<?> savedAnswers = applicationCaptor.getValue().getScreeningAnswers();
        assertEquals(2, savedAnswers.size());
        assertEquals("Which UI framework have you used?",
                applicationCaptor.getValue().getScreeningAnswers().get(0).getQuestion());
        assertEquals("React and Vue",
                applicationCaptor.getValue().getScreeningAnswers().get(0).getAnswer());
        verify(emailService).sendApplicationConfirmation(
                "candidate@example.test", "Candidate", "Frontend Engineer", "HireHub Test Co");
    }

    @Test
    void employerCanAddRejectedApplicantToSilverMedalistPool() {
        Employer employer = job.getEmployer();
        Application application = application(ApplicationStatus.REJECTED, employer);
        when(applicationRepository.findById(50L)).thenReturn(Optional.of(application));

        var response = service.updateSilverMedalist(50L, true, employer);

        assertTrue(application.isSilverMedalist());
        assertTrue(response.isSilverMedalist());
        verify(applicationRepository).save(application);
    }

    @Test
    void onlyRejectedApplicantsCanBeAddedToSilverMedalistPool() {
        Employer employer = job.getEmployer();
        Application application = application(ApplicationStatus.INTERVIEW, employer);
        when(applicationRepository.findById(50L)).thenReturn(Optional.of(application));

        assertThrows(BadRequestException.class,
                () -> service.updateSilverMedalist(50L, true, employer));

        assertFalse(application.isSilverMedalist());
        verify(applicationRepository, never()).save(application);
    }

    @Test
    void changingRejectedApplicationStatusRemovesItFromSilverMedalistPool() {
        Employer employer = job.getEmployer();
        Application application = application(ApplicationStatus.REJECTED, employer);
        application.setSilverMedalist(true);
        when(applicationRepository.findById(50L)).thenReturn(Optional.of(application));

        service.updateApplicationStatus(50L, ApplicationStatus.INTERVIEW, employer);

        assertFalse(application.isSilverMedalist());
    }

    @Test
    void rejectsSilverMedalistChangesFromAnotherEmployer() {
        Employer owner = job.getEmployer();
        Employer otherEmployer = new Employer();
        otherEmployer.setId(21L);
        Application application = application(ApplicationStatus.REJECTED, owner);
        when(applicationRepository.findById(50L)).thenReturn(Optional.of(application));

        assertThrows(com.job.exception.UnauthorizedException.class,
                () -> service.updateSilverMedalist(50L, true, otherEmployer));

        verify(applicationRepository, never()).save(application);
    }

    private Application application(ApplicationStatus status, Employer employer) {
        Application application = new Application();
        application.setId(50L);
        application.setJob(job);
        application.setJobSeeker(jobSeeker);
        application.setStatus(status);
        application.setTenant(job.getTenant());
        application.setAppliedAt(java.time.LocalDateTime.now());
        job.setEmployer(employer);
        return application;
    }

    private ApplicationRequestDTO request(List<String> answers) {
        ApplicationRequestDTO request = new ApplicationRequestDTO();
        request.setJobId(30L);
        request.setScreeningAnswers(answers);
        return request;
    }
}
