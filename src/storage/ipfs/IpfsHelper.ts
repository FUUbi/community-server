import type { StatsBase } from 'fs';
import { Readable } from 'stream';
import type CID from 'cids';
import { create } from 'ipfs';
import type { IPFS } from 'ipfs';
import type { SystemError } from '../../util/errors/SystemError';
/* eslint-disable @typescript-eslint/explicit-function-return-type */

export class IPFSHelper {
  private readonly node: Promise<IPFS>;

  public constructor(config: { repo: string }) {
    this.node = create(config);
  }

  public async write(file: { path: string; content: Readable }) {
    // eslint-disable-next-line no-console
    console.log(file.path);
    const mfs = await this.mfs();
    return mfs.write(file.path, file.content, { create: true, mtime: new Date() });
  }

  public async read(path: string) {
    const mfs = await this.mfs();
    return Readable.from(mfs.read(path));
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

  public async lstat(path: string): Promise<IPFSStats> {
    try {
      const mfs = await this.mfs();
      const stats = await mfs.stat(path);

      if (stats.mode) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return {
          isDirectory: (): boolean => stats.type === 'directory',
          isFile: (): boolean => stats.type === 'file',
          mode: stats.mode,
          // I dont know yet why the date is not set by mfs.stat(x)
          // eslint-disable-next-line no-mixed-operators
          mtime: stats.mtime ? new Date(stats.mtime.secs * 1000 + stats.mtime.nsecs / 1000) : new Date(),
          size: stats.size,
          cid: stats.cid,
        };
      }
      throw new Error('error');
    } catch (error: unknown) {
      if ((error as any).code && (error as any).code === 'ERR_NOT_FOUND') {
        const sysError: SystemError = { ...(error as SystemError),
          code: 'ENOENT',
          syscall: 'stat',
          errno: -2,
          path };
        throw sysError;
      }
      throw error;
    }
  }

  public async mkdir(path: string): Promise<void> {
    try {
      const mfs = await this.mfs();
      await mfs.mkdir(path);
    } catch (error: unknown) {
      if ((error as any).code && (error as any).code === 'ERR_LOCK_EXISTS') {
        const sysError: SystemError = { ...(error as SystemError),
          code: 'EEXIST',
          syscall: 'mkdir',
          errno: -17,
          path };
        throw sysError;
      }
    }
  }

  public async readdir(path: string): Promise<string[]> {
    const mfs = await this.mfs();
    const entries: string[] = [];
    for await (const entry of mfs.ls(path)) {
      entries.push(entry.name);
    }
    return entries;
  }

  public async rmdir(path: string): Promise<void> {
    const mfs = await this.mfs();
    return mfs.rm(path, { recursive: true });
  }

  public async unlink(path: string): Promise<void> {
    try {
      const mfs = await this.mfs();
      await mfs.rm(path);
    } catch (error: unknown) {
      if ((error as any).code && (error as any).code === 'ERR_NOT_FOUND') {
        const sysError: SystemError = { ...(error as SystemError),
          code: 'ENOENT',
          syscall: 'unlink',
          errno: -2,
          path };
        throw sysError;
      }
    }
  }
}

export interface IPFSStats extends StatsBase<number> {
  cid: CID;
}

