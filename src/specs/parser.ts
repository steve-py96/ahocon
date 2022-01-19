import { Parser } from '../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = new Parser();

const inbetweenTest = (
  parts: Array<{ parse: string; expect: Record<string, unknown> }>,
  part: string
) =>
  parts.forEach(({ parse, expect }) => {
    assert.equal(parser.parse(parse.replace('{{}}', part)), expect);
  });

test('parser parses properly', () => {
  // strings
  assert.equal(parser.parse('abc = "test"'), { abc: 'test' });
  assert.equal(parser.parse("abc = 'test'"), { abc: 'test' });
  assert.equal(parser.parse('abc = `test`'), { abc: 'test' });
  assert.equal(parser.parse('abc = "\ntest"'), { abc: '\ntest' });
  assert.equal(parser.parse("abc = '\ntest'"), { abc: '\ntest' });
  assert.equal(parser.parse('abc = `\ntest`'), { abc: '\ntest' });
  assert.equal(parser.parse('abc = """test"""'), { abc: 'test' });
  assert.equal(parser.parse("abc = '''test'''"), { abc: 'test' });
  assert.equal(parser.parse('abc = ```test```'), { abc: 'test' });
  assert.equal(parser.parse('abc = """\ntest\n"""'), { abc: 'test' });
  assert.equal(parser.parse("abc = '''\ntest\n'''"), { abc: 'test' });
  assert.equal(parser.parse('abc = ```\ntest\n```'), { abc: 'test' });
  assert.equal(parser.parse('abc = "#/**/{[``\'\',=:$r \nef()]}"'), {
    abc: "#/**/{[``'',=:$r \nef()]}",
  });
  assert.equal(parser.parse('abc = \'#/**/{[``"",=:$r \nef()]}\''), {
    abc: '#/**/{[``"",=:$r \nef()]}',
  });
  assert.equal(parser.parse('abc = `#/**/{[""\'\',=:$r \nef()]}`'), {
    abc: '#/**/{[""\'\',=:$r \nef()]}',
  });
  assert.equal(parser.parse('abc = """#/**/{[``\'\',=:$r \nef()]}"""'), {
    abc: "#/**/{[``'',=:$r \nef()]}",
  });
  assert.equal(parser.parse("abc = '''#/**/{[``\"\",=:$r \nef()]}'''"), {
    abc: '#/**/{[``"",=:$r \nef()]}',
  });
  assert.equal(parser.parse('abc = ```#/**/{[""\'\',=:$r \nef()]}```'), {
    abc: '#/**/{[""\'\',=:$r \nef()]}',
  });

  // numbers
  assert.equal(parser.parse('abc = 123'), { abc: 123 });
  assert.equal(parser.parse('abc = -123'), { abc: -123 });
  assert.equal(parser.parse('abc = 1.23'), { abc: 1.23 });
  assert.equal(parser.parse('abc = -1.23'), { abc: -1.23 });
  assert.equal(parser.parse('abc = 1e3'), { abc: 1e3 });
  assert.equal(parser.parse('abc = -1e3'), { abc: -1e3 });

  // bools
  assert.equal(parser.parse('abc = true'), { abc: true });
  assert.equal(parser.parse('abc = false'), { abc: false });

  // comments
  assert.equal(parser.parse('#'), {});
  assert.equal(parser.parse('# singleline'), {});
  assert.equal(parser.parse('# singleline\n'), {});
  assert.equal(parser.parse('# text {[$ref()]}.,:=""\'\'``/**/\n'), {});
  inbetweenTest(
    [
      {
        parse: 'abc=123{{}}',
        expect: { abc: 123 },
      },
      {
        parse: 'abc={{}}123',
        expect: { abc: 123 },
      },
      {
        parse: 'abc{{}}=123',
        expect: { abc: 123 },
      },
      {
        parse: '{{}}abc=123',
        expect: { abc: 123 },
      },
    ],
    '# comment\n'
  );
  assert.equal(parser.parse('/**/'), {});
  assert.equal(parser.parse('/* comment */'), {});
  assert.equal(parser.parse('/* \n comment \n */'), {});
  assert.equal(parser.parse('/* # text {[%ref()]}.,:=""\'\'``/*\n */'), {});
  inbetweenTest(
    [
      {
        parse: 'abc=123{{}}',
        expect: { abc: 123 },
      },
      {
        parse: 'abc={{}}123',
        expect: { abc: 123 },
      },
      {
        parse: 'abc{{}}=123',
        expect: { abc: 123 },
      },
      {
        parse: '{{}}abc=123',
        expect: { abc: 123 },
      },
    ],
    '/*text*/'
  );

  // whitespaces
  assert.equal(parser.parse(' '), {});
  assert.equal(parser.parse('              '), {});
  assert.equal(parser.parse('\n'), {});
  assert.equal(parser.parse('\n\n\n'), {});
  assert.equal(parser.parse('\n  \n'), {});
  assert.equal(parser.parse('  \n  '), {});
  inbetweenTest(
    [
      {
        parse: 'abc=123{{}}',
        expect: { abc: 123 },
      },
      {
        parse: 'abc={{}}123',
        expect: { abc: 123 },
      },
      {
        parse: 'abc{{}}=123',
        expect: { abc: 123 },
      },
      {
        parse: '{{}}abc=123',
        expect: { abc: 123 },
      },
    ],
    ' '.repeat(10)
  );
  inbetweenTest(
    [
      {
        parse: 'abc=123{{}}',
        expect: { abc: 123 },
      },
      {
        parse: 'abc={{}}123',
        expect: { abc: 123 },
      },
      {
        parse: 'abc{{}}=123',
        expect: { abc: 123 },
      },
      {
        parse: '{{}}abc=123',
        expect: { abc: 123 },
      },
    ],
    '\n'.repeat(10)
  );

  // objects
  assert.equal(parser.parse('a = {}'), { a: {} });
  assert.equal(parser.parse('a {}'), { a: {} });
  assert.equal(parser.parse('"a" = {}'), { a: {} });
  assert.equal(parser.parse('"a" {}'), { a: {} });
  assert.equal(parser.parse('a.b {}'), { a: { b: {} } });
  assert.equal(parser.parse('a\\.b {}'), { 'a\\.b': {} });
  assert.equal(parser.parse('"a.b" {}'), { 'a.b': {} });
  assert.equal(parser.parse('a { b {} }'), { a: { b: {} } });
  assert.equal(parser.parse('"a.b" { c {} }'), { 'a.b': { c: {} } });
  assert.equal(parser.parse('a.b.c {}'), { a: { b: { c: {} } } });
  assert.equal(parser.parse('a.b.c = 123'), { a: { b: { c: 123 } } });
  assert.equal(parser.parse('a.b.c = 123\na.b.d = 456'), { a: { b: { c: 123, d: 456 } } });
  assert.equal(parser.parse('a.b.c = 123\na.b.c = 456'), { a: { b: { c: 456 } } });
  assert.equal(parser.parse('a.b.c = 123\na.b { c = 456 }'), { a: { b: { c: 456 } } });
  assert.equal(parser.parse('a.b.c = 123\na { b { c = 456 } }'), { a: { b: { c: 456 } } });

  // arrays
  assert.equal(parser.parse('a = []'), { a: [] });
  assert.equal(parser.parse('a []'), { a: [] });
  assert.equal(parser.parse('"a" = []'), { a: [] });
  assert.equal(parser.parse('"a" []'), { a: [] });
  assert.equal(parser.parse('a [1]'), { a: [1] });
  assert.equal(parser.parse('a [1,2]'), { a: [1, 2] });
  assert.equal(parser.parse('a [1\n2]'), { a: [1, 2] });
  assert.equal(parser.parse('a [[]]'), { a: [[]] });
  assert.equal(parser.parse('a [[1]]'), { a: [[1]] });
  assert.equal(parser.parse('a [0, [1]]'), { a: [0, [1]] });
  assert.equal(parser.parse('a [0, [1]]'), { a: [0, [1]] });

  // funcs
});

test.run();
