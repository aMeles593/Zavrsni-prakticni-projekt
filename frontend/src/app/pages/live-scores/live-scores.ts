import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FootballService } from '../../services/football';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './live-scores.html',
  styleUrl: './live-scores.scss'
})
export class LiveComponent implements OnInit, OnDestroy {

  private footballService = inject(FootballService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  matches: any[] = [];
  loading = true;

  private interval:any;

  ngOnInit() {

  console.log("LIVE COMPONENT START");

  this.loadLiveMatches();

  this.interval = setInterval(() => {

    console.log("LIVE REFRESH");

    this.loadLiveMatches();

  }, 30000);
}
loadLiveMatches() {

  console.log("========== LIVE REQUEST ==========");

  this.footballService.getLiveMatches().subscribe({

    next: (res: any) => {

      console.log("LIVE RESPONSE:", res);

      this.matches = Array.isArray(res)
        ? res.filter(m => m?.api_match_id)
        : [];

      console.log("MATCHES:", this.matches);
      console.log("MATCH COUNT:", this.matches.length);

      this.loading = false;

      this.cdr.markForCheck();
    },

    error: (err) => {

      console.error("LIVE ERROR:", err);
      this.loading = false;
    }

  });
}

  ngOnDestroy(){
    if(this.interval){
      clearInterval(this.interval);
    }
  }

  openMatch(matchId:any){
    if(!matchId){
      return;
    }
    this.router.navigate(['/match', matchId]);
  }

}