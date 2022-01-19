export { startValue };

const startValue = `
# strings in some forms
string = string
also_string = "string"
"also.string" = string
nested.string = string
multiline_raw = \`
  hello
  world
\`
multiline_formatted = """
  hello
  formatted
  world
"""
var = $var(123) # not appearing!!
sum = $math.sum(1,2,3,4)
concat = $concat(a, b, c)
assign = $assign($ref(obj), $ref(otherObj))
clone = $clone($ref(assign))

number = 123
also_number = 123.03

bool = true
also_bool = false

ref = $ref(obj.hello)

obj {
  hello = world
}

otherObj {
  hallo = mundo
}

obj.test {
  arrayInside [1,2,3]
}

obj {
  mergeMeSenpai = true
}

arr [
  1
  2
]

/*
  fibonacci
  ... or not
*/
otherArr [
  0
  1
  1
  2
  3
  5
  7
  $ref(.3)
]
`;
