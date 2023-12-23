import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
import { Athlete, EventDetails, EventSignup } from './interfaces.js';
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
  const result = await addEventDetail({ name: form.name, type: form.type, scoringMethod: form.scoringMethod, number_attempts: form.number_attempts, maxFractionDigits: form.maxFractionDigits });
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
  const sql = `INSERT INTO eventDetails (name, type, scoringMethod, number_attempts, maxFractionDigits) VALUES (?, ?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [event.name, event.type, event.scoringMethod, event.number_attempts, event.maxFractionDigits], function(err) {
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
      scoringMethod TEXT NOT NULL,
      number_attempts INTEGER NOT NULL,
      maxFractionDigits INTEGER NOT NULL
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
      clubMaxAthletes INTEGER NOT NULL DEFAULT 2,
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

  const createEventSignUpsTableSql = `
  CREATE TABLE IF NOT EXISTS EventSignUps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    athlete_id INTEGER NOT NULL,
    athlete_type CHAR(1) NOT NULL, -- 'A' for athlete, 'B' for second athlete
    FOREIGN KEY (event_id) REFERENCES EventInstances(id),
    FOREIGN KEY (club_id) REFERENCES Clubs(id),
    FOREIGN KEY (athlete_id) REFERENCES Athletes(id)
  );
`;

  // Execute the EventSignUps table creation query
  db.run(createEventSignUpsTableSql, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("EventSignUps table created or already exists.");
  });

  const createEventAttemptsTableSql = `
    CREATE TABLE IF NOT EXISTS EventAttempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      athlete_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL,
      result TEXT NOT NULL,
      UNIQUE(event_id, athlete_id, attempt_number),
      FOREIGN KEY (event_id) REFERENCES EventInstances(id),
      FOREIGN KEY (athlete_id) REFERENCES Athletes(id)
    );
  `;

  // Execute the EventAttempts table creation query
  db.run(createEventAttemptsTableSql, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("EventAttempts table created or already exists.");
  });

  const createEventPositionsSql = `
  CREATE TABLE IF NOT EXISTS EventPositions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      athlete_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      scoring_type String,
      FOREIGN KEY (athlete_id) REFERENCES Athletes(id),
      FOREIGN KEY (event_id) REFERENCES EventInstances(id),
      UNIQUE(athlete_id, event_id)
  );
  `;

  // Execute the EventAttempts table creation query
  db.run(createEventPositionsSql, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("EventPositions table created or already exists.");
  });

  const createEventPoints = `
  CREATE TABLE IF NOT EXISTS EventPoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue TEXT NOT NULL,
    event_id INTEGER NOT NULL,
    athlete_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES EventInstances(id),
    FOREIGN KEY (athlete_id) REFERENCES Athletes(id),
    UNIQUE(athlete_id, event_id)
);`;

  // Execute the EventAttempts table creation query
  db.run(createEventPoints, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("EventPoints table created or already exists.");
  });

  const createEventRelayAttemptsTableSql = `
  CREATE TABLE IF NOT EXISTS EventRelayAttempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    club_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    result TEXT NOT NULL,
    UNIQUE(event_id, club_id),
    FOREIGN KEY (event_id) REFERENCES EventInstances(id),
    FOREIGN KEY (club_id) REFERENCES Clubs(id)
  );
`;

// Execute the EventAttempts table creation query
db.run(createEventRelayAttemptsTableSql, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("EventAttempts table created or already exists.");
});

const createEventRelayPositionsSql = `
CREATE TABLE IF NOT EXISTS EventRelayPositions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    scoring_type String,
    FOREIGN KEY (club_id) REFERENCES Clubs(id),
    FOREIGN KEY (event_id) REFERENCES EventInstances(id),
    UNIQUE(club_id, event_id)
);
`;

// Execute the EventAttempts table creation query
db.run(createEventRelayPositionsSql, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("EventPositions table created or already exists.");
});

const createEventRelayPoints = `
CREATE TABLE IF NOT EXISTS  EventRelayPoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  club_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES EventInstances(id),
  FOREIGN KEY (club_id) REFERENCES Clubs(id),
  UNIQUE(club_id, event_id)
);`;

// Execute the EventAttempts table creation query
db.run(createEventRelayPoints, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("EventPoints table created or already exists.");
});

const createTotalPoints = `
CREATE TABLE IF NOT EXISTS TotalPoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue TEXT NOT NULL,
  club_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  agegroup TEXT NOT NULL, -- e.g., U11B, U11G, Mixed
  gender TEXT NOT NULL, -- e.g., Boys, Girls, Mixed
  FOREIGN KEY (club_id) REFERENCES Clubs(id),
  UNIQUE(club_id, venue, agegroup, gender)
);`;

// Execute the createTotalPoints table creation query
db.run(createTotalPoints, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("TotalPoints table created or already exists.");
});

const createTotalAthletePoints = `
CREATE TABLE IF NOT EXISTS TotalAthletePoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue TEXT NOT NULL,
  athlete_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  FOREIGN KEY (athlete_id) REFERENCES Athletes(id),
  UNIQUE(athlete_id, venue)
);`;

//Execute the createTotalAthletePoints table creation query
db.run(createTotalAthletePoints, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log("TotalAthletePoints table created or already exists.");
});

//   const createCategoryRankingPosition = `
//   CREATE TABLE IF NOT EXISTS CategoryRankingPosition (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     venue TEXT NOT NULL,
//     agegroup TEXT NOT NULL, -- e.g., U11B, U11G, Mixed
//     gender TEXT NOT NULL, -- e.g., Boys, Girls, Mixed
//     club TEXT NOT NULL,
//     points INTEGER NOT NULL,
//     UNIQUE(venue, agegroup, gender, club)
// );`;

  // Execute the EventAttempts table creation query
  // db.run(createCategoryRankingPosition, (err) => {
  //   if (err) {
  //     console.error(err.message);
  //     return;
  //   }
  //   console.log("CategoryRankingPosition table created or already exists.");
  // });

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

ipcMain.handle('get-event-signups-club', async (event, eventId, clubId) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT athlete_type, Athletes.id AS athlete_id, Athletes.fullname AS athlete_name 
       FROM EventSignUps 
       INNER JOIN Athletes ON EventSignUps.athlete_id = Athletes.id 
       WHERE EventSignUps.event_id = ? AND EventSignUps.club_id = ?`,
      [eventId, clubId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('get-event-signups', async (event, eventId) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT EventSignUps.id, athlete_type, Athletes.id AS athlete_id, Athletes.fullname AS athlete_name 
       FROM EventSignUps 
       INNER JOIN Athletes ON EventSignUps.athlete_id = Athletes.id 
       WHERE EventSignUps.event_id = ?`,
      [eventId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('get-events', async (event, venue) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT EventInstances.*, EventDetails.*
      FROM EventInstances 
      INNER JOIN EventDetails ON EventInstances.eventDetail_name = EventDetails.name 
      WHERE EventInstances.venue_name = ? 
      ORDER BY EventInstances.display_order`,
      [venue],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('get-events-default-order', async (event, venue) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT EventInstances.*, EventDetails.*
      FROM EventInstances 
      INNER JOIN EventDetails ON EventInstances.eventDetail_name = EventDetails.name 
      WHERE EventInstances.venue_name = ? 
      ORDER BY 
        CASE WHEN EventDetails.type IN ('Track', 'Paarlouf') THEN 1 WHEN EventDetails.type = 'Field' THEN 2 ELSE 3 END,
        CASE WHEN EventInstances.agegroup = 'U11' THEN 1 WHEN EventInstances.agegroup = 'U13' THEN 2 WHEN EventInstances.agegroup = 'U15' THEN 3 ELSE 4 END,
        CASE WHEN EventInstances.gender = 'Girls' THEN 1 WHEN EventInstances.gender = 'Boys' THEN 2 ELSE 3 END`,
      [venue],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('get-event', async (event, eventID) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT EventInstances.*, EventDetails.*
      FROM EventInstances 
      INNER JOIN EventDetails ON EventInstances.eventDetail_name = EventDetails.name 
      WHERE EventInstances.id = ? 
      ORDER BY EventInstances.display_order`,
      [eventID],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('delete-event-signups-club', async (event, clubId) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `DELETE FROM EventSignUps WHERE club_id = ?`,
      [clubId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

interface SignUpRow {
  id: number;
  event_id: number;
  club_id: number;
  athlete_id: number;
}

interface CountRow {
  count: number;
}

ipcMain.handle('insert-event-signup', async (event, eventId, clubId, athleteId, athlete_type, relay = false) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM EventSignUps WHERE event_id = ? AND club_id = ? AND athlete_id = ?`,
      [eventId, clubId, athleteId],
      (err, row: SignUpRow | null) => {
        if (err) {
          reject(err);
        } else if (row) {
          reject(new Error('A row with the same event_id, club_id, and athlete_id already exists'));
        } else {
          db.get(
            `SELECT COUNT(*) as count FROM EventSignUps WHERE event_id = ? AND club_id = ?`,
            [eventId, clubId],
            (err, row: CountRow | null) => {
              if (err) {
                reject(err);
              } else if (row && row.count >= 2 && !relay) {
                reject(new Error('There are already 2 athletes from this club signed up for the event'));
              } else {
                db.run(
                  `INSERT INTO EventSignUps(event_id, club_id, athlete_id, athlete_type) VALUES(?, ?, ?, ?)`,
                  [eventId, clubId, athleteId, athlete_type],
                  function (err) {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(this.lastID);
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});
ipcMain.handle('create-event-attempt', async (event, athlete_id, event_id, attemptNumber, result) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO EventAttempts (athlete_id, event_id, attempt_number, result) VALUES (?, ?, ?, ?) ON CONFLICT(athlete_id, event_id, attempt_number) DO UPDATE SET result = excluded.result`, [athlete_id, event_id, attemptNumber, result],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
  }).finally(() => {
    db.close();
  });
});
ipcMain.handle('create-event-relay-attempt', async (event, club_id, event_id, result) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO EventRelayAttempts (club_id, event_id, result) VALUES (?, ?, ?) ON CONFLICT(club_id, event_id) DO UPDATE SET result = excluded.result`, [club_id, event_id, result],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('delete-event-attempt', async (event, athlete_id, event_id, attemptNumber) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM EventAttempts WHERE athlete_id = ? AND event_id = ? AND attempt_number = ?`, [athlete_id, event_id, attemptNumber],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
  }).finally(() => {
    db.close();
  });
});


ipcMain.handle('create-venue', async (event, { name, date }) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Venues (name, date) VALUES (?, ?)`, [name, date],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('update-venue', async (event, { id, name, date }) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE Venues SET name = ?, date = ? WHERE id = ?`, [name, date, id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});

ipcMain.handle('delete-venue', async (event, id ) => {
  console.log("id: " + id);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM Venues WHERE id = ?`, [id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});


ipcMain.handle('get-attempt-result-signup', async (event, athlete_id, event_id) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, result, attempt_number FROM EventAttempts WHERE athlete_id = ? AND event_id = ? ORDER BY attempt_number ASC`, [athlete_id, event_id],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
});


ipcMain.handle('rankSignups', async (ipcEvent, eventId: number) => {
    await rankSignups(eventId);
    ipcEvent.sender.send('rankSignupsComplete');

});

async function rankSignups(eventId: number): Promise<any> {
  // Delete all records in the EventPositions table with a specific eventId
  await deleteEventPosition(eventId);
  await deleteEventRelayPosition(eventId);
  const event_details = await getEventDetails(eventId);
  console.log(event_details);
  const scoring_method = event_details.scoringMethod;
  // Define a helper function to handle the ranking process
  const handleRanking = async (signups: any[], scoring_athlete: string, eventId: number) => {
      // Filter to get top 2 athletes from each club
      /*const filteredAthletes = await filterTopTwoAthletesPerClub(signups, eventId);
      // Convert filtered athletes to the format expected by rankEventAttempts
      const signupScores = filteredAthletes.map(athlete => ({
        signupId: athlete.signupId, 
        scores: [athlete.bestAttempt] 
      }));
    */
    // For each signup, fetch all attempts and find the best attempt
    
    const signupScores = await Promise.all(signups.map(async (signup: any) => {
      const attempts = await getEventSignupAttempt(signup.athlete_id, eventId);
      attempts.sort((a: any, b: any) => a.result - b.result);
      /* if (signup.scoringMethod === 'highest') {
        attempts.reverse();
      }
      */
      return { signupId: signup.id, scores: attempts.map((a: any) => a.result) };
    }));
    
    const rankedAthletes = rankEventAttempts(signupScores, scoring_method === "highest"); // Assuming higher scores are better
    console.log(rankedAthletes);

    const clubAthleteCount = {};
    for (const athlete of rankedAthletes) {
      let modifier = 0;
      console.log(athlete);
      const { athlete_id } = await getEventSignupUserID(athlete.signupId);
      const { athlete_club } = await getEventSignupUserClub(athlete.signupId);
      console.log("athlete_id: " + athlete_id);
      console.log(athlete.scores.length)

      if (!clubAthleteCount[athlete_club]) {
        clubAthleteCount[athlete_club] = 1;
      }
      else {
        clubAthleteCount[athlete_club] += 1;
      }

      if(await checkUserResultsExist(eventId, athlete_id) && clubAthleteCount[athlete_club] < 3){
        await createEventPosition({ eventId, athlete_id, position: athlete.position + modifier, scoring_type: scoring_athlete });
      } else {
        modifier += 1;
      }
    }
  };

  // Fetch all signups for the event and handle the ranking process
  console.log("scoring_type: " + event_details.type);
  if (event_details.type == "Track") {
    console.log("scoring_type: " + event_details.type);
    const signupsA = await getEventSignupTrack(eventId, "A");
    await handleRanking(signupsA, "A", eventId);
    const signupsB = await getEventSignupTrack(eventId, "B");
    await handleRanking(signupsB, "B", eventId);
  } else if (event_details.type == "Relay" || event_details.type == "Paarluf") {
    console.log("scoring_type: " + event_details.type);
    const signups = await getRelaySignupsResults(eventId, 4);
    let i =1;
    for (const club of signups) {
      await createEventRelayPosition({ eventId, club_id: club.club_id, position: i, scoring_type: event_details.type });
      i += 1;
    }

  }
  else {
    console.log("scoring_type: " + event_details.type);
    const signups = await getEventSignup(eventId);
    await handleRanking(signups, "N/A", eventId);
  }
}

// Old implementation
async function rankSignupsOld(eventId: number): Promise<any> {

  // Delete all records in the EventPositions table with a specific eventId
  await deleteEventPosition(eventId);
  // Fetch all signups for the event
  const signups = await getEventSignup(eventId);

  // For each signup, fetch all attempts and find the best attempt
  const signupScores = await Promise.all(signups.map(async (signup: any) => {
    const attempts = await getEventSignupAttempt(signup.id, 1);
    attempts.sort((a: any, b: any) => a.result - b.result);
    if (signup.scoringMethod === 'highest') {
      attempts.reverse();
    }
    return { signupId: signup.id, scores: attempts.map((a: any) => a.result) };
  }));
  

  // Rank the signups based on their best attempts
  signupScores.sort((a: any, b: any) => {
    for (let i = 0; i < Math.max(a.scores.length, b.scores.length); i++) {
      if (a.scores[i] !== b.scores[i]) {
        return b.scores[i] - a.scores[i];
      }
    }
    return 0;
  });
  console.log(signupScores);

// For each signup, create a new record in the EventPositions table with the signup's rank
let lastScore = null;
let lastRank = 0;
for (let i = 0; i < signupScores.length; i++) {
  const { signupId, scores } = signupScores[i];
  const bestScore = scores[0];  // Assuming scores are sorted in descending order
  let rank;
  if (bestScore === lastScore) {
    // If the current score is the same as the last score, give the current signup the same rank as the last rank
    rank = lastRank;
  } else {
    // Otherwise, give the current signup a rank that is one more than the current index
    rank = i + 1;
    lastRank = rank;
  }
  lastScore = bestScore;

  console.log("signupId for lookup: " + signupId);
  const { athlete_id } = await getEventSignupUserID(signupId);
  console.log("athlete_id: " + athlete_id);
  await createEventPosition({ eventId, athlete_id, position: rank, scoring_type: "Old" });
}
};

// Fetch all signups for a specific event
async function getEventSignup(eventId): Promise<any> {
  console.log("eventId: " + eventId);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM EventSignups WHERE event_id = ?`, [eventId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as EventSignup[]);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

async function getRelaySignups(eventId, number): Promise<any> {
  console.log("eventId: " + eventId);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT EventSignUps.club_id, Clubs.name AS club_name, EventRelayAttempts.result as time
      FROM EventSignUps
      INNER JOIN Clubs ON EventSignUps.club_id = Clubs.id
      LEFT JOIN EventRelayAttempts ON EventSignUps.club_id = EventRelayAttempts.club_id AND EventSignUps.event_id = EventRelayAttempts.event_id
      WHERE EventSignUps.event_id = ?
      GROUP BY EventSignUps.club_id
      HAVING COUNT(DISTINCT EventSignUps.athlete_id) = ?;
    `, [eventId, number],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}
async function getRelaySignupsResults(eventId, number): Promise<any> {
  console.log("eventId: " + eventId);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT EventSignUps.club_id, Clubs.name AS club_name, EventRelayAttempts.result as time
      FROM EventSignUps
      INNER JOIN Clubs ON EventSignUps.club_id = Clubs.id
      INNER JOIN EventRelayAttempts ON EventSignUps.club_id = EventRelayAttempts.club_id AND EventSignUps.event_id = EventRelayAttempts.event_id
      WHERE EventSignUps.event_id = ?
      GROUP BY EventSignUps.club_id
      HAVING COUNT(DISTINCT EventSignUps.athlete_id) = ?
      ORDER BY EventRelayAttempts.result ASC;
    `, [eventId, number],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

async function checkUserResultsExist(evnetID, user_id): Promise<boolean> {
  const db = await openDatabase();
  return new Promise<boolean>((resolve, reject) => {
    db.get(`SELECT id FROM EventAttempts WHERE event_id = ? AND athlete_id = ?`, [evnetID, user_id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? true : false);
      }
    });
  }).finally(() => {
    db.close();
  });
}

async function checkNumberOfAthletesPerClub(evnetID, user_id): Promise<boolean> {
  const db = await openDatabase();
  return new Promise<boolean>((resolve, reject) => {
    db.get(`SELECT id FROM EventAttempts WHERE event_id = ? AND athlete_id = ?`, [evnetID, user_id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? true : false);
      }
    });
  }).finally(() => {
    db.close();
  });
}
// Fetch all signups for a specific event
async function getEventSignupTrack(eventId, type): Promise<any> {
  console.log("eventId: " + eventId);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM EventSignups WHERE event_id = ? AND athlete_type = ?`, [eventId, type],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as EventSignup[]);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

async function getEventSignupUserID(signupId): Promise<any> {
  console.log("signupId: " + signupId);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`SELECT athlete_id FROM EventSignups WHERE id = ? LIMIT 1`, [signupId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);  // Resolve the first row
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}
async function getEventSignupUserClub(signupId): Promise<any> {
  console.log("signupId: " + signupId);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`SELECT club_id FROM EventSignups WHERE id = ? LIMIT 1`, [signupId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);  // Resolve the first row
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

async function getEventDetails(eventInstanceId): Promise<any> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get(`SELECT EventDetails.type, EventDetails.scoringMethod, EventInstances.venue_name as venue FROM EventDetails 
            INNER JOIN EventInstances ON EventDetails.name = EventInstances.eventDetail_name 
            WHERE EventInstances.id = ?`, [eventInstanceId],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}


// Fetch all attempts for a specific signup
async function getEventSignupAttempt(athlete_id, event_id): Promise<any> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, result, attempt_number FROM EventAttempts WHERE athlete_id = ? AND event_id = ? ORDER BY attempt_number ASC`, [athlete_id, event_id],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

async function getEventAttempts(eventID): Promise<any> {
  console.log("eventID: " + eventID);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, result, attempt_number FROM EventAttempts WHERE event_id = ? ORDER BY attempt_number ASC`, [eventID],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

// Create a new record in the EventPositions table
async function createEventPosition({ eventId, athlete_id, position, scoring_type }): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run('INSERT INTO EventPositions (event_id, athlete_id, position, scoring_type) VALUES (?, ?, ?, ?)', [eventId, athlete_id, position, scoring_type], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).finally(() => {
    db.close();
  });
}

async function createEventRelayPosition({ eventId, club_id, position, scoring_type }): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run('INSERT INTO EventRelayPositions (event_id, club_id, position, scoring_type) VALUES (?, ?, ?, ?)', [eventId, club_id, position, scoring_type], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).finally(() => {
    db.close();
  });
}
// Delete all records in the EventPositions table with a specific eventId
async function deleteEventPosition(eventId: number): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run('DELETE FROM EventPositions WHERE event_id = ?', [eventId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).finally(() => {
    db.close();
  });
}
async function deleteEventRelayPosition(eventId: number): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run('DELETE FROM EventRelayPositions WHERE event_id = ?', [eventId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).finally(() => {
    db.close();
  });
}
// Call the function to create the database
createDatabase();



/*
/// Scot
interface AthleteAttempt {
  signupId: number;
  bestAttempt: number;
  club: string;
}

// ... other code ...
async function filterTopTwoAthletesPerClub(signups: any[], eventId: number): Promise<AthleteAttempt[]> {
  let athletesByClub: Record<string, AthleteAttempt[]> = {};

  for (const signup of signups) {
    const club = signup.club;
    const attempts = await getEventSignupAttempt(signup.athlete_id, eventId);
    const bestAttempt = Math.max(...attempts.map(a => a.result));

    if (!athletesByClub[club]) {
      athletesByClub[club] = [];
    }

    athletesByClub[club].push({ signupId: signup.id, bestAttempt: bestAttempt, club: club });

    // Sort and keep only top 2 athletes per club
    athletesByClub[club].sort((a, b) => b.bestAttempt - a.bestAttempt);
    if (athletesByClub[club].length > 2) {
      athletesByClub[club].length = 2; // Keep only top 2
    }
  }

  // Flatten the array to get top 2 athletes from all clubs
  return ([] as AthleteAttempt[]).concat(...Object.values(athletesByClub));
}
*/


function rankEventAttempts(eventAttempts, isHigherBetter = true) {
  // Filter out athletes with no scores
  const validAttempts = eventAttempts.filter(attempt => attempt.scores && attempt.scores.length > 0);

  // Sort athletes based on their scores
  validAttempts.sort((a, b) => compareAthletes(a.scores, b.scores, isHigherBetter));

  let currentRank = 1;
  let athletesInCurrentRank = 0;

  validAttempts.forEach((attempt, index) => {
      if (index > 0) {
          const prevAttempt = validAttempts[index - 1];
          if (compareAthletes(attempt.scores, prevAttempt.scores, isHigherBetter) !== 0) {
              currentRank += athletesInCurrentRank;
              athletesInCurrentRank = 1;
          } else {
              athletesInCurrentRank++;
          }
      } else {
          athletesInCurrentRank = 1;
      }
      attempt.position = currentRank;
  });

  return validAttempts;
}

function compareAthletes(aScores, bScores, isHigherBetter) {
  const aBestScore = Math.max(...aScores.map(Number));
  const bBestScore = Math.max(...bScores.map(Number));

  if (aBestScore !== bBestScore) {
      return isHigherBetter ? bBestScore - aBestScore : aBestScore - bBestScore;
  }

  const sortedAScores = [...aScores].sort((x, y) => isHigherBetter ? y - x : x - y);
  const sortedBScores = [...bScores].sort((x, y) => isHigherBetter ? y - x : x - y);

  for (let i = 0; i < Math.min(sortedAScores.length, sortedBScores.length); i++) {
      if (sortedAScores[i] !== sortedBScores[i]) {
          return isHigherBetter ? sortedBScores[i] - sortedAScores[i] : sortedAScores[i] - sortedBScores[i];
      }
  }

  return bScores.length - aScores.length;
}

// Create a new record in the EventPoints table
async function createOrUpdateEventPoint({ eventId, athlete_id, points, venue }): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run(`
      INSERT INTO EventPoints (event_id, athlete_id, points, venue) 
      VALUES (?, ?, ?, ?) 
      ON CONFLICT(athlete_id, event_id) 
      DO UPDATE SET points = ?, venue = ?
    `, [eventId, athlete_id, points, venue, points, venue], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).finally(() => {
    db.close();
  });
}
async function createOrUpdateEventRelayPoint({ eventId, club_id, points, venue }): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run(`
      INSERT INTO EventRelayPoints (event_id, club_id, points, venue) 
      VALUES (?, ?, ?, ?) 
      ON CONFLICT(club_id, event_id) 
      DO UPDATE SET points = ?, venue = ?
    `, [eventId, club_id, points, venue, points, venue], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).finally(() => {
    db.close();
  });
}

interface RowCount {
  count: number;
}
async function getClubCount(): Promise<number> {
  const db = await openDatabase();
  return new Promise<number>((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM Clubs', [], (err, row: RowCount) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  }).finally(() => {
    db.close();
  });
}

async function getEventPositionsForEvents(eventId: number): Promise<any[]> {
  const db = await openDatabase();
  return new Promise<any[]>((resolve, reject) => {
    db.all('SELECT * FROM EventPositions WHERE event_id = ? ORDER BY position ASC', [eventId], (err, eventPositions) => {
      if (err) {
        reject(err);
      } else {
        resolve(eventPositions);
      }
    });
  }).finally(() => {
    db.close();
  });
}
async function getEventPositionsForEventsRelay(eventId: number): Promise<any[]> {
  const db = await openDatabase();
  return new Promise<any[]>((resolve, reject) => {
    db.all('SELECT * FROM EventRelayPositions WHERE event_id = ? ORDER BY position ASC', [eventId], (err, eventPositions) => {
      if (err) {
        reject(err);
      } else {
        resolve(eventPositions);
      }
    });
  }).finally(() => {
    db.close();
  });
}
// Assign scores to each position and write them to the EventPoints table
async function eventPoints(eventId: number): Promise<void> {
  // Retrieve all the eventPositions from the database
  const eventPositions = await getEventPositionsForEvents(eventId);
  const event_details = await getEventDetails(eventId);
  console.log("event_details: " + event_details);
  const numClubs = await getClubCount();
  const venue = event_details.venue;
  let score = numClubs * 2;
  if (event_details.type == "Track") {
    assignScoresAndWriteToEventPointsTrack(eventPositions, score, venue);
  } 
  if (event_details.type == "Relay" || event_details.type == "Paarluf") {
    console.log("scoring_type skipping: " + event_details.type);
  } 
  else {
    assignScoresAndWriteToEventPointsField(eventPositions, score, venue);
  }
}
async function eventPointsRelay(eventId: number): Promise<void> {
  // Retrieve all the eventPositions from the database
  const eventPositions = await getEventPositionsForEventsRelay(eventId);
  const event_details = await getEventDetails(eventId);
  console.log("event_details: " + event_details);
  const numClubs = await getClubCount();
  const venue = event_details.venue;
  let score = numClubs * 2;
  if (event_details.type == "Relay" || event_details.type == "Paarluf") {
  assignScoresAndWriteToEventPointsRelay(eventPositions, score, venue);
  }
}

async function assignScoresAndWriteToEventPointsTrack(eventPositions, score, venue) {
  for (let position of eventPositions) {
    // Assign score based on whether the athlete is A or B
    if (position.scoring_type == "A") {
      position.score = score - (position.position - 1) * 2;
    } else if (position.scoring_type == "B") {
      position.score = score - 1 - (position.position - 1) * 2;
    }

    // Write the score to EventPoints
    createOrUpdateEventPoint({ eventId: position.event_id, athlete_id: position.athlete_id, points: position.score, venue: venue});
  }
}
async function assignScoresAndWriteToEventPointsField(eventPositions, score, venue) {
  for (let position of eventPositions) {
    position.score = score;
    score -= 1
    // Write the score to EventPoints
    createOrUpdateEventPoint({ eventId: position.event_id, athlete_id: position.athlete_id, points: position.score, venue: venue });
  }
}
async function assignScoresAndWriteToEventPointsRelay(eventPositions, score, venue) {
  for (let position of eventPositions) {
    position.score = score;
    score -= 2
    // Write the score to EventPoints
    createOrUpdateEventRelayPoint({ eventId: position.event_id, club_id: position.club_id, points: position.score, venue: venue });
  }
}

ipcMain.handle('scoreEvent', async (ipcEvent, eventId: number) => {
  await eventPoints(eventId);
  await eventPointsRelay(eventId);
  ipcEvent.sender.send('eventScored');

});


ipcMain.handle('get-relay-signup', async (ipcEvent, eventId: number) => {
  const event_details = await getEventDetails(eventId);
  let clubs = [];
  if (event_details.type == "Paarluf") {
      clubs = await getRelaySignups(eventId, 2);
  } else {
      clubs = await getRelaySignups(eventId, 4);
  }

  return clubs;
});


ipcMain.handle('get-athlete-total-score-venue', async (event, athleteId, venue) => {
  return await athleteTotalVenueScore(athleteId, venue);
});

interface ScoreRow {
  total_score: number;
}
async function athleteTotalVenueScore(athleteId, venue) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT SUM(points) as total_score 
       FROM EventPoints 
       WHERE athlete_id = ? AND venue = ?`,
      [athleteId, venue],
      (err, row: ScoreRow | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.total_score : 0);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}