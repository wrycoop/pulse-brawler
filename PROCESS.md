# Development Process — Brawler

**Read this before every session.**

## Core Discipline

### 1. Align Before Executing
- Don't rush to implement
- Discuss approach first
- Get explicit "execute" before making changes
- "Go slow to go fast"

### 2. Riley Owns the Infrastructure
- **Design doc**: Google Docs (not local markdown)
- **Tuning values**: Google Sheets (not local JSON)
- **Code**: GitHub (push after commits)
- If Johnny goes away, Riley still has everything

### 3. Google Docs Standards
- Always use proper heading styles (Heading 1, Heading 2, etc.)
- Never use ASCII art headers (===, ---, etc.)
- Headings enable auto-generated table of contents
- Riley shouldn't have to learn new formatting each rebuild

### 4. Technical Documentation
- When a system is "final," document it for rebuild
- Include exact formulas (not just descriptions)
- Include parameter normalization (sheet value → internal value)
- A future Johnny should recreate identical behavior from the doc

### 5. Commit Discipline
- Commit when reaching a stable state
- Push to GitHub
- Commit message describes what changed and why
- Tag significant milestones

### 6. Tuning Parameters
- All params should have meaningful 0-100 range
- 50 = sensible default
- No extreme values needed for normal behavior
- If math requires tiny decimals, fix the normalization

### 7. Physics Integrity
- Prefer honest physics over governors/caps
- Same force system handles movement AND combat
- If something feels wrong, fix the underlying model
- Caps hide problems, they don't solve them

## Resources

- **Design Doc**: https://docs.google.com/document/d/1IWbcKPkykHTNedlrIQQ30R8lqx8WazyBZqhY2QuTT64/edit
- **Tuning Sheet**: https://docs.google.com/spreadsheets/d/1S-kMA5o6hxUvOe1r4KOGu4T50cyRgF8-nfBknDV2Ht8/edit
- **GitHub**: https://github.com/wrycoop/pulse-brawler

## Before Making Changes

1. Read current state (files, not memory summaries)
2. Propose approach
3. Wait for alignment
4. Execute
5. Test / have Riley test
6. Document if "final"
7. Commit and push
