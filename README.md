# Checklist, Shopping List or To-Do List Application

This is a simple Checklist Application built with TypeScript and JavaScript, allowing users to create, edit, delete, and reorder items in their checklist.

![image](https://github.com/user-attachments/assets/22ea07fd-15de-4df9-9370-efb9dbf0da51)![image](https://github.com/user-attachments/assets/1b0ec11a-e4c0-4f31-ae47-4be592417595)![image](https://github.com/user-attachments/assets/575b538d-fea0-4818-b052-7c7cc1f3cff1)


## Features

- Add items to the Checklist.
- Edit items inline by clicking on the item label.
- Mark items as completed by checking the checkbox, which applies a line-through style.
- Delete items from the list.
- Reorder items using drag-and-drop functionality.
- All changes are saved to the local storage to persist data across sessions.
- Realtime updates
- PWA enabled: Users can install the app on their home screen for a native app-like experience.

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/mannbadal/checklist.git
   cd checklist
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up Firebase:**

   1. Create a new project at [Firebase Console](https://console.firebase.google.com)
   2. Enable **Authentication** and **Realtime Database** services
   3. Add your domain/localhost to authorized domains in Authentication settings
   4. Set up Firebase Realtime Database security rules:

   ```javascript
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```

5. Create a `.env` file in the root of your project and add your Firebase configuration details:

   ```plaintext
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=your_database_url
   ```

   Replace the placeholders with your actual Firebase configuration values.

5. **Run the application:**

   ```sh
   npm start
   ```

   This will start a local development server and open the application in your default web browser.

## Usage

### Adding Items

1. Enter the item name in the input field at the top of the list.
2. Click the "Add" button to add the item to the list.

### Editing Items

1. Click on the item label to enter edit mode.
2. Modify the item text and press "Enter" or click outside the input field to save the changes.

### Marking Items as Completed

1. Check the checkbox next to an item to mark it as completed.
2. The item will be styled with a line-through effect.

### Deleting Items

1. Click the trash can icon next to the item you want to delete.

### Reordering Items

1. Click and hold on an item to start dragging.
2. Move the item to the desired position and release to drop it.

## PWA Features

This application is PWA enabled, which means it can be installed on your mobile device or desktop for a native app-like experience.

### Installing the PWA

1. Open the application in your web browser.
2. On desktop:
   - Click on the install button in the address bar or the settings menu and select "Install".
3. On mobile:
   - For Android, open the browser menu and select "Add to Home screen".
   - For iOS (Safari), tap the "Share" button and then select "Add to Home Screen".

## Project Structure

- `src/`: Contains the source code of the application.
  - `model/`: Contains the model classes for the checklist.
  - `view/`: Contains the view classes for rendering the checklist.
- `index.html`: The main HTML file.
- `style.css`: The main CSS file for styling the application.
- `manifest.json`: The web app manifest file for PWA configuration.
- `service-worker.js`: The service worker file for enabling offline capabilities and caching.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
