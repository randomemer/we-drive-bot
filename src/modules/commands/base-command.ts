import { CommandType } from "@/types";
import _ from "lodash";

export interface BaseCommandOptions {
  type: CommandType;
  data: CommandBuilder;
  middleware?: MiddlewareFunc | MiddlewareFunc[];
  parent?: BaseCommand;
}

export default abstract class BaseCommand {
  readonly type: CommandType;
  readonly data: CommandBuilder;

  middleware: MiddlewareFunc[];
  parent?: BaseCommand;

  constructor(options: BaseCommandOptions) {
    this.type = options.type;
    this.data = options.data;

    this.middleware = options.middleware ? _.castArray(options.middleware) : [];
    this.parent = options.parent;
  }
}
