package com.job.repository;

import com.job.entity.CompanyTenant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyTenantRepository extends JpaRepository<CompanyTenant, Long> {
}
