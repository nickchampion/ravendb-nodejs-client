import {ServerNode} from '../Http/ServerNode';
import {RequestMethod, RequestMethods} from '../Http/RequestMethod';

export abstract class RavenCommand {
  protected method: RequestMethod = RequestMethods.Get;
  protected endPoint?: string;
  protected params?: Object;
  protected payload?: Object;
  protected headers: Object = {};
  protected adminCommand: boolean = false;
  private readonly _ravenCommand: boolean = true;

  constructor(endPoint: string, method: RequestMethod = RequestMethods.Get, params?: Object, payload?: Object, headers: Object = {}, adminCommand: boolean = false) {
    this.endPoint = endPoint;
    this.method = method;
    this.params = params;
    this.payload = payload;
    this.headers = headers;
    this.adminCommand = adminCommand;
  }

  get ravenCommand(): boolean {
    return this._ravenCommand;
  }

  protected abstract createRequest(serverNode: ServerNode): void;
  protected abstract setResponse(response: Object): void;
}