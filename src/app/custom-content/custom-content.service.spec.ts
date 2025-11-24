import { of } from 'rxjs';
import { AppRecommendationService } from './app-recommendation/app-recommendation.service';
import { CustomAssetsService } from './custom-assets.service';
import { CustomContentService, YamlParserService } from './custom-content.service';
import { CustomPageFrontMatter, CustomPageFrontMatterParser } from './frontmatter-parser';

describe('CustomContentService', () => {
  let service: CustomContentService;
  let customAssetsServiceSpy: jasmine.SpyObj<CustomAssetsService>;
  let appRecServiceSpy: jasmine.SpyObj<AppRecommendationService>;
  let frontMatterParser: CustomPageFrontMatterParser
let yamlParserServiceSpy: jasmine.SpyObj<YamlParserService>;

  beforeEach(() => {
    customAssetsServiceSpy = jasmine.createSpyObj('CustomAssetsService', ['getCustomContentForViewsFile', 'getCustomPageFile']);
    appRecServiceSpy = jasmine.createSpyObj('AppRecommendationService', ['setAppRecommendations', 'getAppRecommendations']);

    yamlParserServiceSpy = jasmine.createSpyObj('YamlParserService', ['loadYaml']); // <---

    frontMatterParser = new CustomPageFrontMatterParser();

    service = new CustomContentService(customAssetsServiceSpy, appRecServiceSpy);
    (service as any).yamlParser = yamlParserServiceSpy; // Use the spy object!
    (service as any).frontMatterParser = frontMatterParser;
  });

  it('should load content successfully', () => {
    const mockFileContent = 'mock yaml content';
    const mockParsedContent = {
      slots: [
        { slotId: 'login-top', content: 'Test Content' },
        { slotId: 'tokenlist-top', content: '' },
        { slotId: 'history-top', content: '' }
      ],
      enrollment_app_recommendations: [
        {
          type: 'totp',
          android: {
            name: 'LinOTP Authenticator',
            url: 'https://play.google.com/store/apps/details?id=de.linotp.authenticator'
          },
          ios: {
            name: 'LinOTP Authenticator',
            url: 'https://apps.apple.com/de/app/linotp-authenticator/id6450118468'
          }
        }
      ]
    };

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(""));
    yamlParserServiceSpy.loadYaml.and.returnValue(mockParsedContent);
    spyOn(frontMatterParser, 'parse').and.returnValue({ frontmatter: {}, content: "" } as any);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentForViewsFile).toHaveBeenCalled();
    expect(yamlParserServiceSpy.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.viewsContent).toEqual(mockParsedContent.slots);
    expect(service.viewsContentLoaded).toBeTrue();
  });

  it('should handle invalid yaml file', () => {
    const mockFileContent = 'mock yaml content';
    const mockParsedContent = {};
    // to avoid console.error output

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(""));
    yamlParserServiceSpy.loadYaml.and.returnValue(mockParsedContent);
    spyOn(frontMatterParser, 'parse').and.returnValue({ frontmatter: {}, content: "" } as any);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentForViewsFile).toHaveBeenCalled();
    expect(yamlParserServiceSpy.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.viewsContent).toEqual([]);
    expect(service.viewsContentLoaded).toBeTrue();
  });

  it('should handle yaml parsing error', () => {
    const mockFileContent = 'mock yaml content';
    const consoleErrorSpy = spyOn(console, 'error');

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(""));
    yamlParserServiceSpy.loadYaml.and.throwError('Parsing error');
    spyOn(frontMatterParser, 'parse').and.returnValue({ frontmatter: {}, content: "" } as any);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentForViewsFile).toHaveBeenCalled();
    expect(yamlParserServiceSpy.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.viewsContent).toEqual([]);
    expect(service.viewsContentLoaded).toBeTrue();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.calls.reset();
  });


  it('should load custom page content successfully', () => {
    const mockFileContent = "";
    const mockPageContent = '---\ntitle: "Test Page"\nroute: "test-page"\n---\nPage Content';
    const mockParsedPageContent = {
      frontmatter: {
        slotId: 'custom-page',
        title: 'Test Page',
        route: 'test-page'
      } as CustomPageFrontMatter,
      content: 'Page Content'
    };

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(mockPageContent));
    yamlParserServiceSpy.loadYaml.and.returnValue([]);
    spyOn(frontMatterParser, 'parse').and.returnValue(mockParsedPageContent);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomPageFile).toHaveBeenCalled();
    expect(frontMatterParser.parse).toHaveBeenCalledWith(mockPageContent);
    expect(service.page).toEqual({
      slotId: 'custom-page',
      title: 'Test Page',
      route: 'test-page',
      content: 'Page Content'
    });
    expect(service.pageLoaded).toBeTrue();
  });

  it('should handle custom page parsing error', () => {
    const mockPageContent = 'invalid content';
    const mockFileContent = "";
    const consoleErrorSpy = spyOn(console, 'error');

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(mockPageContent));
    spyOn(frontMatterParser, 'parse').and.throwError('Parsing error');
    yamlParserServiceSpy.loadYaml.and.returnValue([]);


    service.loadContent();

    expect(customAssetsServiceSpy.getCustomPageFile).toHaveBeenCalled();
    expect(frontMatterParser.parse).toHaveBeenCalledWith(mockPageContent);
    expect(service.page).toBeNull();
    expect(service.pageLoaded).toBeTrue();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.calls.reset();
  });

  it('should set customPageLoaded to true after loading page content', () => {
    const mockFileContent = "";
    const mockPageContent = '---\ntitle: "Test Page"\nroute: "test-page"\n---\nPage Content';
    const mockParsedPageContent = {
      frontmatter: {
        slotId: 'custom-page',
        title: 'Test Page',
        route: 'test-page'
      } as CustomPageFrontMatter,
      content: 'Page Content'

    };
    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(mockPageContent));
    spyOn(frontMatterParser, 'parse').and.returnValue(mockParsedPageContent);
    yamlParserServiceSpy.loadYaml.and.returnValue([]);

    service.loadContent();

    expect(service.pageLoaded).toBeTrue();
  });

});
