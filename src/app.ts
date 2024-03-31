import config from './config';
import { Logger } from 'winston';
import { CurrentLang, LangAddTaskText, LangPopUpCloseLabel, LangTaskTextInput } from './domain/langTexts';
import puppeteer, { Browser, Dialog, Page } from 'puppeteer';
import { shuffleArray } from './utils/shufflingArray';
class App {

  private browser!: Browser;
  private page!: Page;
  private tasks: string[]
  private readonly logger: Logger;
  private langText: CurrentLang

  constructor(logger: Logger) {
    this.tasks = [];
    this.logger = logger;
    this.langText = CurrentLang.es
  }

  async initConfig() {

    await this.initBrowser();
    await this.initPage();

    if (this.browser === undefined || this.page === undefined) {
      this.logger.error('Something went wrong setting up the application');
      throw Error('There was a problem setting up puppeteer');
    }
  }

  async initBrowser() {
    if (!config.HEADLESS_MODE) 
      this.logger.warn('Headless mode is off, you will see a browser window instance');

    this.browser = await puppeteer.launch({
      headless: config.HEADLESS_MODE,
      slowMo: 15,
      devtools: true,
      args: ['--lang=en-US,en']
    });
  }

  async initPage(){
    this.page = await this.browser.newPage();
    this.page.on('dialog', (d: Dialog) => d.type() === "beforeunload" && d.accept())
    
  }

  async setPage(url: string): Promise<void> {
    this.page.goto(url, { waitUntil: 'networkidle2' });
    // await this.page.waitForNavigation()
  }

  async getTasks(): Promise<void> {
    await this.setPage(config.SOURCE_PAGE_URL);
    await this.page.waitForSelector('a[draggable]');

    const result: string[] = await this.page.evaluate(() => {
      const tasks = Array.from(document.querySelectorAll('a[draggable]'), node => node.innerHTML);
      return tasks
    });

    this.tasks = result;
    this.logger.info('Tasks obtained', result);
  }

  async setLanguage(){
    
    await this.page.waitForSelector('html');
    const siteLanguage = await this.page.evaluate(() => {
     return document.querySelector('html')?.getAttribute('lang')
    })

    switch(siteLanguage?.toLowerCase()){
      case 'es':{
        this.logger.info('Setting language to es')
        this.langText = CurrentLang.es
      } break;

      case 'en': {
        this.logger.info('Setting language to en')
        this.langText = CurrentLang.en
      } break;

      default: {
        this.logger.error(`${siteLanguage} Language not supported using 'en' as defaul`)
        this.langText = CurrentLang.en
      }
    }
  }

  async loadTasks(): Promise<void> {
    this.setPage(config.TARGET_PAGE_URL)
    
    await this.tryLoginOrThrow()
  
    this.logger.info('Login successfully');
    // verifying account cfg
    await this.setLanguage()
    const xpathAddTaskButtonQuery = `xpath/.//span[contains(text(), '${LangAddTaskText[this.langText]}')]`
    
    const fillTaskTextInputQuery = `p[data-placeholder='${LangTaskTextInput[this.langText]}']`

    // adding 5 random tasks
    const randomTasks = shuffleArray(this.tasks)
    for(let i = 0; i <= 4; i++){
      this.logger.info(`Adding a task: ${randomTasks[i]}`)
      
      // adding task button click
      await this.page.waitForSelector(xpathAddTaskButtonQuery)
      const addTaskSpans = await this.page.$$(xpathAddTaskButtonQuery)
      addTaskSpans[0].click()
      this.logger.info(`Adding a task button clicked`)
      
      // filling field
      await this.page.waitForSelector(`${fillTaskTextInputQuery} , button[type=submit]`)
      await this.page.type(fillTaskTextInputQuery, randomTasks[i])
      
      // submit task
      this.page.click('button[type=submit]')
      
      // check if task is stored (an alert pops up)
      await this.page.waitForSelector(`div[role='alert']`)
      await this.page.click(`button[aria-label="${LangPopUpCloseLabel[this.langText]}"]`)
    }
  }


  async tryLoginOrThrow(): Promise<void> {
    await this.page.waitForSelector('input[type=email], input[type=password], button[type=submit]');

    await this.page.type('input[type=email]', config.TODOIST_EMAIL)
    await this.page.type('input[type=password]', config.TODOIST_PASSWORD)
    
    await this.page.click('button[type=submit]'),
    await this.page.waitForNavigation({ waitUntil: 'networkidle2'})
  }

  async end(){
    await this.browser.close();
  }

}

export default App
