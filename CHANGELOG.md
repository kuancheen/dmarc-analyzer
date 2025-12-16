# Changelog

All notable changes to the DMARC Report Analyzer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/kuancheen/dmarc-analyzer/releases/tag/v1.0.0
