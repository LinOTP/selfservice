import { AppPage } from './app.po';

describe('self-service App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display app title', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('KI Selfservice');
  });
});
