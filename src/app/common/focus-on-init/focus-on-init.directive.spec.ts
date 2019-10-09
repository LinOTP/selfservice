import { FocusOnInitDirective } from './focus-on-init.directive';

describe('FocusOnInitDirective', () => {
  it('should create an instance', () => {
    const directive = new FocusOnInitDirective(null);
    expect(directive).toBeTruthy();
  });

  it('should error out if directive host has no focus method', () => {
    let directive = new FocusOnInitDirective({ nativeElement: {} });
    expect(() => directive.ngOnInit()).toThrow();

    directive = new FocusOnInitDirective({ nativeElement: { focus: () => { } } });
    expect(() => directive.ngOnInit()).not.toThrow();
  });

  it('should call focus on the host element on init', () => {
    jasmine.clock().install();
    const directive = new FocusOnInitDirective({ nativeElement: { focus: jasmine.createSpy('focus') } });
    directive.ngOnInit();
    jasmine.clock().tick(0);
    expect((directive as any).el.nativeElement.focus).toHaveBeenCalled();
    jasmine.clock().uninstall();
  });
});
