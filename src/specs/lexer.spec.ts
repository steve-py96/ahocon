import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { lex } from '../lexer';
import { TOKEN } from '../tokens';

const test = suite('"lex"');

test('"lex" returns proper objects', () => {
  // normal
  assert.equal(lex('abc=123'), {
    currentIndex: 7,
    context: [
      {
        raw: 'abc',
        startIndex: 0,
        token: null,
      },
      {
        raw: '123',
        startIndex: 4,
        token: null,
      },
    ],
    inside: {
      comment: false,
      string: false,
    },
  });

  // raw (with assigmnents and whitespaces etc...)
  assert.equal(lex('abc=123', { raw: true }), {
    currentIndex: 7,
    context: [
      {
        raw: 'abc',
        startIndex: 0,
        token: null,
      },
      {
        startIndex: 3,
        raw: '=',
        token: 'ASSIGNMENT',
      },
      {
        raw: '123',
        startIndex: 4,
        token: null,
      },
    ],
    inside: {
      comment: false,
      string: false,
    },
  });
});

test('"lex" recognizes and filters the tokens properly', () => {
  // no token
  assert.is(lex('123').context[0].token, null);

  // string literal
  assert.is(lex('"').context[0].token, TOKEN.STRING);
  assert.is(lex("'").context[0].token, TOKEN.STRING);
  assert.is(lex('`').context[0].token, TOKEN.STRING);

  // multiline string literal (3 chars instead of 1)
  let formattedMultiline = lex('"""').context[0];
  assert.is(formattedMultiline.token, TOKEN.STRING);
  assert.is(formattedMultiline.raw, '"""');
  formattedMultiline = lex("'''").context[0];
  assert.is(formattedMultiline.token, TOKEN.STRING);
  assert.is(formattedMultiline.raw, "'''");

  // array
  assert.is(lex('[').context[0].token, TOKEN.ARRAY_OPEN);
  assert.is(lex(']').context[0].token, TOKEN.ARRAY_CLOSE);

  // object
  assert.is(lex('{').context[0].token, TOKEN.OBJECT_OPEN);
  assert.is(lex('}').context[0].token, TOKEN.OBJECT_CLOSE);

  // comments (they're not stripped out before their closing appears)
  assert.is(lex('#').context[0].token, TOKEN.SINGLELINE_COMMENT);
  assert.is(lex('//').context[0].token, TOKEN.SINGLELINE_COMMENT);
  assert.is(lex('/*').context[0].token, TOKEN.MULTILINE_COMMENT_OPEN);
  assert.is(lex('*/').context[0].token, TOKEN.MULTILINE_COMMENT_CLOSE);
  assert.is(lex('# comment \n').context.length, 0); // singleline closes with \n
  assert.is(lex('/* comment */').context.length, 0);
  assert.is(lex('/* \n    comment\n */').context.length, 0);

  // refs
  const ref = lex('${x}').context; // [open, value, close]
  assert.is(ref[0].token, TOKEN.REF_OPEN);
  assert.is(ref[2].token, TOKEN.REF_CLOSE);
  assert.is(lex('@').context[0].token, TOKEN.REF_SHORT);

  // assignments
  assert.is(lex('=', { raw: true }).context[0].token, TOKEN.ASSIGNMENT);
  assert.is(lex(':', { raw: true }).context[0].token, TOKEN.ASSIGNMENT);
  assert.is(lex(':').context.length, 0);

  // comma
  assert.is(lex(',', { raw: true }).context[0].token, TOKEN.COMMA);
  assert.is(lex(',').context.length, 0);

  // whitespaces
  assert.is(lex(' ').context.length, 0); // not measurable actually since whitespaces are too contextual
  assert.is(lex('\n', { raw: true }).context[0].token, TOKEN.WHITESPACE);
  assert.is(lex('\n').context.length, 0); // in this scenario \n is trimmed out

  // trimming
  assert.is(lex('\nhi\n').context.length, 1); // raw
  assert.is(lex('// singleline comment\n a = 4').context.length, 2); // key, value
  assert.is(lex('# singleline comment\n a = 4').context.length, 2); // key, value
  assert.is(lex('/* inline comment */ a = 4').context.length, 2); // key, value
});

test('"lex" does not tokenize string and comment content falsely', () => {
  // comments don't contain strings or similar
  assert.is(lex('# this is a comment string: "hello"\n').context.length, 0);
  assert.is(lex('# this is a comment array: [1, 2, 3]\n').context.length, 0);
  assert.is(lex('# this is a comment object: { hello: "world" }\n').context.length, 0);
  assert.is(lex('# this is a comment ref: ${hello.world}\n').context.length, 0);
  assert.is(lex('// this is a comment string: "hello"\n').context.length, 0);
  assert.is(lex('// this is a comment array: [1, 2, 3]\n').context.length, 0);
  assert.is(lex('// this is a comment object: { hello: "world" }\n').context.length, 0);
  assert.is(lex('// this is a comment ref: ${hello.world}\n').context.length, 0);
  assert.is(lex('/* \nthis is a comment string: "hello" \n*/').context.length, 0);
  assert.is(lex('/* \nthis is a comment array: [1, 2, 3] \n*/').context.length, 0);
  assert.is(lex('/* \nthis is a comment object: { hello: "world" }\n*/').context.length, 0);
  assert.is(lex('/* \nthis is a comment ref: @hello.world\n*/').context.length, 0);

  // strings don't contain strings, comments or similar
  assert.is(lex(`"this is a string string: ''"`).context.length, 3); // string, raw, string
  assert.is(lex(`'this is a string string: ""'`).context.length, 3); // string, raw, string
  assert.is(lex('`this is a string string: ""`').context.length, 3); // string, raw, string
  assert.is(lex("`this is a string string: ''`").context.length, 3); // string, raw, string
  assert.is(lex(`"this is a string comment: /* test */"`).context.length, 3); // string, raw, string
  assert.is(lex(`"this is a string singleline comment: # test"`).context.length, 3); // string, raw, string
  assert.is(lex(`"this is a string array: [1, 2, 3]"`).context.length, 3); // string, raw, string
  assert.is(lex(`"this is a string object: { hello = world }"`).context.length, 3); // string, raw, string
  assert.is(lex(`"this is a string ref: \${hello.world}"`).context.length, 3); // string, raw, string
  assert.is(lex(`"this is a string ref: @hello.world"`).context.length, 3); // string, raw, string
  assert.is(lex(`'''\n multiline string comment: /* test  */ '''`).context.length, 4); // string, whitespace, raw, string
  assert.is(lex(`'''\n multiline string singleline comment: # test '''`).context.length, 4); // string, whitespace, raw, string
  assert.is(lex(`'''\n multiline string array: [1, 2, 3] '''`).context.length, 4); // string, whitespace, raw, string
  assert.is(lex(`'''\n multiline string object: { hello = world } '''`).context.length, 4); // string, whitespace, raw, string
  assert.is(lex(`'''\n multiline string ref: \${hello.world} '''`).context.length, 4); // string, whitespace, raw, string
  assert.is(lex(`'''\n multiline string ref: @hello.world '''`).context.length, 4); // string, whitespace, raw, string
});

test.run();
