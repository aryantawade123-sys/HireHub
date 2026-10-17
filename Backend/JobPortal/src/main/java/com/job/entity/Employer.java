package com.job.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.FilterDefs;
import org.hibernate.annotations.ParamDef;

import java.util.List;

@Entity
@FilterDefs({
        @FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class)),
        @FilterDef(name = "tenantLoadByKeyFilter",
                parameters = @ParamDef(name = "tenantId", type = Long.class), applyToLoadByKey = true)
})
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employer extends User {

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String industry;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private CompanyTenant tenant;

    @OneToMany(mappedBy = "employer", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> jobs;
}
