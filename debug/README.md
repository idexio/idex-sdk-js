# Quick Run

To quickly run debugging / testing functionality, yo can use the following command:

```bash
yarn start:path debug/my-file.ts
# or with auto restart on update
# yarn start:path:watch debug/my-file.ts
```

> The file will be run with `tsx` which uses `esbuild` and has some limitations vs a full `tsc` compile. If these become
> an issue, then we could switch to `ts-node` at the cost of a lot more setup required.

> files and directories in the quick folder are automatically ignored by git. You should
> be able to add dependencies for your testing only and not have them checked in.
