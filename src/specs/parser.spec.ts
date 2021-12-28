import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { parse } from '../parser';
import { errorMessage } from './testhelpers';

const test = suite('"parse"');

test('"parse" returns proper objects', () => {
  // no input
  assert.equal(parse(''), {});
  assert.equal(
    parse(`

    `),
    {}
  );

  // assignments
  assert.equal(
    parse(`
    a = 1
    b: 1
    c {
      a = 1
      b: 1
    }
  `),
    {
      a: 1,
      b: 1,
      c: {
        a: 1,
        b: 1,
      },
    }
  );

  // keys
  assert.equal(
    parse(`
      a = 1
      "b" = 1
      c.d = 1
      "c.d" = 1
      c\\.e = 1
    `),
    {
      a: 1,
      b: 1,
      c: {
        d: 1,
      },
      'c.d': 1,
      'c.e': 1,
    }
  );

  // comments
  assert.equal(
    parse(`
    # singleline
    /**
     * multiline
     */
    # wee
    // woo
  `),
    {}
  );

  // strings
  assert.equal(
    parse(`
    empty = ""
    string = hello
    string2 = "hello"
    string3 = 'hello'
    string4 = \`hello\`
    string5 = \`
      hello
      raw
    \`
    string6 = """
      hello
      format
    """
    string7 = '''
      hello
      format
    '''
    noNumber = '123'
    noBool = 'true'
    noNull = 'null'
    noUndefined = 'undefined'
    noArray = '[]'
    noObject = '{}'
    noComment = '# comment'
    noComment2 = '// comment'
    noComment3 = '/* comment */'
    whitespaces =            t e s t
    whitespaces2 = "           t e s t"
  `),
    {
      empty: '',
      string: 'hello',
      string2: 'hello',
      string3: 'hello',
      string4: 'hello',
      string5: '\n      hello\n      raw\n    ',
      string6: 'hello\nformat',
      string7: 'hello\nformat',
      noNumber: '123',
      noBool: 'true',
      noNull: 'null',
      noUndefined: 'undefined',
      noArray: '[]',
      noObject: '{}',
      noComment: '# comment',
      noComment2: '// comment',
      noComment3: '/* comment */',
      whitespaces: 't e s t',
      whitespaces2: '           t e s t',
    }
  );

  // numbers
  assert.equal(
    parse(`
    number = 1
    number2 = -1
  `),
    {
      number: 1,
      number2: -1,
    }
  );

  // bools
  assert.equal(
    parse(`
    bool = true
    other = false
  `),
    {
      bool: true,
      other: false,
    }
  );

  // null / undefined
  assert.equal(
    parse(`
    null = null
    undefined = undefined
  `),
    {
      null: null,
      undefined: undefined,
    }
  );

  // arrays
  assert.equal(
    parse(`
      empty = []
      empty2 []
      array = [1, 2, 3]
      array2 [1, 2, 3]
      array3 = [
        1,
        2,
        3
      ]
      array4 [
        1,
        2,
        3,
      ]
      array5 [
        1
        2
        3
      ]
      array6 [
        1,
        2
        3,
      ]
    `),
    {
      empty: [],
      empty2: [],
      array: [1, 2, 3],
      array2: [1, 2, 3],
      array3: [1, 2, 3],
      array4: [1, 2, 3],
      array5: [1, 2, 3],
      array6: [1, 2, 3],
    }
  );

  // objects
  assert.equal(
    parse(`
    empty = {}
    empty2 {}
    object = {
      hello = world
    }
    object2 {
      hello = world
    }
    inline { a = 1 }
  `),
    {
      empty: {},
      empty2: {},
      object: {
        hello: 'world',
      },
      object2: {
        hello: 'world',
      },
      inline: {
        a: 1,
      },
    }
  );

  // nested
  assert.equal(
    parse(`
    object {
      object {
        object {
          object {
            object {}
          }
        }
      }
    }
    array [
      [
        [
          [
            []
          ]
        ]
      ]
    ]
    arrayInObject {
      array [
        1
        2
        3
      ]
    }
    objectInArray [
      { obj: ect }
    ]
    inceptionObject {
      array: [
        {
          array: [
            {
              array []
            }
          ]
        }
      ]
    }
    inceptionArray [
      {
        obj {
          obj {
            obj {}
          }
        }
      }
    ]
    inlineObj { arr [] }
    inlineArr [ { key: {} } ]
  `),
    {
      object: {
        object: {
          object: {
            object: {
              object: {},
            },
          },
        },
      },
      array: [[[[[]]]]],
      arrayInObject: {
        array: [1, 2, 3],
      },
      objectInArray: [
        {
          obj: 'ect',
        },
      ],
      inceptionObject: {
        array: [
          {
            array: [
              {
                array: [],
              },
            ],
          },
        ],
      },
      inceptionArray: [
        {
          obj: {
            obj: {
              obj: {},
            },
          },
        },
      ],
      inlineObj: {
        arr: [],
      },
      inlineArr: [{ key: {} }],
    }
  );

  // overwriting
  assert.equal(
    parse(`
    a {
      b = 1
    }

    a {
      b = 2
    }

    b {
      c = 1
    }

    b.c = 2

    c {
      ar [
        1, 3
      ]
    }

    c {
      ar [
        2
      ]
    }

    d {
      ar [
        1
        2
      ]
    }

    d.ar.0 = 5
  `),
    {
      a: {
        b: 2,
      },
      b: {
        c: 2,
      },
      c: {
        ar: [2],
      },
      d: {
        ar: [5, 2],
      },
    }
  );

  // refs
  assert.equal(
    parse(`
    number = 1
    numberRef = \${number}
    basicShort = @number
    refRef = @basicShort

    str = "hi"
    strRef = @str

    bool = true
    boolRef = @bool

    null = null
    nullRef = @null

    undefined = undefined
    undefinedRef = @undefined

    obj { a = 1 }
    objRef = @obj

    arr [1,2,3]
    arrRef = @arr

    nestedObj { b = { a = 1 } }
    nestedRef1 = @nestedObj.b.a

    nestedArr [ [ 2 ] ]
    nestedRef2 = @nestedArr.0.0

    self = @self

    relativeRef {
      a = 1.2
      ref = @.a
    }

    relativeRefArr [
      1,
      @.0
    ]
  `),
    {
      number: 1,
      numberRef: 1,
      basicShort: 1,
      refRef: 1,
      str: 'hi',
      strRef: 'hi',
      bool: true,
      boolRef: true,
      null: null,
      nullRef: null,
      undefined: undefined,
      undefinedRef: undefined,
      obj: { a: 1 },
      objRef: { a: 1 },
      arr: [1, 2, 3],
      arrRef: [1, 2, 3],
      nestedObj: { b: { a: 1 } },
      nestedRef1: 1,
      nestedArr: [[2]],
      nestedRef2: 2,
      self: undefined,
      relativeRef: {
        a: 1.2,
        ref: 1.2,
      },
      relativeRefArr: [1, 1],
    }
  );
});

test('"parse" throws proper errors', () => {
  // unset variables
  assert.is(
    errorMessage(() => parse('a =')),
    'unexpected key (a has no value)'
  );
  assert.is(
    errorMessage(() => parse('a = { b = }')),
    'unexpected key (b has no value)'
  );

  // unclosed string
  assert.is(
    errorMessage(() => parse('a = "test')),
    'malformed string found at 1 (missing closing quote)'
  );

  // unclosed array / object
  assert.is(
    errorMessage(() => parse('a = [')),
    'unexpected unclosed array (a is opened but not closed)'
  );
  assert.is(
    errorMessage(() => parse('a = {')),
    'unexpected unclosed object (a is opened but not closed)'
  );

  // things have no key
  assert.is(
    errorMessage(() => parse('a = 1 \n [ b = 3 }')),
    'unexpected array at 3 (without identifier)' // key, value, array
  );
  assert.is(
    errorMessage(() => parse('a = 1 \n { b = 3 }')),
    'unexpected object at 3 (without identifier)' // key, value, object
  );
  assert.is(
    errorMessage(() => parse('a = 1 \n ${a}')),
    'unexpected ref at 3 (without identifier)' // key, value, ref
  );

  // cyclic refs
  assert.is(
    errorMessage(() => parse('a = ${b}\nb = ${a}')),
    'cyclic ref found at 6! (reference b points on reference a which references b again!)' // key, value, key, ref_open, value
  );
  assert.is(
    errorMessage(() => parse('a = @b\nb = @a')),
    'cyclic ref found at 5! (reference b points on reference a which references b again!)' // key, value, key, value
  );

  // invalid ref values
  assert.is(
    errorMessage(() => parse('a = @{ test = b }')),
    'unexpected ref-value at 1 (after @ a string-token or a raw string is expected)' // key, ref
  );
  assert.is(
    errorMessage(() => parse('a = @[1, 2, 3]')),
    'unexpected ref-value at 1 (after @ a string-token or a raw string is expected)' // key, ref
  );
  assert.is(
    errorMessage(() => parse('a = @\nhello.world')),
    'unexpected ref-value at 1 (after @ a string-token or a raw string is expected)' // key, ref
  );
});

test.run();
