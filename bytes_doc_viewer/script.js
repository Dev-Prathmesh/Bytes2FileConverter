const fileInput = document.getElementById("fileInput");
const viewButton = document.getElementById("viewButton");
const status = document.getElementById("status");
const pdfViewer = document.getElementById("pdfViewer");

viewButton.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
        status.textContent = "Please select a TXT file.";
        return;
    }

    try {

        status.textContent = "Reading PDF data...";

        // Read TXT file
        let hex = await file.text();

        console.log("========== FILE INFO ==========");
        console.log("File name:", file.name);
        console.log("File size:", file.size);
        console.log("HEX text length:", hex.length);

        // Remove spaces/newlines if any
        hex = hex.trim();

        // Remove SQL Server 0x prefix
        if (hex.startsWith("0x")) {
            hex = hex.substring(2);
        }

        console.log("HEX length after removing 0x:", hex.length);

        // Expected HEX length
        if (hex.length !== 1643838) {
            throw new Error(
                `Unexpected HEX length. Expected 1643838 but received ${hex.length}.`
            );
        }

        // Make sure only HEX characters exist
        if (!/^[0-9a-fA-F]+$/.test(hex)) {
            throw new Error(
                "TXT contains invalid characters. Only HEX characters are allowed."
            );
        }

        // HEX must contain pairs of characters
        if (hex.length % 2 !== 0) {
            throw new Error(
                "HEX data has an odd length. The PDF data is incomplete."
            );
        }

        status.textContent = "Converting HEX to PDF bytes...";

        // Create byte array
        const bytes = new Uint8Array(hex.length / 2);

        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(
                hex.substring(i, i + 2),
                16
            );
        }

        console.log("========== PDF INFO ==========");
        console.log("PDF size:", bytes.length, "bytes");

        // Check PDF header
        const header = new TextDecoder().decode(
            bytes.slice(0, 5)
        );

        console.log("PDF header:", header);

        if (header !== "%PDF-") {
            throw new Error(
                "Invalid PDF header: " + header
            );
        }

        // Check PDF ending
        const lastBytes = new TextDecoder().decode(
            bytes.slice(-20)
        );

        console.log("PDF ending:", lastBytes);

        // Create PDF Blob
        const pdfBlob = new Blob(
            [bytes],
            {
                type: "application/pdf"
            }
        );

        // Create browser URL
        const pdfUrl = URL.createObjectURL(pdfBlob);

        console.log("PDF URL:", pdfUrl);

        // Display PDF
        pdfViewer.src = pdfUrl;
        pdfViewer.style.display = "block";

        status.textContent =
            `PDF loaded successfully (${bytes.length.toLocaleString()} bytes).`;

    } catch (error) {

        console.error("PDF ERROR:", error);

        status.textContent =
            "Error: " + error.message;
    }
});

