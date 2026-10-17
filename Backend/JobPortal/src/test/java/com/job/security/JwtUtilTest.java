package com.job.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtUtilTest {

    @Test
    void malformedTokenFailsValidationInsteadOfBecomingAnAnonymousRequest() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "a-test-secret-key-that-is-at-least-32-bytes-long");

        assertThrows(JwtException.class, () -> jwtUtil.extractUsername("not-a-valid-jwt"));
    }
}
