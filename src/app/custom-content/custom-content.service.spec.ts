import { of } from 'rxjs';
import { CustomAssetsService } from './custom-assets.service';
import { CustomContentService, YamlParserService } from './custom-content.service';

describe('CustomContentService', () => {
  let service: CustomContentService;
  let customAssetsServiceSpy: jasmine.SpyObj<CustomAssetsService>;
  let yamlParserService: YamlParserService;

  beforeEach(() => {
    customAssetsServiceSpy = jasmine.createSpyObj('CustomAssetsService', ['getCustomContentFile']);
    yamlParserService = new YamlParserService();

    service = new CustomContentService(customAssetsServiceSpy);
    (service as any).yamlParser = yamlParserService;
  });

  it('should load content successfully', () => {
    const mockFileContent = 'mock yaml content';
    const mockParsedContent = [{ slotId: '1', content: 'Test Content' }];

    customAssetsServiceSpy.getCustomContentFile.and.returnValue(of(mockFileContent));
    spyOn(yamlParserService, 'loadYaml').and.returnValue(mockParsedContent);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentFile).toHaveBeenCalled();
    expect(yamlParserService.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.contents).toEqual(mockParsedContent);
    expect(service.customContentLoaded).toBeTrue();
  });

  it('should handle invalid yaml file', () => {
    const mockFileContent = 'mock yaml content';
    const mockParsedContent = {};
    // to avoid console.error output
    const consoleErrorSpy = spyOn(console, 'error');

    customAssetsServiceSpy.getCustomContentFile.and.returnValue(of(mockFileContent));
    spyOn(yamlParserService, 'loadYaml').and.returnValue(mockParsedContent);

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentFile).toHaveBeenCalled();
    expect(yamlParserService.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.contents).toEqual([]);
    expect(service.customContentLoaded).toBeTrue();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.calls.reset();
  });

  it('should handle yaml parsing error', () => {
    const mockFileContent = 'mock yaml content';
    const consoleErrorSpy = spyOn(console, 'error');

    customAssetsServiceSpy.getCustomContentFile.and.returnValue(of(mockFileContent));
    spyOn(yamlParserService, 'loadYaml').and.throwError('Parsing error');

    service.loadContent();

    expect(customAssetsServiceSpy.getCustomContentFile).toHaveBeenCalled();
    expect(yamlParserService.loadYaml).toHaveBeenCalledWith(mockFileContent);
    expect(service.contents).toEqual([]);
    expect(service.customContentLoaded).toBeTrue();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.calls.reset();
  });
});
