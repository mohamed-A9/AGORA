# Venue Creation Validation Documentation

## Overview
This document outlines the validation logic implemented for the Venue Creation Wizard (using `EditableVenuePage.tsx`).

## Validation Logic

The validation is implemented in the `handleSaveStep` function within `EditableVenuePage.tsx`. It intercepts the transition from Step 1 to Step 2.

### Mandatory Fields (Step 1)
The following fields are strictly required. If any are missing, the user is blocked from proceeding, and a popup alert lists the missing items.

1.  **Venue Name** (`name`)
2.  **Primary Category** (`category`)
3.  **City** (`city`)
4.  **Full Street Address** (`address`)
5.  **Phone Number** (`phone`)
    - *Additional Check*: Must start with '0' and be exactly 10 digits.
6.  **Opening Days** (`dayStart`, `dayEnd`)
7.  **Opening Hours** (`timeStart`, `timeEnd`)

### Optional / Excluded Fields
The following fields are explicitly **excluded** from mandatory validation, as per user request:
- **Contact Email**
- **Waze Link** (and other social links like Instagram, TikTok, Website)
- **Neighborhood**

## User Experience
1.  **Click "Next Step"**: The button is always enabled to allow interaction.
2.  **Validation Check**: Upon clicking, the system checks all mandatory fields.
3.  **Failure State**:
    - **Popup Alert**: A browser alert appears listing all missing fields:
      ```
      Please complete the following mandatory fields:
      - Venue Name
      - City
      ...
      ```
    - **Phone Format Alert**: If fields are present but phone is invalid, a specific alert explains the required format (start with 0, 10 digits).
4.  **Success State**: If all validations pass, the data is saved (creating a draft if needed) and the wizard moves to Step 2.

## Code Location
- **File**: `components/EditableVenuePage.tsx`
- **Function**: `handleSaveStep()`
- **Logic**: Lines ~372 onwards (intercepting `currentStep === 1`)
