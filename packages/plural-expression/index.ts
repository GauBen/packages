enum BinaryOperator {
  MODULO = "%",
  MULTIPLY = "*",
  PLUS = "+",
  MINUS = "-",
  EQUALS = "==",
  NOT_EQUAL = "!=",
  GREATER_OR_EQUAL = ">=",
  GREATER = ">",
  LESS_OR_EQUAL = "<=",
  LESS = "<",
  AND = "&&",
  OR = "||",
}
enum TernaryOperator {
  CONDITION = "?:",
}

abstract class Token {}
class TokenNumber extends Token {
  readonly value: number;
  constructor(matches: string[]) {
    super();
    this.value = Number(matches[1]);
  }
}
class TokenVariable extends Token {}
class TokenLeftBracket extends Token {}
class TokenRightBracket extends Token {}
class TokenBinaryOperator extends Token {
  readonly operator: BinaryOperator;
  constructor(matches: string[]) {
    super();
    this.operator = matches[1] as BinaryOperator;
  }
}
class TokenQuestionMark extends Token {}
class TokenColon extends Token {}
class TokenEndOfCode extends Token {}

const tokenize = (string: string): Token[] => {
  const table: readonly (
    | [string, Token | undefined]
    | [RegExp, (new (matches: string[]) => Token) | undefined]
  )[] = [
    [/^\s+/, undefined],
    ["(", new TokenLeftBracket()],
    [")", new TokenRightBracket()],
    ["n", new TokenVariable()],
    ["?", new TokenQuestionMark()],
    [":", new TokenColon()],
    [/^(\d+)/, TokenNumber],
    [/^(&&|\|\||==|!=|>=|<=|>|<|\+|-|\*|%)/, TokenBinaryOperator],
  ];
  const tokens: Token[] = [];
  const matchNext = () => {
    let matches: RegExpExecArray | null;
    for (const [match, lexeme] of table) {
      if (typeof match == "string") {
        if (string.startsWith(match)) {
          if (lexeme !== undefined) {
            tokens.push(lexeme as Token);
          }
          string = string.slice(match.length);
          return true;
        }
      } else if ((matches = match.exec(string))) {
        if (lexeme !== undefined) {
          tokens.push(
            new (lexeme as new (matches: string[]) => Token)(matches)
          );
        }
        string = string.slice(matches[0].length);
        return true;
      }
    }
    return false;
  };
  while (string.length > 0) {
    if (!matchNext()) throw `Unexpected characters "${string.slice(0, 10)}..."`;
  }
  tokens.push(new TokenEndOfCode());
  return tokens;
};

abstract class AST {
  abstract compile(): (n: number) => number;
}
class ASTVariable extends AST {
  compile() {
    return (n: number) => n;
  }
}
class ASTNumber extends AST {
  protected value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
  compile() {
    // Return a function with a smaller scope than `(n) => this.value`
    return (function (value) {
      return (_n: number) => value;
    })(this.value);
  }
}
class ASTExpression extends AST {
  readonly expression: AST;
  constructor(expression: AST) {
    super();
    this.expression = expression;
  }
  compile() {
    return this.expression.compile();
  }
}
class ASTTernary extends AST {
  readonly if: AST;
  readonly then: AST;
  readonly else: AST;
  constructor(if_: AST, then: AST, else_: AST) {
    super();
    this.if = if_;
    this.then = then;
    this.else = else_;
  }
  compile() {
    return (function (if_, then, else_) {
      return (n: number) => (if_(n) !== 0 ? then(n) : else_(n));
    })(this.if.compile(), this.then.compile(), this.else.compile());
  }
}
class ASTBinaryOperator extends AST {
  static readonly functions: Record<
    BinaryOperator,
    (a: number, b: number) => number
  > = Object.freeze({
    [BinaryOperator.MODULO]: (a, b) => a % b,
    [BinaryOperator.MULTIPLY]: (a, b) => a * b,
    [BinaryOperator.PLUS]: (a, b) => a + b,
    [BinaryOperator.MINUS]: (a, b) => a - b,
    [BinaryOperator.EQUALS]: (a, b) => (a === b ? 1 : 0),
    [BinaryOperator.NOT_EQUAL]: (a, b) => (a !== b ? 1 : 0),
    [BinaryOperator.GREATER]: (a, b) => (a > b ? 1 : 0),
    [BinaryOperator.GREATER_OR_EQUAL]: (a, b) => (a >= b ? 1 : 0),
    [BinaryOperator.LESS_OR_EQUAL]: (a, b) => (a <= b ? 1 : 0),
    [BinaryOperator.LESS]: (a, b) => (a < b ? 1 : 0),
    [BinaryOperator.AND]: (a, b) => (a !== 0 && b !== 0 ? 1 : 0),
    [BinaryOperator.OR]: (a, b) => (a !== 0 || b !== 0 ? 1 : 0),
  });
  readonly operator: BinaryOperator;
  readonly left: AST;
  readonly right: AST;
  constructor(operator: BinaryOperator, left: AST, right: AST) {
    super();
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  compile() {
    return (function (op, left, right) {
      return (n: number) => op(left(n), right(n));
    })(
      ASTBinaryOperator.functions[this.operator],
      this.left.compile(),
      this.right.compile()
    );
  }
}

class Stream extends Array<Token> {
  constructor(list: Token[]) {
    super(...[...list].reverse());
  }
  peek(): Token {
    return this[this.length - 1];
  }
  pop(): Token {
    const lexeme = super.pop();
    if (lexeme === undefined) throw "Stack empty";
    return lexeme;
  }
  accept<T extends Token>(expected: new (matches: string[]) => T): T {
    const token = this.pop();
    if (token instanceof expected) return token;
    throw `Unexpected token ${token}, expecting ${expected}`;
  }
}

const precedence = {
  [BinaryOperator.MODULO]: [1, 1],
  [BinaryOperator.MULTIPLY]: [2, 2],
  [BinaryOperator.PLUS]: [3, 3],
  [BinaryOperator.MINUS]: [3, 3],
  [BinaryOperator.EQUALS]: [4, 4],
  [BinaryOperator.NOT_EQUAL]: [4, 4],
  [BinaryOperator.GREATER_OR_EQUAL]: [4, 4],
  [BinaryOperator.GREATER]: [4, 4],
  [BinaryOperator.LESS_OR_EQUAL]: [4, 4],
  [BinaryOperator.LESS]: [4, 4],
  [BinaryOperator.AND]: [5, 5],
  [BinaryOperator.OR]: [6, 6],
  [TernaryOperator.CONDITION]: [7, 8],
};
const parse = (
  st: Stream,
  wraps: [(right: AST) => AST, number][] = []
): AST => {
  switch (st.peek().constructor) {
    case TokenVariable: {
      st.pop();
      return parseOperator(st, new ASTVariable(), wraps);
    }
    case TokenNumber: {
      const leaf: AST = new ASTNumber(st.accept(TokenNumber).value);
      return parseOperator(st, leaf, wraps);
    }
    case TokenLeftBracket: {
      st.pop();
      const leaf: AST = new ASTExpression(parse(st, []));
      st.accept(TokenRightBracket);
      return parseOperator(st, leaf, wraps);
    }
  }
  throw `Unexpected token ${st.peek()}`;
};
const parseOperator = (
  st: Stream,
  left: AST,
  wraps: [(right: AST) => AST, number][]
): AST => {
  switch (st.peek().constructor) {
    case TokenEndOfCode:
    case TokenColon:
    case TokenRightBracket:
      while (wraps.length > 0)
        left = (wraps.pop() as [(left: AST) => AST, number])[0](left);
      return left;
    case TokenBinaryOperator: {
      const operator = st.accept(TokenBinaryOperator).operator;
      while (
        wraps.length > 0 &&
        wraps[wraps.length - 1][1] <= precedence[operator][0]
      ) {
        left = (wraps.pop() as [(left: AST) => AST, number])[0](left);
      }
      return parse(st, [
        ...wraps,
        [
          (right: AST) => new ASTBinaryOperator(operator, left, right),
          precedence[operator][1],
        ],
      ]);
    }
    case TokenQuestionMark: {
      st.pop();
      // Assoc à droite donc <
      while (
        wraps.length > 0 &&
        wraps[wraps.length - 1][1] <= precedence[TernaryOperator.CONDITION][0]
      ) {
        left = (wraps.pop() as [(left: AST) => AST, number])[0](left);
      }
      const then = parse(st, []);
      st.accept(TokenColon);
      return parse(st, [
        ...wraps,
        [
          (right: AST) => new ASTTernary(left, then, right),
          precedence[TernaryOperator.CONDITION][1],
        ],
      ]);
    }
  }
  throw `Unexpected token ${st.peek()}`;
};

export default (string: string) =>
  parse(new Stream(tokenize(string))).compile();
