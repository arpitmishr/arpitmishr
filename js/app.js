import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("App.js Loaded");

// Function to test database connection
async function testConnection() {
    try {
        console.log("Attempting to connect to Firestore...");
        const querySnapshot = await getDocs(collection(db, "settings")); 
        console.log("Connection Successful! Documents found:", querySnapshot.size);
    } catch (error) {
        console.error("Error connecting to Firebase:", error);
    }
}

testConnection();






// Import the upload function
import { uploadToFirebase } from './data-upload.js';

// Setup the Upload Button Listener
const uploadBtn = document.getElementById('uploadBtn');
if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        const confirmAction = confirm("Are you sure? This will overwrite data with the JSON in data-upload.js");
        if (confirmAction) {
            uploadToFirebase();
        }
    });
}
