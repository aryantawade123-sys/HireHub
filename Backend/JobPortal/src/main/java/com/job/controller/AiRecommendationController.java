package com.job.controller;

import com.job.dto.response.ResumeJobRecommendationsDTO;
import com.job.dto.request.JobDescriptionDraftRequest;
import com.job.dto.response.JobDescriptionDraftResponse;
import com.job.dto.request.RecruiterAgentRequest;
import com.job.dto.response.RecruiterAgentResponse;
import com.job.dto.request.MockInterviewRequest;
import com.job.dto.response.MockInterviewResponse;
import com.job.dto.request.SkillGapPlanRequest;
import com.job.dto.response.SkillGapPlanResponse;
import com.job.dto.request.SkillPathRequest;
import com.job.dto.response.SkillPathResponse;
import com.job.entity.Employer;
import com.job.service.impl.SkillGapRecommendationService;
import com.job.service.impl.SkillPathGraphService;
import com.job.service.impl.MockInterviewService;
import com.job.entity.User;
import com.job.service.impl.JobDescriptionDraftService;
import com.job.service.impl.RecruiterAgentService;
import com.job.service.impl.ResumeJobRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiRecommendationController {

    private final ResumeJobRecommendationService recommendationService;
    private final JobDescriptionDraftService jobDescriptionDraftService;
    private final RecruiterAgentService recruiterAgentService;
    private final MockInterviewService mockInterviewService;
    private final SkillGapRecommendationService skillGapRecommendationService;
    private final SkillPathGraphService skillPathGraphService;

    @PreAuthorize("hasRole('JOB_SEEKER')")
    @PostMapping(value = "/job-matches", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeJobRecommendationsDTO> recommendJobs(
            @RequestParam("resume") MultipartFile resume,
            @RequestAttribute("user") User user) {
        return ResponseEntity.ok(recommendationService.recommendJobs(resume));
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping("/job-description")
    public ResponseEntity<JobDescriptionDraftResponse> generateJobDescription(
            @RequestBody @Valid JobDescriptionDraftRequest request) {
        return ResponseEntity.ok(jobDescriptionDraftService.generateDraft(request));
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping("/recruiter-agent")
    public ResponseEntity<RecruiterAgentResponse> chatWithRecruiterAgent(
            @RequestBody @Valid RecruiterAgentRequest request,
            @RequestAttribute("user") User user) {
        return ResponseEntity.ok(recruiterAgentService.respond(request, (Employer) user));
    }

    @PreAuthorize("hasRole('JOB_SEEKER')")
    @PostMapping("/mock-interview")
    public ResponseEntity<MockInterviewResponse> runMockInterviewTurn(
            @RequestBody @Valid MockInterviewRequest request) {
        return ResponseEntity.ok(mockInterviewService.nextTurn(request));
    }

    @PreAuthorize("hasRole('JOB_SEEKER')")
    @PostMapping("/skill-gap-plan")
    public ResponseEntity<SkillGapPlanResponse> recommendSkillGapPlan(
            @RequestBody @Valid SkillGapPlanRequest request) {
        return ResponseEntity.ok(skillGapRecommendationService.recommend(request));
    }

    @PreAuthorize("hasRole('JOB_SEEKER')")
    @PostMapping("/skill-paths")
    public ResponseEntity<SkillPathResponse> mapSkillPaths(
            @RequestBody @Valid SkillPathRequest request) {
        return ResponseEntity.ok(skillPathGraphService.mapPaths(request));
    }
}
