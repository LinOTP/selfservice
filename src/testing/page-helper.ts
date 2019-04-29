import { ComponentFixture } from '@angular/core/testing';

/**
 * A class to represent a page for testing
 *
 * @class Page
 * @template C - component class to test
 */
export class TestingPage<C> {

  constructor(public fixture: ComponentFixture<C>) { }

  query<T extends HTMLElement>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }

  queryAll<T extends HTMLElement>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}
