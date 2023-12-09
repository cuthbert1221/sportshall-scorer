import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
import { Participant, Event } from './interfaces.js';

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

const DB_PATH = './path_to_new_database.db';

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})

ipcMain.handle('create-participant', async (event, participant: Participant) => {
  // Handle user creation in SQLite database
  const result = await addParticipant({ fullname: participant.fullname, club: participant.club, agegroup: participant.agegroup, gender: participant.gender });
  console.log("The result was: " + result);
  return result
});

ipcMain.handle('create-event', async (event, form: Event) => {
  // Handle user creation in SQLite database
  const result = await addEvent({ name: form.name, agegroup: form.agegroup, type: form.type, scoringMethod: form.scoringMethod, gender: form.gender });
  console.log("The result was: " + result);
  return result
});
async function addEvent(event: Event): Promise<number | string> {
  const db = await openDatabase();
  try {
    const eventId = await insertEvent(db, event);
    return eventId;
  } catch (error) {
    return error as string;
  } finally {
    await closeDatabase(db);
  }
}

async function insertEvent(db: sqlite3.Database, event: Event): Promise<number> {
  const sql = `INSERT INTO Events (name, agegroup, type, scoringMethod, gender) VALUES (?, ?, ?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [event.name, event.agegroup, event.type, event.scoringMethod, event.gender], function(err) {
      if (err) {
        console.error(err.message);
        reject(err.message);
      } else {
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

import sqlite3 from 'sqlite3';


async function openDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error("Error opening database.");
        console.error(err.message);
        reject(err.message);
      } else {
        console.log('Connected to the SQLite database.');
        resolve(db);
      }
    });
  });
}

async function insertParticipant(db: sqlite3.Database, participant: Participant): Promise<number> {
  const sql = `INSERT INTO Participants (fullname, club, age, gender) VALUES (?, ?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [participant.fullname, participant.club, participant.agegroup, participant.gender], function(err) {
      if (err) {
        console.error(err.message);
        reject(err.message);
      } else {
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

async function closeDatabase(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error(err.message);
        reject(err.message);
      } else {
        console.log('Closed the database connection.');
        resolve();
      }
    });
  });
}

async function addParticipant(participant: Participant): Promise<number | string> {
  let db: sqlite3.Database;
  try {
    db = await openDatabase();
    const id = await insertParticipant(db, participant);
    await closeDatabase(db);
    return id;
  } catch (error) {
    return error as string;
  }
}

// Function to create a new database and initialize tables
function createDatabase(): void {
  // Open (or create if it doesn't exist) a SQLite database
  let db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
          console.error(err.message);
          return;
      }
      console.log('Connected to the SQLite database.');
  });

  // SQL query to create the Participants table
  const createParticipantsTableSql = `
      CREATE TABLE IF NOT EXISTS Participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullname TEXT NOT NULL,
          club TEXT NOT NULL,
          age TEXT NOT NULL,
          gender TEXT NOT NULL
      );
  `;

  // SQL query to create the Events table
  const createEventsTableSql = `
    CREATE TABLE IF NOT EXISTS Events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        agegroup TEXT NOT NULL,
        gender TEXT NOT NULL,
        scoringMethod TEXT NOT NULL
    );
  `;


  // Execute the Participants table creation query
  db.run(createParticipantsTableSql, (err) => {
      if (err) {
          console.error(err.message);
          return;
      }
      console.log("Participants table created or already exists.");
  });

  // Execute the Events table creation query
  db.run(createEventsTableSql, (err) => {
      if (err) {
          console.error(err.message);
          return;
      }
      console.log("Events table created or already exists.");
  });
  // SQL query to create the Clubs table
  const createClubsTableSql = `
      CREATE TABLE IF NOT EXISTS Clubs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
      );
  `;

  // Execute the Clubs table creation query
  db.run(createClubsTableSql, (err) => {
      if (err) {
          console.error(err.message);
          return;
      }
      console.log("Clubs table created or already exists.");

      // Array of club names
      const clubs = ['Club 1', 'Club 2', 'Club 3'];

      // SQL query to insert a club into the Clubs table
      const insertClubSql = `INSERT OR IGNORE INTO Clubs (name) VALUES (?)`;

      // Iterate over the clubs array and insert each club into the Clubs table
      clubs.forEach((club) => {
          db.run(insertClubSql, club, (err) => {
              if (err) {
                  console.error(err.message);
                  return;
              }
              console.log(`Club ${club} inserted or already exists.`);
          });
      });
  });

  // Close the database connection
  db.close((err) => {
      if (err) {
          console.error(err.message);
          return;
      }
      console.log('Closed the database connection.');
  });
}


ipcMain.handle('read-data', async (event, query) => {
  const db = new sqlite3.Database(DB_PATH);
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err.message);
      }
      resolve(rows);
      db.close();
    });
  });
});

ipcMain.handle('fetch-data', async (event, type) => {
  const db = new sqlite3.Database(DB_PATH);
  let query = '';
  if (type === 'participants') {
    query = "SELECT * FROM Participants";
  } else if (type === 'events') {
    query = "SELECT * FROM Events";
  } else if (type === 'clubs') {
    query = "SELECT * FROM clubs";
  }

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
});

// Call the function to create the database
createDatabase();