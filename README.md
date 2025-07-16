# GLO Introduction Engine

A web application that generates targeted introductions for GLO community members across 4 strategic categories with commission potential tracking.

## 🚀 Overview

The GLO Introduction Engine is a client-side web application that:
- Processes CSV exports from Airtable containing GLO member data
- Generates 25 targeted introductions across 4 categories:
  - **High-Traction Founders** (5 matches)
  - **Active Investors** (5 matches) 
  - **Strategic GTM Partners** (5 matches)
  - **Service Providers** (10 matches)
- Tracks commission potential for each introduction
- Provides a clean, mobile-responsive interface

### Business Framework
The application is built around the **GLO Introduction Framework** (`glo_intro_framework.md`), which defines:
- The 4 introduction categories and their purposes
- Commission structure and revenue potential
- Member information templates
- Introduction strategy guidelines
- AI prompt optimization for high-value matches

**Important**: Always refer to `glo_intro_framework.md` when modifying the matching algorithm or adding new features to ensure alignment with GLO's business model and commission structure.

## 🏗️ Architecture

### Frontend-Only Application
This is a **static web application** that runs entirely in the browser. No server-side processing is required.

### Key Files Structure
```
matching-mvp/
├── index.html                    # Main HTML file with UI structure
├── styles.css                    # All styling and responsive design
├── glo-ui.js                     # UI management and user interactions
├── glo-matcher.js                # Core matching algorithm and business logic
├── glo_intro_framework.md        # Business framework and commission structure
├── app.js                        # Express server (for local development only)
├── package.json                  # Dependencies and scripts
└── _redirects                    # Cloudflare Pages routing configuration
```

## 🧠 Core Components

### 1. GLOIntroductionUI (`glo-ui.js`)
**Purpose**: Manages the user interface and user interactions

**Key Methods**:
- `initializeUI()`: Sets up the initial application state
- `handleFileUpload()`: Processes CSV file uploads
- `generateIntroductions()`: Triggers the matching algorithm
- `displayIntroductions()`: Renders results in the UI
- `resetApp()`: Clears all data and returns to upload state

**State Management**:
- Uses localStorage for CSV data persistence
- Manages current member selection
- Handles UI state transitions

### 2. GLOIntroductionMatcher (`glo-matcher.js`)
**Purpose**: Core business logic for member matching and introduction generation

**Key Methods**:
- `parseMembers(csvText)`: Parses CSV data into member objects
- `generateIntroductions(member)`: Creates 25 targeted introductions
- `calculateMatchScore(member1, member2)`: Scores compatibility between members
- `getAllMembers()`: Returns parsed member data

**Matching Algorithm**:
- Uses weighted scoring based on industry, stage, goals, and other factors
- Ensures diversity across introduction categories
- Prioritizes high-commission potential matches

## 📊 Data Structure

### Expected CSV Format
The application expects a CSV export from Airtable with these columns:
- `First Name`, `Last Name`
- `Company Website`, `Industry`, `Company Stage`
- `Professional Goals`, `Company Goals`
- `LinkedIn Profile`, `Email`
- Additional fields for enhanced matching

### Member Object Structure
```javascript
{
  'First Name': 'John',
  'Last Name': 'Doe',
  'Company Website': 'https://example.com',
  'Industry': 'SaaS',
  'Company Stage': 'Series A',
  'Professional Goals': 'Fundraising',
  // ... other fields
}
```

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Dark theme with purple/pink gradients
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Responsive**: Mobile-first design with breakpoints at 768px and 600px

### Key UI Components
- **Upload Section**: Drag-and-drop CSV file upload
- **Member Selection**: Dropdown with member names and companies
- **Results Grid**: Categorized introduction cards
- **Commission Summary**: Visual breakdown of potential earnings

## 🚀 Development Setup

### Prerequisites
- Node.js (v14 or higher)
- Git

### Local Development
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd matching-mvp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - Open `http://localhost:3000` in your browser
   - Or open `index.html` directly (no server required)

### Production Deployment
The app is designed for static hosting on Cloudflare Pages:

1. **Build**: No build process required (static files)
2. **Deploy**: Push to main branch triggers automatic deployment
3. **Domain**: Available at `https://glo-members-matcher.pages.dev`

## 🔒 Repository Security

**Important**: This repository is currently **public**. As development progresses and the application handles sensitive business data, consider:

- Making the repository **private** to protect business logic and member data
- Implementing proper access controls for team members
- Reviewing what information is exposed in commits and documentation
- Ensuring no sensitive data (API keys, member information) is committed to the repository

## 🔧 Key Features for Developers

### 1. CSV Processing
- Uses PapaParse library for robust CSV parsing
- Handles various CSV formats and edge cases
- Validates required fields before processing

### 2. Matching Algorithm
- Weighted scoring system for member compatibility
- Category-based distribution (5-5-5-10 split)
- Commission potential calculation

### 3. State Management
- localStorage for data persistence
- No external dependencies for state
- Clean reset functionality

### 4. Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions

## 🐛 Common Issues & Solutions

### CSV Upload Issues
- **Problem**: "No valid members found"
- **Solution**: Check CSV format matches expected columns
- **Debug**: Add console.log in `parseMembers()` method

### Styling Issues
- **Problem**: Elements not aligning properly
- **Solution**: Check CSS grid/flexbox properties
- **Debug**: Use browser dev tools to inspect layout

### Performance Issues
- **Problem**: Slow with large CSV files
- **Solution**: Consider pagination for 1000+ members
- **Optimization**: Debounce user interactions

## 🔄 Making Changes

### Adding New Introduction Categories
1. **First, review `glo_intro_framework.md`** to understand if the category aligns with business goals
2. Update `generateIntroductions()` in `glo-matcher.js`
3. Add category to the categories object
4. Update UI display logic in `glo-ui.js`
5. Add corresponding CSS styles
6. Update commission calculation logic

### Modifying Matching Algorithm
1. **First, review `glo_intro_framework.md`** to understand business requirements
2. Edit `calculateMatchScore()` method
3. Adjust weight factors for different criteria
4. Test with sample data
5. Update scoring logic as needed
6. Ensure alignment with commission structure and business goals

### UI/UX Improvements
1. Modify styles in `styles.css`
2. Update HTML structure in `index.html`
3. Adjust JavaScript interactions in `glo-ui.js`
4. Test responsive behavior

## 📝 Code Style Guidelines

### JavaScript
- Use ES6+ features (const, let, arrow functions)
- Prefer functional programming patterns
- Add JSDoc comments for complex methods
- Use meaningful variable names

### CSS
- Follow BEM methodology for class naming
- Use CSS custom properties for theming
- Maintain consistent spacing with 8px grid
- Avoid `!important` declarations

### HTML
- Semantic HTML elements
- Accessible markup with ARIA labels
- Clean, readable structure

## 🧪 Testing

### Manual Testing Checklist
- [ ] CSV upload with various file formats
- [ ] Member selection and introduction generation
- [ ] Mobile responsiveness on different devices
- [ ] Commission calculation accuracy
- [ ] Reset functionality
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📚 Dependencies

### Production Dependencies
- **PapaParse**: CSV parsing library
- **Express**: Local development server only

### Development Dependencies
- **ESLint**: Code linting
- **Node.js**: Runtime environment

## 🚀 Deployment

### Cloudflare Pages
1. Connect GitHub repository to Cloudflare Pages
2. Configure build settings:
   - Build command: (leave empty)
   - Build output directory: `.`
   - Root directory: (leave empty)
3. Deploy automatically on push to main branch

### Environment Variables
- `NODE_ENV`: Set to `production` for deployment

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Update dependencies quarterly
- Test with new CSV formats
- Monitor performance with large datasets
- Review and update matching algorithm weights

### Common Updates
- **CSV Format Changes**: Update `parseMembers()` method
- **New Categories**: Modify matching logic and UI
- **Design Updates**: Edit CSS and HTML structure
- **Performance**: Optimize algorithms and rendering

## 🎯 Future Enhancements

### Potential Features
- Export introductions to CSV/PDF
- Save and load introduction sets
- Advanced filtering and search
- Integration with CRM systems
- Analytics dashboard
- Multi-language support

### Technical Improvements
- Add unit tests with Jest
- Implement TypeScript for type safety
- Add service worker for offline support
- Optimize bundle size
- Add error tracking and monitoring

---

**Last Updated**: December 2024  
**Version**: 1.1  
**Maintainer**: GLO Development Team  
**Primary Developer**: fareeha-s (contact for technical support and questions)

## 💬 Getting Help

If you need assistance with this codebase or have questions about implementation:

- **Contact**: fareeha-s (GitHub username)
- **Development Environment**: This project was built entirely on Cursor IDE
- **Code Style**: Follows Cursor's AI-assisted development patterns and best practices

## 🛠️ Development Environment

This project was developed using **Cursor IDE** with AI assistance. The codebase follows Cursor's development patterns and conventions. When working on this project:

- Use Cursor IDE for the best development experience
- Leverage AI assistance for code generation and debugging
- Follow the established patterns and conventions in the codebase 