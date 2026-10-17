package com.job.service.impl;

import com.job.dto.request.SkillPathRequest;
import com.job.dto.response.SkillPathResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

@Service
public class SkillPathGraphService {

    private static final Map<String, String> CANONICAL_SKILLS = Map.ofEntries(
            Map.entry("js", "JavaScript"),
            Map.entry("javascript", "JavaScript"),
            Map.entry("ts", "TypeScript"),
            Map.entry("typescript", "TypeScript"),
            Map.entry("react", "React"),
            Map.entry("react.js", "React"),
            Map.entry("next.js", "Next.js"),
            Map.entry("nextjs", "Next.js"),
            Map.entry("redux", "Redux"),
            Map.entry("node", "Node.js"),
            Map.entry("node.js", "Node.js"),
            Map.entry("nodejs", "Node.js"),
            Map.entry("express", "Express"),
            Map.entry("express.js", "Express"),
            Map.entry("rest api", "REST APIs"),
            Map.entry("rest apis", "REST APIs"),
            Map.entry("html", "HTML"),
            Map.entry("css", "CSS"),
            Map.entry("accessibility", "Accessibility"),
            Map.entry("a11y", "Accessibility"),
            Map.entry("sql", "SQL"),
            Map.entry("postgres", "PostgreSQL"),
            Map.entry("postgresql", "PostgreSQL"),
            Map.entry("data analysis", "Data Analysis"),
            Map.entry("python", "Python"),
            Map.entry("django", "Django"),
            Map.entry("java", "Java"),
            Map.entry("spring boot", "Spring Boot"),
            Map.entry("git", "Git"),
            Map.entry("github actions", "GitHub Actions"),
            Map.entry("ci/cd", "CI/CD"),
            Map.entry("docker", "Docker"),
            Map.entry("kubernetes", "Kubernetes"),
            Map.entry("automated testing", "Automated Testing"),
            Map.entry("playwright", "Playwright"),
            Map.entry("junit", "JUnit")
    );

    private static final Map<String, List<String>> NEXT_SKILLS = Map.ofEntries(
            Map.entry("HTML", List.of("CSS", "JavaScript")),
            Map.entry("CSS", List.of("React", "Accessibility")),
            Map.entry("JavaScript", List.of("TypeScript", "React", "Node.js")),
            Map.entry("TypeScript", List.of("React", "Next.js")),
            Map.entry("React", List.of("Next.js", "Redux", "Accessibility", "Automated Testing")),
            Map.entry("Node.js", List.of("Express", "REST APIs")),
            Map.entry("Express", List.of("REST APIs")),
            Map.entry("SQL", List.of("PostgreSQL", "Data Analysis")),
            Map.entry("Python", List.of("Django", "Data Analysis")),
            Map.entry("Java", List.of("Spring Boot")),
            Map.entry("Git", List.of("CI/CD")),
            Map.entry("CI/CD", List.of("GitHub Actions")),
            Map.entry("Docker", List.of("Kubernetes")),
            Map.entry("Automated Testing", List.of("Playwright", "JUnit"))
    );

    public SkillPathResponse mapPaths(SkillPathRequest request) {
        List<String> sources = canonicalize(request.knownSkills());
        LinkedHashMap<String, String> targets = new LinkedHashMap<>();
        request.targetSkills().stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(String::trim)
                .forEach(skill -> targets.putIfAbsent(normalize(skill), canonical(skill)));

        List<SkillPathResponse.SkillPath> paths = targets.values().stream()
                .map(target -> findPath(sources, target))
                .toList();
        return new SkillPathResponse(paths);
    }

    private SkillPathResponse.SkillPath findPath(List<String> sources, String target) {
        String normalizedTarget = normalize(target);
        if (sources.stream().anyMatch(skill -> normalize(skill).equals(normalizedTarget))) {
            return new SkillPathResponse.SkillPath(
                    target, target, List.of(target), true, "This skill is already represented in the matched resume skills.");
        }

        List<String> shortestPath = null;
        for (String source : sources) {
            List<String> path = breadthFirstPath(source, target);
            if (path != null && (shortestPath == null || path.size() < shortestPath.size())) {
                shortestPath = path;
            }
        }
        if (shortestPath != null) {
            return new SkillPathResponse.SkillPath(
                    target, shortestPath.get(0), shortestPath, true,
                    "A connected route was found in HireHub's curated skill-dependency map.");
        }
        return new SkillPathResponse.SkillPath(
                target, null, List.of(target), false,
                "No connection to the matched skills exists in the current curated map; this is a direct target, not an inferred prerequisite.");
    }

    private List<String> breadthFirstPath(String source, String target) {
        Queue<List<String>> pending = new ArrayDeque<>();
        Set<String> visited = new HashSet<>();
        pending.add(List.of(source));
        visited.add(normalize(source));

        while (!pending.isEmpty()) {
            List<String> path = pending.remove();
            String current = path.get(path.size() - 1);
            if (normalize(current).equals(normalize(target))) {
                return path;
            }
            for (String next : NEXT_SKILLS.getOrDefault(current, List.of())) {
                if (visited.add(normalize(next))) {
                    List<String> extended = new ArrayList<>(path);
                    extended.add(next);
                    pending.add(List.copyOf(extended));
                }
            }
        }
        return null;
    }

    private List<String> canonicalize(List<String> skills) {
        if (skills == null) {
            return List.of();
        }
        LinkedHashSet<String> distinct = new LinkedHashSet<>();
        skills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(this::canonical)
                .forEach(distinct::add);
        return List.copyOf(distinct);
    }

    private String canonical(String skill) {
        String trimmed = skill.trim();
        return CANONICAL_SKILLS.getOrDefault(normalize(trimmed), trimmed);
    }

    private String normalize(String skill) {
        return skill.trim().toLowerCase(Locale.ROOT);
    }
}
