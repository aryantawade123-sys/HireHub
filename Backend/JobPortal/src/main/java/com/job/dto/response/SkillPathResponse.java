package com.job.dto.response;

import java.util.List;

public record SkillPathResponse(List<SkillPath> paths) {
    public record SkillPath(
            String targetSkill,
            String startingSkill,
            List<String> path,
            boolean connectedToResumeSkill,
            String note
    ) {
    }
}
