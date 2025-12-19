# Changelog

All notable changes to the DMARC Report Analyzer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.4] - 2025-12-20

### Added
- **Documentation**: Added **Hits.sh** view counter badge to `README.md` for visibility tracking.

## [1.7.3] - 2025-12-20

### Changed
- **Footer**: Integrated **Hits.sh** view counter badge and consolidated version, documentation links, and copyright into a single responsive line.

## [1.7.2] - 2025-12-19

### Changed
- **Documentation**: Updated footer to link directly to README and CHANGELOG using the [MD Viewer](https://kuancheen.github.io/md-viewer/).
- **Attribution**: Updated copyright notice to link to the author's GitHub profile.

## [1.7.1] - 2025-12-19

### Fixed
- **Documentation**: Linked the "Live Demo" badge in `README.md` to the live site URL for easier access.

## [1.7.0] - 2025-12-19

### Added
- **Drive Date Filtering**: Users can now filter Google Drive folder results by date before analysis.
  - **Latest**: Processes all files from the same calendar day as the newest file in the folder.
  - **7 Days / 30 Days**: Processes files within a specific timeframe from the newest file.
- **Smart Filtering Logic**: The app now automatically fetches `createdTime` metadata and applies logic relative to the most recent upload.

## [1.6.8] - 2025-12-19

### Changed
- **Compliance Audit**: Standardized project structure and documentation according to `new-project-init` workflow.
- **Documentation**: Added missing Semantic Versioning, Status, and Live Demo badges to `README.md`.
- **UI/UX**: Added mandatory HTML Comment Header to `index.html` and updated application branding.

### Added
- **Automation**: Implemented local `.agent/workflows/version-update.md` for standardized versioning.
- **CI/CD**: Added `.github/workflows/static.yml` for automated GitHub Pages deployment.

## [1.6.7] - 2025-12-18

### Changed
- **Log Severity**: Updated the processing log to categorize "unsupported file types" as errors (red) instead of warnings (yellow) for high-visibility feedback when batch processing mixed file sets.

## [1.6.6] - 2025-12-18

### Fixed
- **XML Parsing Bug**: Resolved an issue where direct XML uploads (non-ZIP) were incorrectly handled as `ArrayBuffer` objects during parsing, leading to "Invalid XML format" errors.
- **Improved Data Extraction**: Corrected the XML tag paths for metadata (Begin/End dates) and record details to ensure full compatibility with standard DMARC report structures (RFC 7489).

## [1.6.5] - 2025-12-18

### Added
- **Multi-File Upload Support**: You can now select multiple files (ZIP, XML, or GZIP) in the file picker or drop multiple files simultaneously into the drop zone.
- **Aggregated Processing**: The app will loop through all selected files, parse them sequentially, and automatically merge all found DMARC reports into a single, comprehensive view.
- **Step-by-Step Logging**: The Processing Log now tracks progress per file (e.g., "Reading file 1/5...") for better clarity when handling batch uploads.

## [1.6.4] - 2025-12-18

### Added
- **File Upload Feedback**: Added a success status bar in the "File Upload" tab that confirms when a file has been successfully dropped and parsed.
- **Improved UX**: The upload status is automatically cleared when switching tabs or starting a new analysis.

## [1.6.3] - 2025-12-18

### Fixed
- **The "Nuclear" Font Fix**: Implemented high-specificity `!important` CSS rules and inline JavaScript styling to force `0.7rem Courier New` across all processing log entries, resolving persistent browser-level font size inconsistencies.
- **UI Architecture**: Renamed log container IDs and flattened CSS selectors to prevent unexpected inheritance from global card styles.
- **Consistency**: Hard-coded font rules for timestamps, messages, and metadata to ensure uniform display regardless of log state (live vs toggled).

## [1.6.2] - 2025-12-18

### Fixed
- **Critical CSS Fix**: Resolved a syntax error where log entry styles were nested inside a non-standard block, causing alternating font sizes (fallback vs specific rule) and inconsistent styling when toggling the log state.
- **UI**: Flattened and consolidated the Progress Log CSS for better reliability and cross-browser consistency.
- **UI**: Enforced strict `Courier New` and `0.7rem` font across all log elements, including timestamps and metadata.

## [1.6.1] - 2025-12-18

### Added
- **Log Enhancements**:
    - **Hyperlinking**: ZIP files and folders now link directly to their source in Google Drive.
    - **View XML**: Extracted XML reports now include a "View XML" link that opens a temporary memory (Blob) version of the file in a new browser tab.
    - **Metadata Formatting**: Org Name, Report ID, and Date Range now appear as a separate Row with zebra striping and distinctive highlighting.
- **UI/UX Polished**:
    - **Strict Typography**: Enforced `Courier New` and consistent font size across all log sub-elements.
    - **Refined Zebra Striping**: Zebra rows now apply to every timestamped entry for maximum readability.

## [1.6.0] - 2025-12-17

### Fixed
- **Critical Fix**: Identified why the Processing Log was invisible on first run: The parent `#results` container was hidden by default!
- **Fix**: The `resetUIForAnalysis()` function now explicitly ensures the `#results` container is made visible (`.classList.add('visible')`) *before* processing starts, allowing the child Processing Log to actually be seen.

## [1.5.9] - 2025-12-17

### Fixed
- **Critical UX**: Moved the `resetUIForAnalysis()` call in the File Upload handler to execute *before* the file is read. This ensures the Processing Log appears immediately, rather than waiting for large files to load.
- **Critical UI**: Implemented the "Nuclear Option" for Log Visibility. The `resetUIForAnalysis` function now explicitly sets `display: block` on the log container, overriding any conflicting CSS class specificity or states.

## [1.5.8] - 2025-12-17

### Fixed
- **UI**: Refined `resetUIForAnalysis` to be robust against missing elements and ensure the Processing Log is forced open (`collapsed` removed) and visible (`hidden` removed) immediately upon analysis start.

## [1.5.7] - 2025-12-17

### Fixed
- **UX**: Solved the issue where the Processing Log wouldn't appear until analysis was finished. Implemented `resetUIForAnalysis()` with an async delay to force the browser to repaint *before* heavy processing starts.
- **UX**: Analysis Flow is now cleaner: when you click "Analyse", all previous result cards (Stats, Charts, Records) are immediately hidden, showing *only* the expanding Progress Log. Results reappear only upon success.

## [1.5.6] - 2025-12-17

### Fixed
- **Layout**: Removed a specific extra `</div>` tag that was ejecting the Smart Summary and Log cards from the main container, fixing the width mismatch.
- **UI**: Increased specificity of Log Zebra Striping CSS selectors to `#progress-container .log-entry` to ensure colors apply correctly.
- **UI**: Removed conflicting `font-size` declarations in timestamp and metadata classes to enforce the global `0.7rem` Courier New style.

## [1.5.5] - 2025-12-17

### Cleanup
- **Fix**: Removed stray HTML tags (`log-toggle-icon` duplicates) from the bottom of `index.html` that were causing layout issues.
- **UI**: Enforced strict font consistency in the Log. All elements (timestamps, metadata, messages) now strictly inherit `Courier New` and the same font size.
- **UI**: Fixed a typo in `line-height` css property.

## [1.5.4] - 2025-12-17

### Fixed
- **UI**: Fixed a critical CSS issue where log styles (zebra striping) and toggle behavior were ignored due to a nesting error.
- **Layout**: Corrected HTML structure so that "Smart Analysis" and "Processing Log" cards now respect the main container width (no more full-width overflow).
- **Functionality**: Re-verified export button functionality.

## [1.5.3] - 2025-12-17

### Changed
- **UX**: Moved "Smart Analysis" card to the bottom of the results section (after Detailed Records, before Processing Log).
- **UI**: Refined Log styles for maximum readability:
    - Enforced `Courier New` font.
    - Updated zebra striping to use high-contrast dark backgrounds (`#050505` vs `#161b22`).
- **Fix**: Added redundant click listener to the Log Toggle arrow (`▼`) to ensure reliable collapsing.

## [1.5.2] - 2025-12-17

### Fixed
- **System**: Resolved a critical HTML injection failure where the Smart Summary card was not appearing in the DOM. The element is now correctly placed in `index.html`.

## [1.5.1] - 2025-12-17

### Fixed
- **UI**: Fixed an issue where the new "Smart Analysis" card HTML was missing from the deployment. Re-injected the necessary markup into `index.html`.

## [1.5.0] - 2025-12-17

### Added
- **Feature**: Added "Smart Analysis & Recommendations" Card.
    - **Heuristic Engine**: Automatically detects critical issues (low pass rates), auth gaps (SPF/DKIM), and policy misconfigurations.
    - **Actionable Insights**: Provides specific recommendations (e.g., "Add IP X to SPF", "Rotate DKIM keys").
    - **Privacy**: All analysis runs 100% locally in the browser using JavaScript rules (no data sent to external AI APIs).

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

[1.7.4]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.7.3...v1.7.4
[1.7.3]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.7.2...v1.7.3
[1.7.2]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.8...v1.7.0
[1.6.8]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.7...v1.6.8
[1.6.7]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.6...v1.6.7
[1.6.6]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.5...v1.6.6
[1.6.5]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.4...v1.6.5
[1.6.4]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.3...v1.6.4
[1.6.3]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.9...v1.6.0
[1.5.9]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.8...v1.5.9
[1.5.8]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.7...v1.5.8
[1.5.7]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.6...v1.5.7
[1.5.6]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.5...v1.5.6
[1.5.5]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.4...v1.5.5
[1.5.4]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.3...v1.5.4
[1.5.3]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/kuancheen/dmarc-analyzer/compare/v1.4.9...v1.5.0
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