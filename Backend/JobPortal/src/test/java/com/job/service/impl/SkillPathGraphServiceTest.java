package com.job.service.impl;

import com.job.dto.request.SkillPathRequest;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SkillPathGraphServiceTest {

    private final SkillPathGraphService service = new SkillPathGraphService();

    @Test
    void findsShortestCuratedPathFromResumeSkillToTargetSkill() {
        var response = service.mapPaths(new SkillPathRequest(
                List.of("JS", "HTML"),
                List.of("Next.js")));

        assertEquals(1, response.paths().size());
        assertEquals(List.of("JavaScript", "TypeScript", "Next.js"), response.paths().get(0).path());
        assertTrue(response.paths().get(0).connectedToResumeSkill());
    }

    @Test
    void choosesTheShortestPathAcrossAllMatchedResumeSkills() {
        var response = service.mapPaths(new SkillPathRequest(
                List.of("HTML", "JavaScript"),
                List.of("Next.js")));

        assertEquals(List.of("JavaScript", "TypeScript", "Next.js"), response.paths().get(0).path());
    }

    @Test
    void reportsAnExplicitDirectTargetWhenNoCuratedConnectionExists() {
        var response = service.mapPaths(new SkillPathRequest(
                List.of("Communication"),
                List.of("Kubernetes")));

        assertEquals(List.of("Kubernetes"), response.paths().get(0).path());
        assertFalse(response.paths().get(0).connectedToResumeSkill());
        assertNull(response.paths().get(0).startingSkill());
    }

    @Test
    void marksTargetsAlreadyPresentInMatchedSkills() {
        var response = service.mapPaths(new SkillPathRequest(
                List.of("React.js"),
                List.of("React")));

        assertEquals(List.of("React"), response.paths().get(0).path());
        assertTrue(response.paths().get(0).connectedToResumeSkill());
    }
}
