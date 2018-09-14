import mockConsole from 'jest-mock-console';

import Binding from '../src/binding';

const doubleBind = () => {
  const obj1 = {
    test: 'foo'
  };

  const binding = new Binding<string>(false, 'foo');

  binding.addBinding(obj1, 'test');

  let threw = false;

  try {
    binding.addBinding(obj1, 'test');
  } catch (e) {
    threw = true;
  }

  if (Binding.config.debug) {
    expect(threw).toBe(true);
  } else {
    expect(threw).toBe(false);
  }

  return binding;
};

export const bindingTests = {
  'binds simple objects one-way': () => {
    const obj1 = {
      test: 'foo'
    };

    const binding = new Binding<string>(false, 'foo');
    binding.addBinding(obj1, 'test');

    expect(binding.get()).toBe('foo');

    binding.set('bar');

    expect(obj1.test).toBe('bar');
  },

  'assigns fresh values': () => {
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
  },

  'handles multiple bindings': () => {
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
  },

  'refuses to bind twice': () => { doubleBind(); },

  'refuses to bind twice with debug': () => {
    Binding.config.debug = true;

    doubleBind();

    Binding.config.debug = false;
  },

  'gets last binding': () => {
    const obj1 = {
      test: 'foo'
    };

    const obj2 = {
      test: 'asd'
    };

    const binding = new Binding<string>(false, 'foo');
    let amount = 0;

    binding.addSlaveBinding(obj1, 'test');
    amount++;

    binding.addBinding(obj2, 'test');
    amount++;

    expect(binding.subscribers.length).toBe(amount);
  },

  'removes bindings correctly': () => {
    const obj1 = {
      test: 'foo'
    };

    const obj2 = {
      test: 'asd'
    };

    const binding = new Binding<string>(false, 'foo');
    let amount = 0;

    binding.addSlaveBinding(obj1, 'test');
    amount++;

    binding.addBinding(obj2, 'test');
    amount++;

    expect(binding.subscribers.length).toBe(amount);

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
  },

  'gets two-way binding right': () => {
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

    binding.addBinding(obj2, 'test');

    expect(binding.get()).toBe('bar');

    obj2.test = 'foo';

    expect(binding.get()).toBe('foo');
    expect(obj1.test).toBe('foo');

    obj1.test = 'bar';

    expect(binding.get()).toBe('bar');
    expect(obj2.test).toBe('bar');
  },

  'clears bindings': () => {
    expect(doubleBind().clearBindings().subscribers.length).toBe(0);
  },

  'defines plugins': () => {
    const obj1 = {
      test: 'foo'
    };

    const obj2 = {
      test: 'bar'
    };

    let gettersCalled = 0;
    let settersCalled = 0;

    const binding = new Binding(true, 'bar', [
      (_, action) => {
        if (action.type === 'get') {
          gettersCalled++;
        }
      },
      (_, action) => {
        if (action.type === 'set') {
          settersCalled++;
        }
      }
    ]);

    let realSettersCalled = 0;
    let realGettersCalled = 0;

    binding.addBinding(obj1, 'test'); realSettersCalled++;
    binding.addBinding(obj2, 'test'); realSettersCalled++;

    obj2.test = obj1.test; realGettersCalled++; realSettersCalled++;
    obj2.test = 'asd';     realSettersCalled++;
    obj1.test = obj2.test; realGettersCalled++; realSettersCalled++;

    // tslint:disable-next-line:no-magic-numbers
    expect(gettersCalled).toBe(realGettersCalled);
    // tslint:disable-next-line:no-magic-numbers
    expect(settersCalled).toBe(realSettersCalled);

    expect(obj1.test).toBe(obj2.test);
    expect(obj1.test).toBe('asd');
  },

  'handles removal of unknown bindings': () => {
    const obj = { test: 'a' };

    const binding = new Binding(true, 'bar');
    binding.removeBinding(obj, 'test'); // Could also throw here!
  }
};

describe('Binding', () => {
  let restoreConsole;

  beforeAll(() => (restoreConsole = mockConsole('info')));

  afterAll(restoreConsole);

  for (const name in bindingTests) {
    it(name, bindingTests[name]);
  }
});
