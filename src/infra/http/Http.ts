export type Request = {
  url: string;
  method?: string;
  file?: {
    [key: string]: any;
  };
  files?: {
    [key: string]: any;
  };
  body: {
    [key: string]: any;
  };
  query: {
    [key: string]: any;
  };
  params: {
    [key: string]: any;
  };
  headers: any;
};

export type Response = {
  status(status: number): Response;
  json(body: any): Response;
  send(body: any): Response;
  end(): void;
  statusCode?: number;
  setHeader(key: string, value: string): any;
};

export type NextFunction = (message?: string) => void;

export type Method = "get" | "post" | "put" | "delete";

export type Handler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void> | void;

export interface HttpServer<T = any> {
  listen(port: number, callback: () => void): void;
  registerMiddleware(handler: Handler): void;
  static(path: string): void;
}
