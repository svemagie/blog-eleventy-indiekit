/**
 * CV Data - Easy to update!
 *
 * To add a new experience: Add an entry to the `experience` array
 * To add a new project: Add an entry to the `projects` array
 * To update skills: Modify the `skills` object
 */

export default {
  // Last updated date - automatically set to build time
  lastUpdated: new Date().toISOString().split("T")[0],

  // Work Experience - Add new positions at the TOP of the array
  experience: [
    {
      title: "Middleware Engineer",
      company: "FGTB-ABVV",
      location: "Brussels",
      startDate: "2023-11",
      endDate: null, // null = present
      type: "full-time",
      description: "Technology Specialist focusing on IT infrastructure and application delivery",
      highlights: [
        "Strategic migration of Java applications from legacy IBM Datapowers and PureApp systems",
        "Containerized application deployment on VMware Linux and OpenShift Kubernetes clusters",
        "Mastering OpenShift, Kubernetes, and Docker technologies"
      ]
    },
    {
      title: "Solution Architect",
      company: "OSINTukraine.com",
      location: "Remote",
      startDate: "2022-02",
      endDate: null,
      type: "volunteer",
      description: "Open-source intelligence (OSINT) initiative for Ukraine conflict monitoring",
      highlights: [
        "Collection, archiving, translation, analysis and dissemination of critical information",
        "Monitoring Russian Telegram channels with filtering, categorization, and archiving",
        "Sub-projects: War crimes archive, Drones research, Location-related alerts system"
      ]
    },
    {
      title: "DevOps Training",
      company: "BeCode",
      location: "Brussels",
      startDate: "2021-09",
      endDate: "2022-03",
      type: "training",
      description: "7-month intensive DevOps specialization",
      highlights: [
        "Vagrant and Ansible infrastructure as code for WordPress, Nginx, Redis",
        "Docker Swarm cluster management",
        "GitLab CI/CD with SonarQube security audits",
        "Jenkins pipelines, Python basics, Prometheus/Grafana monitoring"
      ]
    },
    {
      title: "CTO",
      company: "DigitYser",
      location: "Brussels",
      startDate: "2018-10",
      endDate: "2020-03",
      type: "full-time",
      description: "Digital flagship of tech communities in Brussels",
      highlights: [
        "Hosting infrastructure and automation",
        "Integrations with digital marketing tools",
        "Technical Event Management: Livestreaming, sound, video, photos"
      ]
    },
    {
      title: "Solution Architect",
      company: "Armada.digital",
      location: "Brussels",
      startDate: "2016-05",
      endDate: "2021-12",
      type: "freelance",
      description: "Consultancy to amplify visibility of good causes",
      highlights: [
        "Custom communication and collaboration solutions",
        "Empowering individuals and ethical businesses"
      ]
    },
    {
      title: "FactChecking Platform",
      company: "Journalistes Solidaires",
      location: "Brussels",
      startDate: "2020-03",
      endDate: "2020-05",
      type: "volunteer",
      description: "Cloudron/Docker backend for factchecking workflow",
      highlights: [
        "WordPress with custom post types for COVID-19 disinformation monitoring"
      ]
    },
    {
      title: "Event Manager",
      company: "European Data Innovation Hub",
      location: "Brussels",
      startDate: "2019-02",
      endDate: "2020-03",
      type: "full-time",
      description: "Technical event organization and management"
    },
    {
      title: "Technical Advisor",
      company: "WomenPreneur-Initiative",
      location: "Brussels",
      startDate: "2019-01",
      endDate: "2020-01",
      type: "volunteer",
      description: "Technical guidance for women-focused entrepreneurship initiative"
    },
    {
      title: "Technical Advisor",
      company: "Promote Ukraine",
      location: "Brussels",
      startDate: "2019-01",
      endDate: "2020-01",
      type: "freelance",
      description: "Technical consulting for Ukraine advocacy organization"
    }
  ],

  // Current/Recent Projects - Add new projects at the TOP
  projects: [
    {
      name: "OSINT Intelligence Platform",
      url: "https://osintukraine.com",
      description: "Real-time monitoring and analysis platform for open-source intelligence",
      technologies: ["Docker", "Telegram API", "Python", "PostgreSQL"],
      status: "active"
    },
    {
      name: "Indiekit Cloudron Package",
      url: "https://github.com/rmdes/indiekit-cloudron",
      description: "Cloudron-packaged IndieWeb publishing server with Eleventy frontend",
      technologies: ["Node.js", "Eleventy", "Docker", "Cloudron"],
      status: "active"
    }
    // Add more projects here as needed
  ],

  // Skills - Organized by category
  skills: {
    containers: ["OpenShift", "Kubernetes", "Docker", "Docker Swarm"],
    automation: ["Ansible", "Vagrant", "GitLab CI/CD", "Jenkins", "GitHub Actions"],
    monitoring: ["Prometheus", "Grafana", "OpenTelemetry"],
    systems: ["Linux Administration", "System Administration", "VMware"],
    hosting: ["Cloudron", "On-Premise", "Cloud Infrastructure"],
    web: ["Nginx", "Redis", "WordPress", "TLS/SSL", "Eleventy"],
    security: ["SonarQube", "Information Assurance", "OSINT"],
    languages: ["Python", "Bash", "JavaScript", "Node.js"]
  },

  // Languages spoken
  languages: [
    { name: "Portuguese", level: "Native" },
    { name: "French", level: "Fluent" },
    { name: "English", level: "Fluent" },
    { name: "Spanish", level: "Conversational" }
  ],

  // Education
  education: [
    {
      degree: "DevOps Training",
      institution: "BeCode",
      location: "Brussels",
      year: "2021-2022",
      description: "7-month intensive DevOps specialization"
    },
    {
      degree: "Bachelor's in Management Information Technology",
      institution: "ISLA - Instituto Superior de Gestão e Tecnologia",
      location: "Portugal",
      year: "1998-2001",
      description: "Curso Técnico Superior Profissional de Informática de Gestão"
    }
  ],

  // Interests
  interests: [
    "Music Production (Ableton Live, Ableton Push 3)",
    "IndieWeb & Decentralized Tech",
    "Open Source Intelligence (OSINT)",
    "Democracy & Digital Rights"
  ]
};
