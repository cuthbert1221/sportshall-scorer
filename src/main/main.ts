import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
import { Athlete, EventDetails } from './interfaces.js';
export interface EventInstances  {
  eventDetail_name: string;
  venue_name : string;
  agegroup: string;
  gender: string;
}

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

ipcMain.handle('create-athlete', async (event, athlete: Athlete) => {
  // Handle user creation in SQLite database
  const result = await addAthlete({ fullname: athlete.fullname, club: athlete.club, agegroup: athlete.agegroup, gender: athlete.gender });
  console.log("The result was: " + result);
  return result
});

ipcMain.handle('create-event-detail', async (event, form: EventDetails) => {
  // Handle event creation in SQLite database
  const result = await addEventDetail({ name: form.name, type: form.type, scoringMethod: form.scoringMethod });
  console.log("The result was: " + result);
  return result
});
async function addEventDetail(event: EventDetails): Promise<number | string> {
  const db = await openDatabase();
  try {
    const eventId = await insertEventDetail(db, event);
    return eventId;
  } catch (error) {
    return error as string;
  } finally {
    await closeDatabase(db);
  }
}
async function insertEventDetail(db: sqlite3.Database, event: EventDetails): Promise<number> {
  const sql = `INSERT INTO eventDetails (name, type, scoringMethod) VALUES (?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [event.name, event.type, event.scoringMethod], function(err) {
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

ipcMain.handle('create-event-instance', async (event, form: EventInstances) => {
  // Handle event instance creation in SQLite database
  const result = await addEventInstance({ eventDetail_name: form.eventDetail_name, venue_name: form.venue_name, agegroup: form.agegroup, gender: form.gender });
  console.log("The result was: " + result);
  return result
});

async function addEventInstance(eventInstance: EventInstances): Promise<number | string> {
  const db = await openDatabase();
  try {
    const eventId = await insertEventInstance(db, eventInstance);
    return eventId;
  } catch (error) {
    return error as string;
  } finally {
    await closeDatabase(db);
  }
}

async function insertEventInstance(db: sqlite3.Database, eventInstance: EventInstances): Promise<number> {
  const sql = `INSERT INTO EventInstances (eventDetail_name, venue_name, agegroup, gender) VALUES (?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [eventInstance.eventDetail_name, eventInstance.venue_name, eventInstance.agegroup, eventInstance.gender], function(err) {
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

async function insertAthlete(db: sqlite3.Database, athlete: Athlete): Promise<number> {
  const sql = `INSERT INTO Athletes (fullname, club, agegroup, gender) VALUES (?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [athlete.fullname, athlete.club, athlete.agegroup, athlete.gender], function(err) {
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

async function addAthlete(athlete: Athlete): Promise<number | string> {
  let db: sqlite3.Database;
  try {
    db = await openDatabase();
    const id = await insertAthlete(db, athlete);
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

  // SQL query to create the Athletes table
  const createAthletesTableSql = `
      CREATE TABLE IF NOT EXISTS Athletes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullname TEXT NOT NULL,
          club TEXT NOT NULL,
          agegroup TEXT NOT NULL,
          gender TEXT NOT NULL
      );
  `;

  // SQL query to create the Events table
  const createEventDetailsTableSql = `
    CREATE TABLE IF NOT EXISTS EventDetails (
      name TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      scoringMethod TEXT NOT NULL
  );
  `;


  // Execute the Athletes table creation query
  db.run(createAthletesTableSql, (err) => {
      if (err) {
          console.error(err.message);
          return;
      }
      console.log("Athletes table created or already exists.");
  });

  // Execute the Events table creation query
  db.run(createEventDetailsTableSql, (err) => {
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
  const createVenuesTableSql = `
    CREATE TABLE IF NOT EXISTS Venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL
    );
  `;

  // Execute the Venues table creation query
  db.run(createVenuesTableSql, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Venues table created or already exists.");

    // Array of venue names and dates
    const venues = [
      { name: 'Venue 1', date: '2022-01-01' },
      { name: 'Venue 2', date: '2022-02-01' },
      { name: 'Venue 3', date: '2022-03-01' },
    ];

    // SQL query to insert a venue into the Venues table
    const insertVenueSql = `INSERT OR IGNORE INTO Venues (name, date) VALUES (?, ?)`;

    // Iterate over the venues array and insert each venue into the Venues table
    venues.forEach((venue) => {
      db.run(insertVenueSql, [venue.name, venue.date], (err) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(`Venue ${venue.name} inserted or already exists.`);
      });
    });
  });


  const createEventInstancesTableSql = `
    CREATE TABLE IF NOT EXISTS EventInstances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventDetail_name TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      agegroup TEXT NOT NULL,
      gender TEXT NOT NULL,
      display_order INTEGER,
      FOREIGN KEY (eventDetail_name) REFERENCES EventDetails (name)
    );
  `;

  db.run(createEventInstancesTableSql, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("EventInstances table created or already exists.");
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

ipcMain.handle('update-multiple-events-order', async (event, eventsOrder) => {
  // eventsOrder is an array of { eventId, newOrder }
  // Start a transaction
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION;');
      var i = 0;
      for (const eventOrder of eventsOrder) {
        console.log(eventOrder);
        console.log(eventOrder.id);
        db.run(
          `UPDATE EventInstances SET display_order = ? WHERE id = ?`,
          [i, eventOrder.id],
          (err) => {
            if (err) {
              console.error(err.message);
              reject(err.message);
            }
          }
        );
        i++;
      }
      db.run('COMMIT;', (err) => {
        if (err) {
          reject(err.message);
        } else {
          resolve('success');
        }
      });
    });
  }).finally(() => {
    closeDatabase(db);
  });
});


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
  if (type === 'athletes') {
    query = "SELECT * FROM Athletes";
  } else if (type === 'eventDetails') {
    query = "SELECT * FROM EventDetails";
  } else if (type === 'eventInstances') {
    query = "SELECT * FROM EventInstances ORDER BY display_order";
  } else if (type === 'venues') {
    query = "SELECT * FROM venues";
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