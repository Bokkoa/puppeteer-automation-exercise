import { isEmptyString } from "./utils/isEmptyHandler";

require('dotenv').config();

if(isEmptyString(process.env.TODOIST_EMAIL ?? '')){
  throw new Error('No todoist account setted');
}

if(isEmptyString(process.env.TODOIST_PASSWORD ?? '')){
  throw new Error('No todoist password setted');
}

export default {
  SOURCE_PAGE_URL: 'https://trello.com/b/QvHVksDa/personal-work-goals',
  TARGET_PAGE_URL: 'https://app.todoist.com/app/today',
  TODOIST_PASSWORD: process.env.TODOIST_PASSWORD!,
  TODOIST_EMAIL: process.env.TODOIST_EMAIL!,
  HEADLESS_MODE: process.env.HEADLESS_MODE?.toLocaleLowerCase() === 'true',
}
