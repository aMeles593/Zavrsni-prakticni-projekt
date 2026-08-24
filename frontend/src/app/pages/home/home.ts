import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FootballService } from '../../services/football';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  private football = inject(FootballService);
  private cdr = inject(ChangeDetectorRef);

  featuredLeagues: any[] = [];
  exploreLeagues: any[] = [];

  visibleCount = 5;

  ngOnInit() {
    console.log('HOME INIT');
    this.loadLeagues();
  }

  loadLeagues() {
    this.football.getHomeLeagues().subscribe({
      next: (res: any) => {

        console.log('HOME DATA:', res);

        this.featuredLeagues = res.featured ?? [];
        this.exploreLeagues = res.explore ?? [];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('ERROR:', err);
      }
    });
  }

  get visibleExploreLeagues() {
    return this.exploreLeagues.slice(0, this.visibleCount);
  }

  loadMore() {
    this.visibleCount += 6;
  }
}