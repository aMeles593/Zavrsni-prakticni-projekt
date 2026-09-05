import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FootballService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  getHomeLeagues() {
    return this.http.get(`${this.baseUrl}/leagues/home`);
  }

  getLeagueFixtures(leagueId: number) {
    return this.http.get(`${this.baseUrl}/fixtures?league=${leagueId}`);
  }

  getFixturesByStatus(leagueId: number, status: string) {
    return this.http.get(
      `${this.baseUrl}/fixtures?league=${leagueId}&status=${status}`
    );
  }
  getFixtures(leagueId: number, season: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/fixtures?league=${leagueId}&season=${season}`
    );
  }
  getSeasons(leagueId: number) {
    return this.http.get<number[]>(`${this.baseUrl}/seasons?league=${leagueId}`);
  }
  getLeagueById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/leagues/${id}`);
  }
  getMatchById(id:number){
    return this.http.get<any>(
      `${this.baseUrl}/matches/${id}`
    );
  }
  getMatchDetails(id:number){
    return this.http.get<any>(
    `${this.baseUrl}/matches/${id}/details`
    );
  }
  getLineups(id:number){
    return this.http.get<any>(
      `${this.baseUrl}/matches/${id}/lineups`
    );
  }
  getLiveMatches(){
    return this.http.get<any[]>(
        `${this.baseUrl}/matches/live`
    );
  }
  getMatchEvents(id:number){

    return this.http.get<any[]>(
      `${this.baseUrl}/matches/${id}/events`
    );

  }
  syncFixtures(leagueId:number, season:number){
    return this.http.get(
      `${this.baseUrl}/sync/fixtures/${leagueId}?season=${season}`
    );
  }
  getPlayer(id: number, season: number) {
    return this.http.get<any>(
      `${this.baseUrl}/players/${id}?season=${season}`
    );
  }
}