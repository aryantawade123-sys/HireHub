package com.job.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.response.PageResponseDTO;
import com.job.exception.BadRequestException;
import com.job.service.interfaces.IJobService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ResumeJobRecommendationServiceTest {

    private final IJobService jobService = mock(IJobService.class);
    private final ResumeJobRecommendationService service =
            new ResumeJobRecommendationService(jobService, new ObjectMapper(), "", "test-model");

    @Test
    void validResumeWithNoActiveJobsReturnsAnEmptyShortlist() {
        when(jobService.searchJobs(null, null, null, null, true, 0, 50))
                .thenReturn(new PageResponseDTO<>(List.of(), 0, 0, 0, 50, true));

        var result = service.recommendJobs(validPdf());

        assertEquals(0, result.jobsAnalyzed());
        assertEquals(0, result.recommendations().size());
        verify(jobService).searchJobs(null, null, null, null, true, 0, 50);
    }

    @Test
    void invalidPdfIsRejectedBeforeSearchingJobs() {
        MockMultipartFile invalidPdf = new MockMultipartFile(
                "resume", "resume.pdf", "application/pdf", "not a PDF".getBytes());

        assertThrows(BadRequestException.class, () -> service.recommendJobs(invalidPdf));
        verifyNoInteractions(jobService);
    }

    private MockMultipartFile validPdf() {
        return new MockMultipartFile(
                "resume", "resume.pdf", "application/pdf", new byte[]{'%', 'P', 'D', 'F', '-'});
    }
}
