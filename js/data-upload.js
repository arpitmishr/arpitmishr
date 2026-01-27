import { db } from './firebase-config.js';
import { doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function handleFileUpload(file) {
    if (!file) {
        alert("Please select a file first.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target.result);
            console.log("File parsed successfully. Processing rules...");
            await processAndUpload(json);
        } catch (error) {
            console.error("JSON Error:", error);
            alert("Invalid JSON file.");
        }
    };

    reader.readAsText(file);
}

async function processAndUpload(data) {
    const batch = writeBatch(db);
    let count = 0;

    // --- RULE 1: CALCULATE DATE LIMIT (4 MONTHS AGO) ---
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    console.log(`Filtering data older than: ${fourMonthsAgo.toISOString().split('T')[0]}`);

    // --- RULE 2: IDENTIFY LEFT TENANTS ---
    // We create a set of IDs for tenants who have left to ensure we delete ALL their info
    const leftTenantIds = new Set();
    if (data.leftTenants) {
        data.leftTenants.forEach(t => leftTenantIds.add(t.id));
    }
    console.log(`Found ${leftTenantIds.size} left tenants. Their data will be excluded.`);

    // --- 1. UPLOAD ROOMS (Always keep) ---
    if (data.rooms) {
        data.rooms.forEach(room => {
            const ref = doc(db, "rooms", room.id);
            batch.set(ref, room);
            count++;
        });
    }

    // --- 2. UPLOAD TENANTS (Only Active Ones) ---
    if (data.tenants) {
        data.tenants.forEach(tenant => {
            // Safety check: Make sure active tenant isn't accidentally in left list
            if (!leftTenantIds.has(tenant.id)) {
                const ref = doc(db, "tenants", tenant.id);
                batch.set(ref, tenant);
                count++;
            }
        });
    }

    // --- 3. UPLOAD DUES (Apply 4 Month Rule + Exclude Left Tenants) ---
    if (data.dues) {
        data.dues.forEach(due => {
            const dueDate = new Date(due.date);
            const isRecent = dueDate >= fourMonthsAgo;
            const isActiveTenant = !leftTenantIds.has(due.tenantId);

            if (isRecent && isActiveTenant) {
                const ref = doc(db, "dues", due.id);
                batch.set(ref, due);
                count++;
            }
        });
    }

    // --- 4. UPLOAD PAYMENTS (Apply 4 Month Rule + Exclude Left Tenants) ---
    if (data.payments) {
        data.payments.forEach(pay => {
            const payDate = new Date(pay.date);
            const isRecent = payDate >= fourMonthsAgo;
            const isActiveTenant = !leftTenantIds.has(pay.tenantId);

            if (isRecent && isActiveTenant) {
                const ref = doc(db, "payments", pay.id);
                batch.set(ref, pay);
                count++;
            }
        });
    }

    // --- 5. UPLOAD READINGS (Apply 4 Month Rule) ---
    if (data.utilityReadings) {
        data.utilityReadings.forEach(reading => {
            const readDate = new Date(reading.date);
            if (readDate >= fourMonthsAgo) {
                const ref = doc(db, "utilityReadings", reading.id);
                batch.set(ref, reading);
                count++;
            }
        });
    }

    // --- 6. UPLOAD SETTINGS ---
    if (data.settings) {
        const ref = doc(db, "config", "globalSettings");
        batch.set(ref, data.settings);
        count++;
    }

    // --- COMMIT TO FIREBASE ---
    if (count > 0) {
        // Firestore batches are limited to 500. 
        // If you have >500 items, we would need to split this. 
        // For now, assuming <500 items for 4 months of data.
        await batch.commit();
        alert(`✅ Upload Complete! \n- Processed ${count} records.\n- Removed data older than 4 months.\n- Deleted all Left Tenant info.`);
        location.reload(); // Refresh page to see new data
    } else {
        alert("No relevant data found to upload.");
    }
}
