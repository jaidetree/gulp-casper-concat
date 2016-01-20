import splicer from 'labeled-stream-splicer';
import through from 'through2';

import { Duplex } from 'stream';

class CasperStream extends Duplex {
  isInitialized = false;

  workflow = [
    ['read', new ReadTransform, {}],
    ['babel', new BabelTransform, {}],
    ['store', new StoreTransform, {}],
    ['assemble', new AssembleTransform, {}]
  ];

  constructor (options={}) {
    super({ objectMode: true });

    this.pipeline = this.createPipeline();
    this.input = through.obj();
    this.output = through.obj();

    this.options = Object.assign({}, options);

    this.init();
  }

  init () {
    if (this.isInitialized) return;

    this.input
      .pipe(this.pipeline)
      .pipe(this.output);

    this.output
      .on('readable', this.readOutput.bind(this))
      .on('end', () => {
        this.push(null);
      });

    this.isInitialized = true;
  }

  createPipeline () {
    return splicer();
  }

  readOutput () {
    let chunk;

    while ((chunk = this.output.read()) !== null) {
      // if push returns false, stop writing
      if (!this.push(chunk)) break;
    }
  }

  _read () {}

  _write (...args) {
    this.input.write(...args);
  }
}
