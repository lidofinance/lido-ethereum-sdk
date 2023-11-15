export abstract class LidoSDKCacheable {
  protected accessor cache = new Map<
    string,
    { data: any; timestamp: number }
  >();
}
