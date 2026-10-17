package com.job.entity;

import com.job.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@Filter(name = "tenantLoadByKeyFilter", condition = "tenant_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private CompanyTenant tenant;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "silver_medalist", nullable = false)
    private boolean silverMedalist;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private JobSeeker jobSeeker;

    private String resumeUrl;

    @ElementCollection
    @CollectionTable(name = "application_screening_answers", joinColumns = @JoinColumn(name = "application_id"))
    @OrderColumn(name = "answer_order")
    private List<ApplicationScreeningAnswer> screeningAnswers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.appliedAt = LocalDateTime.now();
        if (tenant == null && job != null) {
            tenant = job.getTenant();
        }
    }
}
