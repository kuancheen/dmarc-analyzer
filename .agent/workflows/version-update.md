---
description: Automatically update version numbers after changes are confirmed
---

# Version Update Workflow

**IMPORTANT**: This workflow should be **automatically triggered** by the agent whenever changes are made to a project and the user has confirmed those changes. The user should NOT need to manually invoke this workflow.

## When to Trigger

Automatically run this workflow after:
- User confirms code changes, bug fixes, or new features
- Changes have been implemented and verified
- User is ready to finalize the update

## Pre-Check: Review Project Compliance

**Before running version update**, verify the project follows workflow standards:

1. **Check Required Files**:
   - Verify `README.md` exists with version number in title
   - Verify `CHANGELOG.md` exists and follows Keep a Changelog format
   - Verify `LICENSE` file exists
   - For web apps: Verify `index.html` has version string

2. **If Non-Compliant**:
   - Notify user of missing or non-compliant files
   - Recommend running `/new-project-init` to bring project into compliance
   - Ask if user wants to proceed with version update anyway or fix compliance first

3. **If Compliant**:
   - Proceed with version update steps below

## Steps

// turbo-all

1. **Analyze Changes**: Determine if the changes constitute a:
   - **Major** (breaking changes): Increment X in vX.Y.Z
   - **Minor** (new features, backward compatible): Increment Y in vX.Y.Z
   - **Patch** (bug fixes, backward compatible): Increment Z in vX.Y.Z

2. **Update index.html** (Web Apps Only):
   - **Note**: This step only applies to web applications with an `index.html` file
   - Find the version string (e.g., `App Version: v1.7.1`)
   - Increment it according to the analysis from step 1
   - Update the version in any meta tags or headers
   - Skip this step if the project is not a web app

3. **Update CHANGELOG.md**:
   - Add a new section at the top for the new version
   - Format: `## [vX.Y.Z] - YYYY-MM-DD`
   - List changes under appropriate categories:
     - `### Added` - for new features
     - `### Changed` - for changes in existing functionality
     - `### Fixed` - for bug fixes
     - `### Removed` - for removed features
     - `### Security` - for security updates

4. **Update README.md**:
   - Update the version number in the title/header (e.g., `# Project Name (v1.7.1)`)
   - **Update Version Badge**: Update the `![Version]` badge to reflect the new version number.
   - **Update Status Badge (Optional)**:
     - Check if the project is moving from "Beta" to "Live/Production".
     - If yes, update the `![Status]` badge (e.g., `status-active-success`) and remove any "(Beta)" suffixes from the version string.
   - Update any relevant instructions if the changes affect usage
   - Update screenshots or examples if UI/UX has changed

5. **Check/Update Copyright Year**:
   - Check the current year.
   - **Identify Project Creation Year**: Determine the original year from existing copyright notices in `LICENSE` or `README.md`.
   - If `current_year > project_creation_year`:
     - Update copyright notices in `LICENSE`, `README.md`, and `index.html`.
     - Format should be `[Project Creation Year]-[Current Year]` (e.g., `2024-2025`).
   - If `current_year == project_creation_year`, ensure it shows only the creation year.

6. **Verify All Changes**:
   - Review all modified files
   - Ensure version numbers are consistent across all files
   - Check that CHANGELOG entries are accurate and complete

7. **Commit and Push to GitHub**:
   - Stage all modified files: `git add .`
   - Commit with version message: `git commit -m "chore: bump version to vX.Y.Z"`
   - **Request user confirmation before pushing**
   - After confirmation, push to GitHub: `git push origin main`
   - Optionally create a Git tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
