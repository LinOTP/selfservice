import { Injectable } from "@angular/core";
import { BehaviorSubject, distinctUntilChanged, filter, map } from "rxjs";
import { UserSystemInfo } from "./system.service";

@Injectable(
  { providedIn: 'root' }
)
export class SelfServiceContextService {
  private store = new BehaviorSubject<SelfServiceContextServiceState>({
    context: null,
  });

  public state$ = this.store.asObservable();
  tokenLimits$ = this.state$.pipe(
    filter(state => !!state.context),
    map(state => state.context.settings.token_limits),
    distinctUntilChanged()
  );

  get context() {
    return this.store.value.context;
  }

  get tokenTimestampsEnabled() {
    return this.context?.settings.last_access || false;
  }

  setContext(data: UserSystemInfo) {
    this.store.next({
      ...this.store.value,
      context: data,
    });
  }
}


type SelfServiceContextServiceState = {
  context: UserSystemInfo | null;
}