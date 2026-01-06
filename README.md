# ATS Workflow Mapper

An interactive React application for visualizing Applicant Tracking System (ATS) recruiting pipelines. This tool provides a clean, professional flowchart showing how candidates move through the hiring process.

## Features

- **Interactive Flowchart**: Built with ReactFlow for a smooth, interactive experience
- **Complete Pipeline Visualization**: From Application to Accepted stages
- **Multiple Node Types**:
  - **Stage Nodes** (Blue): Main pipeline stages (Applied, Phone Screen, Onsite, Offer, Accepted)
  - **Decision Nodes** (Orange): Decision points in the workflow
  - **Automation Nodes** (Green): Automated touchpoints and processes
  - **Manual Handoff Nodes** (Purple): Points requiring manual intervention
- **Professional Design**: Clean, modern UI with gradient backgrounds and smooth animations
- **Zoom & Pan Controls**: Navigate the workflow easily
- **Mini-map**: Overview of the entire workflow

## Pipeline Stages

1. **Applied** → Auto Resume Parse → Initial Screening
2. **Phone Screen** → Auto Schedule → Evaluation
3. **Onsite Interview** → Feedback Collection → Hire Decision
4. **Offer** → Generate Offer Letter → Candidate Decision
5. **Accepted** → Start Onboarding

## Technology Stack

- **React** (v19.2) - UI framework
- **ReactFlow** (@xyflow/react v12.10) - Interactive flowchart library
- **Vite** - Build tool and dev server
- **CSS3** - Custom styling with gradients and animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The application is organized as follows:

- `src/ATSWorkflowMapper.jsx` - Main workflow component with node and edge definitions
- `src/CustomNodes.jsx` - Custom node components (Stage, Decision, Automation, Manual)
- `src/CustomNodes.css` - Styling for custom nodes
- `src/ATSWorkflowMapper.css` - Main workflow container styling
- `src/App.jsx` - Root application component

## Customization

You can easily customize the workflow by modifying:

1. **Nodes**: Edit `initialNodes` array in `ATSWorkflowMapper.jsx`
2. **Edges**: Edit `initialEdges` array in `ATSWorkflowMapper.jsx`
3. **Styling**: Modify the CSS files to change colors, sizes, and animations
4. **Node Types**: Add new custom node types in `CustomNodes.jsx`

## License

MIT

## Author

Created for ATS workflow visualization and recruiting pipeline management.
