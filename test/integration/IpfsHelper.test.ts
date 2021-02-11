import { rmdirSync } from 'fs';
import { Readable } from 'stream';
import { IPFSHelper } from '../../src/storage/ipfs/IpfsHelper';

/* eslint-disable  @typescript-eslint/explicit-function-return-type  */
/* eslint-disable  mocha/valid-test-description  */

describe('A IPFS Helper', (): void => {
  let ipfsHelper: IPFSHelper;
  const config = { repo: '.ipfs-integration-test/' };
  beforeEach((): void => {
    ipfsHelper = new IPFSHelper(config);
  });

  it('can write and read redable streams.', async(): Promise<void> => {
    const path = '/hello1.txt';
    await ipfsHelper.write({
      path,
      content: Readable.from([ 'hey' ]),
    });
    const readResult = await ipfsHelper.read(path);
    expect(readResult).toBe('hey');
  });

  afterEach(async(): Promise<void> => {
    await ipfsHelper.stop();
    rmdirSync(config.repo, { recursive: true });
  });
});
