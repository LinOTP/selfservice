import { CustomPageFrontMatterParser } from './frontmatter-parser';

describe('CustomPageFrontMatterParser', () => {
  let parser: CustomPageFrontMatterParser;

  beforeEach(() => {
    parser = new CustomPageFrontMatterParser();
  });

  it('should parse valid custom page frontmatter correctly', () => {
    const mockMarkdown = `---
slotId: "custom-page"
title: "Test Page"
route: "test-page"
---
# Test Page Content
This is a test page.`;

    const result = parser.parse(mockMarkdown);

    expect(result.frontmatter.slotId).toBe('custom-page');
    expect(result.frontmatter.title).toBe('Test Page');
    expect(result.frontmatter.route).toBe('test-page');
    expect(result.content).toContain('# Test Page Content');
  });

  it('should throw error for invalid slotId in frontmatter', () => {
    const mockMarkdown = `---
slotId: "invalid-slot"
title: "Test Page"
route: "test-page"
---
# Test Page Content
This is a test page.`;

    expect(() => parser.parse(mockMarkdown)).toThrowError('Invalid custom page frontmatter');
  });

  it('should throw error if title is missing in frontmatter', () => {
    const mockMarkdown = `---
slotId: "custom-page"
route: "test-page"
---
# Test Page Content
This is a test page.`;

    expect(() => parser.parse(mockMarkdown)).toThrowError('Invalid custom page frontmatter');
  });

  it('should throw error if route is missing in frontmatter', () => {
    const mockMarkdown = `---
slotId: "custom-page"
title: "Test Page"
---
# Test Page Content
This is a test page.`;

    expect(() => parser.parse(mockMarkdown)).toThrowError('Invalid custom page frontmatter');
  });

  it('should convert route to lowercase', () => {
    const mockMarkdown = `---
slotId: "custom-page"
title: "Test Page"
route: "Test-Page"
---
# Test Page Content
This is a test page.`;

    const result = parser.parse(mockMarkdown);

    expect(result.frontmatter.route).toBe('test-page');
  });
});
