package com.job.config;

import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.enums.JobType;
import com.job.enums.Role;
import com.job.enums.WorkMode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) {

        Long jobCount = entityManager
                .createQuery("SELECT COUNT(j) FROM Job j", Long.class)
                .getSingleResult();

        // Don't create duplicate demo data
        if (jobCount > 0) {
            System.out.println("HireHub demo data already exists. Skipping seeder.");
            return;
        }

        System.out.println("Creating HireHub demo jobs...");

        List<Employer> employers = createEmployers();

        String[] titles = {
                "Java Backend Developer",
                "Spring Boot Developer",
                "Java Software Engineer",
                "Backend Developer",
                "Full Stack Developer",
                "React Developer",
                "Frontend Developer",
                "Software Engineer",
                "Node.js Developer",
                "Python Developer",
                "DevOps Engineer",
                "Cloud Engineer",
                "QA Engineer",
                "Software Testing Engineer",
                "Data Analyst",
                "Business Analyst",
                "Junior Software Developer",
                "Graduate Software Engineer",
                "Java Developer Intern",
                "Software Engineer Intern"
        };

        String[] locations = {
                "Mumbai",
                "Pune",
                "Bengaluru",
                "Hyderabad",
                "Delhi",
                "Noida",
                "Chennai",
                "Ahmedabad",
                "Kolkata",
                "Remote"
        };

        JobType[] jobTypes = {
                JobType.FULL_TIME,
                JobType.FULL_TIME,
                JobType.FULL_TIME,
                JobType.FULL_TIME,
                JobType.CONTRACT,
                JobType.INTERNSHIP,
                JobType.PART_TIME
        };

        WorkMode[] workModes = {
                WorkMode.ONSITE,
                WorkMode.HYBRID,
                WorkMode.REMOTE
        };

        for (int i = 0; i < 150; i++) {

            String title = titles[i % titles.length];
            String location = locations[i % locations.length];

            Job job = new Job();

            job.setTitle(title);

            job.setDescription(
                    "We are looking for a motivated " + title
                            + " to join our growing technology team. "
                            + "The candidate will work on real-world software "
                            + "projects, collaborate with experienced engineers, "
                            + "write clean and maintainable code, and contribute "
                            + "to the complete software development lifecycle."
            );

            job.setLocation(location);

            job.setType(jobTypes[i % jobTypes.length]);

            job.setWorkMode(workModes[i % workModes.length]);

            // Spread jobs across the last 90 days
            job.setPostedAt(
                    LocalDateTime.now()
                            .minusDays(i % 90)
                            .minusHours(i % 12)
            );

            job.setActive(true);

            // Assign different employers
            job.setEmployer(employers.get(i % employers.size()));

            job.setResponsibilities(
                    createResponsibilities(title)
            );

            job.setRequiredSkills(
                    createSkills(title)
            );

            job.setScreeningQuestions(
                    List.of(
                            "Why are you interested in this role?",
                            "Describe a project you have worked on.",
                            "How comfortable are you working with a development team?"
                    )
            );

            entityManager.persist(job);
        }

        System.out.println("======================================");
        System.out.println("HireHub demo data created successfully!");
        System.out.println("150 jobs added.");
        System.out.println("======================================");
    }

    private List<Employer> createEmployers() {

        String[][] companies = {
                {"NovaStack Labs", "Software Development"},
                {"ByteBridge Technologies", "Information Technology"},
                {"CloudNest Solutions", "Cloud Computing"},
                {"CodeOrbit Systems", "Software Development"},
                {"PixelForge Labs", "Technology"},
                {"DevSphere Technologies", "Information Technology"},
                {"NextGen Digital", "Digital Services"},
                {"DataWave Analytics", "Data & Analytics"},
                {"TechNova Solutions", "IT Services"},
                {"AppCraft Technologies", "Software Development"},
                {"CyberGrid Systems", "Cybersecurity"},
                {"ScaleUp Labs", "Technology"},
                {"InnoByte Technologies", "Information Technology"},
                {"BluePeak Software", "Software Development"},
                {"FutureStack Technologies", "Cloud & Software"}
        };

        List<Employer> employers = new ArrayList<>();

        for (int i = 0; i < companies.length; i++) {

            Employer employer = new Employer();

            employer.setName("Hiring Team " + (i + 1));

            employer.setUsername(
                    "demo_employer_" + (i + 1)
            );

            employer.setEmail(
                    "employer" + (i + 1) + "@hirehub.demo"
            );

            employer.setPassword(
                    passwordEncoder.encode("Demo@12345")
            );

            employer.setProfilePictureUrl(null);

            employer.setRole(Role.EMPLOYER);

            employer.setCompanyName(companies[i][0]);

            employer.setIndustry(companies[i][1]);

            employer.setJobs(new ArrayList<>());

            entityManager.persist(employer);

            employers.add(employer);
        }

        return employers;
    }

    private List<String> createResponsibilities(String title) {

        return List.of(
                "Develop and maintain scalable software applications.",
                "Write clean, readable and maintainable code.",
                "Work with team members to design and implement features.",
                "Debug issues and improve application performance.",
                "Participate in code reviews and technical discussions."
        );
    }

    private List<String> createSkills(String title) {

        String lowerTitle = title.toLowerCase();

        if (lowerTitle.contains("java")
                || lowerTitle.contains("spring")) {

            return List.of(
                    "Java",
                    "Spring Boot",
                    "REST APIs",
                    "SQL",
                    "Git",
                    "OOP"
            );
        }

        if (lowerTitle.contains("react")
                || lowerTitle.contains("frontend")) {

            return List.of(
                    "React.js",
                    "JavaScript",
                    "HTML",
                    "CSS",
                    "Git",
                    "REST APIs"
            );
        }

        if (lowerTitle.contains("node")) {

            return List.of(
                    "Node.js",
                    "Express.js",
                    "JavaScript",
                    "MongoDB",
                    "REST APIs",
                    "Git"
            );
        }

        if (lowerTitle.contains("python")) {

            return List.of(
                    "Python",
                    "Django",
                    "REST APIs",
                    "SQL",
                    "Git",
                    "OOP"
            );
        }

        if (lowerTitle.contains("devops")
                || lowerTitle.contains("cloud")) {

            return List.of(
                    "AWS",
                    "Docker",
                    "Linux",
                    "CI/CD",
                    "Git",
                    "Kubernetes"
            );
        }

        if (lowerTitle.contains("qa")
                || lowerTitle.contains("testing")) {

            return List.of(
                    "Manual Testing",
                    "Automation Testing",
                    "Selenium",
                    "API Testing",
                    "SQL",
                    "Jira"
            );
        }

        if (lowerTitle.contains("data")) {

            return List.of(
                    "Python",
                    "SQL",
                    "Excel",
                    "Power BI",
                    "Data Analysis",
                    "Statistics"
            );
        }

        return List.of(
                "Java",
                "SQL",
                "Git",
                "REST APIs",
                "Problem Solving"
        );
    }
}