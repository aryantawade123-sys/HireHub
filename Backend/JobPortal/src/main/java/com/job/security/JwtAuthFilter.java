package com.job.security;

import com.job.entity.Employer;
import com.job.entity.JobSeeker;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.exception.ErrorResponseWriter;
import com.job.repository.EmployerRepository;
import com.job.repository.JobSeekerRepository;
import com.job.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final ErrorResponseWriter errorResponseWriter;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No token found in Authorization header for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        log.debug("JWT token received for request: {}", request.getRequestURI());
        String token = authHeader.substring(7);

        String username;
        try {
            username = jwtUtil.extractUsername(token);
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT for request: {}", request.getRequestURI());
            errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED",
                    "Your session has expired, please log in again", request.getRequestURI());
            return;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT for request: {}", request.getRequestURI());
            errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN",
                    "Your session is invalid, please log in again", request.getRequestURI());
            return;
        }

        if (username == null || username.isBlank()) {
            log.warn("JWT has no subject for request: {}", request.getRequestURI());
            errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN",
                    "Your session is invalid, please log in again", request.getRequestURI());
            return;
        }

        log.debug("Username extracted from token: {}", username);

        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            log.warn("JWT subject does not identify an active user for request: {}", request.getRequestURI());
            errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN",
                    "Your session is invalid, please log in again", request.getRequestURI());
            return;
        }

        User user = optionalUser.get();
        User authenticatedUser = user;
        if (user.getRole() == Role.EMPLOYER) {
            Optional<Employer> employer = employerRepository.findById(user.getId());
            if (employer.isEmpty()) {
                log.error("Employer record missing for authenticated user id: {}", user.getId());
                errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN",
                        "Your session is invalid, please log in again", request.getRequestURI());
                return;
            }
            authenticatedUser = employer.get();
        } else if (user.getRole() == Role.JOB_SEEKER) {
            Optional<JobSeeker> jobSeeker = jobSeekerRepository.findById(user.getId());
            if (jobSeeker.isEmpty()) {
                log.error("Job seeker record missing for authenticated user id: {}", user.getId());
                errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN",
                        "Your session is invalid, please log in again", request.getRequestURI());
                return;
            }
            authenticatedUser = jobSeeker.get();
        }

        String roleName = "ROLE_" + user.getRole().name();
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(authenticatedUser, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        log.debug("Security context set for user: {} with role: {}", username, roleName);
        request.setAttribute("user", authenticatedUser);

        filterChain.doFilter(request, response);
    }
}
