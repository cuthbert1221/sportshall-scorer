import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
import { Athlete, EventDetails, EventSignup, EventInstances } from './interfaces.js';
import sqlite3 from 'sqlite3';
import { parse } from 'papaparse';
import { readFileSync } from 'fs';
import { createDatabase, insertClubsAndVenues, alterDatabase } from './DatabaseUtils.js';
import * as fs from 'fs';
import { promisify } from 'util';
const writeFileAsync = promisify(fs.writeFile);

let DB_PATH: string;
if (process.env.NODE_ENV === 'development') {
  DB_PATH = './path_to_new_database.db';
} else { 
  DB_PATH = join(app.getPath('userData'), 'database.db');
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


ipcMain.handle('create-event-instance', async (event, form: any) => {
  // Handle event instance creation in SQLite database

  //lookup venue id
  const venue_id = await getVenueID(form.venue_name);
  console.log(venue_id);
  const result = await addEventInstance({ eventDetail_name: form.eventDetail_name, venue_id: venue_id, agegroup: form.agegroup, gender: form.gender, clubMaxAthletes: form.clubMaxAthletes});
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
  const sql = `INSERT INTO EventInstances (eventDetail_name, venue_id, agegroup, gender, clubMaxAthletes) VALUES (?, ?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [eventInstance.eventDetail_name, eventInstance.venue_id, eventInstance.agegroup, eventInstance.gender, eventInstance.clubMaxAthletes], function(err) {
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

async function insertAthlete(athlete: Athlete): Promise<any> {
  const db = await openDatabase();
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
  }).finally(() => {
    db.close();
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
    const id = await insertAthlete(athlete);
    return id;
  } catch (error) {
    return error as string;
  }
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
    query = "SELECT Athletes.*, Clubs.name AS club_name FROM Athletes INNER JOIN Clubs ON Athletes.club = Clubs.id";
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
      `SELECT EventSignUps.id, athlete_type, Athletes.id AS athlete_id, Athletes.fullname AS athlete_name, Clubs.name AS club_name, lane
       FROM EventSignUps 
       INNER JOIN Athletes ON EventSignUps.athlete_id = Athletes.id
       INNER JOIN Clubs ON Athletes.club = Clubs.id 
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
  return await getEvents(venue);
});

async function getEvents(venue: string, venue_id?: number): Promise<any> {
  if (!venue_id) {
    venue_id = await getVenueID(venue);
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT EventInstances.*, EventDetails.*
      FROM EventInstances 
      INNER JOIN EventDetails ON EventInstances.eventDetail_name = EventDetails.name 
      WHERE EventInstances.venue_id = ? 
      ORDER BY EventInstances.display_order`,
      [venue_id],
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

ipcMain.handle('get-events-default-order', async (event, venue) => {
  const venue_id = await getVenueID(venue);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT EventInstances.*, EventDetails.*
      FROM EventInstances 
      INNER JOIN EventDetails ON EventInstances.eventDetail_name = EventDetails.name 
      WHERE EventInstances.venue_id = ?
      
      ORDER BY 
        -- Prioritize Hurdles, Track events by lap count, Paarlouf, Field events, and other Track events
        CASE 
          WHEN EventDetails.type = 'Track' AND EventInstances.eventDetail_name LIKE '%Hurdles%' THEN 1
          WHEN EventDetails.type = 'Track' AND EventInstances.eventDetail_name LIKE '%2 laps%' THEN 2
          WHEN EventDetails.type = 'Track' AND EventInstances.eventDetail_name LIKE '%3 laps%' THEN 3
          WHEN EventDetails.type = 'Track' AND EventInstances.eventDetail_name LIKE '%4 laps%' THEN 4
          WHEN EventDetails.type = 'Track' AND EventInstances.eventDetail_name LIKE '%5 laps%' THEN 5
          WHEN EventDetails.type = 'Track' AND EventInstances.eventDetail_name LIKE '%6 laps%' THEN 6
          WHEN EventDetails.type = 'Paarlouf' THEN 7
          WHEN EventDetails.type = 'Field' THEN 8
          WHEN EventDetails.type = 'Track' THEN 9
          ELSE 10 
        END,
      
        -- Age group order changes based on event type
        CASE 
          WHEN EventInstances.eventDetail_name LIKE '%Hurdles%' OR EventDetails.type = 'Relay' THEN
            CASE 
              WHEN EventInstances.agegroup = 'U11' THEN 1 
              WHEN EventInstances.agegroup = 'U13' THEN 2 
              WHEN EventInstances.agegroup = 'U15' THEN 3
              ELSE 4
            END
          ELSE 
            CASE 
              WHEN EventInstances.agegroup = 'U13' THEN 1 
              WHEN EventInstances.agegroup = 'U15' THEN 2 
              WHEN EventInstances.agegroup = 'U11' THEN 3
              ELSE 4 
            END 
        END,
      
        -- Gender order: Girls first, then Boys
        CASE 
          WHEN EventInstances.gender = 'Girls' THEN 1 
          WHEN EventInstances.gender = 'Boys' THEN 2 
          ELSE 3 
        END`,
      [venue_id],
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

ipcMain.handle('delete-event-signup-individual', async (event, event_id, club_id, athlete_type) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `DELETE FROM EventSignUps WHERE event_id = ? AND club_id = ? AND athlete_type = ?`,
      [event_id, club_id, athlete_type],
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
  return await insertEventSignup(eventId, clubId, athleteId, athlete_type, relay)
});

async function insertEventSignup(eventId, clubId, athleteId, athlete_type, relay = false): Promise<any> {
  console.log(relay);
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
}

ipcMain.handle('create-event-attempt', async (event, athlete_id, event_id, attemptNumber, result) => {
  return await createEventAttempt(athlete_id, event_id, attemptNumber, result)
});

async function createEventAttempt(athlete_id, event_id, attemptNumber, result) {
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
}

ipcMain.handle('create-event-relay-attempt', async (event, club_id, event_id, result) => {
  return await createEventRelayAttempt(club_id, event_id, result)
});

async function createEventRelayAttempt(club_id, event_id, result) {
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
}

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
ipcMain.handle('update-athlete', async (event, { fullname, club, agegroup, gender, id }) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE Athletes SET fullname = ?, club = ?, agegroup = ?, gender = ? WHERE id = ?`, [fullname, club, agegroup, gender, id],
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
ipcMain.handle('update-eventDetail', async (event, { name, type, scoringMethod, number_attempts, maxFractionDigits }) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE EventDetails SET name = ?, type = ?, scoringMethod = ?, number_attempts = ? , maxFractionDigits = ? WHERE name = ?`, [name, type, scoringMethod, number_attempts, maxFractionDigits, name],
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
      const { athlete_id } = await getEventSignupUserID(athlete.signupId);
      const athlete_club_raw = await getEventSignupUserClub(athlete.signupId);
      const athlete_club = athlete_club_raw.club_id
      console.log("athlete_id: " + athlete_id);
      console.log("athlete_club: " + athlete_club);
      console.log("signupId: " + athlete.signupId);

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
  if (event_details.type == "Track") {
    const signupsA = await getEventSignupTrack(eventId, "A");
    console.log(signupsA);
    await handleRanking(signupsA, "A", eventId);
    const signupsB = await getEventSignupTrack(eventId, "B");
    await handleRanking(signupsB, "B", eventId);
  } else if (event_details.type == "Relay" || event_details.type == "Paarluf") {
    const signups = await getRelaySignupsResults(eventId, 4);
    let i =1;
    for (const club of signups) {
      await createEventRelayPosition({ eventId, club_id: club.club_id, position: i, scoring_type: event_details.type });
      i += 1;
    }

  }
  else {
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

async function getVenueID(name): Promise<any> {
  const db = await openDatabase();
  return new Promise<number>((resolve, reject) => {
    db.all(`SELECT id FROM Venues WHERE name = ? LIMIT 1`, [name],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve((rows[0] as { id: number }).id);  // Resolve the first row
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

async function getVenues(): Promise<any> {
  const db = await openDatabase();
  return new Promise<any>((resolve, reject) => {
    db.all(`SELECT * FROM Venues`, [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);  // Resolve the first row
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
    db.get(`SELECT EventDetails.type, EventDetails.scoringMethod, EventInstances.venue_id as venue_id FROM EventDetails 
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
async function createOrUpdateEventPoint({ eventId, athlete_id, points, venue_id }): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run(`
      INSERT INTO EventPoints (event_id, athlete_id, points, venue_id) 
      VALUES (?, ?, ?, ?) 
      ON CONFLICT(athlete_id, event_id) 
      DO UPDATE SET points = ?, venue_id = ?
    `, [eventId, athlete_id, points, venue_id, points, venue_id], (err) => {
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
async function createOrUpdateEventRelayPoint({ eventId, club_id, points, venue_id }): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run(`
      INSERT INTO EventRelayPoints (event_id, club_id, points, venue_id) 
      VALUES (?, ?, ?, ?) 
      ON CONFLICT(club_id, event_id) 
      DO UPDATE SET points = ?, venue_id = ?
    `, [eventId, club_id, points, venue_id, points, venue_id], (err) => {
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
  const venue_id = event_details.venue_id;
  let score = numClubs * 2;
  if (event_details.type == "Track") {
    assignScoresAndWriteToEventPointsTrack(eventPositions, score, venue_id);
  } 
  if (event_details.type == "Relay" || event_details.type == "Paarluf") {
    console.log("scoring_type skipping: " + event_details.type);
  } 
  else {
    assignScoresAndWriteToEventPointsField(eventPositions, score, venue_id);
  }
}
async function eventPointsRelay(eventId: number): Promise<void> {
  // Retrieve all the eventPositions from the database
  const eventPositions = await getEventPositionsForEventsRelay(eventId);
  const event_details = await getEventDetails(eventId);
  console.log("event_details: " + event_details);
  const numClubs = await getClubCount();
  const venue_id = event_details.venue_id;
  let score = numClubs * 2;
  if (event_details.type == "Relay" || event_details.type == "Paarluf") {
  assignScoresAndWriteToEventPointsRelay(eventPositions, score, venue_id);
  }
}

async function assignScoresAndWriteToEventPointsTrack(eventPositions, score, venue_id) {
  for (let position of eventPositions) {
    // Assign score based on whether the athlete is A or B
    if (position.scoring_type == "A") {
      position.score = score - (position.position - 1) * 2;
    } else if (position.scoring_type == "B") {
      position.score = score - 1 - (position.position - 1) * 2;
    }

    // Write the score to EventPoints
    createOrUpdateEventPoint({ eventId: position.event_id, athlete_id: position.athlete_id, points: position.score, venue_id: venue_id});
  }
}
async function assignScoresAndWriteToEventPointsField(eventPositions, score, venue_id) {
  for (let position of eventPositions) {
    position.score = score;
    score -= 1
    // Write the score to EventPoints
    createOrUpdateEventPoint({ eventId: position.event_id, athlete_id: position.athlete_id, points: position.score, venue_id: venue_id });
  }
}
async function assignScoresAndWriteToEventPointsRelay(eventPositions, score, venue_id) {
  for (let position of eventPositions) {
    position.score = score;
    score -= 2
    // Write the score to EventPoints
    createOrUpdateEventRelayPoint({ eventId: position.event_id, club_id: position.club_id, points: position.score, venue_id: venue_id });
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


ipcMain.handle('get-athlete-total-score-venue', async (event, athleteId, venue_id) => {
  return await athleteTotalVenueScore(athleteId, venue_id);
});

interface ScoreRow {
  total_score: number;
}
async function athleteTotalVenueScore(athleteId, venue_id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT SUM(points) as total_score 
       FROM EventPoints 
       WHERE athlete_id = ? AND venue_id = ?`,
      [athleteId, venue_id],
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

async function clubsTotalVenue(venue_id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT SUM(points) as total_score 
       FROM EventPoints 
       WHERE athlete_id = ? AND venue_id = ?`,
      [venue_id],
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

type ClubTotalPoints = {
  club: string;
  total_points: number;
};

async function getClubsTotalVenue(venue_id: number | string, agegroup: string, gender: string): Promise<ClubTotalPoints[]> {
  const db = await openDatabase();
  
  // Convert venue_id to a number if it's not already
  const numericVenueId = typeof venue_id === 'string' ? parseInt(venue_id, 10) : venue_id;

  return new Promise<ClubTotalPoints[]>((resolve, reject) => {
    let sql = `
      SELECT Athletes.club, SUM(EventPoints.points) as total_points
      FROM EventPoints
      JOIN Athletes ON EventPoints.athlete_id = Athletes.id
      JOIN EventInstances ON EventPoints.event_id = EventInstances.id
      WHERE EventPoints.venue_id = ?
    `;

    const params: (number | string)[] = [numericVenueId];

    if (agegroup !== 'Mixed') {
      sql += ` AND EventInstances.agegroup = ?`;
      params.push(agegroup);
    }
    if (gender !== 'Mixed') {
      sql += ` AND EventInstances.gender = ?`;
      params.push(gender);
    }

    sql += `
      GROUP BY Athletes.club
      ORDER BY total_points DESC
    `;

    db.all(sql, params, (err, rows: ClubTotalPoints[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  }).finally(() => {
    db.close();
  });
}

async function getClubRelayTotalVenue(venue_id: number | string, club: number | string, agegroup: string, gender: string): Promise<any> {
  const db = await openDatabase();

  // Convert venue_id and club to numbers if they are not already
  const numericVenueId = typeof venue_id === 'string' ? parseInt(venue_id, 10) : venue_id;
  const numericClubId = typeof club === 'string' ? parseInt(club, 10) : club;

  let sql = `
    SELECT club_id, SUM(EventRelayPoints.points) as points
    FROM EventRelayPoints
    JOIN EventInstances ON EventRelayPoints.event_id = EventInstances.id
    WHERE EventRelayPoints.venue_id = ? AND EventRelayPoints.club_id = ?
  `;

  const params: (number | string)[] = [numericVenueId, numericClubId];

  if (agegroup !== 'Mixed') {
    sql += ` AND EventInstances.agegroup = ?`;
    params.push(agegroup);
  }
  if (gender !== 'Mixed') {
    sql += ` AND EventInstances.gender = ?`;
    params.push(gender);
  }

  sql += ` GROUP BY club_id`;

  return new Promise<any>((resolve, reject) => {
    db.all(sql, params, (err, rows: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    });
  }).finally(() => {
    db.close();
  });
}

ipcMain.handle('rankClubTotalVenue', async (event, venue_id) => {

  const agegroups = ['U11', 'U13', 'U15', 'Mixed'];
  const genders = ['Girl', 'Boy', 'Mixed']
  for (const agegroup of agegroups) {
    console.log("agegroup: " + agegroup);
    for (const gender of genders) {
      await rankClubTotalVenue(venue_id, agegroup, gender);
    }
  }
  return;
});

async function rankClubTotalVenue(venue_id, agegroup, gender): Promise<any> {
  // Delete all records in the EventPositions table with a specific eventId
  const clubs: ClubTotalPoints[] = await getClubsTotalVenue(venue_id, agegroup, gender);
  console.log(venue_id);
  for (let club of clubs) {
    let club_points = club.total_points
    let relay_club_points = await getClubRelayTotalVenue(venue_id, club.club, agegroup, gender)
    if(relay_club_points){
      club_points = club.total_points + relay_club_points.points;
    }
    await createOrUpdateClubTotalVenue({ club: club.club, total_points: club_points, venue_id: venue_id, agegroup: agegroup, gender: gender });
  }
}

async function createOrUpdateClubTotalVenue({ club, total_points, venue_id, agegroup, gender}): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    db.run(`
      INSERT INTO TotalPoints (club_id, points, venue_id, agegroup, gender) 
      VALUES (?, ?, ?, ?, ?) 
      ON CONFLICT(club_id, venue_id, agegroup, gender) 
      DO UPDATE SET points = excluded.points
    `, [club, total_points, venue_id, agegroup, gender], (err) => {
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

ipcMain.handle('getClubPointsVenue', async (event, venue_id, agegroup, gender) => {
  return await getClubPointsVenue(venue_id, agegroup, gender);
});

async function getClubPointsVenue(venue_id: number, agegroup, gender): Promise<any[]> {
  const db = await openDatabase();
  return new Promise<any[]>((resolve, reject) => {
    db.all(`SELECT TotalPoints.*, Clubs.name 
    FROM TotalPoints 
    INNER JOIN Clubs ON TotalPoints.club_id = Clubs.id 
    WHERE TotalPoints.venue_id = ? AND TotalPoints.agegroup = ? AND TotalPoints.gender = ? 
    ORDER BY TotalPoints.points DESC`,  [venue_id, agegroup, gender], (err, eventPositions) => {
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


let countings = 0;
async function processTrackEventCSV(filePath: string) {
  const fileContent = readFileSync(filePath, 'utf8');
  const parsedData = parse(fileContent, { header: true }).data;

  for (const row of parsedData) {
    await processRowTrack(row);
  }
}
async function processRowTrack(row: any) {
  try {
  if (row.Name == '' || row.Name == ' ') return;

  let type: string;
  let relay: boolean;
  let clubMaxAthletes: number;
  if (row.Event.includes("Relay")) {
    type = "Relay";
    relay = true;
    clubMaxAthletes = 4;
  } else if (row.Event.includes("Paarlouf")) {
    type = "Paarlouf";
    clubMaxAthletes = 2;
    relay = false;
  } else {
    type = "Track";
    clubMaxAthletes = 2;
    relay = false;
  }

  const club_id = await getClubId(row.Club);
  const gender = row.Gender.slice(0, -1)
  if (!club_id) {
    return;
  }
  if (type != "Relay") {
    var athlete = await getAthleteDetails(row.Name, club_id, row.Age, gender);
    if (!athlete) {
      const athlete_insert = {fullname: row.Name, club: club_id.toString(), agegroup: row.Age, gender: gender}
      await insertAthlete(athlete_insert)
      athlete = await getAthleteDetails(row.Name, club_id, row.Age, gender);
    }
  }
  const venue_id = await getVenueID('Venue 1');
  const eventDetailId = await findOrCreateEventDetail({ name: row.Event, type: type, scoringMethod: 'Lowest', number_attempts: 1, maxFractionDigits: 2 });
  const eventInstanceId = await findOrCreateEventInstance({eventDetail_name: row.Event, venue_id: venue_id, agegroup: row.Age, gender: gender, clubMaxAthletes: clubMaxAthletes})

  try {
    if (type != "Relay") {
        await insertEventSignup(eventInstanceId, club_id, athlete.id, row.Race, false)
    }
  } catch (err) {
    console.error(err);
    //return
  }

  const timeInSeconds = convertTimeToSeconds(row.Time);
  if (type != "Relay") {
    await createEventAttempt(athlete.id, eventInstanceId, 1, timeInSeconds);
  } else {
    await createEventRelayAttempt(club_id, eventInstanceId, timeInSeconds)
  }

  } catch (err) {
    console.error(`Error processing row: ${JSON.stringify(row)}`);
    console.error(err);
  }
    //const eventDetailId = await ensureEventDetail(db, row.Event);
    //const eventInstanceId = await ensureEventInstance(db, eventDetailId, row.Age, row.Gender, row.Label);
    // Insert EventSignup and Attempt

}

async function processFieldEventCSV(filePath: string) {
  const fileContent = readFileSync(filePath, 'utf8');
  const parsedData = parse(fileContent, { header: true }).data;

  for (const row of parsedData) {
    await processRowField(row);
  }
}

async function processRowField(row: any) {
  try {
  if (row.Name == '' || row.Name == ' ') return;
  const club_id = await getClubId(row.Club);
  const gender = row.Gender.slice(0, -1)
  if (!club_id) {
    return;
  }
  var athlete = await getAthleteDetails(row.Name, club_id, row.Age, gender);
  if (!athlete) {
    const athlete_insert = {fullname: row.Name, club: club_id.toString(), agegroup: row.Age, gender: gender}
    await insertAthlete(athlete_insert)
    athlete = await getAthleteDetails(row.Name, club_id, row.Age, gender);
  }
  let type: string;
  let relay: boolean;
  let clubMaxAthletes: number;
  type = "Field";
  clubMaxAthletes = 2;
  relay = false;
  const venue_id = await getVenueID('Venue 1');
  const eventDetailId = await findOrCreateEventDetail({ name: row.Event, type: type, scoringMethod: 'Highest', number_attempts: 1, maxFractionDigits: 2 });
  const eventInstanceId = await findOrCreateEventInstance({eventDetail_name: row.Event, venue_id: venue_id, agegroup: row.Age, gender: gender, clubMaxAthletes: clubMaxAthletes})

  try {
    await insertEventSignup(eventInstanceId, club_id, athlete.id, row.Race, false)
  } catch (err) {
    console.error(err);
    //return
  }

  await createEventAttempt(athlete.id, eventInstanceId, 1, row.Performance);

  } catch (err) {
    console.error(`Error processing row: ${JSON.stringify(row)}`);
    console.error(err);
  }
    //const eventDetailId = await ensureEventDetail(db, row.Event);
    //const eventInstanceId = await ensureEventInstance(db, eventDetailId, row.Age, row.Gender, row.Label);
    // Insert EventSignup and Attempt

}



interface RowID {
  id: number;
}

function convertTimeToSeconds(time: string): number {
  const [minutes, seconds] = time.split(':');
  return Number(minutes) * 60 + Number(seconds);
}

async function getClubId(name): Promise<number | null> {
  const db = await openDatabase();
  return new Promise<number | null>((resolve, reject) => {
    db.get('SELECT id FROM Clubs Where name = ?', [name], (err, row: { id: number }) => {
      if (err) {
        resolve(null);
      } else {
        resolve(row ? row.id : null);
      }
    });
  }).finally(() => {
    db.close();
  });
}

async function getAthleteDetails(athlete_name: string, club_id, agegroup, gender): Promise<any> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT Athletes.*, Clubs.id as club_id, Clubs.name as club_name
       FROM Athletes 
       INNER JOIN Clubs ON Athletes.club = Clubs.id 
       WHERE Athletes.fullname = ? AND Athletes.club = ? AND Athletes.agegroup = ? AND Athletes.gender = ?`,
      [athlete_name, club_id, agegroup, gender],
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
async function findOrCreateEventDetail(eventDetail: EventDetails): Promise<number> {
  const db = await openDatabase();
  return new Promise<any>((resolve, reject) => {
    db.get(
      `SELECT * FROM EventDetails WHERE name = ? LIMIT 1`,
      [eventDetail.name],
      (err, row: EventDetails) => {
        if (err) {
          reject(err);
        } else if (!row) {
          db.run(
            `INSERT INTO EventDetails (name, type, scoringMethod, number_attempts, maxFractionDigits) VALUES (?, ?, ?, ?, ?)`,
            [eventDetail.name, eventDetail.type, eventDetail.scoringMethod, eventDetail.number_attempts, eventDetail.maxFractionDigits],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID);
              }
            }
          );
        } else {
          resolve(row.id);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}
async function findOrCreateEventInstance(eventInstance: EventInstances): Promise<number> {
  const db = await openDatabase();
  return new Promise<any>((resolve, reject) => {
    db.get(
      `SELECT * FROM EventInstances WHERE eventDetail_name = ? AND venue_id = ? AND agegroup = ? AND gender = ? LIMIT 1`,
      [eventInstance.eventDetail_name, eventInstance.venue_id, eventInstance.agegroup, eventInstance.gender],
      (err, row: EventDetails) => {
        if (err) {
          reject(err);
        } else if (!row) {
          db.run(
            `INSERT INTO EventInstances (eventDetail_name, venue_id, agegroup, gender, clubMaxAthletes) VALUES (?, ?, ?, ?, ?)`,
            [eventInstance.eventDetail_name, eventInstance.venue_id, eventInstance.agegroup, eventInstance.gender, eventInstance.clubMaxAthletes],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID);
              }
            }
          );
        } else {
          resolve(row.id);
        }
      }
    );
  }).finally(() => {
    db.close();
  });
}

async function loopEventsResults(): Promise<void> {
  const venues = await getVenues()

  for (const venue of venues) {
    const events = await getEvents("N/A", venue.id)

    for (const event of events) {
      await rankSignups(event.id);
      await eventPoints(event.id);
      await eventPointsRelay(event.id);
    }
  }

}
setUpDatabase()
async function setUpDatabase() {
  await createDatabase(DB_PATH);
  await alterDatabase(DB_PATH);
  await insertClubsAndVenues(DB_PATH)
  // Seeder
  const path = require('path');
  var trackFile = path.join(__dirname, 'trackFile.csv');
  var filedFile = path.join(__dirname, 'fieldFile.csv');
  if (process.env.NODE_ENV != 'development') {
    await processTrackEventCSV(trackFile)
    await processFieldEventCSV(filedFile)
  } else {
    await processTrackEventCSV("trackFile.csv")
    await processFieldEventCSV("fieldFile.csv")
  } 
  await loopEventsResults()
  generatePrintableLaneAssignmentsToFile('Track', 'lane_assignments.txt', 1)

}

interface Club {
  id: number;
  name: string;
}
interface EventInstanceRow {
  display_order: number;
}

ipcMain.handle('get-and-update-event-signups', async (event, eventId: number) => {
  const db = await openDatabase();

  try {
    const displayOrder = await getEventDisplayOrder(db, eventId);
    const eventSignUps = await getEventSignUps(db, eventId);
    const clubs = await getAllClubs(db);

    const updatedSignUps = updateLanes(eventSignUps, clubs, displayOrder);
    await updateEventSignUpLanes(db, updatedSignUps);

    return updatedSignUps;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
});



async function generatePrintableLaneAssignmentsToFile(trackEventType: string, filePath: string, venue): Promise<void> {
  const db = await openDatabase();
  const clubs = await getAllClubs(db);
  let laneAssignmentsText = "";

  const clubIds = clubs.map(club => club.id);
  const trackEvents = await getTrackEvents(db, trackEventType, venue);

  for (const event of trackEvents) {
    const displayOrder = event.display_order ?? 0;
    laneAssignmentsText += `Event ${displayOrder + 1} - ${event.eventDetail_name} ${event.agegroup} ${event.gender} \n`;
    const rotatedClubIds = rotateArray(clubIds, displayOrder);

    rotatedClubIds.forEach((clubId, index) => {
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        laneAssignmentsText += `Lane ${index + 1}: ${club.name}\n`;
      }
    });

    laneAssignmentsText += '\n';
  }

  await writeFileAsync(filePath, laneAssignmentsText);
  console.log(`Lane assignments written to ${filePath}`);
}


async function getTrackEvents(db: sqlite3.Database, eventType: string, venue): Promise<EventInstances[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM EventInstances 
       INNER JOIN EventDetails ON EventInstances.eventDetail_name = EventDetails.name 
       WHERE EventDetails.type = ? AND EventInstances.venue_id = ?
       ORDER BY EventInstances.display_order`,
      [eventType, venue],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as EventInstances[]);
        }
      }
    );
  });
}

async function getEventDisplayOrder(db: sqlite3.Database, eventId: number): Promise<number | null> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT display_order FROM EventInstances WHERE id = ?`,
      [eventId],
      (err, row: EventInstanceRow | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.display_order : null);
        }
      }
    );
  });
}
async function getEventSignUps(db: sqlite3.Database, eventId: number): Promise<EventSignup[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM EventSignUps WHERE event_id = ?`,
      [eventId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as EventSignup[]);
        }
      }
    );
  });
}

async function getAllClubs(db: sqlite3.Database): Promise<Club[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, name FROM Clubs`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Club[]);
        }
      }
    );
  });
}

function updateLanes(eventSignUps: EventSignup[], clubs: Club[], displayOrder: number | null): EventSignup[] {
  // Default to no rotation if displayOrder is null
  const effectiveDisplayOrder = displayOrder ?? 0;

  const rotatedClubs = rotateArray(clubs.map(club => club.id), effectiveDisplayOrder);
  eventSignUps.forEach(signUp => {
    const clubIndex = rotatedClubs.indexOf(signUp.club_id);
    signUp.lane = clubIndex !== -1 ? clubIndex + 1 : null;
  });

  return eventSignUps;
}


function rotateArray(arr: number[], count: number): number[] {
  const rotation = count % arr.length;
  return [...arr.slice(rotation), ...arr.slice(0, rotation)];
}
async function updateEventSignUpLanes(db: sqlite3.Database, eventSignUps: EventSignup[]): Promise<void> {
  for (const signUp of eventSignUps) {
    // Ensure that lane is either a number or null
    const lane = signUp.lane !== undefined ? signUp.lane : null;
    await updateLane(db, signUp.id, lane);
  }
}


async function updateLane(db: sqlite3.Database, signUpId: number, lane: number | null): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE EventSignUps SET lane = ? WHERE id = ?`,
      [lane ?? null, signUpId], // Here, we use the nullish coalescing operator to ensure lane is not undefined
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}