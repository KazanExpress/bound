import Bound, { bound, BoundError } from '../src/bound';

describe('Bound', () => {
  it('snapshots the structure correctly', () => {
    const obj = {
      test: 'foo',
      inside: {
        another: 'bar'
      }
    };

    const bound = new Bound(obj);
    bound.bind(obj);


    function check(o, b) {
      for (const key in o) if (key !== '__bound__') {
        if (typeof o[key] !== 'object') {
          expect(o[key]).toEqual(b[key]);
        } else {
          check(o[key], b[key]);
        }
      }
    }

    check(obj, bound.bound);
  });

  it('throws on non-object args', () => {
    Bound.config.debug = true;
    const threw = {
      'string': false,
      'number': false,
      'boolean': false,
      'object': false,
    };

    const thro = (arg, type: keyof typeof threw) => {
      try {
        new Bound(arg as any);
      } catch (e) {
        threw[type] = true;
      }
    };

    thro('asd', 'string');
    thro(1, 'number');
    thro(true, 'boolean');
    thro({}, 'object');
    thro([], 'object');

    expect(threw.boolean).toBe(true);
    expect(threw.number).toBe(true);
    expect(threw.string).toBe(true);
    expect(threw.object).toBe(false);
    Bound.config.debug = false;
  });

  it('throws for bound objects', () => {
    Bound.config.debug = true;
    let amountThrew = 0;

    const obj = {
      test: 'foo'
    };

    try {
      var bound = new Bound(obj);
      bound.bind(obj);
    } catch (e) {
      amountThrew++;
    }


    try {
      new Bound(bound);
    } catch (e) {
      amountThrew++;
    }

    try {
      new Bound(obj);
    } catch (e) {
      amountThrew++;
    }

    // tslint:disable-next-line:no-magic-numbers
    expect(amountThrew).toBe(2);
    Bound.config.debug = false;
  });

  it('has config', () => {
    expect(Bound.config).toMatchObject({
      debug: false
    });
  });

  it('checks bound objects', () => {
    const obj = {
      test: 'foo'
    };

    const obj2 = {
      test: 'foo'
    };

    const bound = new Bound(obj);
    bound.bind(obj);

    expect(Bound.isBound(obj)).toBe(true);
    expect(Bound.isBound(obj2)).toBe(false);
  });

  it('assigns bound as function', () => {
    expect(bound({})).toHaveProperty('__bound__');
  });

  it('throws on circular dependencies', () => {
    let threw = false;

    try {
      const obj: any = {
        test: 'foo'
      };
      obj.nested = obj;

      new Bound(obj);
    } catch (e) {
      threw = true;
    }

    expect(threw).toBe(true);
  });
});
