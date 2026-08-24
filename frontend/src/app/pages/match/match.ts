import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FootballService } from '../../services/football';
import { CommonModule } from '@angular/common';


@Component({
 selector:'app-match',
 standalone:true,
 imports:[CommonModule],
 templateUrl:'./match.html',
 styleUrl:'./match.scss'
})
export class MatchComponent {


private route = inject(ActivatedRoute);
private football = inject(FootballService);
private cdr = inject(ChangeDetectorRef);


events:any[]=[];
eventKeys = new Set<string>();

match:any;

private interval:any;
private matchId:number = 0;
private es:any = null;
loading = true;

activeTab:'events' | 'lineups' = 'events';
lineups:any = null;
lineupLoading=false;
ngOnInit(){

    this.route.paramMap.subscribe(params=>{
        const id = Number(params.get('id'));
        console.log(
            "MATCH PAGE ID:",
            id
        );
        if(!id)
          return;
        this.matchId = id;
        this.loadMatch(id);
    });

}

startSSE(){
  if(this.es){
    try{ this.es.close(); } catch(e){}
  }
  if(!this.matchId){
    return;
  }
  const url = `http://localhost:3000/api/stream?matchId=${this.matchId}`;
  try{
    this.es = new EventSource(url);
    this.es.addEventListener('match_event', (e:any)=>{
      const payload = JSON.parse(e.data);
      if(payload?.event){
        const normalized = this.normalizeEvent(payload.event);
        const key = this.getEventKey(normalized);
        if(!this.eventKeys.has(key)){
          this.eventKeys.add(key);
          this.events = [...this.events, normalized]
            .sort((a, b) => (a.minute || 0) - (b.minute || 0));
          this.cdr.detectChanges();
        }
      }
    });

    this.es.addEventListener('match_update', (e:any)=>{
      const payload = JSON.parse(e.data);
      if(payload){
        this.match.score_home = payload.score_home;
        this.match.score_away = payload.score_away;
        this.match.status = payload.status;
        this.match.live_minute = payload.live_minute;
        this.cdr.detectChanges();
      }
    });

    this.es.addEventListener('match_ended', (e:any)=>{
      const payload = JSON.parse(e.data);
      if(payload){
        this.match.status = 'FT';
        this.match.live_minute = null;
        this.cdr.detectChanges();
      }
    });

    this.es.onerror = (err:any)=>{
      console.warn('SSE error', err);
    };

  }
  catch(err){
    console.error('SSE init error', err);
  }

}

loadMatch(id:number){


    this.football
    .getMatchById(id)
    .subscribe({
        next:data=>{
            console.log(
                "MATCH:",
                data
            );
            this.match=data;
            this.cdr.detectChanges();

            this.loadDetails(id);
            this.startSSE();
            this.startLiveRefresh(id);
        },
        error:err=>{
            console.error(
                "MATCH ERROR:",
                err
            );
        }
    });
}
loadDetails(id:number){

    this.football
    .getMatchEvents(id)
    .subscribe({
        next:data=>{
            console.log(
                "EVENTS:",
                data
            );
            const raw = Array.isArray(data) ? data : [];
            const seen = new Set<string>();
            this.events = raw
              .filter(event => {
                const key = this.getEventKey(event);
                if(seen.has(key)){
                  return false;
                }
                seen.add(key);
                return true;
              })
              .sort((a,b)=> (a.minute||0) - (b.minute||0));

            this.eventKeys.clear();
            for(const event of this.events){
              this.eventKeys.add(this.getEventKey(event));
            }
            this.cdr.detectChanges();
        },

        error:err=>{
            console.error(
                "EVENT ERROR:",
                err
            );
        }
    });
}

startLiveRefresh(id:number){
  if(this.interval){
    clearInterval(this.interval);
    this.interval = null;
  }
  this.interval = setInterval(()=>{
    if(!this.match){
      return;
    }
    const liveStatuses = [
      '1H',
      '2H',
      'HT',
      'ET'
    ];
    if(
      liveStatuses.includes(
        this.match.status
      )
    ){
      console.log(
        "LIVE UPDATE"
      );
      this.football
      .getMatchById(id)
      .subscribe({
        next:data=>{
          this.match = data;
          this.cdr.detectChanges();
        }
      });
      this.loadDetails(id);
    }
    else{
      console.log(
        "MATCH NOT LIVE ANYMORE"
      );
      clearInterval(
        this.interval
      );
    }
  },60000);
}

isLive(){
    if(!this.match){
        return false;
    }
    return [
        '1H',
        'HT',
        '2H',
        'ET',
        'P'
    ]
    .includes(
        this.match.status
    );
}

showLineups() {
  if (this.activeTab === 'lineups') {
    return;
  }
  this.activeTab = 'lineups';
  if (this.lineups) {
    return;
  }
  this.lineupLoading = true;
  this.football.getLineups(this.match.api_match_id)
    .subscribe({
      next: data => {
        console.log("LINEUPS:", data);
        this.lineups = data;
        this.lineupLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        this.lineupLoading = false;
      }
    });
}

getEventKey(event:any){

  const minute = event.time?.elapsed ?? event.minute ?? 0;
  const extra = event.time?.extra ?? event.extra_minute ?? '';
  const type = event.type ?? '';
  const detail = event.detail ?? '';
  const team = event.team?.name ?? event.team_name ?? '';
  const player = event.player?.name ?? event.player_name ?? '';
  const assist = event.assist?.name ?? event.assist_name ?? '';

  return [minute, extra, type, detail, team, player, assist].join('-');

}

normalizeEvent(event:any){

  if(event.time){
    return {
      minute: event.time.elapsed ?? 0,
      extra_minute: event.time.extra ?? null,
      type: event.type ?? null,
      detail: event.detail ?? null,
      team_name: event.team?.name ?? null,
      player_name: event.player?.name ?? null,
      assist_name: event.assist?.name ?? null
    };
  }

  return event;

}

showEvents(){
  this.activeTab='events';
}

ngOnDestroy(){
  try{ if(this.interval) clearInterval(this.interval); } catch(e){}
  try{ if(this.es) this.es.close(); } catch(e){}
}
}
