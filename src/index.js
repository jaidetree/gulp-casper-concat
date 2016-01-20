import TestBuilder from './TestBuilder';
import TestReporter from './TestReporter';
import TestRunner from './TestRunner';
import JSONFormatter from './JSONFormatter';

/**
 * @example
 * casper = new Casper();
 *
 * gulp.src('test/integration/**\/*.js')
 *
 *   // Concats the source files into one test json file
 *   .pipe(casper.concat())
 *
 *   // Runs the test with the master test file
 *   .pipe(caspser.run())
 *
 *   // Reports the results with the given reporter. Default just writes
 *   // it to stdout.
 *   .pipe(casper.report())
 */

export class CasperConcat {
  concat (options) {
    return new TestBuilder(options);
  }

  report (reporter) {
    if (reporter === 'json') {
      return new TestReporter({ formatter: JSONFormatter });
    }

    else if (reporter.constructor !== Object) {
      return reporter;
    }

    return new TestReporter(reporter);
  }

  run (options) {
    return new TestRunner(options);
  }
}
