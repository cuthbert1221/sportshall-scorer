
# Sportshall Scorer

**Sportshall Scorer** is an Electron + Vue application designed to manage and score sportshall track and field events in venues across the UK. It offers flexible features that cater to track, field, and relay events, making it suitable for a wide range of configurations and competition formats.

---

## Features

- **Athlete Management**: Add and manage athlete profiles with details like name, club, age group, and gender.
- **Event Creation**: Define events with custom scoring methods, attempts, and participation rules.
- **Dynamic Scoring**: Automatically rank athletes and calculate scores for individual and relay events.
- **PDF Reporting**: Generate and export results and lane assignments in PDF format.
- **CSV Integration**: Import athlete and event data from CSV files for easy bulk setup.
- **Database Integration**: Uses SQLite for efficient and persistent data management.
- **Adaptable Scoring Methods**: Supports both highest and lowest score ranking systems, including multi-attempt events.

---

## Technology Stack

- **Frontend**: Vue 3, PrimeVue, and Vuetify.
- **Backend**: Electron, SQLite.
- **Utilities**: Puppeteer (PDF generation), EJS (templating), and PapaParse (CSV parsing).

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/cuthbert1221/sportshall-scorer.git
   cd sportshall-scorer
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   - Windows:
     ```bash
     npm run build:win
     ```
   - macOS:
     ```bash
     npm run build:mac
     ```
   - Linux:
     ```bash
     npm run build:linux
     ```

---

## Usage

### Athlete Management
- Add athletes via the UI or by importing data from CSV files.
- Assign athletes to clubs, age groups, and gender categories.

### Event Management
- Define events with specific attributes, such as:
  - Event type (Track, Field, Relay, or Paarlouf).
  - Scoring method (Highest or Lowest score wins).
  - Maximum number of attempts.
- Set club-specific rules, like a limit on the number of participating athletes per event.

### Scoring and Reporting
- Automatically rank participants and assign scores based on event results.
- Generate comprehensive event result PDFs, including lane assignments and final rankings.

### CSV Import
- Import athlete and event data from `trackFile.csv` and `fieldFile.csv` for bulk setup.
- Automatically parse and insert data into the application database.

---

## Development

### Directory Structure
- **`src/`**: Main application source code.
- **`renderer/`**: Vue-based frontend code.
- **`build/`**: Compiled Electron main process code.
- **`database/`**: SQLite database and migration scripts.
- **`scripts/`**: Build and development server scripts.

### Key Commands
- **Run in Development Mode**:
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Build Platform-Specific Packages**:
  ```bash
  npm run build:win
  npm run build:mac
  npm run build:linux
  ```

---

## Contribution

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your fork and open a pull request:
   ```bash
   git push origin feature-name
   ```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

If you encounter issues or have feature requests, please open an issue in the [GitHub repository](https://github.com/cuthbert1221/sportshall-scorer/issues).

---

**Sportshall Scorer** – Making sports events seamless, one score at a time! 🏅
