import puppeteer from 'puppeteer';
import App from '../src/app';

jest.mock('puppeteer');

jest.mock('../src/config', () => ({
  HEADLESS_MODE: false,
  SOURCE_PAGE_URL: 'https://example.com',
  TARGET_PAGE_URL: 'https://target.com',
  TODOIST_EMAIL: 'test@example.com',
  TODOIST_PASSWORD: 'password',
}));

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('App', () => {
  let app: App;

  beforeEach(() => {
    app = new App(loggerMock as any);
  });

  it('initializes the browser correctly with headless mode off', async () => {

    const launchSpy = jest.spyOn(puppeteer, 'launch').mockResolvedValueOnce({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn().mockResolvedValue(null),
        on: jest.fn(),
        waitForSelector: jest.fn().mockResolvedValue(null),
      }),
    } as any);

    await app.initBrowser();

    expect(launchSpy).toHaveBeenCalled();
    expect(loggerMock.warn).toHaveBeenCalledWith(expect.any(String));
  });



  describe('Login', () => {
    it('login fails but not throw', async () => {
  
      const launchSpy = jest.spyOn(puppeteer, 'launch').mockResolvedValueOnce({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockResolvedValue(null),
          type: jest.fn().mockResolvedValue(null),
          on: jest.fn(),
          waitForSelector: jest.fn().mockResolvedValue(null),
          waitForNavigation: jest.fn().mockResolvedValue(() => new Error('Login fails'))
        }),
        close: jest.fn()
      } as any);

      const appEndSpy = jest.spyOn(app, 'end')
  
      await app.initConfig();
      await app.setPage('https://target.com');
      await app.tryLoginOrThrow();
      expect(launchSpy).toHaveBeenCalled();
      expect(loggerMock.error).toHaveBeenCalled();
      expect(appEndSpy).toHaveBeenCalled();
      
    });
  
  });


  describe('setLanguage', () => {

    
    it('sets language based on page evaluation', async () => {
      
      const launchSpy = jest.spyOn(puppeteer, 'launch').mockResolvedValueOnce({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockResolvedValue(null),
          type: jest.fn().mockResolvedValue(null),
          click: jest.fn(),
          on: jest.fn(),
          evaluate: jest.fn().mockResolvedValueOnce('es'),
          waitForSelector: jest.fn().mockResolvedValue(null),
        }),
      } as any);
      
      const app = new App(loggerMock as any);
      await app.initConfig();
      await app.setPage('https://target.com');

      await app.setLanguage();
      expect(launchSpy).toHaveBeenCalled();
      expect(loggerMock.info).toHaveBeenCalledWith('Setting language to es');
    });
  
    it('defaults to English for unsupported languages', async () => {

      const launchSpy = jest.spyOn(puppeteer, 'launch').mockResolvedValueOnce({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockResolvedValue(null),
          type: jest.fn().mockResolvedValue(null),
          on: jest.fn(),
          click: jest.fn(),
          evaluate: jest.fn().mockResolvedValue('fr'),
          waitForSelector: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      const app = new App(loggerMock as any);
      await app.initConfig();
      await app.setLanguage();
      expect(launchSpy).toHaveBeenCalled();
      expect(loggerMock.error).toHaveBeenCalledWith('fr Language not supported using \'en\' as default');
    });
  });

});



