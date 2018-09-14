import { assignToPath, fromPath } from '../src/util';

describe('fromPath', () => {
  it('gets nested values', () => {
    const obj = {
      2: 3,
      very: {
        nested: {
          object: {
            here: '!'
          }
        }
      }
    };

    expect(fromPath(obj, 'very.nested.object.here')).toBe('!');
    expect(fromPath(obj, 'very.nested.object')).toMatchObject({ here: '!' });
    expect(fromPath(obj, 'very')).toMatchObject({
      nested: {
        object: {
          here: '!'
        }
      }
    });

    // tslint:disable-next-line:no-magic-numbers
    expect(fromPath(obj, 2)).toBe(3);
  });
});

describe('assignToPath', () => {
  it('assigns a value to any nested value', () => {
    const obj = {
      2: 3,
      very: {
        nested: {
          object: {
            here: '!'
          }
        }
      }
    };

    // tslint:disable-next-line:no-magic-numbers
    assignToPath(obj, 2, 12);
    // tslint:disable-next-line:no-magic-numbers
    expect(fromPath(obj, 2)).toBe(12);

    assignToPath(obj, 'very.nested.object.here', '.');
    expect(fromPath(obj, 'very.nested.object.here')).toBe('.');
    expect(fromPath(obj, 'very.nested.object')).toMatchObject({ here: '.' });

    assignToPath(obj, 'very.nested.object', '!');
    expect(fromPath(obj, 'very.nested.object')).toBe('!');

    assignToPath(obj, 'very.nested', '...');
    expect(fromPath(obj, 'very.nested')).toBe('...');
    expect(fromPath(obj, 'very')).toMatchObject({ nested: '...' });
  });
});
