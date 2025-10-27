import { createLetter } from './letter';
// import { type Config, type Scenario } from 'artillery';

export const config: Config = {
  target: process.env.BASE_URL,
  engines: {
    playwright: {}
  }
};
 
export const scenarios: Scenario[]  = [{
  engine: 'playwright',
  testFunction: createLetter
}];