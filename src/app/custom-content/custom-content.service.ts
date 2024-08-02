import { Injectable } from "@angular/core";
import * as yaml from 'js-yaml';
import { BehaviorSubject, EMPTY, catchError, distinctUntilChanged, finalize, map, tap } from "rxjs";
import { CustomAssetsService } from "./custom-assets.service";
@Injectable(
  {providedIn: 'root'}
)
export class CustomContentService {
  private _store = new BehaviorSubject<CustomContentServiceState>({
    contents: [],
    customContentLoaded:false
  });
  private _state = this._store.asObservable();
  contents$ = this._state.pipe(
    map(state => state.contents),
    distinctUntilChanged()
  );
  contentLoaded$ = this._state.pipe(
    map(state => state.customContentLoaded),
    distinctUntilChanged()
  );

  get contents() {
    return this._store.value.contents
  }

  get customContentLoaded() {
    return this._store.value.customContentLoaded
  }

  private yamlParser = new YamlParserService();

  constructor(private customAssetsService:CustomAssetsService) { }

  loadContent() {
    this.customAssetsService.getCustomContentFile().pipe(
      catchError(() => {
        return EMPTY
      }),
      tap((file) => {
        try {
          const result = this.yamlParser.loadYaml(file);
          if(!Array.isArray(result)) {
            throw new Error("Invalid yaml file")
          }
          this._store.next({
            ...this._store.value,
            contents: result,
          });
        } catch (e) {
          console.error("Error parsing yaml file", e);
          this._store.next({
            ...this._store.value,
            contents: [],
          });
        }
      }),
      finalize(() => {
        this._store.next({
          ...this._store.value,
          customContentLoaded:true
        });
      })
    ).subscribe();
  }
}


export type CustomContent = {
  slotId:string;
  content:string;
}

type CustomContentServiceState = {
  contents: CustomContent[];
  customContentLoaded:boolean
}

export class YamlParserService {
  loadYaml(content: string): any {
    return yaml.load(content);
  }
}