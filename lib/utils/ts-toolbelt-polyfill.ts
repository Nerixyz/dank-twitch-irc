type Match = | 'default'
  | 'implements->'
  | '<-implements'
  | 'extends->'
  | '<-extends'
  | 'equals';

type Extends<A1 extends any, A2 extends any> =
  [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0;

type Equals<A1 extends any, A2 extends any> =
  (<A>() => A extends A2 ? 1 : 0) extends (<A>() => A extends A1 ? 1 : 0)
    ? (<A>() => A extends A1 ? 1 : 0) extends (<A>() => A extends A2 ? 1 : 0)
    ? 1
    : 0
    : 0;

type Implements<A1 extends any, A2 extends any> =
  Extends<A1, A2> extends 1
    ? 1
    : 0;

export type Is<A extends any, A1 extends any, match extends Match = 'default'> = {
  'default'     : Extends<A,     A1>
  'implements->': Implements<A,  A1>
  'extends->'   : Extends<A,     A1>
  '<-implements': Implements<A1, A>
  '<-extends'   : Extends<A1,    A>
  'equals'      : Equals<A1,     A>
}[match]