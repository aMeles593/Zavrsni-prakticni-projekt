import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { FootballService }
  from '../../services/football';


@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './player.html',
  styleUrl: './player.scss'
})
export class PlayerComponent
  implements OnInit {


  private route =
    inject(ActivatedRoute);

  private football =
    inject(FootballService);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);


  player: any = null;

  loading = true;

  error = false;


  /*
  ==========================================
  SEZONE
  ==========================================
  */

  seasons: number[] = [];

  selectedSeason = 0;


  ngOnInit(): void {

    const playerId =
      Number(
        this.route.snapshot.paramMap
          .get('id')
      );


    const season =
      Number(
        this.route.snapshot.queryParamMap
          .get('season')
      );


    console.log(
      'PLAYER ID:',
      playerId
    );

    console.log(
      'PLAYER SEASON:',
      season
    );


    if (!playerId || !season) {

      console.error(
        'Missing player ID or season'
      );

      this.loading = false;

      this.error = true;

      return;
    }


    /*
    ========================================
    POSTAVI POČETNU SEZONU
    ========================================
    */

    this.selectedSeason =
      season;


    /*
    ========================================
    UČITAJ DOSTUPNE SEZONE
    ========================================
    */

    this.loadSeasons(
      playerId,
      season
    );

  }


  /*
  ==========================================
  LOAD SEASONS
  ==========================================
  */

  loadSeasons(
    playerId: number,
    currentSeason: number
  ) {

    /*
    Za početak koristimo sezone iz matches
    tablice.
    */

    this.football
      .getPlayerSeasons(
        playerId
      )
      .subscribe({

        next: (seasons) => {

          console.log(
            'PLAYER SEASONS:',
            seasons
          );


          this.seasons =
            Array.isArray(seasons)
              ? seasons
              : [];


          /*
          Trenutna sezona mora postojati
          u dropdownu.
          */

          if (
            !this.seasons.includes(
              currentSeason
            )
          ) {

            this.seasons.push(
              currentSeason
            );

          }


          /*
          Najnovija prvo
          */

          this.seasons.sort(
            (a, b) => b - a
          );


          this.loadPlayer(
            playerId,
            currentSeason
          );

        },

        error: (err) => {

          console.error(
            'SEASONS ERROR:',
            err
          );


          /*
          Ako endpoint za sezone
          zakaže, barem prikaži
          trenutnu sezonu.
          */

          this.seasons = [
            currentSeason
          ];


          this.loadPlayer(
            playerId,
            currentSeason
          );

        }

      });

  }


  /*
  ==========================================
  LOAD PLAYER
  ==========================================
  */

  loadPlayer(
    playerId: number,
    season: number
  ) {

    this.loading = true;

    this.error = false;


    this.football
      .getPlayer(
        playerId,
        season
      )
      .subscribe({

        next: (data) => {

          console.log(
            'PLAYER:',
            data
          );


          this.player =
            data;


          this.selectedSeason =
            season;


          this.loading = false;


          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'PLAYER ERROR:',
            err
          );


          this.loading = false;

          this.error = true;


          this.cdr.detectChanges();

        }

      });

  }


  /*
  ==========================================
  PROMJENA SEZONE
  ==========================================
  */

  changeSeason(season: number) {

    if (!season) return;

    const playerId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    console.log('CHANGING SEASON TO:', season);

    this.selectedSeason = season;

    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {
          season: season
        },
        queryParamsHandling: 'merge'
      }
    );

    this.loadPlayer(playerId, season);
  }


  /*
  ==========================================
  BACK
  ==========================================
  */

  goBack() {

    const matchId =
      Number(
        this.route.snapshot
          .queryParamMap
          .get('matchId')
      );


    if (matchId) {

      this.router.navigate(
        ['/match', matchId]
      );

    }
    else {

      this.router.navigate(
        ['/']
      );

    }

  }

}