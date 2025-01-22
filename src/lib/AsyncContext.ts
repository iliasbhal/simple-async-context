import { AsyncVariable } from "./AsyncVariable";
import { AsyncSnapshot } from "./AsyncSnapshot";

export class AsyncContext {
  static Variable = AsyncVariable;
  static Snapshot = AsyncSnapshot;
}
