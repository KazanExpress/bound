import mockConsole from 'jest-mock-console';
import { JSDOM } from 'jsdom';
import { bindingTests } from './binding.test';

import { ElementBinding } from '@/bindings';

describe('elementBinding', () => {
  const dom = new JSDOM();
  let restoreConsole;

  beforeAll(() => (restoreConsole = mockConsole('info')));

  afterAll(restoreConsole);

  it('retains parent\'s functionality', () => {
    for (const name in bindingTests) {
      bindingTests[name]();
    }
  });

  it('binds to elements\' events', () => {
    const input = dom.window.document.createElement('input');

    const binding = new ElementBinding(true, 'foo');

    binding.addBinding(input, 'value', 'master', 'input');

    expect(input.value).toBe('foo');

    binding.set('bar');

    expect(input.value).toBe('bar');

    input.value = 'foo';
    input.dispatchEvent(new dom.window.Event('input'));

    expect(binding.get()).toBe('foo');
  });

  it('binds to elements\' properties', () => {
    const input = dom.window.document.createElement('input');

    const binding = new ElementBinding(true, 'foo');

    binding.addBinding(input, 'value', 'master');

    expect(input.value).toBe('foo');

    binding.set('bar');

    expect(input.value).toBe('bar');

    input.value = 'foo';

    expect(binding.get()).toBe('foo');
  });
});
