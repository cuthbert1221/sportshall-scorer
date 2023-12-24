// interfaces.ts
export interface Athlete {
    fullname: string;
    club: string;
    agegroup: string;
    gender: string;
  }
  
  export interface Event {
    name: string; // Matches state.name
    type: string; // Matches state.type
    agegroup: string; // Matches state.agegroup
    scoringMethod: string; // Matches state.scoringMethod
    gender: string; // Matches state.gender
  }
export interface Venues {
    name: string;
    Date: string; 
  }

export interface Clubs {
    name: string;
    Date: string; 
  }

export interface EventSignup {
    id: number;
    event_id: number;
    club_id: number;
    athlete_id: number;
    athlete_type: string;
  }

export interface EventDetails {
    id?: number;
    name: string;
    type: string;
    scoringMethod: string; 
    number_attempts: number;
    maxFractionDigits: number;
  }
export interface EventInstances  {
  eventDetail_name: string;
  venue_id : number;
  agegroup: string;
  gender: string;
  clubMaxAthletes? : number;
  display_order?: number;
}

  