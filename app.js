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

    // Basic validation for API Key format (starts with AIza)
    if (!apiKey.startsWith('AIza')) {
        alert('Invalid API Key format. API Keys should start with "AIza". You might have pasted a Client Secret by mistake.');
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

    try {
        await gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        checkAuthStatus();
    } catch (error) {
        console.error('GAPI Init Error:', error);
        showError('Failed to initialize Google API. Please check your API Key in Settings. It may be invalid or restricted.');
        // Force open settings if init failed to let user fix it
        setTimeout(() => openSettings(), 1000);
    }
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

    if (tokenClient?.requestAccessToken === undefined) {
        // Fallback or retry logic could go here, but usually indicates script not loaded or init failed
        if (!gisInited) {
            // Try to load again if missed
            loadGoogleScripts();
            setTimeout(() => {
                if (tokenClient?.requestAccessToken) {
                    tokenClient.requestAccessToken({ prompt: 'consent' });
                } else {
                    showError('Google Services not ready. Please verify Client ID in settings and refresh.');
                }
            }, 1000);
            return;
        }
        showError('Google Identity Services not initialized. Refresh page or check API settings.');
        return;
    }

    tokenClient.requestAccessToken({ prompt: 'consent' });
}

function checkAuthStatus() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    if (!localStorage.getItem('dmarc_client_id')) {
        authSection.classList.remove('hidden');
        authSection.innerHTML = `
            <p>Please configure your Google Cloud Credentials in Settings to use Drive features.</p>
            <button class="btn btn-secondary" style="margin-top: 10px;">⚙️ Open Settings</button>
        `;
        // Re-attach event listener for the button we just injected
        authSection.querySelector('button').onclick = openSettings;
    } else if (!accessToken) {
        authSection.classList.remove('hidden');
        // Restore default auth button content if it was overwritten
        if (!authSection.querySelector('#authorize-btn')) {
            authSection.innerHTML = `
                <p>To analyze Google Drive links properly (including folders and restricted files), please sign in.</p>
                <button class="btn btn-google" id="authorize-btn">
                    <span class="icon">🔑</span> Sign In with Google
                </button>
             `;
            document.getElementById('authorize-btn').addEventListener('click', handleAuthClick);
        }
    } else {
        authSection.classList.add('hidden');
    }
}

/* ===================================
   Tab Management
   =================================== */

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

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
    clearLog();
    addLog(`Starting analysis for link: ${link}...`);

    try {
        // Try to get file metadata first to determine if it's a folder or file
        const metadata = await gapi.client.drive.files.get({
            fileId: driveId,
            fields: 'id, name, mimeType',
            supportsAllDrives: true
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
    addLog(`Scanning folder ID: ${folderId}...`);
    // mimeType = 'application/x-gzip' is often used for .gz files
    const query = `'${folderId}' in parents and (mimeType = 'application/zip' or mimeType = 'application/x-gzip' or mimeType = 'application/gzip' or mimeType = 'text/xml' or name contains '.xml' or name contains '.zip' or name contains '.gz') and trashed = false`;

    let files = [];
    let pageToken = null;

    do {
        const response = await gapi.client.drive.files.list({
            q: query,
            fields: 'nextPageToken, files(id, name, mimeType)',
            spaces: 'drive',
            pageToken: pageToken,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        addLog(`Found ${response.result.files.length} potential files in this batch...`);
        files = files.concat(response.result.files);
        pageToken = response.result.nextPageToken;
    } while (pageToken);

    if (files.length === 0) {
        addLog('No ZIP, GZIP, or XML files found.', 'warning');
        throw new Error('No ZIP or XML files found in this folder.');
    }

    addLog(`Total files to process: ${files.length}`);
    let allReports = [];

    for (const [index, file] of files.entries()) {
        try {
            addLog(`Processing file ${index + 1}/${files.length}: ${file.name} (${file.mimeType})`);
            const fileContent = await fetchDriveFileContent(file.id);
            const fileName = file.name.toLowerCase();
            let type = 'xml';
            if (fileName.endsWith('.zip') || file.mimeType.includes('zip') && !file.mimeType.includes('gzip')) {
                type = 'zip';
            } else if (fileName.endsWith('.gz') || file.mimeType.includes('gzip')) {
                type = 'gzip';
            }

            const fileReports = await processContent(fileContent, type, file.name);
            allReports = allReports.concat(fileReports);
        } catch (e) {
            console.error(`Skipping file ${file.name}:`, e);
            addLog(`Skipped ${file.name}: ${e.message}`, 'error');
        }
    }

    if (allReports.length === 0) {
        throw new Error('Could not parse any valid reports from the folder.');
    }

    dmarcData = allReports.length === 1 ? allReports[0] : mergeReports(allReports);
    displayResults(dmarcData);
}

async function processDriveFile(fileId, fileName) {
    addLog(`Fetching single file: ${fileName}...`);
    const content = await fetchDriveFileContent(fileId);
    const name = fileName.toLowerCase();

    let type = 'xml';
    if (name.endsWith('.zip')) {
        type = 'zip';
    } else if (name.endsWith('.gz')) {
        type = 'gzip';
    }

    const reports = await processContent(content, type, fileName);

    if (reports.length === 0) {
        throw new Error('No valid reports found in file.');
    }

    dmarcData = reports.length === 1 ? reports[0] : mergeReports(reports);
    displayResults(dmarcData);
}

async function fetchDriveFileContent(fileId) {
    return new Promise((resolve, reject) => {
        const accessToken = gapi.auth.getToken().access_token;
        const xhr = new XMLHttpRequest();
        // Add supportsAllDrives=true to the URL query parameters
        xhr.open('GET', `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`);
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.responseType = 'blob';
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
    const isGzip = fileName.endsWith('.gz') || fileName.endsWith('.gzip');
    const isXml = fileName.endsWith('.xml');

    if (!isZip && !isXml && !isGzip) {
        showError('Please upload a ZIP, GZIP, or XML file');
        return;
    }

    showLoading(true);
    clearError();

    try {
        let type = 'xml';
        if (isZip) type = 'zip';
        else if (isGzip) type = 'gzip';

        const reports = await processContent(file, type, fileName);
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

    addLog(`Extracting content from ${sourceName} (${type})...`);

    if (type === 'zip') {
        const zip = await JSZip.loadAsync(input);
        const xmlFileNames = Object.keys(zip.files).filter(name =>
            name.toLowerCase().endsWith('.xml') && !name.startsWith('__MACOSX')
        );

        if (xmlFileNames.length === 0) {
            console.warn(`No XML files found in ZIP: ${sourceName}`);
            addLog(`No XML files found inside ZIP: ${sourceName}`, 'warning');
            return [];
        }

        addLog(`Found ${xmlFileNames.length} XML file(s) in ZIP.`);

        for (const fileName of xmlFileNames) {
            const content = await zip.files[fileName].async('text');
            xmlFiles.push({ name: fileName, content });
            addLog(`Extracted: ${fileName}`);
        }
    } else if (type === 'gzip') {
        try {
            addLog('Decompressing GZIP...');
            const content = await decompressGzip(input);
            xmlFiles.push({ name: sourceName, content });
            addLog('Decompression successful.', 'success');
        } catch (e) {
            console.error('GZIP Decompression failed:', e);
            throw new Error(`Failed to decompress GZIP file: ${sourceName}`);
        }
    } else {
        // Direct XML file
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
        const report = parseDmarcXml(xmlFile.content);
        reports.push(report);

        // LOGGING METADATA AS REQUESTED
        const meta = report.metadata;
        const dateRange = `${meta.dateBegin.toLocaleDateString()} - ${meta.dateEnd.toLocaleDateString()}`;
        addLog(`Parsed: ${xmlFile.name}<br><span class="log-metadata">Org: ${meta.orgName} | ID: ${meta.reportId} | Period: ${dateRange}</span>`, 'success');

    } catch (error) {
        console.error(`Error parsing ${xmlFile.name}:`, error);
        addLog(`Failed to parse XML ${xmlFile.name}: ${error.message}`, 'error');
    }
}

return reports;
}

async function decompressGzip(blob) {
    // Check for DecompressionStream support
    if ('DecompressionStream' in window) {
        const ds = new DecompressionStream('gzip');
        const stream = blob.stream().pipeThrough(ds);
        return new Response(stream).text();
    } else {
        throw new Error('GZIP decompression is not supported in this browser. Please use a modern browser (Chrome, Edge, Safari, Firefox).');
    }
}

/* ===================================
   DMARC XML Parsing
   =================================== */

function parseDmarcXml(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    if (xmlDoc.querySelector('parsererror')) {
        throw new Error('Invalid XML format');
    }

    const metadata = {
        orgName: getXmlValue(xmlDoc, 'org_name'),
        email: getXmlValue(xmlDoc, 'email'),
        reportId: getXmlValue(xmlDoc, 'report_id'),
        dateBegin: new Date(parseInt(getXmlValue(xmlDoc, 'date_begin')) * 1000),
        dateEnd: new Date(parseInt(getXmlValue(xmlDoc, 'date_end')) * 1000)
    };

    const policy = {
        domain: getXmlValue(xmlDoc, 'policy_published domain'),
        adkim: getXmlValue(xmlDoc, 'policy_published adkim') || 'r',
        aspf: getXmlValue(xmlDoc, 'policy_published aspf') || 'r',
        p: getXmlValue(xmlDoc, 'policy_published p'),
        sp: getXmlValue(xmlDoc, 'policy_published sp') || 'none',
        pct: getXmlValue(xmlDoc, 'policy_published pct') || '100'
    };

    const records = [];
    xmlDoc.querySelectorAll('record').forEach(record => {
        records.push({
            sourceIp: getXmlValue(record, 'source_ip'),
            count: parseInt(getXmlValue(record, 'count')) || 0,
            policyEvaluated: {
                disposition: getXmlValue(record, 'policy_evaluated disposition'),
                dkim: getXmlValue(record, 'policy_evaluated dkim'),
                spf: getXmlValue(record, 'policy_evaluated spf')
            },
            authResults: {
                spfDomain: getXmlValue(record, 'auth_results spf domain'),
                spfResult: getXmlValue(record, 'auth_results spf result'),
                dkimDomain: getXmlValue(record, 'auth_results dkim domain'),
                dkimResult: getXmlValue(record, 'auth_results dkim result'),
                dkimSelector: getXmlValue(record, 'auth_results dkim selector')
            }
        });
    });

    return { metadata, policy, records };
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

    const merged = {
        metadata: reports[0].metadata,
        policy: reports[0].policy,
        records: []
    };

    merged.metadata.dateBegin = new Date(Math.min(...reports.map(r => r.metadata.dateBegin)));
    merged.metadata.dateEnd = new Date(Math.max(...reports.map(r => r.metadata.dateEnd)));

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

    let dmarcPass = 0, dmarcFail = 0, spfPass = 0, dkimPass = 0;

    data.records.forEach(record => {
        const isDmarcPass = record.policyEvaluated.dkim === 'pass' ||
            record.policyEvaluated.spf === 'pass';

        if (isDmarcPass) dmarcPass += record.count;
        else dmarcFail += record.count;

        if (record.policyEvaluated.spf === 'pass') spfPass += record.count;
        if (record.policyEvaluated.dkim === 'pass') dkimPass += record.count;
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
    document.getElementById('results').classList.add('visible');
    renderStats(analysis);
    renderCharts(data, analysis);
    renderTable(data);
    renderMetadata(data);
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function renderStats(analysis) {
    const statsGrid = document.getElementById('stats-grid');
    const stats = [
        { label: 'Total Messages', value: analysis.totalMessages.toLocaleString(), class: '' },
        { label: 'DMARC Pass Rate', value: `${analysis.dmarcPassRate}%`, class: analysis.dmarcPassRate >= 95 ? 'success' : analysis.dmarcPassRate >= 80 ? 'warning' : 'danger' },
        { label: 'SPF Pass Rate', value: `${analysis.spfPassRate}%`, class: analysis.spfPassRate >= 95 ? 'success' : analysis.spfPassRate >= 80 ? 'warning' : 'danger' },
        { label: 'DKIM Pass Rate', value: `${analysis.dkimPassRate}%`, class: analysis.dkimPassRate >= 95 ? 'success' : analysis.dkimPassRate >= 80 ? 'warning' : 'danger' },
        { label: 'Unique Sources', value: analysis.uniqueSources.toLocaleString(), class: '' },
        { label: 'Failed Messages', value: analysis.dmarcFail.toLocaleString(), class: analysis.dmarcFail > 0 ? 'danger' : 'success' }
    ];

    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value ${stat.class}">${stat.value}</div>
        </div>
    `).join('');
}

function renderCharts(data, analysis) {
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};

    const authCtx = document.getElementById('auth-chart').getContext('2d');
    charts.auth = new Chart(authCtx, {
        type: 'doughnut',
        data: {
            labels: ['DMARC Pass', 'DMARC Fail'],
            datasets: [{
                data: [analysis.dmarcPass, analysis.dmarcFail],
                backgroundColor: ['rgba(67, 233, 123, 0.8)', 'rgba(255, 107, 107, 0.8)'],
                borderColor: ['rgba(67, 233, 123, 1)', 'rgba(255, 107, 107, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#b8b8d1', font: { size: 12 } }
                }
            }
        }
    });

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
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#b8b8d1' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                x: { ticks: { color: '#b8b8d1', maxRotation: 45, minRotation: 45 }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
            }
        }
    });
}

function renderTable(data) {
    const tbody = document.getElementById('records-table').querySelector('tbody');
    if (!tbody) return;
    const sortedRecords = [...data.records].sort((a, b) => b.count - a.count);
    tbody.innerHTML = sortedRecords.map(record => {
        const dmarcPass = record.policyEvaluated.dkim === 'pass' || record.policyEvaluated.spf === 'pass';
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
    let csv = 'DMARC Report Analysis\n\nSummary Statistics\n';
    csv += `Total Messages,${analysis.totalMessages}\n`;
    csv += `DMARC Pass Rate,${analysis.dmarcPassRate}%\n`;
    csv += `SPF Pass Rate,${analysis.spfPassRate}%\n`;
    csv += `DKIM Pass Rate,${analysis.dkimPassRate}%\n`;
    csv += `Unique Sources,${analysis.uniqueSources}\n\n`;
    csv += 'Detailed Records\nSource IP,Count,SPF,DKIM,DMARC,Disposition\n';
    dmarcData.records.forEach(record => {
        const dmarcPass = record.policyEvaluated.dkim === 'pass' || record.policyEvaluated.spf === 'pass';
        csv += `${record.sourceIp},${record.count},${record.policyEvaluated.spf},${record.policyEvaluated.dkim},${dmarcPass ? 'pass' : 'fail'},${record.policyEvaluated.disposition}\n`;
    });
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

errorContainer.scrollIntoView({ behavior: 'smooth' });
}

function clearError() {
    document.getElementById('error-container').innerHTML = '';
}

function clearLog() {
    const log = document.getElementById('progress-log');
    if (log) log.innerHTML = '';
}

function addLog(message, type = 'info') {
    const logContainer = document.getElementById('progress-log');
    if (!logContainer) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}
