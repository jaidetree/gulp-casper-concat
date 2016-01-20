import TestBuilder from './TestBuilder';
import TestRunner from './TestRunner';

export class CasperConcat {
  concat (options) {
    return new TestBuilder(options);
  }

  run (options) {
    return new TestRunner(options);
  }
}
