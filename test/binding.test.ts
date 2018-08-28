import mockConsole from 'jest-mock-console';

import { Binding } from '@/bindings';

describe('Binding', () => {
  let restoreConsole;

  beforeAll(() => (restoreConsole = mockConsole('info')));

  afterAll(restoreConsole);

  it('binds simple objects one-way', () => {
    const obj1 = {
      test: 'foo'
    };

    const binding = new Binding<string>(false, 'foo');
    binding.addBinding(obj1, 'test');

    expect(binding.get()).toBe('foo');

    binding.set('bar');

    expect(obj1.test).toBe('bar');
  });

  it('assigns fresh values', () => {
    const obj1 = {
      test: 'bar'
    };

    const binding = new Binding<string>(false, 'foo');
    binding.addBinding(obj1, 'test');

    const bound: any = {
      get test() {
        return binding.get();
      },

      set test(v) {
        binding.set(v);
      }
    };

    expect(bound.test).toBe('foo');
    expect(obj1.test).toBe('foo');

    bound.test = 'bar';

    expect(obj1.test).toBe('bar');
  });

  it('handles multiple bindings', () => {
    const obj1 = {
      test: 'foo'
    };

    const obj2 = {
      test: 'asd'
    };

    const binding = new Binding<string>(false, 'foo');
    binding.addBinding(obj1, 'test');

    const bound: any = {
      get test() {
        return binding.get();
      },

      set test(v) {
        binding.set(v);
      }
    };

    expect(bound.test).toBe('foo');

    binding.addBinding(obj2, 'test');

    expect(obj2.test).toBe('foo');

    bound.test = 'bar';

    expect(obj1.test).toBe('bar');
    expect(obj2.test).toBe('bar');
  });

  const doubleBind = () => {
    const obj1 = {
      test: 'foo'
    };

    const binding = new Binding<string>(false, 'foo');

    binding.addBinding(obj1, 'test');
    binding.addBinding(obj1, 'test');

    expect(binding.bindings.length).toBe(1);

    return binding;
  };

  it('refuses to bind twice', () => {
    doubleBind();
  });

  it('refuses to bind twice with debug', () => {
    Binding.config.debug = true;

    doubleBind();

    Binding.config.debug = false;
  });

  it('gets last binding', () => {
    const obj1 = {
      test: 'foo'
    };

    const obj2 = {
      test: 'asd'
    };

    const binding = new Binding<string>(false, 'foo');
    let amount = 0;

    binding.addBinding(obj1, 'test');
    amount++;

    binding.addBinding(obj2, 'test');
    amount++;

    expect(binding.bindings.length).toBe(amount);
    expect(binding.lastBinding).toEqual(binding.bindings[binding.bindings.length - 1]);
  });

  it('removes bindings correctly', () => {
    const obj1 = {
      test: 'foo'
    };

    const obj2 = {
      test: 'asd'
    };

    const binding = new Binding<string>(false, 'foo');
    let amount = 0;

    binding.addBinding(obj1, 'test');
    amount++;

    binding.addBinding(obj2, 'test');
    amount++;

    expect(binding.bindings.length).toBe(amount);

    binding.set('bar');

    expect(obj1.test).toBe('bar');
    expect(obj2.test).toBe('bar');

    binding.removeBinding(obj2, 'test');

    binding.set('foo');

    expect(obj1.test).toBe('foo');
    expect(obj2.test).toBe('bar');

    binding.removeBinding(0);

    binding.set('asd');

    expect(obj1.test).toBe('foo');
    expect(obj2.test).toBe('bar');
  });

  it('gets two-way binding right', () => {
    const obj1 = {
      test: 'foo'
    };

    const obj2 = {
      test: 'bar'
    };

    const binding = new Binding<string>(true, 'bar');
    expect(binding.get()).toBe('bar');

    binding.addMasterBinding(obj1, 'test');

    expect(binding.get()).toBe('foo');

    binding.addBinding(obj2, 'test', 'master');

    expect(binding.get()).toBe('bar');

    obj2.test = 'foo';

    expect(binding.get()).toBe('foo');
    expect(obj1.test).toBe('foo');

    obj1.test = 'bar';

    expect(binding.get()).toBe('bar');
    expect(obj2.test).toBe('bar');
  });

  it('clears bindings', () => {
    expect(doubleBind().clearBindings().bindings.length).toBe(0);
  });
});
