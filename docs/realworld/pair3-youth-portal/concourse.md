# Concourse Tech Inc — Proposal for RFP 260000000387 (free-form: the bidder did not use the State template)



Concourse Tech Inc. 169 Madison Ave, Suite 15520 

New York, NY 10016 

sales@concoursetech.com | (646) 305-9964 

Technical Proposal 

Youth Employment Permit Portal 

# State of Michigan 

Department of Technology, Management and Budget – Procurement 

RFP No. 260000000387 

## Executive Summary 

Concourse Tech is pleased to submit this technical proposal to deliver a comprehensive Youth Employment Permit Portal (YEPP) for the State of Michigan's Department of Labor and Economic Opportunity. Our proposed solution will transform Michigan's youth work permit process from a paperbased system to a modern, secure, cloud-based platform that serves minors, employers, guardians, school staff, and state administrators. 

Our approach centers on delivering a fully compliant, accessible, and scalable Software-as-a-Service (SaaS) platform that meets all federal and state youth employment regulations while providing an intuitive user experience across all devices. The solution will integrate seamlessly with Michigan's MiLogin identity management system, provide real-time compliance monitoring, and deliver the transparency and efficiency required for effective program administration. 

### Key Solution Highlights 

- Proven Government Technology Experience: Successfully delivered technology solutions to state labor departments, health benefit exchanges, and county agencies nationwide, including the New York Department of Labor and Maryland Health Benefit Exchange 

- Comprehensive Compliance: FedRAMP-authorized or SOC 2 Type II hosting with full FISMA/NIST 800-53 compliance, WCAG 2.1 Level AA accessibility, and support for the State's Security Accreditation Process 

- Modern Architecture: Cloud-native SaaS platform with 99.98% uptime guarantee, mobile-responsive design, and unlimited scalability as Michigan's youth workforce grows 

- Seamless Integration: Purpose-built MiLogin SSO integration supporting SAML 2.0 and OpenID Connect protocols with comprehensive API access for future enterprise integrations 

- Realistic Timeline: Proven 40-week implementation methodology achieving production go-live by September 30, 2026, with comprehensive training and 180-day warranty period 

This technical proposal demonstrates our deep understanding of Michigan's requirements, our commitment to security and compliance, and our proven ability to deliver enterprise-grade government technology solutions on time and within scope. 

## Understanding of Requirements 

### Current Challenge 

Michigan's Youth Employment Standards Act (Public Act 90 of 1978) requires the Wage and Hour Division to establish a statewide, no-cost work permit system for youth employment. Currently, the permit processing duties handled by local school districts rely on a paper-based method that creates inefficiencies, inconsistencies, and challenges in compliance monitoring. The State requires a centralized electronic system that improves efficiency, standardizes enforcement, and upholds legal protections for working minors across Michigan. 

### Program Scale and Impact 

This system will serve Michigan's entire youth workforce ecosystem, including thousands of minors seeking employment, employers across all industries, parents and guardians, school administrative staff at hundreds of school districts, and State of Michigan personnel responsible for program administration and enforcement. The solution must accommodate this diverse user base while maintaining strict compliance with both federal Fair Labor Standards Act (FLSA) requirements and Michigan-specific youth employment regulations. 

### Critical Success Factors 

We recognize that success requires more than technology implementation. The solution must provide an intuitive experience that encourages adoption among young workers and busy employers, maintain rigorous security and privacy protections for minor-related data, deliver real-time visibility for state enforcement personnel, ensure accessibility for all users regardless of ability or device, scale seamlessly as program participation grows, and integrate with Michigan's enterprise identity management infrastructure. 

### Our Commitment 

Concourse Tech commits to delivering a solution that transforms Michigan's youth employment permit program while ensuring zero disruption to current operations. We will work collaboratively with the Wage and Hour Division, school districts, and stakeholder groups throughout the implementation to ensure the final system meets the real-world needs of all user communities. 

## Proposed Solution Overview 

### Solution Architecture 

Concourse proposes a modern, cloud-native Software-as-a-Service (SaaS) platform purpose-built for Michigan's youth employment permit program. The solution will be hosted on State-approved cloud infrastructure (AWS or Google Cloud Platform) with FedRAMP authorization or equivalent SOC 2 Type II certification, ensuring the highest levels of security, availability, and compliance. 

The platform architecture features a responsive web application accessible via modern browsers on desktop, tablet, and mobile devices, a secure RESTful API layer supporting integrations with MiLogin and future enterprise systems, a scalable PostgreSQL database 

with encryption at rest and in transit, comprehensive audit logging with immutable records of all system activity, and automated backup and disaster recovery capabilities meeting 24-hour RPO and RTO objectives. 

### Core Platform Capabilities 

## Multi-Role Access and Identity Management 

The system will support five distinct user roles with customized workflows and permissions: minors applying for work permits, parents/guardians providing consent and oversight, employers requesting to hire minors and verifying permits, school administrative staff processing applications and maintaining records, and state staff with comprehensive administrative and enforcement capabilities. All users will authenticate through Michigan's MiLogin system using SAML 2.0 or OpenID Connect protocols, providing single sign-on convenience with enterprise-grade security. 

## Digital Permit Application and Approval Workflow 

The platform will digitize and automate the entire permit lifecycle. Minors and guardians will complete applications online with intelligent validation ensuring all required information is provided. School staff will review applications with system-guided compliance checks against federal and state regulations. Employers will electronically verify employment offers and working conditions. The system will automatically issue digital permits upon approval with verifiable QR codes and secure online verification for employers and enforcement personnel. All workflow steps will include automated notifications via email and optional SMS to keep all parties informed of application status. 

## Compliance Engine 

A rules-based compliance engine will be the heart of the system, encoding all applicable federal FLSA requirements and Michigan Youth Employment Standards Act provisions. The engine will provide real-time validation of work hours, industry restrictions, and age-based limitations, automatically flag applications requiring special review or approval, generate alerts for non-compliant situations, and maintain an audit trail of all compliance decisions. This systematic approach will ensure consistent enforcement of youth employment protections across Michigan. 

## Public Employer Directory 

The solution will include a public-facing, searchable directory of validated employers approved to hire minors. Users will be able to search and filter by industry type, geographic location using proximity-based radius search, employer name, and approval status. This transparency will help minors and families make informed employment decisions while encouraging employer compliance with program requirements. 

## Real-Time Dashboards and Analytics 

State program administrators will have access to comprehensive dashboards providing real-time visibility into permit application volumes and trends, approval rates and processing times, employer compliance metrics, geographic distribution of youth employment, and potential compliance concerns requiring investigation. All reports will be exportable in PDF, Excel, and CSV formats to support data-driven policymaking and program evaluation. 

## Mobile-Responsive Design 

Recognizing that many minors and families will access the system via smartphones, the entire platform will be built with mobile-first responsive design principles. The interface will automatically adapt to screen sizes from large desktop monitors to small smartphones, ensuring full functionality regardless of device. This approach will maximize accessibility and adoption across Michigan's diverse communities. 

### Integration Strategy 

The platform will integrate with Michigan's enterprise systems through well-documented, secure APIs. The primary integration will be with MiLogin for identity federation, implementing both SAML 2.0 and OpenID Connect protocols to support the State's authentication standards. The solution will expose RESTful JSON APIs allowing external State systems to retrieve permit data, receive real-time webhooks for system events, and query employer verification status. All API communications will be encrypted, authenticated, and logged to maintain security and audit compliance. 

### Why This Approach Succeeds 

- User-Centric Design: Built around actual user workflows for minors, employers, and administrators, not generic case management templates 

- Compliance-First: Regulations encoded in the system logic ensure consistent enforcement without requiring staff to be regulatory experts 

- Cloud-Native: Modern SaaS architecture provides unlimited scalability, automatic updates, and enterprise-grade reliability 

- Accessibility: WCAG 2.1 Level AA compliance ensures all Michigan residents can access the system regardless of ability 

- Future-Ready: Open API architecture supports integration with future State initiatives and evolving program requirements 

## Technical Approach and Architecture 

### Technology Stack 

Our solution leverages modern, enterprise-grade technologies selected for security, scalability, and long-term maintainability. The frontend will be built using React.js with Next.js framework for server-side rendering and optimal performance, TypeScript for type safety and code quality, Material-UI or similar component library aligned with State of Michigan Application/Site standards, and responsive CSS ensuring compatibility with all required browsers (Chrome, Edge, Firefox, Safari). 

The backend will utilize Node.js or Python for API services with comprehensive error handling and logging, PostgreSQL database with row-level security and encryption, Redis for caching and session management, and a message queue system for asynchronous processing and notifications. 

Infrastructure will be deployed on State-approved cloud platform (AWS GovCloud or Google Cloud Platform) with FedRAMP authorization, Docker containers managed by Kubernetes for scalability and resilience, automated CI/CD pipeline for secure deployments, and comprehensive monitoring with CloudWatch, Datadog, or equivalent. 

### Security Architecture 

## Compliance Framework 

The solution will be designed and operated in full compliance with FISMA Moderate baseline using NIST Special Publication 800-53 security controls, FedRAMP authorization (if using third-party hosting provider) or SOC 2 Type II audit, NIST 800-171 for protecting controlled unclassified information, and all applicable State of Michigan IT Policies, Standards, and Procedures. 

## Data Protection 

All State data will remain within the United States or its territories at all times, with no offshore access permitted. Data will be encrypted in transit using TLS 1.3 with FIPS 140-2 validated cryptographic modules and at rest using AES-256 encryption. Database-level encryption will be implemented with role-based access controls limiting data access to authorized personnel only. All sensitive fields (Social Security Numbers, dates of birth, addresses) will have additional field-level encryption. 

## Access Controls 

The system will implement least-privilege access with role-based permissions, multifactor authentication for privileged administrative accounts per NIST SP 800-63B guidance, integration with Michigan's MiLogin for federated identity management, automatic session timeout and account lockout policies, and comprehensive audit logging of all access attempts and data modifications with immutable audit trails stored separately from application data. 

## Network Security 

The infrastructure will feature network segmentation with separate tiers for web, application, and database layers, web application firewall (WAF) protecting against OWASP Top 10 vulnerabilities, DDoS protection and rate limiting, intrusion detection and prevention systems, and regular vulnerability scanning and penetration testing. 

## Application Security 

We will implement secure development practices including quarterly Dynamic Application Security Testing (DAST) with authenticated scanning, Static Application Security Testing (SAST) for all source code, Software Composition Analysis (SCA) for third-party and opensource components, security code reviews for all new features, and adherence to OWASP Secure Coding Practices. 

### Accessibility Implementation 

The solution will meet or exceed WCAG 2.1 Level AA standards across all functionality. Our approach includes semantic HTML5 markup with proper ARIA labels and roles, keyboard navigation support for all interactive elements, screen reader compatibility tested with JAWS, NVDA, and VoiceOver, sufficient color contrast ratios (minimum 4.5:1 for normal text), text resize support up to 200% without loss of functionality, and alternative text for all images and visual content. 

We will provide a completed Product Accessibility Template (PAT) documenting conformance with each WCAG 2.1 Level AA success criterion, including detailed explanations for any criteria marked as "Not Applicable." The PAT will cover all user roles and functionality, including user-facing features, administrative interfaces, and reporting capabilities. Third-party accessibility audits will be conducted prior to go-live to validate compliance. 

### Disaster Recovery and Business Continuity 

The solution will maintain comprehensive disaster recovery capabilities meeting the RFP's requirements of 24-hour Recovery Point Objective (RPO) and 24-hour Recovery Time Objective (RTO). Our approach includes daily automated backups with point-in-time recovery capability, weekly offline backups stored in geographically separate regions, continuous replication to secondary availability zone, documented disaster recovery procedures tested annually at minimum, and 99.98% uptime service level agreement with automated failover. 

All backup data will be encrypted and stored exclusively within the United States. We will provide comprehensive Disaster Recovery Plan documentation including backup schedules and retention policies, recovery procedures for various failure scenarios, contact information and escalation procedures, testing schedule and results, and incident response protocols. 

### API Architecture 

The solution will expose well-documented RESTful JSON APIs enabling Michigan to integrate the permit system with other enterprise applications. API capabilities will include querying permit application status and history, retrieving employer verification information, receiving real-time webhooks for application events (submitted, approved, denied, expired), accessing reporting data for external analytics platforms, and managing user accounts and permissions (administrative APIs). 

All APIs will implement OAuth 2.0 authentication, rate limiting to prevent abuse, comprehensive request/response logging, versioning to support backward compatibility, and OpenAPI 3.0 documentation with interactive testing interface. 

### Technical Excellence Commitments 

- Browser Compatibility: Tested and supported on the two most recent major versions of Chrome, Edge, Firefox, and Safari 

- Performance: Page load times under 2 seconds for 98% of transactions with visual confirmation 

- Scalability: Architecture supports unlimited user growth without performance degradation 

- Maintainability: Clean, documented code following industry best practices for long-term State ownership 

- Updates: Regular security patches and feature enhancements with zerodowntime deployments 

Security Accreditation and Compliance 

### State Security Accreditation Process Support 

Concourse commits to full participation in Michigan's Security Accreditation Process at no additional charge to the State. We will work collaboratively with DTMB's security team to develop and maintain all required documentation in the State's automated governance, risk, and compliance (GRC) platform. 

## System Security Plan (SSP) Development 

We will lead the development of a comprehensive System Security Plan documenting all security controls implemented for the YEPP solution. The SSP will map our security implementation to NIST SP 800-53 controls using the State's required control baseline and minimum values. We will submit evidence within two weeks of State requests to validate our security controls. The SSP will be maintained as a living document throughout the contract term, updated promptly for any material changes to the system. 

## Annual Control Re-Assessment 

We will support annual re-assessment of all security controls to maintain the system's Authority to Operate (ATO). This includes providing updated evidence of control effectiveness, documenting any changes to security architecture or procedures, participating in assessment interviews and technical reviews, and remediating any findings according to State timelines. 

## Plan of Action and Milestones (POAM) 

For any security findings identified during assessments, we will create or assist with Stateapproved POAMs at no additional charge. Each POAM will include detailed remediation plans with specific timelines, identification of responsible personnel, evidence of completion upon remediation, and compensating controls where immediate remediation is not feasible. We commit to remediating high-risk findings within 30 days and medium-risk findings within 90 days, with all remediation evidence provided to the State for verification. 

## Risk Acceptance Process 

We understand that only the State may formally accept risk. For any residual risks that cannot be fully mitigated, we will provide detailed risk documentation including likelihood and impact analysis, compensating controls in place, and recommendations for risk treatment. The State will retain final authority over all risk acceptance decisions. 

### Application Security Testing Program 

## Dynamic Application Security Testing (DAST) 

We will perform authenticated Dynamic Application Security Testing quarterly and for each major release using State-approved scanning tools (such as Qualys, Tenable, or equivalent PCI-approved tools). Scans will be conducted in a non-production environment with verifiable matching source code and infrastructure configurations. We will provide vulnerability assessment reports within 5 business days of scan completion, including risk ratings for all identified vulnerabilities, detailed remediation recommendations with estimated timelines, and evidence of remediation for previously identified issues. 

## Static Application Security Testing (SAST) 

All source code will undergo static analysis scanning quarterly and for each release. We will use industry-leading SAST tools to identify potential security vulnerabilities in the codebase before deployment. Scanning will cover all custom code including backend APIs, frontend components, database queries and stored procedures, configuration files, and third-party integration code. Critical and high-severity findings will be remediated prior to production deployment. 

## Software Composition Analysis (SCA) 

We will maintain a comprehensive Software Bill of Materials (SBOM) documenting all thirdparty and open-source components. SCA scanning will be performed quarterly and whenever components are updated to identify known vulnerabilities in dependencies. We will monitor security advisories from component vendors and the National Vulnerability Database (NVD) to ensure prompt patching of newly discovered vulnerabilities. The SBOM will be provided to the State in a mutually agreed format, updated quarterly and at least 30 days prior to adding new components. 

## Penetration Testing 

If required by the State based on data classification or regulatory requirements, we will support penetration testing by qualified third-party security firms. We will provide necessary access and documentation, coordinate testing windows to minimize impact, and remediate findings according to agreed timelines. 

### Infrastructure Vulnerability Management 

Our infrastructure and applications will be scanned monthly using approved vulnerability scanning tools (Qualys, Tenable, or equivalent). Scan assessments will be provided to the State in the specified format for tracking remediation progress. Vulnerabilities will be remediated according to State PSP timelines: Critical vulnerabilities within 15 days, high vulnerabilities within 30 days, medium vulnerabilities within 90 days, and low vulnerabilities within 180 days. 

### Breach Notification and Incident Response 

In the unlikely event of any security incident affecting State data, we commit to notifying the State within 24 hours of becoming aware of the incident. Our incident response will include immediate investigation with all relevant logs and evidence provided to the State, containment actions to prevent further exposure, detailed incident reports documenting timeline, scope, and root cause, notification to affected individuals if required (with State approval), provision of credit monitoring services if Personal Data is compromised, and payment of all costs associated with breach response and notification. 

Within 10 calendar days of any incident, we will provide a detailed prevention plan describing measures to prevent recurrence. We will cooperate fully with any State or law enforcement investigations. 

### Security Compliance Guarantee 

Concourse guarantees full compliance with all State security requirements throughout the contract term. Any failure to maintain required compliance will be deemed a material breach, and we will remediate at our expense. We maintain comprehensive cybersecurity insurance to protect the State's interests. 

## Implementation Methodology and Timeline 

### Project Management Approach 

Concourse will utilize a hybrid project management methodology combining elements of the State's SUITE (State Unified Information Technology Environment) methodology with proven Agile delivery practices. This approach provides the structure and documentation required for government projects while enabling flexibility and iterative delivery. 

Our implementation will be organized into eight major phases spanning 40 weeks from contract execution to production go-live on September 30, 2026. Each phase will have clearly defined deliverables, acceptance criteria, and State review periods. We will maintain weekly status reporting in the State's Clarity PPM system, conduct weekly project team meetings with bi-weekly steering committee meetings for executive oversight, and provide real-time visibility into project progress through shared project dashboards. 

### Implementation Timeline 

|PHASE|TIMELINE|KEYDELIVERABLES|
|---|---|---|
|Phase 1:Project<br>Planning &<br>Management|Weeks 1-2|Project kickoff, management plan,<br>deployment plan, baseline schedule,<br>configuration management plan,<br>stakeholder communication plan,<br>deliverable expectation documents|
|Phase 2:|Weeks 3-4|Validation sessions, final requirement|
|Requirements &<br>Design Validation||validation document, final design<br>document, final implementation<br>document|
|Phase 3:|Weeks 5-6|Requirements traceability matrix,|
|Enterprise||conceptual design documentation|
|Analysis &Design||(EASA)|



|PHASE|TIMELINE|KEYDELIVERABLES|
|---|---|---|
|Phase 4:Provision<br>Environments|Weeks 7-12|Validated test and production<br>environments with security configuration|
|Phase 5:Build<br>(Development &<br>Configuration)|Weeks 7-20|Solution implementation plan, security<br>plan, disaster recovery plan,<br>infrastructure support plan, integration<br>plan, cutover plan|
|Phase 6: Testing &<br>Acceptance|Weeks 21-<br>30|Test plan, test cases/scripts, system<br>integration test results, UAT support and<br>results, final test results report, final<br>training documentation, final<br>acceptance|
|Phase 7: Training &<br>Knowledge<br>Transfer|Weeks 21-<br>30|Training plan, training curriculum and<br>materials, training completion report|
|Phase 8:Cutover &<br>Go-Live|Weeks 31-<br>40|Readiness report, updated<br>implementation plans, as-built<br>documentation, technical<br>documentation, updated cutover plan,<br>cutover completion report|
|Phase 9:Post-<br>Production<br>Warranty|180 days<br>post go-live|Ongoing support, issue resolution,<br>optimization, transition to standard<br>support|



### Detailed Phase Descriptions 

## Phase 1: Project Planning & Management (Weeks 1-2) 

This phase establishes project governance, validates scope, and builds the foundation for successful delivery. The project kickoff meeting will bring together all key stakeholders including State Program Managers from DTMB and LEO, Concourse project leadership and technical team, and representatives from school districts and other stakeholder groups. 

We will review and validate all requirements documented in the RFP, finalize the project approach and methodology, establish communication protocols and escalation procedures, identify risks and develop mitigation strategies, and obtain formal approval to proceed. 

Deliverables from this phase include a comprehensive Project Management Plan documenting roles, responsibilities, governance structure, and communication protocols. The Baseline Project Schedule will detail all tasks, dependencies, resource assignments, and milestone dates aligned with the September 30, 2026 go-live target. The Configuration Management Plan will establish procedures for managing changes to requirements, design, and code. The Stakeholder Outreach and Communication Plan will define how we will engage with schools, employers, and other stakeholder groups throughout implementation. 

## Phase 2: Requirements & Design Validation (Weeks 3-4) 

This phase validates all business and technical requirements through collaborative workshops with State personnel and stakeholder representatives. We will conduct requirements validation sessions with each user role (minors, employers, guardians, school staff, state administrators) to ensure the solution meets real-world needs. Workflow design sessions will map out the end-to-end permit application and approval process with decision points, notifications, and exception handling. Technical architecture reviews will validate security controls, integration approaches, and infrastructure design. User interface and experience design sessions will create wireframes and mockups for State review and approval. 

The Final Requirement Validation Document will serve as the authoritative requirements baseline for the project. The Final Design Document will provide detailed technical specifications including database schema, API definitions, security architecture, and integration specifications. The Final Implementation Document will describe the development approach, testing strategy, and deployment procedures. 

## Phase 3: Enterprise Analysis & Design (Weeks 5-6) 

This phase translates validated requirements into detailed technical specifications. The Requirements Traceability Matrix will map each business requirement to specific technical implementations, test cases, and acceptance criteria, ensuring complete coverage. The 

Conceptual Design Documentation will provide Enterprise Architecture and Security Architecture (EASA) documentation aligned with State standards, including detailed system architecture diagrams, data flow diagrams, security control mapping to NIST 80053, and integration architecture. 

## Phase 4: Provision Environments (Weeks 7-12) 

This phase establishes the infrastructure foundation for development, testing, and production. We will set up separate environments for development (for ongoing feature development), test (for integration and user acceptance testing), and production (for live system operation). Each environment will be configured with appropriate security controls including network segmentation, firewall rules, encryption, access controls, and monitoring. MiLogin integration will be configured in test and production environments with SAML 2.0 and OpenID Connect endpoints. Backup and disaster recovery systems will be established and tested. Environment validation will confirm that all infrastructure meets State security requirements and is ready for application deployment. 

## Phase 5: Build (Development & Configuration) (Weeks 7-20) 

This is the primary development phase where the solution is built and configured. Development will proceed in two-week sprints with regular demonstrations to State stakeholders. Core functionality development includes user registration and authentication via MiLogin, permit application workflows for all user types, approval workflows with compliance checks, employer verification and directory, dashboards and reporting, notifications (email and SMS), and API development. The security plan will document all implemented security controls mapped to NIST 800-53. The disaster recovery and business continuity plan will detail backup procedures, recovery processes, and testing schedules. The integration plan will specify all integration points, data formats, error handling, and testing procedures. 

## Phase 6: Testing & Acceptance (Weeks 21-30) 

Comprehensive testing ensures the solution meets all functional, security, and performance requirements. Unit testing will verify individual components function correctly. Integration testing will validate that components work together properly, with special focus on MiLogin integration. System testing will verify end-to-end workflows from permit application through approval and verification. Security testing will include DAST, 

SAST, and SCA scans with remediation of findings, penetration testing if required, and vulnerability assessment. Performance and load testing will validate the 2-second response time requirement and 99.98% availability under expected user loads. Accessibility testing will verify WCAG 2.1 Level AA compliance using automated tools and manual testing with assistive technologies. User acceptance testing (UAT) will engage State staff in testing real-world scenarios with UAT results documented for final acceptance. 

## Phase 7: Training & Knowledge Transfer (Weeks 21-30) 

This phase runs parallel to testing and ensures all users are prepared for go-live. Administrator training will cover 25 State personnel in system administration, user management, reporting and analytics, compliance monitoring, and troubleshooting. Enduser training materials will be developed including video tutorials for minors and families, employer quick-start guides, school staff training materials, FAQ documentation, and online help system. Train-the-trainer sessions will prepare State staff to provide ongoing training after go-live. Technical knowledge transfer will ensure State IT personnel understand system architecture, security controls, monitoring and alerting, backup and recovery procedures, and troubleshooting common issues. 

## Phase 8: Cutover & Go-Live (Weeks 31-40) 

The final phase executes the transition to production. Go-live readiness will be assessed through a comprehensive checklist covering all technical, training, and operational requirements. The cutover plan will be executed including final data migration (if applicable), production deployment, smoke testing to verify core functionality, and monitoring activation. Go-live support will provide 24/7 coverage for the first week with dedicated on-call resources, daily status meetings with State leadership, rapid issue triage and resolution, and performance monitoring. The project closeout report will document lessons learned, outstanding items, and recommendations for future enhancements. 

## Phase 9: Post-Production Warranty (180 Days After Go-Live) 

The 180-day warranty period ensures system stability and addresses any post-launch issues. Priority support will be provided for all issues with rapid response times. Performance tuning will optimize system based on real-world usage patterns. Issue resolution will address any bugs or deficiencies discovered after go-live. User feedback 

will be incorporated through minor enhancements. Documentation will be updated to reflect as-built configuration. At the end of the warranty period, we will transition to standard ongoing support with documented procedures for requesting enhancements, reporting issues, and accessing technical support. 

### Risk Management 

We have identified potential risks to successful delivery and developed mitigation strategies. Security authorization timeline risk is mitigated by starting the Security Accreditation Process early (Phase 4) and maintaining continuous communication with DTMB security team. MiLogin integration complexity risk is addressed by engaging State identity management team early and conducting integration testing in Phase 5. Stakeholder engagement risk is managed through regular communication, stakeholder workshops, and a dedicated State outreach plan. Resource availability risk is mitigated by ensuring key personnel commitments and maintaining backup resources. Scope creep risk is controlled through formal change management process and weekly scope review meetings. 

### Timeline Commitments 

- September 30, 2026 Go-Live: Firm commitment to production deployment by target date 

- Weekly Reporting: Detailed status reports every week in Clarity PPM 

- Monthly Reviews: Executive steering committee meetings with DTMB and LEO leadership 

- Milestone Accountability: Clear acceptance criteria for each deliverable with State sign-off 

- Warranty Support: 180 days of included post-launch support ensuring smooth operations 

Training and Documentation 

### Administrator Training 

We will provide comprehensive online training for up to 25 State of Michigan administrators. Training will be delivered through live virtual sessions with interactive demonstrations, hands-on exercises in the test environment, Q&A sessions, and recorded sessions for future reference. Training topics will cover system administration and user management, permit application processing and approval workflows, compliance monitoring and enforcement tools, reporting and analytics, security and audit logging, troubleshooting common issues, and integration management. 

All training materials including presentation slides, exercise workbooks, video recordings, and quick reference guides will be provided in electronic format for ongoing use by the State. 

### End-User Training Materials 

We will develop comprehensive self-service training materials for all end-user types. For minors and families, we will create video tutorials (5-7 minutes each) covering how to apply for a work permit, understanding permit requirements and restrictions, and verifying permit status. For employers, materials will include quick-start guides for new employers, video demonstrations of the employer verification process, and compliance requirements reference. For school staff, training will cover application review and approval process, compliance checks and exception handling, and record keeping and reporting. 

All materials will be designed for accessibility (WCAG 2.1 Level AA compliant) with closed captions for videos, screen reader compatible documents, and plain language explanations avoiding technical jargon. 

### Documentation Suite 

Complete documentation will be provided including Administrator Guide covering all administrative functions with step-by-step procedures, User Guides for each user role (minor, employer, guardian, school staff, state staff), Technical Documentation for State IT personnel including architecture diagrams, API documentation, security controls, and 

troubleshooting procedures, System Security Plan and related compliance documentation, Operations Manual covering backup/recovery, monitoring, and maintenance procedures, and comprehensive FAQ database addressing common questions and issues. 

All documentation will be provided in editable formats (Microsoft Word, PowerPoint, or equivalent) allowing the State to maintain and update as needed. We will also provide an online help system accessible within the application providing context-sensitive help, searchable knowledge base, and links to relevant video tutorials. 

### Knowledge Transfer 

Technical knowledge transfer sessions will ensure State IT personnel can support the system long-term. Sessions will cover system architecture and design decisions, security implementation and monitoring, troubleshooting methodology, backup and recovery procedures, monitoring and alerting configuration, and integration management. Knowledge transfer will include hands-on exercises, review of actual system logs and alerts, and walkthrough of common support scenarios. 

## Government Technology Delivery Experience 

Concourse has successfully delivered technology solutions to government agencies nationwide. Below are relevant examples of our work: 

New York Department of Labor 

#### Location: Albany, NY 

Solution: Salesforce Licenses 

Contract Value: $2.2M 

Provided Salesforce to the New York Department of Labor for centralized customer data management with configurable workflows and collaborative case tracking. The solution includes dashboards, analytics, and reporting with APIs for integration with external systems, supporting enterprise-grade security, governance, and scalability. 

Maryland Health Benefit Exchange 

Location: Baltimore, MD 

Solution: PingIdentity Access Management Contract Value: $182,883 

Provided PingIdentity (ForgeRock) access management, directory, and identity gateway modules for the MDThink platform. The suite provides centralized authentication and authorization with adaptive risk evaluation, federation (SAML/OIDC), and user-managed access. Deployment included 25,000 internal access modules and 1,500,000 external directory proxy identities. 



Ohio Attorney General 

Location: Columbus, OH 

Solution: ManageEngine Active Directory Management Contract Value: $26,155 

Provided ManageEngine ADManager Plus and ADSelfService Plus to the Ohio Attorney General. ADManager Plus delivers centralized Active Directory management with role-based delegation and workflow controls. ADSelfService Plus provides end-user self-service password reset with enhanced login security. Deployment covered 6 domains with delegation for 20 help desk technicians supporting 52,500 users. 

West Virginia Dept. of Environmental Protection 

Location: Charleston, WV Solution: Smartsheet Workflow Automation Contract Value: $19,828 

Provided Smartsheet Business and Dynamic View for collaborative work management with configurable dashboards, workflow automation, forms creation, selective sharing and editing, and workflow-driven notifications and approvals. These capabilities support standardized workflows, transparency, and governance across teams. 

Southeastern Pennsylvania Transportation Authority 

#### Location: Philadelphia, PA 

Solution: Salesforce Public Sector Foundation Contract Value: $629,776 

Provided Salesforce Public Sector Foundation Advanced with Government Cloud Plus. Salesforce delivers a centralized CRM platform with configurable workflows, dashboards, analytics, and reporting. Government Cloud Plus provides a secure government cloud environment with governance features for public sector requirements. Deployment included 108 advanced users and 2,000 employee experience users. 

Genesee County Road Commission 

Location: Flint, MI 

Solution: Microsoft 365 & Identity Management 

Contract Value: $19,314 

Provided Microsoft 365 Business Standard, Exchange Online, Microsoft Entra ID, and Teams Enterprise to the Genesee County Road Commission. Solutions provide cloud productivity, email and calendaring, directory-based identity and access management with single sign-on, and secure collaboration. Delivered for 90 users across services. 

Project Team and Key Personnel 

### Project Organization 

Our project team will be led by experienced professionals with proven track records delivering government technology solutions. The team structure includes a dedicated Project Manager overseeing all aspects of delivery, a Security Officer ensuring compliance with all security requirements, a Technical Lead guiding the development team, and specialized personnel for frontend development, backend development, quality assurance, security testing, technical writing, and training delivery. 

All key personnel meet or exceed the experience requirements specified in the RFP including minimum 5 years of relevant experience, required educational credentials, and professional certifications. Detailed resumes with project references are provided separately as required by the RFP. 

### Commitment to Stability 

We understand that project continuity is critical to success. All key personnel have signed Letters of Commitment confirming their availability and commitment to this project. We commit to maintaining the same key personnel throughout the contract term unless the State requests removal or circumstances beyond our control require replacement. Any proposed personnel changes will require State approval with comprehensive transition planning to ensure project continuity. 

### No Offshore Resources 

All project personnel will be based in the United States with no offshore resources permitted. All development work, system access, and support activities will be performed exclusively by personnel located within the United States or its territories, ensuring compliance with State security requirements and data residency mandates. 

Quality Assurance and Testing 

### Comprehensive Testing Strategy 

Our quality assurance approach ensures the solution meets all functional, security, performance, and accessibility requirements before go-live. Testing will be conducted systematically across multiple dimensions including functional testing to verify all features work as specified, security testing to validate protection of sensitive data, performance testing to ensure responsive user experience, accessibility testing to confirm WCAG 2.1 Level AA compliance, integration testing to validate MiLogin and API functionality, and user acceptance testing with State personnel and stakeholder representatives. 

### Test Environment and Data 

All testing will be conducted in a dedicated test environment that mirrors the production configuration. We will work with the State to develop realistic test data covering the full range of scenarios including various age groups and work hour combinations, different industries and employment situations, edge cases and exception scenarios, and highvolume conditions for performance testing. All test data will be synthetic with no real Personal Identifiable Information (PII) used in testing. 

### Defect Management 

All defects identified during testing will be logged, prioritized, and tracked to resolution. We will use a collaborative defect tracking system providing the State with real-time visibility into defect status. Critical and high-priority defects will be resolved before proceeding to the next testing phase. All defects will be resolved before production go-live with the State's acceptance of any minor issues documented as known limitations. 

### Acceptance Criteria 

Each deliverable and phase will have specific acceptance criteria documented in Deliverable Expectation Documents (DEDs). The State will have defined review periods (typically 30 days) to evaluate deliverables against acceptance criteria. Formal sign-off will be required before proceeding to subsequent phases. The final go-live decision will be based on successful completion of all acceptance testing with documented State approval. 

## Ongoing Support and Maintenance 

### 180-Day Warranty Period 

Following production go-live, we will provide 180 days of warranty support at no additional cost. During this period, we will provide priority resolution of any defects or issues discovered post-launch, performance tuning and optimization based on real-world usage, user support via phone, email, and online ticketing system, and system monitoring with proactive identification of potential issues. The warranty period ensures the system stabilizes and operates reliably before transitioning to standard support. 

### Support Service Levels 

We commit to the following support service level agreements: 99.98% system availability measured monthly with automated monitoring and alerting, response times of 30 minutes for critical issues, 24 hours for high-priority issues, 2 business days for medium-priority issues, and 5 business days for low-priority requests. Resolution times aligned with RFP requirements include 4 hours for critical errors, 2 business days for high-priority issues, 10 business days for medium-priority issues, and 60 business days for low-priority requests. Support will be available 8am-5pm Eastern Monday through Friday for phone support, with 24/7 online support for submitting support tickets. 

### Continuous Improvement 

We are committed to continuous improvement of the solution based on user feedback, technology advances, and evolving requirements. Regular software updates will include security patches applied within industry-standard timeframes, bug fixes and minor enhancements, and new features and capabilities developed in response to State needs. All updates will be tested in the test environment before production deployment with zerodowntime deployment procedures ensuring continuous system availability. 

Accessibility and Usability 

### WCAG 2.1 Level AA Compliance 

Accessibility is a core design principle, not an afterthought. The solution will meet or exceed all WCAG 2.1 Level AA success criteria through semantic HTML markup with proper heading structure and ARIA labels, keyboard navigation for all interactive elements without requiring a mouse, screen reader compatibility tested with JAWS, NVDA, and VoiceOver, sufficient color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text), text resizing up to 200% without loss of content or functionality, alternative text for all meaningful images, captions for video content, and clear form labels and error messages. 

We will provide a completed Product Accessibility Template (PAT) documenting our conformance with each WCAG 2.1 Level AA criterion. The PAT will include detailed explanations for any "Not Applicable" responses and will clarify whether conformance is achieved throughout the entire solution or only in specific areas. Third-party accessibility audits will be conducted to validate compliance before go-live. 

### User-Centered Design 

The solution will be designed around actual user needs and workflows, not generic templates. We will conduct user research during requirements validation including interviews with minors, employers, school staff, and State administrators, review of current paper-based processes, and identification of pain points and improvement opportunities. User interface design will prioritize clarity and simplicity with plain language avoiding technical jargon, intuitive navigation requiring minimal training, clear visual hierarchy and information organization, and helpful inline guidance and tooltips. 

### Mobile-First Design 

Recognizing that many users will access the system via smartphones, the entire interface will be built with mobile-first responsive design principles. The interface will automatically adapt to screen sizes from large desktop monitors to small smartphones, touch-friendly controls sized appropriately for finger interaction, streamlined workflows optimized for mobile use, and fast page load times even on slower mobile networks. All functionality will be available on mobile devices without requiring desktop access. 

### Multilingual Considerations 

While not explicitly required by the RFP, we recognize Michigan's diverse population. The solution architecture will be designed to support multiple languages if the State wishes to add Spanish or other language support in the future. All user-facing text will be externalized in language files rather than hard-coded, enabling straightforward translation. 

## Data Management and Reporting 

### Data Retention and Lifecycle 

The solution will support the State's data retention requirements throughout the contract term and beyond. All permit applications, approvals, and related data will be retained indefinitely or according to State-specified retention schedules. The system will support data export in multiple formats (PDF, Excel, CSV) enabling the State to archive data to the Michigan Archives or transfer to a successor system. Data can be deleted or destroyed upon State request with documented destruction procedures meeting NIST 800-88 sanitization standards. Backup data will be retained according to agreed schedules with ability to restore historical data as needed. 

### Real-Time Dashboards 

State administrators will have access to comprehensive real-time dashboards providing visibility into permit application volumes and trends over time, approval and denial rates with breakdown by reason, processing time metrics identifying bottlenecks, employer compliance status and risk indicators, geographic distribution of youth employment, industry analysis showing where youth are employed, and comparative analysis across regions or time periods. 

Dashboards will be interactive with drill-down capabilities, customizable to show metrics most relevant to different roles, refreshed in real-time as data changes, and accessible via secure web browser from any location. 

### Standard and Ad-Hoc Reporting 

The solution will include a comprehensive reporting engine supporting both standard reports and ad-hoc queries. Standard reports will cover permit applications by status (pending, approved, denied), employer verification reports, compliance exception reports, age and industry demographic reports, and historical trend analysis. Ad-hoc reporting will enable State users to create custom reports with flexible filters, sorting, and grouping, custom field selection, scheduled report generation and distribution, and export in PDF, Excel, and CSV formats. 

### Audit Logging 

The system will maintain comprehensive immutable audit logs capturing all system activity including user authentication and authorization events, permit application submissions and modifications, approval and denial decisions with rationale, employer verification checks, administrative actions (user management, configuration changes), data exports and API access, and security events (failed login attempts, access violations). Audit logs will be retained for the full contract term with search and filtering capabilities enabling investigation of specific events or user actions. Logs will be protected from modification or deletion ensuring integrity for compliance and forensic purposes. 

## Transition Planning 

### Transition-In Strategy 

While this is a new system replacing a paper-based process, careful transition planning is essential. Our transition-in approach includes stakeholder engagement with schools, employers, and community organizations to build awareness and support, phased rollout beginning with pilot districts before statewide deployment (if desired by State), comprehensive training for all user groups before their access is enabled, extensive communications campaign including press releases, social media, and direct outreach, and dedicated go-live support ensuring rapid response to questions and issues during the transition period. 

### Transition-Out Planning 

Although we are committed to long-term success, we understand the State requires a clear transition-out plan. Should the State choose to transition to a different system or bring services in-house at contract end, we will provide up to 180 days of transition assistance including continued operation of the current system at standard rates, data extraction in State-specified formats (database dumps, CSV files, API access), comprehensive technical documentation of system architecture and configuration, knowledge transfer to State personnel or successor vendor, cooperation with migration testing and validation, and support for parallel operations if needed during transition. 

The State will retain ownership of all data, Work Product, and Customizations created specifically for Michigan, ensuring complete portability. We will not hold State data hostage and will cooperate fully with any transition activities. 

## Contract Terms and Insurance 

### Acceptance of Standard Terms 

Concourse accepts the State's standard Software Terms and Conditions as presented in the RFP without modification. We understand and agree to all provisions including intellectual property ownership, data security requirements, service level commitments, insurance requirements, indemnification obligations, and termination provisions. Our acceptance of these terms demonstrates our confidence in our ability to meet all State requirements and our commitment to a straightforward contracting process. 

### Insurance Coverage 

Concourse maintains comprehensive insurance coverage meeting or exceeding all RFP requirements. Our insurance portfolio includes Commercial General Liability ($2M aggregate), Automobile Liability ($1M per accident), Workers' Compensation (statutory limits), Employers Liability ($500K per accident), Cyber Liability ($1M per occurrence and aggregate), and Crime/Fidelity coverage ($1M per loss). All policies name the State of Michigan as additional insured where required. Certificates of insurance will be provided to DTMB Risk Management within 10 business days of contract execution with annual renewals provided throughout the contract term. 

Why Choose Concourse 

### Proven Government Technology Expertise 

Concourse has successfully delivered technology solutions to government agencies nationwide, including state labor departments, health benefit exchanges, and county agencies. We understand the unique requirements of government projects including complex compliance requirements, public procurement processes, and the need for long-term support and maintenance. 

### Security and Compliance Excellence 

We bring deep expertise in government security frameworks including FISMA, NIST 800-53, FedRAMP, and state-specific requirements. Our team has successfully navigated numerous security authorization processes and maintains active certifications demonstrating our commitment to protecting sensitive government data. 

### User-Centered Design 

We design solutions around actual user needs, not technology constraints. Our approach prioritizes ease of use, accessibility, and intuitive workflows that encourage adoption. The result is systems that people actually want to use, driving higher participation and better outcomes. 

### Commitment to Success 

Concourse is committed to Michigan's success with this critical program. We will be a true partner, not just a vendor, working collaboratively to overcome challenges and achieve program goals. Our team will be responsive, transparent, and focused on delivering exceptional value to Michigan taxpayers. 

## Company Information 



<!-- Start of picture text -->
Company Name Concourse Tech Inc.<br>Contact Person Kelsey Shaner, Operations Manager<br>Phone (646) 305-9964<br>Email sales@concoursetech.com<br>169 Madison Ave, Suite 15520, New York, NY<br>Address<br>10016<br>DUNS Number 119359641<br>CAGE Code 09E17<br><!-- End of picture text -->

Customer References 

|ENTITY|CONTACT<br>NAME|EMAIL|PHONE|
|---|---|---|---|
|TarrantCounty|Kehinde<br>Olugbile<br>SeniorBuyer|kolugbile@tarrantcountytx.gov|817-212-<br>7249|
|Town of<br>Waterford|Jeffrey<br>Robillard<br>ITManager|jrobillard@waterfordct.org|(860)<br>442-<br>0553|
|SanAntonio<br>WaterSystem|JosiahSia<br>Purchasing<br>Agent|Josiah.Sia@saws.org|210-233-<br>2941|
|Northeast|Samantha|sschum@neisd.net|210-407-|
|Independent<br>SchoolDistrict|Schumacher<br>Administrator||0001|
|City of|Colton|goodrichc@fcmcclerk.com|614-|
|Columbus|Goodrich||645-|
|MunicipalCourt<br>Clerk|IT<br>Administrator||8183|



## Contract Terms and Conditions 

Quote Terms and Conditions: A Quote is not an order or offer to sell. Product, available inventory, additional fees and pricing data are updated by manufacturers from time to time and may change without notice. 

Warranties Disclaimer: Concourse Tech Inc. does not make any warranties, express or implied, including but not limited to warranties of merchantability or fitness for a particular 

purpose. 

Force Majeure: Concourse Tech Inc. shall not be responsible for delays or failure to deliver due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, labor disputes, supply chain disruptions. 

Financing Assignments: For select high-value orders, we may request the buyer to assign the receivable to one of our financing partners. 

Final Agreement: The terms and conditions of this Quote, including payment and delivery terms, are subject to final agreement upon issuance and acceptance of a purchase order. 

## Acceptance 

By signing below, both parties agree to the terms and conditions outlined in this proposal. 

#### Client Acceptance: 

Signature 

Print Name 

Date 

#### Concourse Tech Inc.: 

Signature 

Print Name 

Date 

