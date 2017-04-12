import { BarcelonaPage } from './app.po';

describe('barcelona App', () => {
  let page: BarcelonaPage;

  beforeEach(() => {
    page = new BarcelonaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
