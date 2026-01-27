import { handleFileUpload } from './data-upload.js';

// ... (Keep your existing imports and testConnection code) ...


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




// Setup the File Upload Listener
const processFileBtn = document.getElementById('processFileBtn');
const fileInput = document.getElementById('jsonFileInput');

if (processFileBtn && fileInput) {
    processFileBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (confirm("This will overwrite database data with the selected file (Last 4 months only). Continue?")) {
            handleFileUpload(file);
        }
    });
}
