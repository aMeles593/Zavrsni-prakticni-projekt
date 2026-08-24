import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveScores } from './live-scores';

describe('LiveScores', () => {
  let component: LiveScores;
  let fixture: ComponentFixture<LiveScores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveScores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveScores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
