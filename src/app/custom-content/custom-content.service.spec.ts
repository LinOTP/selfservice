import { of } from 'rxjs';
import { CustomAssetsService } from './custom-assets.service';
import { CustomContentService, YamlParserService } from './custom-content.service';
import { CustomPageFrontMatter, CustomPageFrontMatterParser } from './frontmatter-parser';

describe('CustomContentService', () => {
  let service: CustomContentService;
  let customAssetsServiceSpy: jasmine.SpyObj<CustomAssetsService>;
  let yamlParserService: YamlParserService;
  let frontMatterParser: CustomPageFrontMatterParser

  beforeEach(() => {
    customAssetsServiceSpy = jasmine.createSpyObj('CustomAssetsService', ['getCustomContentForViewsFile', 'getCustomPageFile']);
    yamlParserService = new YamlParserService();
    frontMatterParser = new CustomPageFrontMatterParser();

    service = new CustomContentService(customAssetsServiceSpy);
    (service as any).yamlParser = yamlParserService;
    (service as any).frontMatterParser = frontMatterParser;
  });

  it('should load content successfully', () => {
    const mockFileContent = 'mock yaml content';
    const mockParsedContent = [{ slotId: '1', content: 'Test Content' }];

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(""));
    spyOn(yamlParserService, 'loadYaml').and.returnValue(mockParsedContent);
    spyOn(frontMatterParser, 'parse').and.returnValue({ frontmatter: {}, content: "" } as any);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentForViewsFile).toHaveBeenCalled();
    expect(yamlParserService.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.viewsContent).toEqual(mockParsedContent);
    expect(service.viewsContentLoaded).toBeTrue();
  });

  it('should handle invalid yaml file', () => {
    const mockFileContent = 'mock yaml content';
    const mockParsedContent = {};
    // to avoid console.error output
    const consoleErrorSpy = spyOn(console, 'error');

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(""));
    spyOn(yamlParserService, 'loadYaml').and.returnValue(mockParsedContent);
    spyOn(frontMatterParser, 'parse').and.returnValue({ frontmatter: {}, content: "" } as any);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentForViewsFile).toHaveBeenCalled();
    expect(yamlParserService.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.viewsContent).toEqual([]);
    expect(service.viewsContentLoaded).toBeTrue();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.calls.reset();
  });

  it('should handle yaml parsing error', () => {
    const mockFileContent = 'mock yaml content';
    const consoleErrorSpy = spyOn(console, 'error');

    customAssetsServiceSpy.getCustomContentForViewsFile.and.returnValue(of(mockFileContent));
    customAssetsServiceSpy.getCustomPageFile.and.returnValue(of(""));
    spyOn(yamlParserService, 'loadYaml').and.throwError('Parsing error');
    spyOn(frontMatterParser, 'parse').and.returnValue({ frontmatter: {}, content: "" } as any);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentForViewsFile).toHaveBeenCalled();
    expect(yamlParserService.loadYaml).toHaveBeenCalledWith(mockFileContent);
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
    spyOn(yamlParserService, 'loadYaml').and.returnValue([]);
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
    spyOn(yamlParserService, 'loadYaml').and.returnValue([]);


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
    spyOn(yamlParserService, 'loadYaml').and.returnValue([]);

    service.loadContent();

    expect(service.pageLoaded).toBeTrue();
  });

});
