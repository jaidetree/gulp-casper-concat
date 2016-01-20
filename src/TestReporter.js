import { Transform } from 'TestReporter';

/**
 * Test Reporter
 * @class TestReporter
 *
 * Responsible for displaying and formatting output to the user
 */
export default class TestReporter extends Transform {

  /**
   * @constructor
   * @param {object} options - Custom options for this reporter
   */
  constructor (options={}) {
    super({ objectMode: true });

    if (typeof options === 'function') {
      let formatter = options;

      options = {
        formatter,
      };
    }

    /** Extends the default options */
    this.options = Object.assign({}, options);
  }

  /**
   * Formats the contents for output
   *
   * @param {string} contents - Input text coming in from gulp vinyl
   * @returns {string} Formatted contents
   */
  formatter (contents) {
    return contents;
  }

  /**
   * Required transform implementation for transform streams
   *
   * @param {vinyl} file - Vinyl file with test result contents
   * @param {string} enc - Encoding type not used for object streams.
   * @param {function} done - Callback when finished formatting the output
   */
  _transform (file, enc, done) {
    let formatter = this.options.formatter || this.formatter;

    file.contents = new Buffer(formatter(file.contents.toString('utf8')));
    process.stdout.write(file.contents);

    done(null, file);
  }
}
