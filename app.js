/* ===================================
   DMARC Report Analyzer - Application Logic
   =================================== */

// Global state
let dmarcData = null;
let charts = {};

// Google API Config
let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

/* ===================================
   Initialization
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeSettings();
    loadGoogleScripts();
});

function initializeEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Google Drive analysis
    document.getElementById('analyze-drive-btn').addEventListener('click', handleDriveAnalysis);
    document.getElementById('drive-link').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDriveAnalysis();
    });

    // Google Auth
    document.getElementById('authorize-btn').addEventListener('click', handleAuthClick);
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('close-settings').addEventListener('click', closeSettings);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);

    // File upload
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    });

    // Export button
    document.getElementById('export-btn').addEventListener('click', exportResults);
}

function loadGoogleScripts() {
    // Check if scripts are loaded
    if (typeof gapi !== 'undefined') gapiLoaded();
    if (typeof google !== 'undefined') gisLoaded();
}

/* ===================================
   Settings & Google API Setup
   =================================== */

function initializeSettings() {
    const clientId = localStorage.getItem('dmarc_client_id');
    const apiKey = localStorage.getItem('dmarc_api_key');

    if (clientId) document.getElementById('client-id').value = clientId;
    if (apiKey) document.getElementById('api-key').value = apiKey;

    checkAuthStatus();
}

function openSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function saveSettings() {
    const clientId = document.getElementById('client-id').value.trim();
    const apiKey = document.getElementById('api-key').value.trim();

    if (!clientId || !apiKey) {
        alert('Please enter both Client ID and API Key');
        return;
    }

    localStorage.setItem('dmarc_client_id', clientId);
    localStorage.setItem('dmarc_api_key', apiKey);

    closeSettings();
    location.reload(); // Reload to re-initialize GAPI with new creds
}

function gapiLoaded() {
    gapi.load('client', intializeGapiClient);
}

async function intializeGapiClient() {
    const apiKey = localStorage.getItem('dmarc_api_key');
    if (!apiKey) return;

    await gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    checkAuthStatus();
}

function gisLoaded() {
    const clientId = localStorage.getItem('dmarc_client_id');
    if (!clientId) return;

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
            if (response.error !== undefined) {
                throw (response);
            }
            accessToken = response.access_token;
            checkAuthStatus();
            // If analysis was pending, trigger it now? 
            // Better UX: User clicks Analyze again, but now they are signed in.
        },
    });
    gisInited = true;
    checkAuthStatus();
}

function handleAuthClick() {
    if (!localStorage.getItem('dmarc_client_id')) {
        openSettings();
        return;
    }

    if (tokenClient.requestAccessToken === undefined) {
        showError('Google Identity Services not initialized. Refresh page or check API settings.');
        return;
    }

    tokenClient.requestAccessToken({ prompt: 'consent' });
}

function checkAuthStatus() {
    const authSection = document.getElementById('auth-section');
    if (!localStorage.getItem('dmarc_client_id')) {
        authSection.classList.remove('hidden');
        authSection.innerHTML = `
            <p>Please configure your Google Cloud Credentials in Settings to use Drive features.</p>
            <button class="btn btn-secondary" onclick="openSettings()">⚙️ Open Settings</button>
        `;
    } else if (!accessToken) {
        authSection.classList.remove('hidden');
        // Reset original content if needed, but it's hardcoded in HTML
    } else {
        authSection.classList.add('hidden');
    }
}

/* ===================================
   Tab Management
   =================================== */

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

/* ===================================
   Google Drive Processing
   =================================== */

async function handleDriveAnalysis() {
    const linkInput = document.getElementById('drive-link');
    const link = linkInput.value.trim();

    if (!link) {
        showError('Please enter a Google Drive link');
        return;
    }

    const driveId = extractDriveId(link);
    if (!driveId) {
        showError('Invalid Google Drive link. Could not extract File or Folder ID.');
        return;
    }

    if (!accessToken) {
        showError('Please sign in with Google first to access Drive files.');
        const authSection = document.getElementById('auth-section');
        authSection.classList.remove('hidden');
        authSection.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    showLoading(true);
    clearError();

    try {
        // Try to get file metadata first to determine if it's a folder or file
        const metadata = await gapi.client.drive.files.get({
            fileId: driveId,
            fields: 'id, name, mimeType'
        });

        const mimeType = metadata.result.mimeType;

        if (mimeType === 'application/vnd.google-apps.folder') {
            await processDriveFolder(driveId);
        } else {
            await processDriveFile(driveId, metadata.result.name);
        }

    } catch (error) {
        console.error('Drive API Error:', error);
        let errorMsg = error.message || (error.result && error.result.error && error.result.error.message);
        showError(`Error accessing Google Drive: ${errorMsg || 'Unknown error'}`);
    } finally {
        showLoading(false);
    }
}

function extractDriveId(url) {
    // Handle various Google Drive URL formats
    const patterns = [
        /\/folders\/([a-zA-Z0-9_-]+)/,      // /folders/ID
        /\/file\/d\/([a-zA-Z0-9_-]+)/,      // /file/d/ID
        /id=([a-zA-Z0-9_-]+)/,              // ?id=ID
        /\/open\?id=([a-zA-Z0-9_-]+)/,      // /open?id=ID
        /\/uc\?.*id=([a-zA-Z0-9_-]+)/       // /uc?export=download&id=ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

async function processDriveFolder(folderId) {
    // List all files in the folder
    // Query for ZIP or XML files, excluding trash
    const query = `'${folderId}' in parents and (mimeType = 'application/zip' or mimeType = 'text/xml' or name contains '.xml' or name contains '.zip') and trashed = false`;

    let files = [];
    let pageToken = null;

    do {
        const response = await gapi.client.drive.files.list({
            q: query,
            fields: 'nextPageToken, files(id, name, mimeType)',
            spaces: 'drive',
            pageToken: pageToken
        });

        files = files.concat(response.result.files);
        pageToken = response.result.nextPageToken;
    } while (pageToken);

    if (files.length === 0) {
        throw new Error('No ZIP or XML files found in this folder.');
    }

    // Process all found files
    let allReports = [];

    for (const file of files) {
        try {
            const fileContent = await fetchDriveFileContent(file.id);
            const isZip = file.mimeType.includes('zip') || file.name.endsWith('.zip');
            const fileReports = await processContent(fileContent, isZip ? 'zip' : 'xml', file.name);
            allReports = allReports.concat(fileReports);
        } catch (e) {
            console.error(`Skipping file ${file.name}:`, e);
        }
    }

    if (allReports.length === 0) {
        throw new Error('Could not parse any valid reports from the folder.');
    }

    // Merge and Display
    dmarcData = allReports.length === 1 ? allReports[0] : mergeReports(allReports);
    displayResults(dmarcData);
}

async function processDriveFile(fileId, fileName) {
    const content = await fetchDriveFileContent(fileId);
    const isZip = fileName.toLowerCase().endsWith('.zip');

    const reports = await processContent(content, isZip ? 'zip' : 'xml', fileName);

    if (reports.length === 0) {
        throw new Error('No valid reports found in file.');
    }

    dmarcData = reports.length === 1 ? reports[0] : mergeReports(reports);
    displayResults(dmarcData);
}

async function fetchDriveFileContent(fileId) {
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
    });
    return response.body; // text content for XML, but binary for ZIP? 
    // Wait, gapi client 'media' returns body as string usually. 
    // For binary (ZIP), we might need a different approach if gapi tries to decode it.
    // However, JSZip can load from string/base64/arraybuffer. 
    // Let's verify: gapi response.body is raw string.
}

// Updated fetch for binary safety
async function fetchDriveFileContent(fileId) {
    return new Promise((resolve, reject) => {
        const accessToken = gapi.auth.getToken().access_token;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.responseType = 'blob'; // Important for ZIP files
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Fetch failed: ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
    });
}

/* ===================================
   File Upload Handling
   =================================== */

async function handleFileUpload(file) {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isZip = fileName.endsWith('.zip');
    const isXml = fileName.endsWith('.xml');

    if (!isZip && !isXml) {
        showError('Please upload a ZIP or XML file');
        return;
    }

    showLoading(true);
    clearError();

    try {
        const reports = await processContent(file, isZip ? 'zip' : 'xml', fileName);
        if (reports.length === 0) throw new Error('No valid reports found');

        dmarcData = reports.length === 1 ? reports[0] : mergeReports(reports);
        displayResults(dmarcData);
    } catch (error) {
        showError(`Error processing file: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/* ===================================
   Core Processing Logic (Shared)
   =================================== */

async function processContent(input, type, sourceName) {
    let xmlFiles = [];

    if (type === 'zip') {
        const zip = await JSZip.loadAsync(input);
        const xmlFileNames = Object.keys(zip.files).filter(name =>
            name.toLowerCase().endsWith('.xml') && !name.startsWith('__MACOSX')
        );

        if (xmlFileNames.length === 0) {
            console.warn(`No XML files found in ZIP: ${sourceName}`);
            return [];
        }

        for (const fileName of xmlFileNames) {
            const content = await zip.files[fileName].async('text');
            xmlFiles.push({ name: fileName, content });
        }
    } else {
        // Direct XML file
        // Input can be Blob (from file upload/XHR) or string (if text)
        // If it's blob/file:
        let content;
        if (input instanceof Blob) {
            content = await input.text();
        } else {
            content = input; // Assume string
        }
        xmlFiles.push({ name: sourceName, content });
    }

    const reports = [];
    for (const xmlFile of xmlFiles) {
        try {
            const report = parseDmarcXml(xmlFile.content);
            reports.push(report);
        } catch (error) {
            console.error(`Error parsing ${xmlFile.name}:`, error);
        }
    }

    return reports;
}

/* ===================================
   DMARC XML Parsing
   =================================== */

function parseDmarcXml(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML format');
    }

    // Extract metadata
    const metadata = {
        orgName: getXmlValue(xmlDoc, 'org_name'),
        email: getXmlValue(xmlDoc, 'email'),
        reportId: getXmlValue(xmlDoc, 'report_id'),
        dateBegin: new Date(parseInt(getXmlValue(xmlDoc, 'date_begin')) * 1000),
        dateEnd: new Date(parseInt(getXmlValue(xmlDoc, 'date_end')) * 1000)
    };

    // Extract policy published
    const policy = {
        domain: getXmlValue(xmlDoc, 'policy_published domain'),
        adkim: getXmlValue(xmlDoc, 'policy_published adkim') || 'r',
        aspf: getXmlValue(xmlDoc, 'policy_published aspf') || 'r',
        p: getXmlValue(xmlDoc, 'policy_published p'),
        sp: getXmlValue(xmlDoc, 'policy_published sp') || 'none',
        pct: getXmlValue(xmlDoc, 'policy_published pct') || '100'
    };

    // Extract records
    const records = [];
    const recordElements = xmlDoc.querySelectorAll('record');

    recordElements.forEach(record => {
        const sourceIp = getXmlValue(record, 'source_ip');
        const count = parseInt(getXmlValue(record, 'count')) || 0;

        const policyEvaluated = {
            disposition: getXmlValue(record, 'policy_evaluated disposition'),
            dkim: getXmlValue(record, 'policy_evaluated dkim'),
            spf: getXmlValue(record, 'policy_evaluated spf')
        };

        const authResults = {
            spfDomain: getXmlValue(record, 'auth_results spf domain'),
            spfResult: getXmlValue(record, 'auth_results spf result'),
            dkimDomain: getXmlValue(record, 'auth_results dkim domain'),
            dkimResult: getXmlValue(record, 'auth_results dkim result'),
            dkimSelector: getXmlValue(record, 'auth_results dkim selector')
        };

        records.push({
            sourceIp,
            count,
            policyEvaluated,
            authResults
        });
    });

    return {
        metadata,
        policy,
        records
    };
}

function getXmlValue(xmlDoc, path) {
    const tags = path.split(' ');
    let element = xmlDoc;

    for (const tag of tags) {
        element = element.querySelector(tag);
        if (!element) return '';
    }

    return element.textContent.trim();
}

/* ===================================
   Report Merging
   =================================== */

function mergeReports(reports) {
    if (reports.length === 0) return null;

    // Combine multiple reports into one
    const merged = {
        metadata: reports[0].metadata,
        policy: reports[0].policy,
        records: []
    };

    // Update date range
    merged.metadata.dateBegin = new Date(Math.min(...reports.map(r => r.metadata.dateBegin)));
    merged.metadata.dateEnd = new Date(Math.max(...reports.map(r => r.metadata.dateEnd)));

    // Combine records
    const recordMap = new Map();
    reports.forEach(report => {
        report.records.forEach(record => {
            const key = record.sourceIp;
            if (recordMap.has(key)) {
                recordMap.get(key).count += record.count;
            } else {
                recordMap.set(key, { ...record });
            }
        });
    });

    merged.records = Array.from(recordMap.values());
    return merged;
}

/* ===================================
   Data Analysis
   =================================== */

function analyzeData(data) {
    const totalMessages = data.records.reduce((sum, r) => sum + r.count, 0);

    let dmarcPass = 0;
    let dmarcFail = 0;
    let spfPass = 0;
    let dkimPass = 0;

    data.records.forEach(record => {
        const isDmarcPass = record.policyEvaluated.dkim === 'pass' ||
            record.policyEvaluated.spf === 'pass';

        if (isDmarcPass) {
            dmarcPass += record.count;
        } else {
            dmarcFail += record.count;
        }

        if (record.policyEvaluated.spf === 'pass') {
            spfPass += record.count;
        }

        if (record.policyEvaluated.dkim === 'pass') {
            dkimPass += record.count;
        }
    });

    return {
        totalMessages,
        dmarcPass,
        dmarcFail,
        spfPass,
        dkimPass,
        dmarcPassRate: totalMessages > 0 ? ((dmarcPass / totalMessages) * 100).toFixed(1) : 0,
        spfPassRate: totalMessages > 0 ? ((spfPass / totalMessages) * 100).toFixed(1) : 0,
        dkimPassRate: totalMessages > 0 ? ((dkimPass / totalMessages) * 100).toFixed(1) : 0,
        uniqueSources: data.records.length
    };
}

/* ===================================
   Results Display
   =================================== */

function displayResults(data) {
    const analysis = analyzeData(data);

    // Show results section
    document.getElementById('results').classList.add('visible');

    // Render stats
    renderStats(analysis);

    // Render charts
    renderCharts(data, analysis);

    // Render table
    renderTable(data);

    // Render metadata
    renderMetadata(data);

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function renderStats(analysis) {
    const statsGrid = document.getElementById('stats-grid');

    const stats = [
        {
            label: 'Total Messages',
            value: analysis.totalMessages.toLocaleString(),
            class: ''
        },
        {
            label: 'DMARC Pass Rate',
            value: `${analysis.dmarcPassRate}%`,
            class: analysis.dmarcPassRate >= 95 ? 'success' : analysis.dmarcPassRate >= 80 ? 'warning' : 'danger'
        },
        {
            label: 'SPF Pass Rate',
            value: `${analysis.spfPassRate}%`,
            class: analysis.spfPassRate >= 95 ? 'success' : analysis.spfPassRate >= 80 ? 'warning' : 'danger'
        },
        {
            label: 'DKIM Pass Rate',
            value: `${analysis.dkimPassRate}%`,
            class: analysis.dkimPassRate >= 95 ? 'success' : analysis.dkimPassRate >= 80 ? 'warning' : 'danger'
        },
        {
            label: 'Unique Sources',
            value: analysis.uniqueSources.toLocaleString(),
            class: ''
        },
        {
            label: 'Failed Messages',
            value: analysis.dmarcFail.toLocaleString(),
            class: analysis.dmarcFail > 0 ? 'danger' : 'success'
        }
    ];

    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value ${stat.class}">${stat.value}</div>
        </div>
    `).join('');
}

function renderCharts(data, analysis) {
    // Destroy existing charts
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};

    // Authentication Results Pie Chart
    const authCtx = document.getElementById('auth-chart').getContext('2d');
    charts.auth = new Chart(authCtx, {
        type: 'doughnut',
        data: {
            labels: ['DMARC Pass', 'DMARC Fail'],
            datasets: [{
                data: [analysis.dmarcPass, analysis.dmarcFail],
                backgroundColor: [
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(255, 107, 107, 0.8)'
                ],
                borderColor: [
                    'rgba(67, 233, 123, 1)',
                    'rgba(255, 107, 107, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b8b8d1',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });

    // Volume by Source Bar Chart (Top 10)
    const sortedRecords = [...data.records].sort((a, b) => b.count - a.count).slice(0, 10);
    const volumeCtx = document.getElementById('volume-chart').getContext('2d');
    charts.volume = new Chart(volumeCtx, {
        type: 'bar',
        data: {
            labels: sortedRecords.map(r => r.sourceIp),
            datasets: [{
                label: 'Messages',
                data: sortedRecords.map(r => r.count),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b8b8d1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b8b8d1',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function renderTable(data) {
    const tbody = document.getElementById('records-table').querySelector('tbody');
    if (!tbody) return; // Guard clause in case table structure changed

    // Sort by count descending
    const sortedRecords = [...data.records].sort((a, b) => b.count - a.count);

    tbody.innerHTML = sortedRecords.map(record => {
        const dmarcPass = record.policyEvaluated.dkim === 'pass' ||
            record.policyEvaluated.spf === 'pass';

        return `
            <tr>
                <td><code>${record.sourceIp}</code></td>
                <td>${record.count.toLocaleString()}</td>
                <td><span class="badge badge-${record.policyEvaluated.spf === 'pass' ? 'success' : 'danger'}">${record.policyEvaluated.spf}</span></td>
                <td><span class="badge badge-${record.policyEvaluated.dkim === 'pass' ? 'success' : 'danger'}">${record.policyEvaluated.dkim}</span></td>
                <td><span class="badge badge-${dmarcPass ? 'success' : 'danger'}">${dmarcPass ? 'pass' : 'fail'}</span></td>
                <td><span class="badge badge-info">${record.policyEvaluated.disposition}</span></td>
            </tr>
        `;
    }).join('');
}

function renderMetadata(data) {
    const metadata = document.getElementById('metadata');

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    metadata.innerHTML = `
        <p><strong>Organization:</strong> ${data.metadata.orgName}</p>
        <p><strong>Report ID:</strong> ${data.metadata.reportId}</p>
        <p><strong>Report Period:</strong> ${data.metadata.dateBegin.toLocaleDateString('en-US', dateOptions)} - ${data.metadata.dateEnd.toLocaleDateString('en-US', dateOptions)}</p>
        <p><strong>Domain:</strong> ${data.policy.domain}</p>
        <p><strong>DMARC Policy:</strong> ${data.policy.p}</p>
        <p><strong>DKIM Alignment:</strong> ${data.policy.adkim === 'r' ? 'Relaxed' : 'Strict'}</p>
        <p><strong>SPF Alignment:</strong> ${data.policy.aspf === 'r' ? 'Relaxed' : 'Strict'}</p>
    `;
}

/* ===================================
   Export Functionality
   =================================== */

function exportResults() {
    if (!dmarcData) return;

    const analysis = analyzeData(dmarcData);

    // Create CSV content
    let csv = 'DMARC Report Analysis\n\n';
    csv += 'Summary Statistics\n';
    csv += `Total Messages,${analysis.totalMessages}\n`;
    csv += `DMARC Pass Rate,${analysis.dmarcPassRate}%\n`;
    csv += `SPF Pass Rate,${analysis.spfPassRate}%\n`;
    csv += `DKIM Pass Rate,${analysis.dkimPassRate}%\n`;
    csv += `Unique Sources,${analysis.uniqueSources}\n\n`;

    csv += 'Detailed Records\n';
    csv += 'Source IP,Count,SPF,DKIM,DMARC,Disposition\n';

    dmarcData.records.forEach(record => {
        const dmarcPass = record.policyEvaluated.dkim === 'pass' ||
            record.policyEvaluated.spf === 'pass';
        csv += `${record.sourceIp},${record.count},${record.policyEvaluated.spf},${record.policyEvaluated.dkim},${dmarcPass ? 'pass' : 'fail'},${record.policyEvaluated.disposition}\n`;
    });

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dmarc-analysis-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/* ===================================
   UI Helper Functions
   =================================== */

function showLoading(show) {
    document.getElementById('loading').classList.toggle('visible', show);
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `
        <div class="message message-error">
            <strong>Error:</strong> ${message}
        </div>
    `;
    errorContainer.scrollIntoView({ behavior: 'smooth' });
}

function clearError() {
    document.getElementById('error-container').innerHTML = '';
}

function initializeEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Google Drive analysis
    document.getElementById('analyze-drive-btn').addEventListener('click', handleDriveAnalysis);
    document.getElementById('drive-link').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDriveAnalysis();
    });

    // File upload
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    });

    // Export button
    document.getElementById('export-btn').addEventListener('click', exportResults);
}

/* ===================================
   Tab Management
   =================================== */

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

/* ===================================
   Google Drive Integration
   =================================== */

async function handleDriveAnalysis() {
    const linkInput = document.getElementById('drive-link');
    const link = linkInput.value.trim();

    if (!link) {
        showError('Please enter a Google Drive link');
        return;
    }

    const fileId = extractDriveFileId(link);
    if (!fileId) {
        showError('Invalid Google Drive link. Please use a valid share link.');
        return;
    }

    showLoading(true);
    clearError();

    try {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch file. Make sure the file is publicly accessible.');
        }

        const blob = await response.blob();
        await processFile(blob, link.toLowerCase().endsWith('.xml') ? 'xml' : 'zip');
    } catch (error) {
        showError(`Error fetching from Google Drive: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function extractDriveFileId(url) {
    // Handle various Google Drive URL formats
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,  // /file/d/FILE_ID
        /id=([a-zA-Z0-9_-]+)/,           // ?id=FILE_ID
        /\/open\?id=([a-zA-Z0-9_-]+)/    // /open?id=FILE_ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/* ===================================
   File Upload Handling
   =================================== */

async function handleFileUpload(file) {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isZip = fileName.endsWith('.zip');
    const isXml = fileName.endsWith('.xml');

    if (!isZip && !isXml) {
        showError('Please upload a ZIP or XML file');
        return;
    }

    showLoading(true);
    clearError();

    try {
        await processFile(file, isZip ? 'zip' : 'xml');
    } catch (error) {
        showError(`Error processing file: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/* ===================================
   File Processing
   =================================== */

async function processFile(file, type) {
    let xmlFiles = [];

    if (type === 'zip') {
        // Extract XML files from ZIP
        const zip = await JSZip.loadAsync(file);
        const xmlFileNames = Object.keys(zip.files).filter(name =>
            name.toLowerCase().endsWith('.xml') && !name.startsWith('__MACOSX')
        );

        if (xmlFileNames.length === 0) {
            throw new Error('No XML files found in ZIP archive');
        }

        for (const fileName of xmlFileNames) {
            const content = await zip.files[fileName].async('text');
            xmlFiles.push({ name: fileName, content });
        }
    } else {
        // Direct XML file
        const content = await file.text();
        xmlFiles.push({ name: file.name || 'report.xml', content });
    }

    // Parse all XML files
    const reports = [];
    for (const xmlFile of xmlFiles) {
        try {
            const report = parseDmarcXml(xmlFile.content);
            reports.push(report);
        } catch (error) {
            console.error(`Error parsing ${xmlFile.name}:`, error);
        }
    }

    if (reports.length === 0) {
        throw new Error('No valid DMARC reports found');
    }

    // Merge multiple reports if needed
    dmarcData = reports.length === 1 ? reports[0] : mergeReports(reports);

    // Display results
    displayResults(dmarcData);
}

/* ===================================
   DMARC XML Parsing
   =================================== */

function parseDmarcXml(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML format');
    }

    // Extract metadata
    const metadata = {
        orgName: getXmlValue(xmlDoc, 'org_name'),
        email: getXmlValue(xmlDoc, 'email'),
        reportId: getXmlValue(xmlDoc, 'report_id'),
        dateBegin: new Date(parseInt(getXmlValue(xmlDoc, 'date_begin')) * 1000),
        dateEnd: new Date(parseInt(getXmlValue(xmlDoc, 'date_end')) * 1000)
    };

    // Extract policy published
    const policy = {
        domain: getXmlValue(xmlDoc, 'policy_published domain'),
        adkim: getXmlValue(xmlDoc, 'policy_published adkim') || 'r',
        aspf: getXmlValue(xmlDoc, 'policy_published aspf') || 'r',
        p: getXmlValue(xmlDoc, 'policy_published p'),
        sp: getXmlValue(xmlDoc, 'policy_published sp') || 'none',
        pct: getXmlValue(xmlDoc, 'policy_published pct') || '100'
    };

    // Extract records
    const records = [];
    const recordElements = xmlDoc.querySelectorAll('record');

    recordElements.forEach(record => {
        const sourceIp = getXmlValue(record, 'source_ip');
        const count = parseInt(getXmlValue(record, 'count')) || 0;

        const policyEvaluated = {
            disposition: getXmlValue(record, 'policy_evaluated disposition'),
            dkim: getXmlValue(record, 'policy_evaluated dkim'),
            spf: getXmlValue(record, 'policy_evaluated spf')
        };

        const authResults = {
            spfDomain: getXmlValue(record, 'auth_results spf domain'),
            spfResult: getXmlValue(record, 'auth_results spf result'),
            dkimDomain: getXmlValue(record, 'auth_results dkim domain'),
            dkimResult: getXmlValue(record, 'auth_results dkim result'),
            dkimSelector: getXmlValue(record, 'auth_results dkim selector')
        };

        records.push({
            sourceIp,
            count,
            policyEvaluated,
            authResults
        });
    });

    return {
        metadata,
        policy,
        records
    };
}

function getXmlValue(xmlDoc, path) {
    const tags = path.split(' ');
    let element = xmlDoc;

    for (const tag of tags) {
        element = element.querySelector(tag);
        if (!element) return '';
    }

    return element.textContent.trim();
}

/* ===================================
   Report Merging
   =================================== */

function mergeReports(reports) {
    // Combine multiple reports into one
    const merged = {
        metadata: reports[0].metadata,
        policy: reports[0].policy,
        records: []
    };

    // Update date range
    merged.metadata.dateBegin = new Date(Math.min(...reports.map(r => r.metadata.dateBegin)));
    merged.metadata.dateEnd = new Date(Math.max(...reports.map(r => r.metadata.dateEnd)));

    // Combine records
    const recordMap = new Map();
    reports.forEach(report => {
        report.records.forEach(record => {
            const key = record.sourceIp;
            if (recordMap.has(key)) {
                recordMap.get(key).count += record.count;
            } else {
                recordMap.set(key, { ...record });
            }
        });
    });

    merged.records = Array.from(recordMap.values());
    return merged;
}

/* ===================================
   Data Analysis
   =================================== */

function analyzeData(data) {
    const totalMessages = data.records.reduce((sum, r) => sum + r.count, 0);

    let dmarcPass = 0;
    let dmarcFail = 0;
    let spfPass = 0;
    let dkimPass = 0;

    data.records.forEach(record => {
        const isDmarcPass = record.policyEvaluated.dkim === 'pass' ||
            record.policyEvaluated.spf === 'pass';

        if (isDmarcPass) {
            dmarcPass += record.count;
        } else {
            dmarcFail += record.count;
        }

        if (record.policyEvaluated.spf === 'pass') {
            spfPass += record.count;
        }

        if (record.policyEvaluated.dkim === 'pass') {
            dkimPass += record.count;
        }
    });

    return {
        totalMessages,
        dmarcPass,
        dmarcFail,
        spfPass,
        dkimPass,
        dmarcPassRate: totalMessages > 0 ? ((dmarcPass / totalMessages) * 100).toFixed(1) : 0,
        spfPassRate: totalMessages > 0 ? ((spfPass / totalMessages) * 100).toFixed(1) : 0,
        dkimPassRate: totalMessages > 0 ? ((dkimPass / totalMessages) * 100).toFixed(1) : 0,
        uniqueSources: data.records.length
    };
}

/* ===================================
   Results Display
   =================================== */

function displayResults(data) {
    const analysis = analyzeData(data);

    // Show results section
    document.getElementById('results').classList.add('visible');

    // Render stats
    renderStats(analysis);

    // Render charts
    renderCharts(data, analysis);

    // Render table
    renderTable(data);

    // Render metadata
    renderMetadata(data);

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function renderStats(analysis) {
    const statsGrid = document.getElementById('stats-grid');

    const stats = [
        {
            label: 'Total Messages',
            value: analysis.totalMessages.toLocaleString(),
            class: ''
        },
        {
            label: 'DMARC Pass Rate',
            value: `${analysis.dmarcPassRate}%`,
            class: analysis.dmarcPassRate >= 95 ? 'success' : analysis.dmarcPassRate >= 80 ? 'warning' : 'danger'
        },
        {
            label: 'SPF Pass Rate',
            value: `${analysis.spfPassRate}%`,
            class: analysis.spfPassRate >= 95 ? 'success' : analysis.spfPassRate >= 80 ? 'warning' : 'danger'
        },
        {
            label: 'DKIM Pass Rate',
            value: `${analysis.dkimPassRate}%`,
            class: analysis.dkimPassRate >= 95 ? 'success' : analysis.dkimPassRate >= 80 ? 'warning' : 'danger'
        },
        {
            label: 'Unique Sources',
            value: analysis.uniqueSources.toLocaleString(),
            class: ''
        },
        {
            label: 'Failed Messages',
            value: analysis.dmarcFail.toLocaleString(),
            class: analysis.dmarcFail > 0 ? 'danger' : 'success'
        }
    ];

    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value ${stat.class}">${stat.value}</div>
        </div>
    `).join('');
}

function renderCharts(data, analysis) {
    // Destroy existing charts
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};

    // Authentication Results Pie Chart
    const authCtx = document.getElementById('auth-chart').getContext('2d');
    charts.auth = new Chart(authCtx, {
        type: 'doughnut',
        data: {
            labels: ['DMARC Pass', 'DMARC Fail'],
            datasets: [{
                data: [analysis.dmarcPass, analysis.dmarcFail],
                backgroundColor: [
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(255, 107, 107, 0.8)'
                ],
                borderColor: [
                    'rgba(67, 233, 123, 1)',
                    'rgba(255, 107, 107, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b8b8d1',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });

    // Volume by Source Bar Chart (Top 10)
    const sortedRecords = [...data.records].sort((a, b) => b.count - a.count).slice(0, 10);
    const volumeCtx = document.getElementById('volume-chart').getContext('2d');
    charts.volume = new Chart(volumeCtx, {
        type: 'bar',
        data: {
            labels: sortedRecords.map(r => r.sourceIp),
            datasets: [{
                label: 'Messages',
                data: sortedRecords.map(r => r.count),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b8b8d1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b8b8d1',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function renderTable(data) {
    const tbody = document.getElementById('records-body');

    // Sort by count descending
    const sortedRecords = [...data.records].sort((a, b) => b.count - a.count);

    tbody.innerHTML = sortedRecords.map(record => {
        const dmarcPass = record.policyEvaluated.dkim === 'pass' ||
            record.policyEvaluated.spf === 'pass';

        return `
            <tr>
                <td><code>${record.sourceIp}</code></td>
                <td>${record.count.toLocaleString()}</td>
                <td><span class="badge badge-${record.policyEvaluated.spf === 'pass' ? 'success' : 'danger'}">${record.policyEvaluated.spf}</span></td>
                <td><span class="badge badge-${record.policyEvaluated.dkim === 'pass' ? 'success' : 'danger'}">${record.policyEvaluated.dkim}</span></td>
                <td><span class="badge badge-${dmarcPass ? 'success' : 'danger'}">${dmarcPass ? 'pass' : 'fail'}</span></td>
                <td><span class="badge badge-info">${record.policyEvaluated.disposition}</span></td>
            </tr>
        `;
    }).join('');
}

function renderMetadata(data) {
    const metadata = document.getElementById('metadata');

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    metadata.innerHTML = `
        <p><strong>Organization:</strong> ${data.metadata.orgName}</p>
        <p><strong>Report ID:</strong> ${data.metadata.reportId}</p>
        <p><strong>Report Period:</strong> ${data.metadata.dateBegin.toLocaleDateString('en-US', dateOptions)} - ${data.metadata.dateEnd.toLocaleDateString('en-US', dateOptions)}</p>
        <p><strong>Domain:</strong> ${data.policy.domain}</p>
        <p><strong>DMARC Policy:</strong> ${data.policy.p}</p>
        <p><strong>DKIM Alignment:</strong> ${data.policy.adkim === 'r' ? 'Relaxed' : 'Strict'}</p>
        <p><strong>SPF Alignment:</strong> ${data.policy.aspf === 'r' ? 'Relaxed' : 'Strict'}</p>
    `;
}

/* ===================================
   Export Functionality
   =================================== */

function exportResults() {
    if (!dmarcData) return;

    const analysis = analyzeData(dmarcData);

    // Create CSV content
    let csv = 'DMARC Report Analysis\n\n';
    csv += 'Summary Statistics\n';
    csv += `Total Messages,${analysis.totalMessages}\n`;
    csv += `DMARC Pass Rate,${analysis.dmarcPassRate}%\n`;
    csv += `SPF Pass Rate,${analysis.spfPassRate}%\n`;
    csv += `DKIM Pass Rate,${analysis.dkimPassRate}%\n`;
    csv += `Unique Sources,${analysis.uniqueSources}\n\n`;

    csv += 'Detailed Records\n';
    csv += 'Source IP,Count,SPF,DKIM,DMARC,Disposition\n';

    dmarcData.records.forEach(record => {
        const dmarcPass = record.policyEvaluated.dkim === 'pass' ||
            record.policyEvaluated.spf === 'pass';
        csv += `${record.sourceIp},${record.count},${record.policyEvaluated.spf},${record.policyEvaluated.dkim},${dmarcPass ? 'pass' : 'fail'},${record.policyEvaluated.disposition}\n`;
    });

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dmarc-analysis-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/* ===================================
   UI Helper Functions
   =================================== */

function showLoading(show) {
    document.getElementById('loading').classList.toggle('visible', show);
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `
        <div class="message message-error">
            <strong>Error:</strong> ${message}
        </div>
    `;
}

function clearError() {
    document.getElementById('error-container').innerHTML = '';
}
