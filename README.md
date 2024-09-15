# SONE: Eye-Tracking Communication for Patients
![sone](https://github.com/user-attachments/assets/c0abb1e7-2e92-48e9-acfa-660d8c9c7fd2)

SONE is a React Native application that facilitates seamless communication for patients with limited mobility. This app allows patients to send notifications to nursing staff by selecting predefined options like "I need water" or "I'm in pain" using their eye movements, triggering push notifications on hospital staff’s mobile devices.

The goal is to reduce reliance on manual checks and improve communication between patients and caregivers, particularly for those who are physically disabled or nonverbal.

## Features

- **Eye-Tracking for Icon Selection**: Patients interact with the app using built-in eye-tracking technology to select different communication options.
- **Push Notifications**: Button selections trigger push notifications.
- **Cross-Platform**: Available for both iPad (iOS) and Android tablets.
- **Real-Time Communication**: Notifications are sent in real-time to ensure swift responses from nursing staff.

## Tech Stack

- **React Native**: For building cross-platform mobile applications.
- **Firebase Cloud Messaging (FCM)**: For push notification delivery.
- **Expo**: For building and testing the application.
- **iOS Eye-Tracking**: Apple’s beta eye-tracking to track patient’s gaze and allow them to interact with UI elements.
- **JavaScript/TypeScript**: Primary programming languages used in the project.
- **Node.js**: Backend infrastructure for managing real-time events and handling notifications.
- **Firebase Realtime Database**: For tracking and managing patient requests.

## How It Works

1. **Eye-Tracking Input**: The app leverages iOS's native eye-tracking functionality (available for iPads) to detect when a patient focuses on a specific icon (e.g., "I'm in pain," "I need water").
2. **Button Press and Notification**: When an icon is selected, the app triggers a push notification via Firebase Cloud Messaging (FCM), which is sent to the nurse's mobile device.
3. **Notification on Nurse's Device**: The nurse receives the notification, allowing them to take appropriate action based on the patient's needs.
