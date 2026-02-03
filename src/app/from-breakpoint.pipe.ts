import { Pipe, PipeTransform } from "@angular/core";
import { map, Observable } from "rxjs";
import { BootstrapBreakpointService } from "./bootstrap-breakpoints.service";

@Pipe({
  name: "fromBreakpoint",
  standalone: true,
  pure: true,
})
export class FromBreakpointPipe implements PipeTransform {
  constructor(private bp: BootstrapBreakpointService) { }

  transform(minBreakpoint: number): Observable<boolean> {
    return this.bp.breakpoint$.pipe(map((current) => current >= minBreakpoint));
  }
}
