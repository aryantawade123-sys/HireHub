package com.job.security;

import com.job.entity.Employer;
import com.job.exception.TenantContextException;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantFilterInterceptor implements HandlerInterceptor {

    public static final String TENANT_ID_ATTRIBUTE = TenantFilterInterceptor.class.getName() + ".tenantId";
    private static final String[] HIBERNATE_FILTER_NAMES = {"tenantFilter", "tenantLoadByKeyFilter"};
    private static final String HIBERNATE_SESSION_ATTRIBUTE = TenantFilterInterceptor.class.getName() + ".session";

    private final EntityManager entityManager;

    public TenantFilterInterceptor(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Object authenticatedUser = request.getAttribute("user");
        if (!(authenticatedUser instanceof Employer employer)) {
            return true;
        }

        if (employer.getTenant() == null || employer.getTenant().getId() == null) {
            throw new TenantContextException("The employer account is not assigned to a company tenant.");
        }

        Long tenantId = employer.getTenant().getId();
        Session session = entityManager.unwrap(Session.class);
        try {
            for (String filterName : HIBERNATE_FILTER_NAMES) {
                Filter existingFilter = session.getEnabledFilter(filterName);
                if (existingFilter != null) {
                    existingFilter.setParameter("tenantId", tenantId);
                } else {
                    session.enableFilter(filterName).setParameter("tenantId", tenantId);
                }
            }
        } catch (RuntimeException exception) {
            for (String filterName : HIBERNATE_FILTER_NAMES) {
                if (session.getEnabledFilter(filterName) != null) {
                    session.disableFilter(filterName);
                }
            }
            throw exception;
        }
        request.setAttribute(HIBERNATE_SESSION_ATTRIBUTE, session);
        request.setAttribute(TENANT_ID_ATTRIBUTE, tenantId);
        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception) {
        Object sessionAttribute = request.getAttribute(HIBERNATE_SESSION_ATTRIBUTE);
        try {
            if (sessionAttribute instanceof Session session && session.isOpen()) {
                for (String filterName : HIBERNATE_FILTER_NAMES) {
                    if (session.getEnabledFilter(filterName) != null) {
                        session.disableFilter(filterName);
                    }
                }
            }
        } finally {
            request.removeAttribute(TENANT_ID_ATTRIBUTE);
            request.removeAttribute(HIBERNATE_SESSION_ATTRIBUTE);
        }
    }
}
