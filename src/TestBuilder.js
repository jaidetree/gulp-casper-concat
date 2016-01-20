import splicer from 'labeled-stream-splicer';
import through from 'through2';

import AssembleTransform from './AssembleTransform';
import ES6Transform from './ES6Transform';
import ReadTransform from './ReadTransform';
import StoreTransform from './StoreTransform';

import { Duplex } from 'stream';

/**
 * Casper Concat Stream
 * Concats casper test functions into a single test object JSON that it feeds
 * into a casper file
 */
export default class TestBuilder extends Duplex {
  isInitialized = false;

  /**
   * Our main workflow for our labeled stream splicer pipeline
   */
  workflow = [
    ['read', ReadTransform, {}],
    ['es6', ES6Transform, {}],
    ['store', StoreTransform, {}],
    ['assemble', AssembleTransform, {}],
  ];

  /**
   * @constructor
   * @param {object} options - Initialization options
   */
  constructor (options={}) {
    super({ objectMode: true });

    this.pipeline = this.createPipeline();
    this.input = through.obj();
    this.output = through.obj();

    this.options = Object.assign({}, options);

    this.init();
  }

  /**
   * Initialize the input and output streams and add the listeners
   */
  init () {
    if (this.isInitialized) return;

    /**
     * Setup this stream to pipe the input to the pipeline and out through
     * our output passthrough stream. This will make this class a little
     * easier to test.
     */
    this.input
      .pipe(this.pipeline)
      .pipe(this.output);

    this.output
      /**
       * When output is readable: posh it's data down the stream
       */
      .on('readable', this.readOutput.bind(this))
      /**
       * When the output ends tell the receiving stream that we are done
       * pushing data.
       */
      .on('end', () => {
        this.push(null);
      });

    this.isInitialized = true;
  }

  /**
   * Return the assembled pipeline
   *
   * @returns {object} Labeled stream splicer instance built with our workflow
   */
  createPipeline () {
    let pipeline = [];

    this.workflow.forEach(([name, Stream, opts]) => {
      let stream = new Stream(opts);

      pipeline.push(name);
      pipeline.push(stream);

      stream.on('error', (err) => {
        this.emit('error', err);
      });
    });

    return splicer(pipeline);
  }

  /**
   * Read Output
   * Reads output from our output stream and pushes it down this current
   * duplex stream.
   */
  readOutput () {
    let chunk;

    while ((chunk = this.output.read()) !== null) {
      // if push returns false, stop writing
      if (!this.push(chunk)) break;
    }
  }

  /**
   * Required duplex stream read implementation. This is read from our
   * output stream.
   */
  _read () {}

  /**
   * Required duplex stream write impelmentation. Writes to our input stream.
   *
   * @param {vinyl} file - A vinyl file from gulp.src or other gulp task
   * @param {string} enc - Encoding type. Ignored in object streams.
   * @param {function} done - Callback when done writing to this stream.
   */
  _write (file, enc, done) {
    if (file.isStream()) {
      file.pipe(this.input);
      return;
    }

    if (file.isNull()) {
      done(null, file);
      return;
    }

    this.input.write(file, enc, done);
  }
}
