# Changelog

All notable changes to the DMARC Report Analyzer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-17

### Added
- **Features**: Added **WHOIS Lookup** for Source IPs.
    - Click on any IP address in the "Detailed Records" table to view intelligence.
    - Shows Organization, ISP, Location (City/Country), and ASN.
    - Uses free `ipwho.is` API (client-side, no key required).
    - UI inspired by "AI Overview" summary cards.

## [1.2.0] - 2025-12-17

### Added
- **Features**: Implemented detailed **Progress Logging** during analysis.
    - Shows real-time logs of files being scanned and processed.
    - Displays extracted metadata (Organization, Report ID, Date Period) for each parsed report.
    - Helps debug issues with specific files in large folders.

## [1.1.5] - 2025-12-16

### Fixed
- **Critical**: Fixed cache busting mechanism. Previous versions (v1.1.2-v1.1.4) were incorrectly loading the old `v1.1.1` code due to a missing update in `index.html`. Users on Shared Drives should now actually receive the fix.

## [1.1.4] - 2025-12-16

### Fixed
- **Feature**: Added full support for **Google Shared Drives** (formerly Team Drives).
- Fixed `404 File Not Found` errors when accessing files/folders on Shared Drives by adding the `supportsAllDrives=true` parameter to all API calls.

## [1.1.3] - 2025-12-16

### Fixed
- **Bug**: Fixed `Error: Can't find end of central directory` when processing `.gz` (GZIP) files. The app now correctly identifies and decompresses GZIP files separately from ZIP archives.

## [1.1.2] - 2025-12-16

### Fixed
- Added validation for API Key format to prevent users from accidentally using Client Secrets.
- Added graceful error handling for Google API initialization failures (e.g., invalid key).
- Improved error messages for API setup issues.

## [1.1.1] - 2025-12-16

### Fixed
- **Critical**: Resolved duplicate logic in `app.js` causing CORS errors even with API integration.
- **Critical**: Restored missing "Settings Modal" HTML structure that prevented saving API keys.
- Added cache busting for static assets (`app.js`, `style.css`) to ensure users get the latest version.

## [1.1.0] - 2025-12-16

### Added
- **Google Drive API Integration**: 
  - Robust file fetching via OAuth 2.0 (solves CORS issues)
  - Support for processing entire folders of ZIP files
  - New "Settings" modal for custom API credentials
  - Authenticated access to restricted files
- New styles for auth buttons and modal system
- Updated dependencies for Google Identity Services

## [1.0.1] - 2025-12-16

### Fixed
- Corrected GitHub repository URLs in README and CHANGELOG
- Updated deployment documentation links

## [1.0.0] - 2025-12-16

### Added
- Initial release of DMARC Report Analyzer
- Google Drive link integration for fetching reports
- Drag-and-drop file upload functionality
- Support for both ZIP and XML file formats
- ZIP file extraction using JSZip library
- DMARC XML parsing engine
- Comprehensive statistical analysis:
  - Total message count
  - DMARC pass/fail rates
  - SPF authentication statistics
  - DKIM authentication statistics
  - Unique source identification
  - Failed message tracking
- Beautiful visualizations:
  - Summary statistics cards with color-coded indicators
  - Pie chart for authentication results distribution
  - Bar chart for top 10 sources by volume
- Detailed records table with sortable data
- Report metadata display
- CSV export functionality for analysis results
- Modern UI with dark theme and glassmorphism effects
- Vibrant gradient color palette
- Smooth animations and transitions
- Fully responsive design for mobile and desktop
- 100% client-side processing for privacy
- Comprehensive documentation (README, LICENSE)
- SEO optimization

### Technical Features
- Multiple Google Drive URL format support
- Batch processing of multiple XML files in ZIP
- Report merging for multiple DMARC reports
- Error handling and user-friendly error messages
- Loading indicators for better UX
- Tab-based input interface
- Chart.js integration for data visualization

### Privacy & Security
- No server-side processing
- No data collection or tracking
- All processing happens in the browser
- Works offline after initial load

[1.3.0]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.1.5...v1.2.0
[1.1.5]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/kuancheen/dmarc-analyzer/releases/tag/v1.0.0
