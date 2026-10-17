package com.job.repository;

import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.enums.JobType;
import com.job.enums.CompensationPeriod;
import com.job.enums.WorkMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    interface CompensationBenchmarkAggregate {
        BigDecimal getMinimum();
        Number getAverageRangeMidpoint();
        BigDecimal getMaximum();
        Long getSampleCount();
    }

    List<Job> findByEmployer(Employer employer);

    long countByEmployer(Employer employer);

    @Query(value = "SELECT j FROM Job j JOIN FETCH j.employer WHERE j.active = true",
            countQuery = "SELECT COUNT(j) FROM Job j WHERE j.active = true")
    Page<Job> findAllWithEmployer(Pageable pageable);

    @Query(value = "SELECT j FROM Job j JOIN FETCH j.employer WHERE j.id = :id")
    Optional<Job> findByIdWithEmployer(@Param("id") Long id);

    @Query(value = "SELECT j FROM Job j JOIN FETCH j.employer WHERE j.active = true AND LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))",
            countQuery = "SELECT COUNT(j) FROM Job j WHERE j.active = true AND LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Job> findByTitleContainingIgnoreCaseWithEmployer(@Param("keyword") String keyword, Pageable pageable);

    @Query(value = "SELECT j FROM Job j JOIN FETCH j.employer WHERE j.active = true AND j.type = :type",
            countQuery = "SELECT COUNT(j) FROM Job j WHERE j.active = true AND j.type = :type")
    Page<Job> findByTypeWithEmployer(@Param("type") JobType type, Pageable pageable);

    @Query(value = "SELECT j FROM Job j JOIN FETCH j.employer WHERE j.active = true AND LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))",
            countQuery = "SELECT COUNT(j) FROM Job j WHERE j.active = true AND LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    Page<Job> findByLocationContainingIgnoreCaseWithEmployer(@Param("location") String location, Pageable pageable);

    @Query(value = "SELECT j FROM Job j JOIN FETCH j.employer WHERE j.active = true AND j.workMode = :workMode",
            countQuery = "SELECT COUNT(j) FROM Job j WHERE j.active = true AND j.workMode = :workMode")
    Page<Job> findByWorkModeWithEmployer(@Param("workMode") WorkMode workMode, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN FETCH j.employer WHERE j.employer = :employer")
    List<Job> findByEmployerWithEmployer(@Param("employer") Employer employer);

    @Query(value = "SELECT j FROM Job j JOIN FETCH j.employer WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:location IS NULL OR :location = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:type IS NULL OR j.type = :type) AND " +
            "(:workMode IS NULL OR j.workMode = :workMode) AND " +
            "(:active IS NULL OR j.active = :active)",
            countQuery = "SELECT COUNT(j) FROM Job j WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:location IS NULL OR :location = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:type IS NULL OR j.type = :type) AND " +
            "(:workMode IS NULL OR j.workMode = :workMode) AND " +
            "(:active IS NULL OR j.active = :active)")
    Page<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("type") JobType type,
            @Param("workMode") WorkMode workMode,
            @Param("active") Boolean active,
            Pageable pageable);

    @Query("""
            SELECT MIN(j.compensationMinimum) AS minimum,
                   AVG(j.compensationMinimum + j.compensationMaximum) / 2 AS averageRangeMidpoint,
                   MAX(j.compensationMaximum) AS maximum,
                   COUNT(j) AS sampleCount
            FROM Job j
            WHERE j.active = true
              AND j.compensationMinimum IS NOT NULL
              AND j.compensationMaximum IS NOT NULL
              AND j.compensationCurrency = :currency
              AND j.compensationPeriod = :period
              AND LOWER(j.title) LIKE LOWER(CONCAT('%', :titleKeyword, '%'))
              AND (:location IS NULL OR :location = ''
                   OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
            """)
    CompensationBenchmarkAggregate findCompensationBenchmark(
            @Param("titleKeyword") String titleKeyword,
            @Param("location") String location,
            @Param("currency") String currency,
            @Param("period") CompensationPeriod period);
}