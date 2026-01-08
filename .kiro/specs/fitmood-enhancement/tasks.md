# Implementation Plan: FitMood Enhancement

## Overview

This implementation plan transforms the mood tracking application from "Moodly" to "FitMood" with enhanced password-based authentication, Google Sheets backend integration, and contact information display. The approach focuses on incremental development with early validation through testing.

## Tasks

- [x] 1. Set up enhanced authentication infrastructure
  - Create password validation utilities with security requirements
  - Set up Web Crypto API integration for client-side hashing
  - Create authentication service interfaces and types
  - _Requirements: 2.2, 4.4_

- [ ]* 1.1 Write property test for password validation
  - **Property 4: Password Validation Rules**
  - **Validates: Requirements 2.1, 2.2**

- [x] 2. Implement Google Apps Script backend enhancements
  - [x] 2.1 Update user registration endpoint with password support
    - Add password hashing and salt generation
    - Modify user data sheet schema to include password fields
    - Implement secure password storage
    - _Requirements: 2.1, 2.3, 4.1_

  - [ ]* 2.2 Write property test for password security
    - **Property 2: Password Security Round Trip**
    - **Validates: Requirements 2.2, 2.3, 4.1, 4.4**

  - [x] 2.3 Enhance login endpoint for flexible authentication
    - Support email OR phone + password combinations
    - Implement password validation against stored hashes
    - Add proper error handling for invalid credentials
    - _Requirements: 2.4, 2.5, 4.2_

  - [ ]* 2.4 Write property test for flexible authentication
    - **Property 3: Flexible Authentication**
    - **Validates: Requirements 2.4, 2.5, 4.2**

  - [x] 2.5 Add password reset functionality
    - Implement reset token generation and validation
    - Add password update operations
    - Create secure token expiration handling
    - _Requirements: 2.7, 4.3_

  - [ ]* 2.6 Write property test for password reset
    - **Property 7: Password Reset Functionality**
    - **Validates: Requirements 4.3**

- [x] 3. Checkpoint - Backend authentication complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 4. Implement frontend authentication components
  - [x] 4.1 Create enhanced registration form
    - Add password field with validation feedback
    - Implement real-time password strength indicator
    - Add form validation and error handling
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Update login form for flexible authentication
    - Support email OR phone number input
    - Add password field and validation
    - Implement proper error message display
    - _Requirements: 2.4, 2.6_

  - [ ]* 4.3 Write property test for authentication error handling
    - **Property 5: Authentication Error Handling**
    - **Validates: Requirements 2.6**

  - [x] 4.4 Create forgot password workflow
    - Build password reset request form
    - Implement reset token validation
    - Create new password setup form
    - _Requirements: 2.7_

  - [ ]* 4.5 Write unit tests for authentication forms
    - Test form validation and user interactions
    - Test error message display
    - _Requirements: 2.1, 2.6, 2.7_

- [x] 5. Implement complete application rebranding
  - [x] 5.1 Replace all "Moodly" references with "FitMood"
    - Update all UI text and labels
    - Modify page titles and headers
    - Update PWA manifest and metadata
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 5.2 Migrate localStorage key prefixes
    - Change all "moodly_" prefixes to "fitmood_"
    - Update all storage access throughout the application
    - Ensure consistent key naming
    - _Requirements: 1.3_

  - [ ]* 5.3 Write property test for complete branding replacement
    - **Property 1: Complete Branding Replacement**
    - **Validates: Requirements 1.1, 1.3, 1.4**

- [x] 6. Implement data migration service
  - [x] 6.1 Create localStorage migration utilities
    - Build migration service to convert old keys to new format
    - Implement data validation during migration
    - Add rollback mechanism for failed migrations
    - _Requirements: 5.1, 5.3, 5.5_

  - [x] 6.2 Add existing user password setup flow
    - Create password setup prompt for existing users
    - Implement one-time migration workflow
    - Add migration status tracking
    - _Requirements: 5.2_

  - [ ]* 6.3 Write property test for data migration
    - **Property 6: Data Migration Preservation**
    - **Validates: Requirements 5.1, 5.3, 5.4, 5.5**

  - [ ]* 6.4 Write unit tests for migration service
    - Test migration edge cases and error conditions
    - Test rollback functionality
    - _Requirements: 5.1, 5.5_

- [x] 7. Checkpoint - Core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement contact information display
  - [x] 8.1 Create contact display component
    - Build responsive contact information layout
    - Add clickable phone number for mobile
    - Implement consistent FitMood branding
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 8.2 Write unit tests for contact display
    - Test responsive layout and mobile interactions
    - Test branding consistency
    - _Requirements: 3.4, 3.5_

- [x] 9. Integration and final wiring
  - [x] 9.1 Wire all authentication components together
    - Connect frontend forms to backend services
    - Implement proper session management
    - Add authentication state management
    - _Requirements: 2.1, 2.4, 2.5, 4.2_

  - [x] 9.2 Integrate migration service with application startup
    - Add migration checks on application load
    - Implement user prompts for password setup
    - Connect migration service to authentication flow
    - _Requirements: 5.2, 5.3_

  - [ ]* 9.3 Write integration tests
    - Test end-to-end authentication flows
    - Test migration and rebranding integration
    - _Requirements: 2.4, 2.5, 5.1, 5.2_

- [x] 10. Final checkpoint - Complete system validation
  - Ensure all tests pass, verify all requirements are met, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and user interactions
- Backend changes require updating the existing Google Apps Script code
- Migration service ensures existing users don't lose data during the transition
- All password handling uses Web Crypto API for security