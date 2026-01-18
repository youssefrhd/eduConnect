import { TestBed } from '@angular/core/testing';

import { AskQuestionService } from './ask-question.service';

describe('AskQuestionService', () => {
  let service: AskQuestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AskQuestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
