import { Injectable } from "@angular/core";
import * as yaml from 'js-yaml';
import { BehaviorSubject, catchError, distinctUntilChanged, EMPTY, finalize, map, Observable, tap } from "rxjs";
import { AppRecommendationService } from "./app-recommendation/app-recommendation.service";
import { CustomAssetsService } from "./custom-assets.service";
import { CustomPageFrontMatterParser } from "./frontmatter-parser";

@Injectable(
  {providedIn: 'root'}
)
export class CustomContentService {
  private _store = new BehaviorSubject<CustomContentServiceState>({
    viewsContent: [],
    viewsContentLoaded:false,
    customPage:null,
    customPageLoaded:false
  });
  private _state = this._store.asObservable();

  viewsContent$ = this._state.pipe(
    map(state => state.viewsContent),
    distinctUntilChanged()
  );
  slotContentLoaded$ = this._state.pipe(
    map(state => state.viewsContentLoaded),
    distinctUntilChanged()
  );
  page$ = this._state.pipe(
    map(state => state.customPage),
    distinctUntilChanged()
  );
  pageLoaded$ = this._state.pipe(
    map(state => state.customPageLoaded),
    distinctUntilChanged()
  );

  customContent$:Observable<CustomContent[]> = this._state.pipe(
    map(state => {
      return [
        ...state.viewsContent,
        state.customPage
      ].filter(c => c !== null) as CustomContent[]
    }),
    distinctUntilChanged()
  );

  get page():CustomPage | null {
    return this._store.value.customPage;
  }

  get pageLoaded():boolean {
    return this._store.value.customPageLoaded;
  }

  get viewsContent():SlotContent[] {
    return this._store.value.viewsContent;
  }

  get customContent():CustomContent[] {
    return [...this._store.value.viewsContent, this._store.value.customPage].filter(c => c !== null)
  }

  get viewsContentLoaded():boolean {
    return this._store.value.viewsContentLoaded;
  }

  customContentLoaded$ = this._state.pipe(
    map(state => state.viewsContentLoaded && state.customPageLoaded),
    distinctUntilChanged()
  );

  get customContentLoaded():boolean {
    return this._store.value.viewsContentLoaded && this._store.value.customPageLoaded;
  }

  private yamlParser = new YamlParserService();
  private frontMatterParser = new CustomPageFrontMatterParser()

  constructor(private customAssetsService:CustomAssetsService, private appRecService: AppRecommendationService) { }

  loadContent() {
    this.customAssetsService.getCustomContentForViewsFile().pipe(
      catchError(() => {
        return EMPTY
      }),
      tap((file) => {
        try {
          const result = this.yamlParser.loadYaml(file);
          if (result.enrollment_app_recommendations) {
            this.appRecService.setAppRecommendations(result.enrollment_app_recommendations);
          }
          this._store.next({
            ...this._store.value,
            viewsContent: result.slots ?? [],
          });
        } catch (e) {
          console.error("Error parsing yaml file", e);
          this._store.next({
            ...this._store.value,
            viewsContent: [],
          });
        }
      }),
      finalize(() => {
        this._store.next({
          ...this._store.value,
          viewsContentLoaded:true
        });
      })
    ).subscribe();


    this.customAssetsService.getCustomPageFile().pipe(
      catchError(() => {
        return EMPTY
      }),
      tap((fileContent:string) => {
        try {
          const parsed = this.frontMatterParser.parse(fileContent);
          this._store.next({
            ...this._store.value,
            customPage: {
              ...parsed.frontmatter,
              content: parsed.content
            }
          });
        } catch(err) {
          console.error("Error parsing custom page file", err);
          this._store.next({
            ...this._store.value,
            customPage: null
          });
        }
    }),
      finalize(() => {
        this._store.next({
          ...this._store.value,
          customPageLoaded:true
        });
  })
    ).subscribe();
  }
}

export type SlotContent = {
  slotId:string;
  content:string;
}
export type CustomPage = {
  slotId: "custom-page"
  title: string
  route: string
  content: string
}

export type SlotId = string | "custom-page";

export type CustomContent = SlotContent | CustomPage;

type CustomContentServiceState = {
  viewsContent: SlotContent[];
  viewsContentLoaded: boolean;
  customPageLoaded: boolean;
  customPage: CustomPage | null;
}

export class YamlParserService {
  loadYaml(content: string): any {
    if (!content) {
      throw new Error("Invalid parameter");
    }
    const result = yaml.load(content);
    if (!result || Object.keys(result).length <= 0) {
      throw new Error("Invalid yaml file");
    }
    return result;
  }
}