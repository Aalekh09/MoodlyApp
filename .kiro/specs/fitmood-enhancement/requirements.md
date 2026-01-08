# Requirements Document

## Introduction

This specification covers three major enhancements to transform the mood tracking application: complete rebranding from "Moodly" to "FitMood", implementing password-based authentication with Google Sheets backend storage, and adding a Contact Us feature for user support.

## Glossary

- **FitMood_System**: The complete mood tracking application after rebranding
- **Authentication_Service**: The login/registration system with password support
- **Google_Sheets_Backend**: The Google Apps Script service that stores user data including passwords
- **Contact_Display**: The contact information display feature
- **User**: Any person using the FitMood application
- **Password**: User-created authentication credential with minimum security requirements

## Requirements

### Requirement 1: Complete Application Rebranding

**User Story:** As a user, I want to see the application branded as "FitMood" instead of "Moodly", so that I experience a consistent brand identity throughout the application.

#### Acceptance Criteria

1. WHEN a user visits any page of the application, THE FitMood_System SHALL display "FitMood" in all titles, headers, and branding elements
2. WHEN a user views the landing page, THE FitMood_System SHALL show "FitMood" as the main application name
3. WHEN a user checks browser storage keys, THE FitMood_System SHALL use "fitmood_" prefixes instead of "moodly_" prefixes
4. WHEN a user views any text content, THE FitMood_System SHALL display "FitMood" instead of "Moodly" in all user-facing text
5. WHEN a user installs the PWA, THE FitMood_System SHALL show "FitMood" as the application name

### Requirement 2: Enhanced Password-Based Authentication

**User Story:** As a user, I want to create an account with a password and login using either my email or phone number with that password, so that I have secure and flexible access to my account.

#### Acceptance Criteria

1. WHEN a user registers for a new account, THE Authentication_Service SHALL require name, email, phone, and password fields
2. WHEN a user creates a password, THE Authentication_Service SHALL enforce minimum 8 characters with at least one special character
3. WHEN a user submits registration, THE Google_Sheets_Backend SHALL store the password securely in the user data sheet
4. WHEN a user attempts to login, THE Authentication_Service SHALL accept either email+password OR phone+password combinations
5. WHEN a user enters valid credentials, THE Authentication_Service SHALL authenticate against stored passwords in Google Sheets
6. WHEN a user enters invalid credentials, THE Authentication_Service SHALL display appropriate error messages
7. WHEN a user requests password reset, THE Authentication_Service SHALL provide "Forgot Password" functionality

### Requirement 3: Contact Us Information Display

**User Story:** As a user, I want to easily find contact information for FitMood support, so that I can reach out when I need help or have questions.

#### Acceptance Criteria

1. WHEN a user navigates to the contact section, THE Contact_Display SHALL show the company phone number prominently
2. WHEN a user views contact information, THE Contact_Display SHALL display the complete business address
3. WHEN a user accesses the contact page, THE Contact_Display SHALL present information in a clear, readable format
4. WHEN a user is on mobile, THE Contact_Display SHALL make the phone number clickable for direct calling
5. WHEN a user views the contact section, THE Contact_Display SHALL maintain consistent styling with the FitMood brand

### Requirement 4: Backend Data Storage Integration

**User Story:** As a system administrator, I want user passwords and authentication data stored securely in Google Sheets, so that the authentication system integrates with the existing backend infrastructure.

#### Acceptance Criteria

1. WHEN a user registers, THE Google_Sheets_Backend SHALL store password data in the user management sheet
2. WHEN authentication occurs, THE Google_Sheets_Backend SHALL validate credentials against stored password data
3. WHEN password reset is requested, THE Google_Sheets_Backend SHALL support password update operations
4. WHEN storing passwords, THE Google_Sheets_Backend SHALL maintain data integrity and security practices
5. WHEN user data is accessed, THE Google_Sheets_Backend SHALL ensure consistent data format across all operations

### Requirement 5: Backward Compatibility and Migration

**User Story:** As an existing user, I want my current data to remain accessible after the rebranding and authentication changes, so that I don't lose my mood tracking history.

#### Acceptance Criteria

1. WHEN the system is updated, THE FitMood_System SHALL migrate existing "moodly_" localStorage keys to "fitmood_" format
2. WHEN existing users first login after the update, THE Authentication_Service SHALL prompt them to set a password
3. WHEN data migration occurs, THE FitMood_System SHALL preserve all existing mood history and user preferences
4. WHEN users access their data, THE FitMood_System SHALL maintain all existing functionality with the new branding
5. WHEN localStorage migration happens, THE FitMood_System SHALL clean up old "moodly_" keys after successful migration