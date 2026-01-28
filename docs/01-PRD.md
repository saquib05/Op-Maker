# Product Requirements Document (PRD)
## OP Maker - Opportunity Profile Generator

**Version:** 1.0  
**Date:** January 28, 2026  
**Status:** Phase 1 - Initialized

---

## 1. PROJECT OVERVIEW

### 1.1 Problem Statement
The marketing team currently creates Opportunity Profiles (OPs) manually. OPs are PowerPoint presentations that detail potential leads based on survey responses. The process is time-consuming and repetitive, requiring manual data compilation, content writing, and PPT creation for each prospect.

### 1.2 Solution
An automated platform that allows users to:
1. Create and manage reusable templates for different campaigns/clients
2. Generate OPs by filling required fields and uploading data files
3. Edit generated PPTs in-app with full control over design elements
4. Export final OPs in PPTX or PDF format

### 1.3 Success Criteria
- Reduce manual OP creation time by 80%+
- Generate professional, branded PPTs matching current quality standards
- Support all current template variations and layouts
- Enable complete editing control over generated presentations

---

## 2. GOALS

### 2.1 Primary Goals
1. **Template Management System**
   - Create, save, edit, and delete templates
   - Support unlimited pages per template
   - Support unlimited sections per page
   - Enable template sharing between users (future-ready)

2. **Automated PPT Generation**
   - Generate PPTs from templates using AI (Gemini 3 Pro)
   - Process Excel files with formulas and data extraction
   - Support multiple data sources (LLM prompts, Excel columns, text fields, images)
   - Create beautiful, professional presentations matching reference OPs

3. **In-App PPT Editor**
   - Full editing capabilities (text, images, colors, vectors, alignment, spacing)
   - AI-powered layout rethinking for selected sections
   - Theme and layout customization
   - Reference image support for AI redesign

4. **Export & Distribution**
   - Export to PPTX format (fully editable in PowerPoint)
   - Export to PDF format
   - Maintain all formatting and design elements

### 2.2 Secondary Goals (Future)
- Multi-user support with authentication
- Cloud deployment option
- Integration with CRM/survey tools
- Additional export formats

---

## 3. CONSTRAINTS

### 3.1 Technical Constraints
- **Deployment:** On-premise (single machine)
- **User Model:** Single user (no authentication required initially)
- **Browser Compatibility:** All modern browsers (Chrome, Firefox, Edge, Safari)
- **File Size:** No maximum limits enforced
- **Excel Formats:** Support all formats (.xlsx, .xls, .csv)

### 3.2 Business Constraints
- **Timeline:** As quickly as possible
- **Cost:** Cost-effective solution (minimize API costs, use efficient libraries)
- **Compliance:** Not required initially (can be added later)

### 3.3 Technical Preferences
- **Tech Stack:** No specific preferences (architect to recommend based on best practices)
- **Infrastructure:** No specific preferences (architect to recommend)

---

## 4. RECOMMENDED TECH STACK

### 4.1 Frontend
**Recommendation: React + TypeScript**
- **Rationale:** 
  - Large ecosystem for rich editors and UI components
  - Strong community support
  - Good performance for complex UIs
  - TypeScript for type safety

**Key Libraries:**
- **UI Framework:** Tailwind CSS (utility-first, fast development)
- **State Management:** Zustand or React Context (lightweight for single-user)
- **Rich Text Editor:** Slate.js or Tiptap (for text editing)
- **Canvas/Graphics Editor:** Fabric.js or Konva.js (for PPT element manipulation)
- **File Upload:** react-dropzone
- **Charts/Visualizations:** Recharts or Chart.js (for data visualization in editor)

### 4.2 Backend
**Recommendation: Node.js + Express + TypeScript**
- **Rationale:**
  - Same language as frontend (code sharing, faster development)
  - Excellent Excel processing libraries (xlsx, exceljs)
  - Good ecosystem for file handling
  - Easy on-premise deployment

**Alternative: Python + FastAPI**
- **Rationale:**
  - Excellent Excel processing (pandas, openpyxl)
  - Strong AI/ML ecosystem
  - python-pptx is mature and feature-rich
- **Decision:** Node.js recommended for faster development and single codebase

**Key Libraries:**
- **Framework:** Express.js
- **Excel Processing:** xlsx or exceljs
- **PPT Generation:** PptxGenJS (server-side) or python-pptx via subprocess
- **LLM Integration:** @google/generative-ai (Gemini SDK)
- **File Storage:** Local filesystem (on-premise)
- **Validation:** Zod or Joi

### 4.3 Database
**Recommendation: SQLite**
- **Rationale:**
  - Single file, no server required (perfect for on-premise)
  - Zero configuration
  - ACID compliant
  - Sufficient for single-user application
  - Easy backup (just copy the file)

**Schema Areas:**
- Templates (metadata, structure)
- Template pages and sections
- Generated OPs (metadata, file paths)
- User settings

### 4.4 PPT Generation & Editing Strategy

**Option A: Server-Side Generation (Recommended)**
- Generate PPTX on backend using PptxGenJS or python-pptx
- Convert PPTX to editable format for frontend (JSON representation)
- Frontend editor manipulates JSON structure
- Re-generate PPTX on save/export

**Option B: Client-Side Generation**
- Use PptxGenJS directly in browser
- Edit PPT structure in memory
- Export directly from browser
- **Challenge:** Large files, browser memory limits

**Recommendation: Hybrid Approach**
- Generate initial PPTX on server
- Parse PPTX to JSON structure (using officegen or similar)
- Frontend editor works with JSON
- Re-assemble PPTX on export

**For In-App Editing:**
- Use Fabric.js or Konva.js canvas for visual editing
- Maintain JSON representation of slide elements
- Support: text boxes, images, shapes, charts, alignment, colors, fonts

### 4.5 LLM Integration
- **Provider:** Google Gemini 3 Pro
- **SDK:** @google/generative-ai (Node.js)
- **API Key:** Centralized (stored in config, not per-user)
- **Usage:** 
  - Content generation for sections based on prompts
  - Layout rethinking based on user prompts
  - Text summarization from Excel data

### 4.6 File Processing
- **Excel:** xlsx or exceljs (Node.js)
- **Formulas:** Evaluate formulas using library support
- **Data Extraction:** Column-based queries, row filtering, aggregation
- **Image Processing:** Sharp (Node.js) for image optimization/resizing

---

## 5. FEATURE REQUIREMENTS

### 5.1 Template Management

#### 5.1.1 Template Creation
- **Template Name:** Required, unique identifier
- **Template Metadata:** Description, tags, created date, last modified
- **Pages:** Unlimited pages per template
  - Each page has: name, order/index, layout type
- **Sections:** Unlimited sections per page
  - Each section has: name, type (text, image, chart, etc.), position

#### 5.1.2 Section Configuration
For each section, user can configure:
1. **Data Source Type:**
   - LLM Prompt (text field for prompt)
   - Excel Reference (file upload + column selection + formula)
   - Text Field (user input)
   - Image Field (user upload)
   - Static Content (fixed text/image)

2. **Excel Integration Details:**
   - Upload Excel file (per generation, not stored with template)
   - Select columns to reference
   - Apply formulas (SUM, AVERAGE, CONCATENATE, custom formulas)
   - Row filtering/selection criteria
   - Data transformation instructions

3. **Visual Properties:**
   - Default font, size, color
   - Default background color
   - Default alignment
   - Default position/layout

#### 5.1.3 Template Operations
- Create new template
- Edit existing template (add/remove pages, modify sections)
- Delete template
- Duplicate template
- Export template (JSON format for sharing)
- Import template (from JSON)

### 5.2 OP Generation Workflow

#### 5.2.1 Template Selection
- List all available templates
- Search/filter templates
- Preview template structure
- Select template to use

#### 5.2.2 Data Input
- **Required Fields:** Display all required fields for selected template
- **Field Types:**
  - Text inputs
  - File uploads (Excel, images)
  - Multi-select dropdowns
  - Date pickers
- **Excel Upload:** 
  - Upload Excel file for this generation
  - Preview Excel data
  - Map columns to template sections (if needed)

#### 5.2.3 Generation Process
1. Validate all required fields are filled
2. Process Excel files (if any):
   - Parse Excel file
   - Extract data from specified columns
   - Apply formulas
   - Prepare data for sections
3. Generate content using LLM:
   - For each section with LLM prompt, call Gemini API
   - Pass context (other field values, Excel data)
   - Generate section content
4. Assemble PPT:
   - Create PPTX structure based on template
   - Populate sections with generated/filled content
   - Apply default styling
   - Generate charts/visualizations (if needed)
5. Present editable PPT in app

### 5.3 In-App PPT Editor

#### 5.3.1 Editing Capabilities
- **Text Editing:**
  - Edit text content
  - Change font, size, color, weight, style
  - Alignment (left, center, right, justify)
  - Line spacing, paragraph spacing

- **Image Editing:**
  - Replace images
  - Resize, crop, rotate
  - Position adjustment
  - Opacity, filters

- **Shape/Vector Editing:**
  - Edit shapes (rectangles, circles, polygons)
  - Change colors (fill, stroke)
  - Resize, rotate, position
  - Layer ordering (bring to front, send to back)

- **Layout Editing:**
  - Move elements (drag and drop)
  - Align elements (snap to grid, align to other elements)
  - Distribute elements evenly
  - Group/ungroup elements

- **Color & Theme:**
  - Change color scheme
  - Apply predefined themes
  - Custom color picker
  - Background colors/images

#### 5.3.2 AI-Powered Features
- **Layout Rethinking:**
  - Select section/element
  - Enter prompt describing desired layout
  - Optionally upload reference image
  - AI regenerates layout based on prompt

- **Content Enhancement:**
  - Select text/element
  - Ask AI to improve/rewrite
  - AI suggests alternatives

#### 5.3.3 Editor UI
- Canvas-based editor (Fabric.js/Konva.js)
- Toolbar with editing tools
- Properties panel (right sidebar)
- Layer panel (left sidebar)
- Zoom controls
- Undo/redo functionality
- Slide navigator (thumbnails)

### 5.4 Export Functionality

#### 5.4.1 PPTX Export
- Export current edited PPT to PPTX format
- Maintain all formatting, images, charts
- Ensure compatibility with Microsoft PowerPoint
- Preserve editability in PowerPoint

#### 5.4.2 PDF Export
- Export current edited PPT to PDF format
- Maintain visual fidelity
- Preserve colors, fonts, layout
- Optimize file size

#### 5.4.3 Export Options
- Export all slides or selected slides
- Quality settings (for images)
- Include/exclude notes
- Custom filename

---

## 6. REFERENCE OP ANALYSIS

Based on provided reference images, OPs contain:

### 6.1 Slide Types
1. **Cover Slide:** Title, logos, branding
2. **Overview Slide:** Table of contents, facet overview
3. **Facet Slides:** Individual opportunity facets (8+ facets per OP)
4. **Summary Slide:** Thank you slide

### 6.2 Common Elements
- **Text Elements:**
  - Titles (large, bold, green)
  - Subtitles (smaller, lighter green)
  - Body text (black, various sizes)
  - Bullet points
  - Headings and subheadings

- **Visual Elements:**
  - Logos (top corners, footer)
  - Profile pictures (circular)
  - Icons (LinkedIn, calendar, etc.)
  - Shapes (rectangles, circles, trapezoids)
  - Charts (donut charts, line graphs, radar charts)
  - Decorative elements (diamond graphics, colored bars)

- **Layout Patterns:**
  - Two-column layouts
  - Three-column layouts
  - Sidebar layouts (green vertical bar)
  - Centered content
  - Grid arrangements

- **Color Scheme:**
  - Primary green (#38C661, #21AE4C, variations)
  - Dark blue (logos, accents)
  - White/light gray backgrounds
  - Accent colors (orange, coral, magenta, pink)

### 6.3 Data Visualizations Required
- Donut charts (functional distribution)
- Line graphs (time series data)
- Radar charts (DISC ratings)
- Bar charts (potential)
- Pie charts (potential)

### 6.4 Content Types
- Contact information (name, title, email, phone)
- Professional goals (bullet lists)
- Business challenges (structured with headings)
- Strategic priorities (with descriptions)
- Headcount analysis (statistics + charts)
- Interaction summaries (bulleted sections)
- Conversation guidelines (multi-column text)

---

## 7. USER FLOWS

### 7.1 Create Template Flow
1. Click "Create New Template"
2. Enter template name
3. Add first page (enter page name)
4. Add sections to page:
   - Click "Add Section"
   - Select section type
   - Configure data source (LLM prompt, Excel, text field, image)
   - Set visual properties
5. Repeat for additional pages
6. Save template

### 7.2 Generate OP Flow
1. Select template from list
2. View required fields
3. Fill in text fields
4. Upload Excel file (if required)
5. Upload images (if required)
6. Click "Generate PPT"
7. Wait for generation (show progress)
8. PPT appears in editor
9. Edit as needed
10. Export to PPTX or PDF

### 7.3 Edit PPT Flow
1. Open generated PPT in editor
2. Select element (click on canvas)
3. Edit properties (text, color, size, position)
4. Use AI features (if needed):
   - Select section
   - Enter prompt or upload reference
   - AI regenerates layout
5. Save changes
6. Export when satisfied

---

## 8. TECHNICAL SPECIFICATIONS

### 8.1 Data Models

#### Template Schema
```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  pages: Page[];
}

interface Page {
  id: string;
  name: string;
  order: number;
  layoutType: string;
  sections: Section[];
}

interface Section {
  id: string;
  name: string;
  type: 'text' | 'image' | 'chart' | 'shape' | 'mixed';
  dataSource: DataSource;
  visualProperties: VisualProperties;
  position: Position;
}

interface DataSource {
  type: 'llm' | 'excel' | 'text' | 'image' | 'static';
  llmPrompt?: string;
  excelConfig?: ExcelConfig;
  defaultValue?: string;
}

interface ExcelConfig {
  columns: string[];
  formula?: string;
  rowFilter?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'custom';
}
```

#### Generated OP Schema
```typescript
interface GeneratedOP {
  id: string;
  templateId: string;
  name: string;
  createdAt: Date;
  filePath: string;
  metadata: Record<string, any>;
}
```

### 8.2 API Endpoints (Backend)

#### Template Management
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template
- `GET /api/templates/:id` - Get template details
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/duplicate` - Duplicate template
- `POST /api/templates/import` - Import template from JSON
- `GET /api/templates/:id/export` - Export template to JSON

#### OP Generation
- `POST /api/generate` - Generate new OP
  - Body: { templateId, fields, excelFile?, images? }
  - Returns: { opId, status, progress }
- `GET /api/generate/:opId/status` - Check generation status
- `GET /api/generate/:opId` - Get generated OP data

#### OP Editing
- `GET /api/ops/:id` - Get OP data for editing
- `PUT /api/ops/:id` - Save edited OP
- `POST /api/ops/:id/ai-redesign` - AI-powered layout redesign
  - Body: { sectionId, prompt, referenceImage? }

#### Export
- `GET /api/ops/:id/export/pptx` - Export to PPTX
- `GET /api/ops/:id/export/pdf` - Export to PDF

#### Excel Processing
- `POST /api/excel/parse` - Parse Excel file
- `POST /api/excel/process` - Process Excel with formulas

### 8.3 File Structure
```
PPT Maker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── utils/
│   │   └── config/
│   └── package.json
├── database/
│   └── opmaker.db (SQLite)
├── storage/
│   ├── templates/
│   ├── generated-ops/
│   ├── excel-files/
│   └── images/
└── docs/
    └── 01-PRD.md
```

---

## 9. NON-FUNCTIONAL REQUIREMENTS

### 9.1 Performance
- Template loading: < 1 second
- OP generation: < 30 seconds for typical OP (8-10 slides)
- Editor responsiveness: < 100ms for UI interactions
- Export: < 10 seconds for PPTX, < 15 seconds for PDF

### 9.2 Reliability
- Auto-save drafts every 30 seconds
- Error handling for API failures
- Graceful degradation if LLM API is unavailable
- Data validation before generation

### 9.3 Usability
- Intuitive UI (no training required)
- Clear error messages
- Progress indicators for long operations
- Undo/redo for all editor actions
- Keyboard shortcuts for common actions

### 9.4 Security (Future)
- Input sanitization
- File upload validation
- API key protection
- XSS prevention

---

## 10. OUT OF SCOPE (V1)

- Multi-user authentication
- Cloud deployment
- Real-time collaboration
- Version control for templates
- Template marketplace
- Advanced analytics
- Integration with external systems
- Mobile app
- Offline mode
- Advanced chart types beyond basic ones

---

## 11. SUCCESS METRICS

### 11.1 Development Metrics
- Time to first working prototype: TBD
- Time to full feature set: TBD
- Code coverage: > 70%

### 11.2 User Metrics (Post-Launch)
- Time saved per OP generation: Target 80% reduction
- User satisfaction: TBD via feedback
- Error rate: < 5% of generations
- Export success rate: > 95%

---

## 12. OPEN QUESTIONS / ASSUMPTIONS

### 12.1 Assumptions
1. User has Google Gemini API key available
2. User has Node.js/Python runtime available
3. User is comfortable with on-premise deployment
4. Single user means no concurrent access concerns
5. Templates can be exported/imported as JSON for sharing

### 12.2 Questions to Resolve in Phase 2
1. Preferred UI style (minimalist, modern, corporate)?
2. Default color palettes for themes?
3. Chart library preference (if any)?
4. Error handling style (toast notifications, modals, inline)?
5. File naming conventions?
6. Auto-save behavior (drafts, versions)?

---

## 13. NEXT STEPS

1. **Phase 2: Discuss Phase** - Resolve gray areas and UI/UX preferences
2. **Phase 3: Plan Phase** - Break down into atomic tasks
3. **Phase 4: Execute Phase** - Build one task at a time
4. **Phase 5: Verify Phase** - Manual testing guide

---

**Document Status:** ✅ Complete - Ready for Phase 2 (Discuss Phase)
