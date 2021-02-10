import { rmdirSync } from 'fs';
import { Readable } from 'stream';
import type CID from 'cids';
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
    const node = await this.node;
    return await node.add(file);
  }

  public async read(path: CID) {
    const node = await this.node;
    return readableToString(Readable.from(node.cat(path)));
  }

  public async stop() {
    return (await this.node).stop();
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
    const rest = await ipfsHelper.write({
      path,
      content: Readable.from([ 'hey' ]),
    });
    // Expect(rest.path).toBe(path);
    const readResult = await ipfsHelper.read(rest.cid);
    expect(readResult).toBe('hey');
  });

  afterEach(async() => {
    await ipfsHelper.stop();
    rmdirSync(config.repo, { recursive: true });
  });
});
