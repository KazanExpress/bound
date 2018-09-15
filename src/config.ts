export default {
  debug: false
} as IConfig;

export interface IConfig {
  /**
   * Whether the debug mode is enabled.
   *
   * Debug mode allows for more exception feedback and more aggressive exception handling.
   */
  debug: boolean;
}
