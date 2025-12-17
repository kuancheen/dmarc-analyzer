# Changelog

All notable changes to the DMARC Report Analyzer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.9] - 2025-12-17

### Changed
- **UX**: Log entries are now prepended (newest on top) instead of appended, so you always see the latest action first.
- **UX**: The Log Card is now completely hidden until an analysis starts.
- **UI**: Improved zebra striping contrast in the log (alternating dark/lighter rows) for better readability.

## [1.4.8] - 2025-12-17

### Fixed
- **System**: Renamed core files to `dmarc-app.js` and `dmarc-style.css` to permanently resolve persistent browser caching issues.
- **Stability**: Hardened event listener initialization with error handling to prevent the entire app from breaking if a single UI element is missing.
- **UI**: Added `!important` flags to Log UI styles to ensure the custom font (Courier New) and sizing are correctly applied.

## [1.4.7] - 2025-12-17

### Cleanup & UI Polish
- **UI**: Removed the redundant "Report Information" card (as requested).
- **UI**: Updated Progress Log font to `Courier New` and added alternating background colors for better readability.
- **Fix**: Reinforced the log collapse logic with specific padding overrides to ensure it closes completely.
- **Fix**: Verified Export button functionality (it now actively alerts if no data is present).

## [1.4.6] - 2025-12-17

### Fixed
- **Fix**: Fixed "Invalid Date" issue by implementing safer integer parsing for XML timestamps (Unix format).
- **Fix**: Fixed Export Results button (added null checks and better error feedback).
- **UI**: Redesigned Progress Log to match the card aesthetic, improved typography (smaller, monospaced), and fixed the collapse/expand logic.

## [1.4.5] - 2025-12-17

### Fixed
- **Regression**: Fixed `ReferenceError: showError is not defined`. Re-added the function which was accidentally deleted during v1.4.0 refactoring.
- **Bug**: Fixed `ReferenceError: sum is not defined` caused by a syntax error in the array reduction logic (`analyzeData` function).

## [1.4.4] - 2025-12-17

### Fixed
- **Hotfix**: Fixed `SyntaxError: Unexpected token '}'`. Removed stray closing braces that were accidentally introduced while fixing the `showLoading` reference error.

## [1.4.3] - 2025-12-17

### Fixed
- **Regression**: Fixed `ReferenceError: showLoading is not defined`. This function was removed in v1.4.0 in favor of `setLogState` but was still being called in the analysis workflows.

## [1.4.2] - 2025-12-17

### Fixed
- **Hotfix**: Fixed `SyntaxError: Unexpected token ')'` in `app.js`. A stray closing sequence `});` was left over from a previous edit inside `initializeEventListeners`.

## [1.4.1] - 2025-12-17

### Fixed
- **Hotfix**: Removed stray markdown characters from CSS and fixed a syntax error (unexpected token inside event listeners) in `app.js`.

## [1.4.0] - 2025-12-17

### Added
- **UI/UX**: Modals now close when clicking outside or pressing `Esc`.
- **UI/UX**: Progress Log moved to bottom of page and is now **collapsible**.
    - Auto-expands during processing.
    - Auto-collapses when finished to keep UI clean.

### Changed
- **Refactor**: Removed redundant "Report Information" card (metadata is available in the log).
- **Fix**: Improved export button reliability.

## [1.3.3] - 2025-12-17

### Fixed
- **Hotfix**: Fixed `SyntaxError: Unexpected end of input`. A missing closing brace `}` for the `initializeEventListeners` function was causing the entire file to be malformed.

## [1.3.2] - 2025-12-17

### Fixed
- **Hotfix**: Fixed `ReferenceError: reports is not defined`. A stray closing brace was causing the return statement to be unreachable, breaking the file processing logic.

## [1.3.1] - 2025-12-17

### Fixed
- **Hotfix**: Resolved a critical syntax error (`Unexpected token 'catch'`) in `app.js` that prevented reports from being parsed.

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

[1.4.9]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.8...v1.4.9
[1.4.8]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.7...v1.4.8
[1.4.7]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.6...v1.4.7
[1.4.6]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.5...v1.4.6
[1.4.5]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.4...v1.4.5
[1.4.4]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.3...v1.4.4
[1.4.3]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.2...v1.4.3
[1.4.2]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.3.3...v1.4.0
[1.3.3]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.3.0...v1.3.1
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
é22