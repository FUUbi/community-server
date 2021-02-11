import { Readable } from 'stream';
import { create } from 'ipfs';
import type { IPFS } from 'ipfs';
import { readableToString } from '../../util/StreamUtil';

/* eslint-disable  @typescript-eslint/explicit-function-return-type  */
/* eslint-disable  mocha/valid-test-description  */
export class IPFSHelper {
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
