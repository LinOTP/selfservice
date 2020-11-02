import { Observable, Observer } from 'rxjs';

/**
 * Emits an increasing sequence of numbers like the interval() of rxjs,
 * but doubles the interval every `timeToBackoff` milliseconds, up to
 * `backoffJumps` times, after which the interval stays constant.
 *
 * @param startInterval initial interval in milliseconds
 * @param timeToBackoff time between doubling the current interval, in milliseconds
 * @param backoffJumps number of times the doubling occurs
 */
export function exponentialBackoffInterval(startInterval: number, timeToBackoff: number, backoffJumps: number): Observable<number> {
    return new Observable((observer: Observer<number>) => {
        let interval = startInterval;
        let repeats = timeToBackoff / interval;
        let repeat = 1;
        let cycle = 0;
        let sequence = 0;

        const f = () => setTimeout(() => {
            observer.next(sequence++);
            if (repeat >= repeats && cycle < backoffJumps) {
                interval = interval * 2;
                repeats = timeToBackoff / interval;
                repeat = 0;
                cycle++;
            }
            repeat++;
            f();
        }, interval);

        f();
    });
}
