import { Component, ChangeDetectorRef, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FootballService } from '../../services/football';

@Component({
  selector: 'app-league',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './league.html',
  styleUrl: './league.scss'
})
export class LeagueComponent {

  private route = inject(ActivatedRoute);
  private football = inject(FootballService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private fixturesRequestId = 0;

  leagueId!: number;
  league: any = null;

  leagueName: WritableSignal<string> = signal('');
  leagueLogo: WritableSignal<string> = signal('');

  seasons: number[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];
  selectedSeason: number = 2024;
  leagueLoaded = false;
  loading: WritableSignal<boolean> = signal<boolean>(true);
  fixturesLoading = false;

  fixtures: any[] = [];
  matchesByRound: any[] = [];

  ngOnInit() {
    const initialId = Number(this.route.snapshot.paramMap.get('id'));
    if (initialId) {
      this.leagueId = initialId;
      
      this.loadLeague();
      
      this.fetchSeasons();
    }
    this.route.paramMap.subscribe(params => {
      const newId = Number(params.get('id'));
      if (newId && newId !== this.leagueId) {
        this.leagueId = newId;
        this.loadLeague();
        this.fetchSeasons();
      }
    });
  }

  loadLeague() {
    this.fixturesRequestId += 1;
    this.loading.set(true);
    this.leagueLoaded = false;
    this.leagueName.set('');
    this.leagueLogo.set('');

    this.football.getLeagueById(this.leagueId)
      .subscribe({
        next: (league: any) => {
          this.league = league;
          this.leagueName.set(league.name);
          this.leagueLogo.set(league.logo);
          this.leagueLoaded = true;
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load league', err);
          this.leagueLoaded = false;
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  syncFixtures() {
    this.football.syncFixtures(this.leagueId, this.selectedSeason)
      .subscribe({
        next: (res:any) => {
          console.log(
            'FIXTURES SYNC RESULT:',
            res
          );
          this.loadFixtures(this.selectedSeason, false);
        },
        error: (err:any) => {
          console.error(
            'FIXTURES SYNC ERROR:',
            err
          );
          this.loadFixtures(this.selectedSeason, false);
        }
      });
  }

  onSeasonChange(season: number) {
    this.selectedSeason = season;
    this.syncFixtures();
  }

  loadFixtures(season?: number | string, fallbackToAvailable = false) {
    
    if (season === '' || season === null || season === undefined) {
      season = this.selectedSeason;
    }
    
    const targetSeason = Number(season);
    
    if (!Number.isFinite(targetSeason)) {
      return;
    }
    
    this.selectedSeason = targetSeason;
    this.fixturesRequestId += 1;
    const requestId = this.fixturesRequestId;
    this.fixturesLoading = true;
    this.fixtures = [];
    this.matchesByRound = [];

    const seasons = this.seasons;
    const startIndex = seasons.findIndex(s => s === targetSeason);
    const seasonIndex = startIndex >= 0 ? startIndex : 0;

    const trySeason = (index: number) => {
      if (index >= seasons.length) {
        this.fixturesLoading = false;
        return;
      }

      const seasonToLoad = seasons[index];
      this.selectedSeason = seasonToLoad;

      this.football.getFixtures(this.leagueId, seasonToLoad).subscribe({
        next: data => {
          if (requestId !== this.fixturesRequestId) {
            return;
          }

          const orderedFixtures = this.sortFixtures(data || []);

          if (fallbackToAvailable && orderedFixtures.length === 0 && index < seasons.length - 1) {
            trySeason(index + 1);
            return;
          }

          this.fixturesLoading = false;
          this.fixtures = orderedFixtures;
          this.matchesByRound = this.groupRounds(orderedFixtures);

          this.cdr.markForCheck();
        },
        error: err => {
          if (requestId !== this.fixturesRequestId) {
            return;
          }

          this.fixturesLoading = false;
          this.fixtures = [];
          this.matchesByRound = [];
          console.error(err);

          this.cdr.markForCheck();
        }
      });
    };

    trySeason(seasonIndex);
  }

  fetchSeasons() {
    console.log('fetchSeasons called for leagueId:', this.leagueId);
    this.football.getSeasons(this.leagueId).subscribe({
      next: (seasons: number[]) => {
        console.log('Seasons received:', seasons);
        const normalizedSeasons = (Array.isArray(seasons) ? seasons : [])
          .map(value => Number(value))
          .filter(Number.isFinite)
          .sort((a, b) => b - a);

        console.log('Normalized seasons:', normalizedSeasons);
        
        if (normalizedSeasons.length === 0) {
          console.log('No seasons found, using fallback list');
          this.seasons = this.getDefaultSeasons();
        } else {
          this.seasons = normalizedSeasons;
        }
        
        console.log('Seasons set to:', this.seasons);
      
        this.selectedSeason = this.seasons[0];
        console.log('Selected season:', this.selectedSeason);
        this.cdr.markForCheck();
        
        this.syncFixtures();
      },
      error: err => {
        console.error('Failed to load seasons:', err);
        this.seasons = this.getDefaultSeasons();
        this.selectedSeason = this.seasons[0];
        this.cdr.markForCheck();
        this.syncFixtures();
      }
    });
  }

  getDefaultSeasons(): number[] {
   
    const seasons: number[] = [];
    for (let year = 2026; year >= 2010; year--) {
      seasons.push(year);
    }
    return seasons;
  }

  private sortFixtures(data: any[]) {

  if (!data.length) {
    return [];
  }

  const isLeague = data.every(f => Number.isFinite(Number(f.round_number)));

  if (isLeague) {

    return [...data].sort((a, b) => {

      const roundDiff = Number(b.round_number) - Number(a.round_number);

      if (roundDiff !== 0) {
        return roundDiff;
      }

      return new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
    });

  }

  const firstMatchByRound = new Map<string, number>();

  for (const fixture of data) {

    const round = fixture.round_name ?? 'Unknown';
    const date = new Date(fixture.match_date).getTime();

    const current = firstMatchByRound.get(round);

    if (current === undefined || date < current) {
      firstMatchByRound.set(round, date);
    }
  }

  return [...data].sort((a, b) => {

    const firstDateA = firstMatchByRound.get(a.round_name ?? 'Unknown') ?? 0;
    const firstDateB = firstMatchByRound.get(b.round_name ?? 'Unknown') ?? 0;

    if (firstDateA !== firstDateB) {
      return firstDateB - firstDateA;
    }

    return new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
  })
  }
  groupRounds(fixtures: any[]) {

    const rounds = new Map<string, any[]>();

    fixtures.forEach(match => {

      const round = match.round_name || 'Unknown';

      if (!rounds.has(round)) {
        rounds.set(round, []);
      }

      rounds.get(round)!.push(match);

    });


    return Array.from(rounds.entries())
      .map(([name, matches]) => {

        return {
          name,
          matches,
          firstDate: Math.min(
            ...matches.map(m =>
              new Date(m.match_date).getTime()
            )
          )
        };

      })
      .sort((a, b) => {

        return b.firstDate - a.firstDate;

      });
  }
  openMatch(id:number){

    console.log('Opening match:', id);

    this.router.navigate(['/match', id]);

  }
}

