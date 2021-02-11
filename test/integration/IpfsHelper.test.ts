import { rmdirSync } from 'fs';
import { Readable } from 'stream';
import { create } from 'ipfs';
import type { IPFS } from 'ipfs';
import { readableToString } from '../../src';

/* eslint-disable  @typescript-eslint/explicit-function-return-type  */
/* eslint-disable  mocha/valid-test-description  */

class IPFSHelper {
  private readonly node: Promise<IPFS>;

  public constructor(config: { repo: string }) {
    this.node = create(config);
  }

  public async write(file: { path: string; content: Readable }) {
    const mfs = await this.mfs();
    return mfs.write(file.path, file.content, { create: true });
  }

  public async read(path: string) {
    const mfs = await this.mfs();
    return readableToString(Readable.from(mfs.read(path)));
  }

  public async stop() {
    return (await this.node).stop();
  }

  public async stats(path: string) {
    return (await this.mfs()).stat(path);
  }

  private async mfs() {
    return (await this.node).files;
  }
}

describe('A IPFS Helper', (): void => {
  let ipfsHelper: IPFSHelper;
  const config = { repo: '.ipfs-integration-test/' };
  beforeEach(() => {
    ipfsHelper = new IPFSHelper(config);
  });

  it('should handle readable streams', async() => {
    const path = '/hello1.txt';
    await ipfsHelper.write({
      path,
      content: Readable.from([ 'hey' ]),
    });
    const readResult = await ipfsHelper.read(path);
    expect(readResult).toBe('hey');
  });

  afterEach(async() => {
    await ipfsHelper.stop();
    rmdirSync(config.repo, { recursive: true });
  });
});
