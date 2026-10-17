package com.job.repository;

import com.job.entity.Application;
import com.job.entity.ApplicationScreeningAnswer;
import com.job.entity.CompanyTenant;
import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.entity.JobSeeker;
import com.job.enums.ApplicationStatus;
import com.job.enums.CompensationPeriod;
import com.job.enums.JobType;
import com.job.enums.Role;
import com.job.enums.WorkMode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.hibernate.Session;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@DataJpaTest
@ActiveProfiles("test")
class JobAndApplicationPersistenceTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Test
    void publicJobListingExcludesInactiveJobsAndApplicationPersistsScreeningAnswers() {
        CompanyTenant tenant = new CompanyTenant("HireHub Test");
        entityManager.persist(tenant);
        Employer employer = new Employer();
        employer.setName("Test Employer");
        employer.setUsername("test-employer");
        employer.setPassword("encoded-password");
        employer.setEmail("employer@example.test");
        employer.setRole(Role.EMPLOYER);
        employer.setCompanyName("HireHub Test");
        employer.setIndustry("Technology");
        employer.setTenant(tenant);
        entityManager.persist(employer);

        Job activeJob = createJob(employer, "Active role", true);
        Job inactiveJob = createJob(employer, "Closed role", false);
        entityManager.persist(activeJob);
        entityManager.persist(inactiveJob);
        entityManager.flush();

        var publicJobs = jobRepository.findAllWithEmployer(PageRequest.of(0, 10));
        assertEquals(1, publicJobs.getTotalElements());
        assertEquals("Active role", publicJobs.getContent().get(0).getTitle());

        CompanyTenant otherTenant = new CompanyTenant("Other Company");
        entityManager.persist(otherTenant);
        Employer otherEmployer = new Employer();
        otherEmployer.setName("Other Employer");
        otherEmployer.setUsername("other-employer");
        otherEmployer.setPassword("encoded-password");
        otherEmployer.setEmail("other-employer@example.test");
        otherEmployer.setRole(Role.EMPLOYER);
        otherEmployer.setCompanyName("Other Company");
        otherEmployer.setIndustry("Technology");
        otherEmployer.setTenant(otherTenant);
        entityManager.persist(otherEmployer);
        entityManager.persist(createJob(otherEmployer, "Other active role", true));
        entityManager.flush();

        Session session = entityManager.getEntityManager().unwrap(Session.class);
        session.enableFilter("tenantFilter").setParameter("tenantId", tenant.getId());
        var tenantJobs = jobRepository.findAllWithEmployer(PageRequest.of(0, 10));
        assertEquals(1, tenantJobs.getTotalElements());
        assertEquals("Active role", tenantJobs.getContent().get(0).getTitle());
        session.disableFilter("tenantFilter");

        JobSeeker candidate = new JobSeeker();
        candidate.setName("Test Candidate");
        candidate.setUsername("test-candidate");
        candidate.setPassword("encoded-password");
        candidate.setEmail("candidate@example.test");
        candidate.setRole(Role.JOB_SEEKER);
        candidate.setDob(LocalDate.of(1995, 1, 1));
        candidate.setResumeUrl("https://files.example.test/resume.pdf");
        entityManager.persist(candidate);

        Application application = new Application();
        application.setJob(activeJob);
        application.setJobSeeker(candidate);
        application.setResumeUrl(candidate.getResumeUrl());
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());
        application.setScreeningAnswers(List.of(
                new ApplicationScreeningAnswer("Why this role?", "I enjoy building user interfaces.")));
        entityManager.persist(application);
        entityManager.flush();
        var statusCounts = applicationRepository.countByStatusForEmployer(employer);
        assertEquals(1, statusCounts.size());
        assertEquals(ApplicationStatus.PENDING, statusCounts.get(0).getStatus());
        assertEquals(1L, statusCounts.get(0).getApplicationCount());
        assertEquals(2L, jobRepository.countByEmployer(employer));

        Long applicationId = application.getId();
        entityManager.clear();

        Application persistedApplication = entityManager.find(Application.class, applicationId);
        assertEquals(1, persistedApplication.getScreeningAnswers().size());
        assertEquals("Why this role?", persistedApplication.getScreeningAnswers().get(0).getQuestion());
        assertEquals("I enjoy building user interfaces.",
                persistedApplication.getScreeningAnswers().get(0).getAnswer());
    }

    @Test
    void tenantFilterScopesEntityLoadsByPrimaryKey() {
        CompanyTenant tenant = new CompanyTenant("Primary tenant");
        CompanyTenant otherTenant = new CompanyTenant("Other tenant");
        entityManager.persist(tenant);
        entityManager.persist(otherTenant);

        Employer employer = createEmployer("primary-employer", "primary@example.test", tenant);
        Employer otherEmployer = createEmployer("other-employer", "other@example.test", otherTenant);
        entityManager.persist(employer);
        entityManager.persist(otherEmployer);

        Job ownJob = createJob(employer, "Primary job", true);
        Job otherJob = createJob(otherEmployer, "Other job", true);
        entityManager.persist(ownJob);
        entityManager.persist(otherJob);

        JobSeeker candidate = new JobSeeker();
        candidate.setName("Tenant Test Candidate");
        candidate.setUsername("tenant-test-candidate");
        candidate.setPassword("encoded-password");
        candidate.setEmail("tenant-candidate@example.test");
        candidate.setRole(Role.JOB_SEEKER);
        candidate.setDob(LocalDate.of(1995, 1, 1));
        candidate.setResumeUrl("https://files.example.test/resume.pdf");
        entityManager.persist(candidate);

        Application ownApplication = createApplication(ownJob, candidate);
        Application otherApplication = createApplication(otherJob, candidate);
        entityManager.persist(ownApplication);
        entityManager.persist(otherApplication);
        entityManager.flush();

        Long ownJobId = ownJob.getId();
        Long otherJobId = otherJob.getId();
        Long ownApplicationId = ownApplication.getId();
        Long otherApplicationId = otherApplication.getId();
        entityManager.clear();

        Session session = entityManager.getEntityManager().unwrap(Session.class);
        session.enableFilter("tenantFilter").setParameter("tenantId", tenant.getId());
        session.enableFilter("tenantLoadByKeyFilter").setParameter("tenantId", tenant.getId());
        try {
            assertNotNull(entityManager.find(Job.class, ownJobId));
            assertNull(entityManager.find(Job.class, otherJobId));
            assertNotNull(entityManager.find(Application.class, ownApplicationId));
            assertNull(entityManager.find(Application.class, otherApplicationId));
        } finally {
            session.disableFilter("tenantLoadByKeyFilter");
            session.disableFilter("tenantFilter");
        }
    }

    @Test
    void compensationBenchmarkAggregatesActiveMatchingListingsAndRespectsTenantFilter() {
        CompanyTenant tenant = new CompanyTenant("Benchmark tenant");
        CompanyTenant otherTenant = new CompanyTenant("Other benchmark tenant");
        entityManager.persist(tenant);
        entityManager.persist(otherTenant);
        Employer employer = createEmployer("benchmark-employer", "benchmark@example.test", tenant);
        Employer otherEmployer = createEmployer("other-benchmark-employer", "other-benchmark@example.test", otherTenant);
        entityManager.persist(employer);
        entityManager.persist(otherEmployer);

        persistCompensationJob(employer, "Software Engineer", true, "100.00", "120.00", "USD",
                CompensationPeriod.ANNUAL);
        persistCompensationJob(employer, "Senior Software Engineer", true, "120.00", "140.00", "USD",
                CompensationPeriod.ANNUAL);
        persistCompensationJob(employer, "Software Engineer", true, "200.00", "220.00", "USD",
                CompensationPeriod.ANNUAL);
        persistCompensationJob(otherEmployer, "Software Engineer", true, "300.00", "320.00", "USD",
                CompensationPeriod.ANNUAL);
        persistCompensationJob(otherEmployer, "Senior Software Engineer", true, "500.00", "520.00", "USD",
                CompensationPeriod.ANNUAL);
        persistCompensationJob(otherEmployer, "Software Engineer", true, "700.00", "720.00", "USD",
                CompensationPeriod.ANNUAL);
        persistCompensationJob(employer, "Software Engineer", false, "900.00", "920.00", "USD",
                CompensationPeriod.ANNUAL);
        entityManager.flush();

        JobRepository.CompensationBenchmarkAggregate publicBenchmark = jobRepository.findCompensationBenchmark(
                "software engineer", "remote", "USD", CompensationPeriod.ANNUAL);
        assertEquals(6L, publicBenchmark.getSampleCount());
        assertMoneyEquals("100.00", publicBenchmark.getMinimum());
        assertEquals(new BigDecimal("330.00"), new BigDecimal(
                publicBenchmark.getAverageRangeMidpoint().toString()).setScale(2));
        assertMoneyEquals("720.00", publicBenchmark.getMaximum());

        Session session = entityManager.getEntityManager().unwrap(Session.class);
        session.enableFilter("tenantFilter").setParameter("tenantId", tenant.getId());
        try {
            JobRepository.CompensationBenchmarkAggregate tenantBenchmark = jobRepository.findCompensationBenchmark(
                    "software engineer", "remote", "USD", CompensationPeriod.ANNUAL);
            assertEquals(3L, tenantBenchmark.getSampleCount());
            assertMoneyEquals("100.00", tenantBenchmark.getMinimum());
            assertEquals(new BigDecimal("150.00"), new BigDecimal(
                    tenantBenchmark.getAverageRangeMidpoint().toString()).setScale(2));
            assertMoneyEquals("220.00", tenantBenchmark.getMaximum());
        } finally {
            session.disableFilter("tenantFilter");
        }
    }

    private void persistCompensationJob(Employer employer, String title, boolean active, String minimum,
                                       String maximum, String currency, CompensationPeriod period) {
        Job job = createJob(employer, title, active);
        job.setCompensationMinimum(new BigDecimal(minimum));
        job.setCompensationMaximum(new BigDecimal(maximum));
        job.setCompensationCurrency(currency);
        job.setCompensationPeriod(period);
        entityManager.persist(job);
    }

    private void assertMoneyEquals(String expected, BigDecimal actual) {
        assertEquals(0, new BigDecimal(expected).compareTo(actual));
    }

    private Employer createEmployer(String username, String email, CompanyTenant tenant) {
        Employer employer = new Employer();
        employer.setName(username);
        employer.setUsername(username);
        employer.setPassword("encoded-password");
        employer.setEmail(email);
        employer.setRole(Role.EMPLOYER);
        employer.setCompanyName(tenant.getCompanyName());
        employer.setIndustry("Technology");
        employer.setTenant(tenant);
        return employer;
    }

    private Application createApplication(Job job, JobSeeker candidate) {
        Application application = new Application();
        application.setJob(job);
        application.setTenant(job.getTenant());
        application.setJobSeeker(candidate);
        application.setResumeUrl(candidate.getResumeUrl());
        application.setStatus(ApplicationStatus.PENDING);
        return application;
    }

    private Job createJob(Employer employer, String title, boolean active) {
        Job job = new Job();
        job.setTitle(title);
        job.setDescription("A test job description.");
        job.setLocation("Remote");
        job.setType(JobType.FULL_TIME);
        job.setWorkMode(WorkMode.REMOTE);
        job.setEmployer(employer);
        job.setTenant(employer.getTenant());
        job.setActive(active);
        job.setPostedAt(LocalDateTime.now());
        job.setScreeningQuestions(List.of("Why this role?"));
        return job;
    }
}
