# DMARC Report Analyzer

A beautiful, privacy-focused web application for analyzing DMARC (Domain-based Message Authentication, Reporting & Conformance) reports. Parse email authentication data from Google Drive links or direct file uploads and gain actionable insights with stunning visualizations.

![Version](https://img.shields.io/badge/version-1.5.4-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Privacy](https://img.shields.io/badge/privacy-100%25%20client--side-success.svg)

## ✨ Features

- **📧 Dual Input Methods**
  - **Google Drive Integration**:
    - Direct Google Drive API integration (requires setup)
    - Supports public and restricted files (via Sign In)
    - **Bulk Processing**: Analyze entire folders of ZIP files
    - Solves CORS issues with direct file fetching
  - **Drag-and-drop file upload**: Supports both ZIP and XML formats

- **🔒 100% Privacy-Focused**
  - All processing happens entirely in your browser
  - No data sent to any server
  - No tracking or analytics
  - Works offline after initial load

- **📊 Comprehensive Analysis**
  - Overall DMARC compliance rate
  - SPF authentication results
  - DKIM authentication results
  - Per-source IP breakdown
  - Message volume statistics
  - Failure identification

- **📈 Beautiful Visualizations**
  - Summary statistics cards
  - Interactive pie charts for authentication results
  - Bar charts for volume analysis
  - Detailed sortable tables
  - Color-coded compliance indicators

- **💾 Export Functionality**
  - Export analysis results as CSV
  - Includes summary statistics and detailed records

- **🎨 Modern UI/UX**
  - Dark mode with glassmorphism effects
  - Vibrant gradient colors
  - Smooth animations
  - Fully responsive design
  - Mobile-friendly

## 🚀 Getting Started

### Live Demo

Visit the live application: [DMARC Analyzer](https://kuancheen.github.io/dmarc-analyzer)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/kuancheen/dmarc-analyzer.git
cd dmarc-analyzer
```

2. Serve the files using any local web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`

## 📖 How to Use

### Method 1: Google Drive Link

1. **First Time Setup**:
   - Click "⚙️ API Settings" in the top right.
   - Enter your **Google Cloud Client ID** and **API Key**.
   - These are saved locally in your browser.
2. **Sign In**: Click "Sign In with Google" to authorize access.
3. **Analyze**:
   - Paste a link to a **File** or a **Folder**.
   - Click "Analyze".
   - If you paste a folder link, the app will find and process all ZIP/XML files inside it.

### Method 2: File Upload

1. Click on the "File Upload" tab
2. Either drag and drop your file or click to browse
3. Select your DMARC report (ZIP or XML file)
4. The analysis will start automatically

### Understanding Your Results

**Summary Statistics**
- **Total Messages**: Total number of email messages reported
- **DMARC Pass Rate**: Percentage of messages that passed DMARC (either SPF or DKIM aligned)
- **SPF Pass Rate**: Percentage of messages that passed SPF authentication
- **DKIM Pass Rate**: Percentage of messages that passed DKIM authentication
- **Unique Sources**: Number of different IP addresses sending on your behalf
- **Failed Messages**: Number of messages that failed DMARC

**Charts**
- **Authentication Results**: Visual breakdown of pass/fail status
- **Message Volume by Source**: Top 10 sending sources by volume

**Detailed Records Table**
- Source IP addresses
- Message count per source
- SPF, DKIM, and DMARC status
- Disposition (what action the receiver took)

## 📧 Getting DMARC Reports

DMARC reports are typically sent via email to the address specified in your DMARC DNS record. Here's how to set up and receive them:

### 1. Set Up DMARC DNS Record

Add a TXT record to your DNS:
```
_dmarc.yourdomain.com. IN TXT "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

### 2. Receive Reports

Email providers will send daily aggregate reports to the specified address. These reports are typically:
- Sent as ZIP files containing XML
- Named with the format: `!yourdomain.com!senderdomain.com!timestamp.zip`

### 3. Save to Google Drive

- Save the ZIP or XML files to your Google Drive
- Make them publicly accessible
- Use this tool to analyze them

## 🛠️ Technical Details

### Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with custom properties and animations
- **JavaScript (ES6+)**: Client-side application logic
- **JSZip**: ZIP file extraction
- **Chart.js**: Data visualization
- **Google Fonts (Inter)**: Typography

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### File Format Support

This tool supports standard DMARC aggregate reports in XML format as defined by [RFC 7489](https://tools.ietf.org/html/rfc7489).

## 🔐 Privacy & Security

Your privacy is our top priority:

- ✅ **No Server Processing**: All file processing happens in your browser using JavaScript
- ✅ **No Data Collection**: We don't collect, store, or transmit any of your data
- ✅ **No External Services**: Except for loading libraries from CDNs, no external services are contacted
- ✅ **Open Source**: All code is transparent and available for review

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## 🙏 Acknowledgments

- Icons from Unicode Emoji
- Fonts from Google Fonts
- Libraries: JSZip, Chart.js, Google Drive API

## 💬 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ for better email security**

&copy; 2025 DMARC Analyzer. All rights reserved.
