// js/data-upload.js
import { db } from './firebase-config.js';
import { collection, doc, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. PASTE YOUR FULL JSON DATA BELOW
// (Copy the content between { and } from your text file)
const initialData = {
    // --- START PASTING HERE ---
    
    // Paste the "rooms": [...], "tenants": [...], etc. here.
    // If you want to test with empty data first, just leave this structure:
    "rooms": [],
    "tenants": [],
    "leftTenants": [],
    "dues": [],
    "payments": [],
    "utilityReadings": [],
    "settings": { "electricityRate": 7, "currencySymbol": "₹" }

    // --- END PASTING HERE ---
};

// 2. Function to Upload Data
export async function uploadToFirebase() {
    console.log("Starting Data Upload...");
    
    // We use a "Batch" to do multiple writes at once (Safety mechanism)
    // Note: Firestore batches allow max 500 operations. If you have more, we might need a loop.
    const batch = writeBatch(db);
    let operationCount = 0;

    // A. Upload Rooms
    if (initialData.rooms) {
        initialData.rooms.forEach(room => {
            const ref = doc(db, "rooms", room.id); // Use the JSON 'id' as the Document ID
            batch.set(ref, room);
            operationCount++;
        });
        console.log(`Queued ${initialData.rooms.length} rooms.`);
    }

    // B. Upload Tenants
    if (initialData.tenants) {
        initialData.tenants.forEach(tenant => {
            const ref = doc(db, "tenants", tenant.id);
            batch.set(ref, tenant);
            operationCount++;
        });
        console.log(`Queued ${initialData.tenants.length} tenants.`);
    }

    // C. Upload Left Tenants (History)
    if (initialData.leftTenants) {
        initialData.leftTenants.forEach(lt => {
            const ref = doc(db, "leftTenants", lt.id);
            batch.set(ref, lt);
            operationCount++;
        });
        console.log(`Queued ${initialData.leftTenants.length} left tenants.`);
    }

    // D. Upload Dues
    if (initialData.dues) {
        initialData.dues.forEach(due => {
            const ref = doc(db, "dues", due.id);
            batch.set(ref, due);
            operationCount++;
        });
    }

    // E. Upload Payments
    if (initialData.payments) {
        initialData.payments.forEach(pay => {
            const ref = doc(db, "payments", pay.id);
            batch.set(ref, pay);
            operationCount++;
        });
    }

    // F. Upload Readings
    if (initialData.utilityReadings) {
        initialData.utilityReadings.forEach(ur => {
            const ref = doc(db, "utilityReadings", ur.id);
            batch.set(ref, ur);
            operationCount++;
        });
    }

    // G. Upload Settings (Single Document)
    if (initialData.settings) {
        const settingsRef = doc(db, "config", "globalSettings"); // Fixed ID for settings
        batch.set(settingsRef, initialData.settings);
        operationCount++;
    }

    // Commit the changes
    if (operationCount > 0) {
        try {
            await batch.commit();
            console.log("✅ Success! Database populated.");
            alert("Database successfully populated! Check your Firestore Console.");
        } catch (error) {
            console.error("❌ Error uploading data:", error);
            alert("Error uploading data. Check console for details.");
        }
    } else {
        console.log("No data found to upload.");
    }
}
