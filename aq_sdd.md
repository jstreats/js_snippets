# Software Design Document (SDD) 

## For: AutoQlik - Automated Deployment Tool 

### 1. Introduction 
**AutoQlik**  is a proprietary automated deployment tool designed to automate various stages of deployment for QlikSense applications, including the creation of Change Requests (CRs), managing backups, deployments from GitHub, and ensuring smooth app transitions between production streams. It also incorporates validation processes and ServiceNow integration.
### 2. Purpose 

The purpose of this document is to outline the design and flow of the AutoQlik deployment tool. The document will describe the architecture, features, components, and deployment processes used by AutoQlik to ensure seamless and secure deployment operations.

### 3. System Overview 

AutoQlik automates the following core tasks:

- ServiceNow Change Request (CR) creation

- Integration with ICE (Internal Change Environment) for CR updates

- Backup of QlikSense QVF files to GitHub

- Deployment of QVF files from GitHub to production environments

- Movement of QVF files between Qlik Streams (e.g., Pre-Production to Production)

- Validation checks at critical points in the deployment process

- Post-deployment verifications

### 4. Functional Requirements 

#### 4.1. Pre-Requisites for CR Creation 
 
1. **Testing Evidence** :
  - Test evidence must be attached in the Jira story either in the comments or attachments section.

  - Alternatively, a sub-task must be added to the Jira story indicating testing completion.
 
2. **Jira Story State** :
  - The Jira story must be in either the "Ready for Release" or "Done" state.
 
3. **CR Limitation** :
  - Only a single CR can be created per Jira story.

#### 4.2. CR Creation Process 
 
1. The user must input the **Jira story number** .
 
2. The appropriate **QlikSense stream**  and **app**  to be deployed must be selected.

3. The system allows multiple apps and streams to be added in a single CR.

4. Post-verification option available ("Needs post verification" checkbox).
 
5. Once details are confirmed, the user clicks **"Create CR"**  to initiate the CR process.

6. Notifications and URLs (ServiceNow, ICE) are generated after CR creation.

#### 4.3. Post-CR Creation 

1. A message confirms CR creation, and notifications are sent to three designated users.
 
2. CR is created in the **"New"**  state in ServiceNow.

3. URLs for ServiceNow and ICE are provided.

4. The CR will be created and ready for deployment one hour after initiation.

5. The CR duration (expiry) is four hours post-creation.

#### 4.4. CR Deployment Process 
 
1. The user inputs the **Jira Story number**  in AutoQlik.
 
2. The Jira story must be in the **"Ready for Release"**  or **"Done"**  state.

3. If post-verification is required, an email is sent for testing.

4. The recipient of the email can update the testing status as either "Success" or "Failed."
 
5. If **"Failed"**  is selected, all changes are rolled back.

6. CR deployment occurs at least 30 minutes after CR creation.

### 5. Non-Functional Requirements 

#### 5.1. Security 

- AutoQlik interacts with Jira, GitHub, ICE, and ServiceNow, ensuring that all data transmitted is secure.

- Rollback mechanisms are in place to prevent incomplete or failed deployments.

#### 5.2. Usability 

- The UI of AutoQlik includes dropdown selections and validation prompts to reduce human error during the deployment process.

#### 5.3. Reliability 

- The deployment process includes post-verification checks, ensuring that any failure is automatically rolled back to the previous stable state.

- All CRs must be validated before and after deployment.

#### 5.4. Performance 

- AutoQlik is designed to handle multiple CRs and apps within a single deployment, providing scalability.

- The CR creation and deployment processes operate under time constraints (e.g., one-hour CR creation, four-hour validity).

### 6. Design Components 

#### 6.1. Frontend (User Interface) 
 
- **CR Creation Screen** :
  - Input fields for Jira Story number, streams, and app selection.

  - Options to add multiple apps.

  - Checkboxes for post-verification and validation requirements.

  - Confirmation prompts.

#### 6.2. Backend 
 
- **ServiceNow Integration** :
  - Automatically creates CR tickets.

  - Assigns a short description, requestor, start date, end date, etc.
 
- **ICE Integration** :
  - Updates deployment status and relevant details such as DAST issue counts, scan URLs, and testing evidence URLs.
 
- **GitHub Integration** :
  - Backs up QVF files related to the CR.

  - Deploys QVF files from GitHub to the production environment.
 
- **Validation** :
  - Ensures that the Jira story is in the correct state before proceeding with CR creation.

  - Validates that all necessary details and files are available before deployment.

#### 6.3. Notifications 

- Email notifications are sent to three pre-designated users during critical stages such as CR creation and post-verification.

### 7. Process Flow 

#### 7.1. CR Creation Flow 


```Copy code
1. User enters Jira Story Number.
2. User selects stream and app(s).
3. Validation checks for app-stream selections.
4. Post-verification checkbox selection.
5. CR creation initiated.
6. ServiceNow CR ticket created.
7. ICE updated with necessary artifacts and test evidence.
8. Notification emails sent.
9. GitHub backup initiated for QVF files.
```

#### 7.2. Deployment Flow 


```Copy code
1. User enters Jira Story Number.
2. Jira Story is validated to ensure it's in the "Ready for Release" or "Done" state.
3. Post-verification emails sent if necessary.
4. Apps deployed from GitHub to Production.
5. Post-deployment verification triggered (if enabled).
6. Deployment status (Success/Failure) updated via testing email link.
7. If failed, rollback initiated for all apps in CR.
```

### 8. Testing Strategy 

#### 8.1. Unit Testing 

- Unit tests for validating CR creation and state changes (ServiceNow, ICE, Jira story state validation).

#### 8.2. Integration Testing 

- GitHub integration tests to ensure files are correctly backed up and deployed.

- ServiceNow and ICE integration validation for CR and deployment details.

#### 8.3. End-to-End Testing 

- Simulate the complete CR creation and deployment process, including edge cases (e.g., failed tests and rollbacks).

#### 8.4. User Acceptance Testing 

- Test the system with actual users and gather feedback on usability and functionality.

### 9. Deployment Strategy 

- The AutoQlik tool will be deployed on the internal servers with access to all necessary APIs (Jira, GitHub, ServiceNow, ICE).

- Ensure that all configurations for stream access, post-verification, and user notifications are predefined.

### 10. Conclusion 

AutoQlik provides a streamlined and automated deployment process, reducing the overhead for developers and deployment managers by automating CR creation, QVF file deployment, and validation. This design ensures that all applications are deployed securely and reliably.
