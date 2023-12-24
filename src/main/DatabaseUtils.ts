import sqlite3 from 'sqlite3';

export async function createDatabase(DB_PATH: string): Promise<void> {
    let db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error(err.message);
        throw err;
      }
      console.log('Connected to the SQLite database.');
    });

    const promises: Promise<void>[] = [];

    const runSql = (sql: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            db.run(sql, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    console.log(`${sql.split(' ')[5]} table created or already exists.`);
                    resolve();
                }
            });
        });
    };

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
    // SQL query to create the Clubs table
    const createClubsTableSql = `
    CREATE TABLE IF NOT EXISTS Clubs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    `;

    // SQL query to create the Venues table
    const createVenuesTableSql = `
    CREATE TABLE IF NOT EXISTS Venues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        date TEXT NOT NULL
    );
    `;

    // SQL query to create the EventInstances table
    const createEventInstancesTableSql = `
    CREATE TABLE IF NOT EXISTS EventInstances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventDetail_name TEXT NOT NULL,
        venue_id INTEGER NOT NULL,
        agegroup TEXT NOT NULL,
        gender TEXT NOT NULL,
        display_order INTEGER,
        clubMaxAthletes INTEGER NOT NULL DEFAULT 2,
        FOREIGN KEY (eventDetail_name) REFERENCES EventDetails (name),
        FOREIGN KEY (venue_id) REFERENCES Venues(id)
    );
    `;

    // SQL query to create the EventSignUps table
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

    // SQL query to create the EventAttempts table
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

    // SQL query to create the EventPositions table
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

    // SQL query to create the EventPoints table
    const createEventPoints = `
    CREATE TABLE IF NOT EXISTS EventPoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venue_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        athlete_id INTEGER NOT NULL,
        points INTEGER NOT NULL,
        FOREIGN KEY (event_id) REFERENCES EventInstances(id),
        FOREIGN KEY (athlete_id) REFERENCES Athletes(id),
        FOREIGN KEY (venue_id) REFERENCES Venues(id),
        UNIQUE(athlete_id, event_id)
    );
    `;

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

    const createEventRelayPoints = `
    CREATE TABLE IF NOT EXISTS  EventRelayPoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venue_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        club_id INTEGER NOT NULL,
        points INTEGER NOT NULL,
        FOREIGN KEY (event_id) REFERENCES EventInstances(id),
        FOREIGN KEY (club_id) REFERENCES Clubs(id),
        FOREIGN KEY (venue_id) REFERENCES Venues(id),
        UNIQUE(club_id, event_id)
    );`;

    const createTotalPoints = `
    CREATE TABLE IF NOT EXISTS TotalPoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    agegroup TEXT NOT NULL, -- e.g., U11B, U11G, Mixed
    gender TEXT NOT NULL, -- e.g., Boys, Girls, Mixed
    FOREIGN KEY (club_id) REFERENCES Clubs(id),
    FOREIGN KEY (venue_id) REFERENCES Venues(id),
    UNIQUE(club_id, venue_id, agegroup, gender)
    );`;

    const createTotalAthletePoints = `
    CREATE TABLE IF NOT EXISTS TotalAthletePoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL,
    athlete_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    FOREIGN KEY (athlete_id) REFERENCES Athletes(id),
    FOREIGN KEY (venue_id) REFERENCES Venues(id),
    UNIQUE(athlete_id, venue_id)
    );`;

    // Execute the table creation queries
    promises.push(runSql(createAthletesTableSql)); // for Athletes table
    promises.push(runSql(createEventDetailsTableSql)); // for Athletes table
    promises.push(runSql(createClubsTableSql)); // for Clubs table
    promises.push(runSql(createVenuesTableSql)); // for Venues table
    promises.push(runSql(createEventInstancesTableSql)); // for EventInstances table
    promises.push(runSql(createEventSignUpsTableSql)); // for EventSignUps table
    promises.push(runSql(createEventAttemptsTableSql)); // for EventAttempts table
    promises.push(runSql(createEventPositionsSql)); // for EventPositions table
    promises.push(runSql(createEventPoints)); // for EventPoints table
    promises.push(runSql(createEventRelayAttemptsTableSql)); // for EventRelayAttempts table
    promises.push(runSql(createEventRelayPositionsSql)); // for EventRelayPositions table
    promises.push(runSql(createEventRelayPoints)); // for EventRelayPoints table
    promises.push(runSql(createTotalPoints)); // for TotalPoints table
    promises.push(runSql(createTotalAthletePoints)); // for TotalAthletePoints table

    await Promise.all(promises);

    return new Promise<void>((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log('Closed the database connection.');
                resolve();
            }
        });
    });
}

// Usage example
// createDatabase('path_to_your_database.db')
//   .then(() => console.log('Database setup complete.'))
//   .catch((err) => console.error('Database setup failed:', err));


export async function insertClubsAndVenues(DB_PATH) {
    let db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error(err.message);
        throw err;
      }
      console.log('Connected to the SQLite database.');
    });

    // SQL queries for creating tables (if they don't exist)


    // Data for clubs and venues
    const clubs = ['Oswestry', 'Shrewsbury', 'Wenlock', 'Telford'];
    const venues = [
      { name: 'Venue 1', date: '2022-01-01' },
      { name: 'Venue 2', date: '2022-02-01' },
      { name: 'Venue 3', date: '2022-03-01' },
    ];

    // Helper function to run SQL queries
    const runSql = (sql: string, params: (string | number | null)[] = []) => {
        return new Promise<void>((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    // Insert clubs and venues
    for (const club of clubs) {
        await runSql(`INSERT OR IGNORE INTO Clubs (name) VALUES (?)`, [club]);
        console.log(`Club ${club} inserted or already exists.`);
    }

    for (const venue of venues) {
        await runSql(`INSERT OR IGNORE INTO Venues (name, date) VALUES (?, ?)`, [venue.name, venue.date]);
        console.log(`Venue ${venue.name} inserted or already exists.`);
    }

    // Close the database connection
    return new Promise<void>((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log('Closed the database connection.');
                resolve();
            }
        });
    });
}