package com.job.security;

import com.job.entity.CompanyTenant;
import com.job.entity.Employer;
import com.job.exception.TenantContextException;
import jakarta.persistence.EntityManager;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TenantFilterInterceptorTest {

    private final EntityManager entityManager = mock(EntityManager.class);
    private final TenantFilterInterceptor interceptor = new TenantFilterInterceptor(entityManager);

    @Test
    void enablesAndDisablesTenantFilterForAuthenticatedEmployer() throws Exception {
        CompanyTenant tenant = new CompanyTenant("HireHub Test");
        tenant.setId(42L);
        Employer employer = new Employer();
        employer.setTenant(tenant);

        Session session = mock(Session.class);
        Filter filter = mock(Filter.class);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.setAttribute("user", employer);

        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.getEnabledFilter("tenantFilter")).thenReturn(null, filter);
        when(session.getEnabledFilter("tenantLoadByKeyFilter")).thenReturn(null, filter);
        when(session.enableFilter(org.mockito.ArgumentMatchers.anyString())).thenReturn(filter);
        when(session.isOpen()).thenReturn(true);

        interceptor.preHandle(request, response, new Object());
        interceptor.afterCompletion(request, response, new Object(), null);

        verify(filter, times(2)).setParameter("tenantId", 42L);
        verify(session).disableFilter("tenantFilter");
        verify(session).disableFilter("tenantLoadByKeyFilter");
        verify(entityManager, times(1)).unwrap(Session.class);
        org.junit.jupiter.api.Assertions.assertNull(request.getAttribute(TenantFilterInterceptor.TENANT_ID_ATTRIBUTE));
    }

    @Test
    void failsClosedWhenEmployerHasNoTenant() {
        Employer employer = new Employer();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute("user", employer);

        assertThrows(TenantContextException.class,
                () -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()));
        verify(entityManager, never()).unwrap(Session.class);
    }

    @Test
    void failsClosedWhenEmployerTenantHasNoPersistedId() {
        Employer employer = new Employer();
        employer.setTenant(new CompanyTenant("Unpersisted tenant"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute("user", employer);

        assertThrows(TenantContextException.class,
                () -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()));
        verify(entityManager, never()).unwrap(Session.class);
    }

    @Test
    void doesNotTouchHibernateSessionForNonEmployerRequests() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();

        interceptor.preHandle(request, new MockHttpServletResponse(), new Object());
        interceptor.afterCompletion(request, new MockHttpServletResponse(), new Object(), null);

        verify(entityManager, never()).unwrap(Session.class);
    }

    @Test
    void updatesAndDisablesAnAlreadyEnabledTenantFilter() throws Exception {
        CompanyTenant tenant = new CompanyTenant("HireHub Test");
        tenant.setId(42L);
        Employer employer = new Employer();
        employer.setTenant(tenant);

        Session session = mock(Session.class);
        Filter filter = mock(Filter.class);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute("user", employer);

        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.getEnabledFilter("tenantFilter")).thenReturn(filter);
        when(session.getEnabledFilter("tenantLoadByKeyFilter")).thenReturn(filter);
        when(session.isOpen()).thenReturn(true);

        interceptor.preHandle(request, new MockHttpServletResponse(), new Object());
        interceptor.afterCompletion(request, new MockHttpServletResponse(), new Object(), null);

        verify(filter, times(2)).setParameter("tenantId", 42L);
        verify(session).disableFilter("tenantFilter");
        verify(session).disableFilter("tenantLoadByKeyFilter");
    }
}
