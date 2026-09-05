import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { LiveComponent } from './pages/live-scores/live-scores';
import { LeagueComponent } from './pages/league/league';
import { MatchComponent } from './pages/match/match';
import { PlayerComponent } from './pages/player/player';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'live',
    component: LiveComponent
  },
  {
    path: 'league/:id',
    component: LeagueComponent
  },
  {
    path:'match/:id',
    component: MatchComponent
  },
  {
    path: 'player/:id',
    component: PlayerComponent
  }
]