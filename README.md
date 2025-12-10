# QR Manager

A modern, user-friendly web application for generating, organizing, and managing QR codes. QR Manager enables users to create custom QR codes, store them with descriptive metadata, and manage them efficiently with tagging, filtering, and sorting capabilities.

## Overview

QR Manager solves the problem of QR code mismanagement by providing a centralized platform where users can:
- **Generate** custom QR codes with a simple interface
- **Organize** codes with titles, descriptions, and timestamps
- **Tag** codes for easy categorization and filtering
- **Sort** by creation date, modification date, or alphabetically
- **Export/Import** QR code collections for backup and sharing
- **Download** QR codes as PNG files

This application is ideal for restaurants managing menu QR codes, student organizations handling event signups, businesses tracking promotional codes, and any organization that needs centralized QR code management.

## Features

### Core Functionality
- **QR Code Generation**: Create QR codes from URLs using the goQR.me API
- **CRUD Operations**: Create, read, update, and delete QR codes
- **Live Preview**: See QR code updates in real-time
- **Download**: Export QR codes as PNG files directly from the editor

### Organization & Management
- **Tagging System**: Add custom tags with color-coding (7 predefined colors + custom colors)
- **Filtering**: Filter QR codes by assigned tags
- **Sorting**: Sort by latest, oldest, or alphabetical order
- **Metadata Tracking**: 
  - Title
  - Description
  - URL link
  - Creation date
  - Last modified date

### Data Management
- **Local Storage**: All QR codes stored in browser's local storage for privacy
- **Import/Export**: Backup and restore QR code collections as JSON
- **Clear All**: Reset your collection with a single click

## Project Structure

```
qr-manager/
├── index.html              # Main dashboard page
├── pages/
│   ├── about.html          # Project information & features page
│   └── edit.html           # QR code creation/editing page
├── scripts/
│   ├── main.js             # Dashboard logic (display, filter, sort)
│   ├── edit.js             # QR editor logic (creation, updates, downloads)
│   └── common.js           # Shared utilities (API calls, storage, helpers)
├── styles/
│   └── styles.css          # Custom styling
├── images/                 # Project assets and icons
├── demo/                   # Demo data
│   └── test_data.json      # Sample QR code data
└── README.md              # This file
```

## Technology Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+ Modules)
- **Styling**: Tailwind CSS framework for responsive design
- **API**: [goQR.me API](https://goqr.me/api/doc/create-qr-code/) for QR code generation
- **Storage**: Browser's Local Storage for data persistence
- **CORS Proxy**: corsproxy.io to handle cross-origin API requests

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for QR code generation

### Access the Application

Visit **[https://pogoretskiy777.github.io/qr-manager/](https://pogoretskiy777.github.io/qr-manager/)** to use QR Manager directly in your browser. No installation or setup required!

## Usage

### Creating a QR Code

1. Click the **"New"** button on the main dashboard
2. Enter the URL you want to encode
3. Add a title and optional description
4. Select a tag color and add tags for organization
5. Click **"Save"** to generate and store the QR code
6. Click **"Download"** to save the QR code as a PNG file

### Managing QR Codes

- **View**: Browse your QR codes in the main dashboard
- **Edit**: Click any QR code card to edit its details
- **Delete**: Remove a QR code from the editor page
- **Filter**: Use the filter dropdown to show codes with specific tags
- **Sort**: Change the sorting order (Latest, Oldest, Alphabetical)

### Data Operations

- **Export**: Click the "Export" button to download all your QR codes as a JSON file
- **Import**: Click the "Import" button to restore QR codes from a JSON backup
- **Clear**: Click the "Clear" button to delete all QR codes (use with caution!)

## API Information

QR Manager uses the **goQR.me API** to generate QR codes. Key details:

- **No Rate Limit**: Unlimited QR code generation per day
- **Privacy**: The API does not store QR code contents
- **Cache**: QR code images are deleted from cache ~30 seconds after delivery
- **Logging**: Only request metadata (referrer, IP) is logged

For more information, visit the [goQR.me Privacy & Security page](https://goqr.me/privacy-safety-security/).

## Data Storage

All QR codes are stored locally in your browser using the **Local Storage API**. This means:
- Your data stays on your device
- No server upload of QR code information
- Works offline after initial load
- Data is lost if you clear browser cache/local storage
- Use Export feature to back up your data

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Example Use Cases

**Restaurant Owner**
- Generate menu QR codes
- Organize by location or menu type using tags
- Update menu content without changing the QR code design

**Student Organization**
- Create event signup QR codes
- Tag by semester or event type
- Maintain searchable history of all recruitment codes

**Marketing Team**
- Generate campaign-specific QR codes
- Track different versions with tags
- Export all campaign codes for distribution

## Responsive Design

The application is fully responsive and works seamlessly on:
- Mobile devices (single-column layout)
- Tablets (optimized spacing)
- Desktop (multi-column grid)

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions, issues, or feedback, please open a GitHub issue or contact me.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [goQR.me API](https://goqr.me/) - QR code generation service
- [corsproxy.io](https://corsproxy.io/) - CORS proxy for API calls

