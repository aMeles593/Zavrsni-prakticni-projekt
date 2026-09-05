import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FootballService } from '../../services/football';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.html',
  styleUrl: './player.scss'
})
export class PlayerComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private football = inject(FootballService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  player: any = null;
  loading = true;
  error = false;

  ngOnInit(): void {

    const playerId = Number(this.route.snapshot.paramMap.get('id'));
    const season = Number(
      this.route.snapshot.queryParamMap.get('season')
    );

    console.log('PLAYER ID:', playerId);
    console.log('PLAYER SEASON:', season);

    if (!playerId || !season) {
      console.error('Missing player ID or season');
      this.loading = false;
      this.error = true;
      return;
    }

    this.football.getPlayer(playerId, season).subscribe({
      next: (data) => {
        console.log('PLAYER:', data);

        this.player = data;
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('PLAYER ERROR:', err);

        this.loading = false;
        this.error = true;

        this.cdr.detectChanges();
      }
    }); 
  }
  goBack() {
    const matchId = Number(
      this.route.snapshot.queryParamMap.get('matchId')
    );

    if (matchId) {
      this.router.navigate(['/match', matchId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}