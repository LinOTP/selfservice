import { exponentialBackoffInterval } from './exponential-backoff-interval';


describe('exponentialBackoffInterval', () => {
    let timerCallback: jasmine.Spy;

    beforeEach(() => {
        timerCallback = jasmine.createSpy('timerCallback');
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });

    it(`should double interval every 200ms 3 times starting at 50ms`, () => {
        const expectedIterations = [
            { ticks: 0, calls: 0 },    // start at 0ms

            { ticks: 49, calls: 0 },   // 1st interval of 50ms at 49ms (after 49ms)
            { ticks: 1, calls: 1 },    // 1st interval of 50ms complete at 50ms
            { ticks: 50, calls: 2 },   // 2nd interval of 50ms complete at 100ms
            { ticks: 50, calls: 3 },   // 3rd interval of 50ms complete at 150ms
            { ticks: 50, calls: 4 },   // 4th interval of 50ms complete at 200ms

            { ticks: 50, calls: 4 },   // 1st interval of 100ms at 250ms (after 50ms)
            { ticks: 50, calls: 5 },   // 1st interval of 100ms complete at 300ms
            { ticks: 100, calls: 6 },  // 2nd interval of 100ms complete at 400ms

            { ticks: 100, calls: 6 },  // 1st interval of 200ms at 500ms (after 100ms)
            { ticks: 100, calls: 7 },  // 1st interval of 200ms complete at 600ms

            { ticks: 200, calls: 7 },  // 1st interval of 400ms at 800ms (after 200ms)
            { ticks: 200, calls: 8 },  // 1st interval of 400ms complete at 1000ms
            { ticks: 400, calls: 9 },  // 2nd interval of 400ms complete at 1400ms
            { ticks: 400, calls: 10 }, // 3rd interval of 400ms complete at 1800ms
            { ticks: 400, calls: 11 }, // 4th interval of 400ms complete at 2200ms
            { ticks: 400, calls: 12 }, // 5th interval of 400ms complete at 2600ms
        ];

        exponentialBackoffInterval(50, 200, 3).subscribe(() => {
            timerCallback();
        });

        expectedIterations.forEach(i => {
            jasmine.clock().tick(i.ticks);
            expect(timerCallback).toHaveBeenCalledTimes(i.calls);
        });
    });
});
