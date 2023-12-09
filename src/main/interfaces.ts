// interfaces.ts
export interface Participant {
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
export interface EventDetails {
    name: string;
    type: string;
    scoringMethod: string; 
  }
export interface EventInstances  {
  name: string;
  eventDetail_id: number;
  venue_id : number;
  agegroup: string;
  gender: string;
}

  