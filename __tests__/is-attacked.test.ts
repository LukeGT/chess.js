import {
  Chess,
  Square,
  Color,
  SQUARES,
  WHITE,
  BLACK,
  DEFAULT_POSITION,
  AttackWithPins,
} from '../src/chess'

function areAttacked(chess: Chess, squares: Square[], color: Color) {
  return squares.reduce(
    (acc, square) => acc && chess.isAttacked(square, color),
    true,
  )
}

function areNotAttacked(chess: Chess, squares: Square[], color: Color) {
  // returns true is all squares are NOT attacked
  return !squares.reduce(
    (acc, square) => acc || chess.isAttacked(square, color),
    false,
  )
}

test('isAttacked (white pawn attacks)', () => {
  const chess = new Chess()

  // diagonal attacks
  chess.load('4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1')
  expect(areAttacked(chess, ['d3', 'f3'], WHITE)).toBe(true)
  expect(areNotAttacked(chess, ['d3', 'f3'], BLACK)).toBe(true)

  // small/big pawn moves aren't attacks
  expect(areNotAttacked(chess, ['e4', 'e4'], WHITE)).toBe(true)
})

test('isAttacked (black pawn attacks)', () => {
  const chess = new Chess()

  // diagonal attacks
  chess.load('4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1')
  expect(areAttacked(chess, ['f6', 'd6'], BLACK)).toBe(true)
  expect(areNotAttacked(chess, ['f6', 'd6'], WHITE)).toBe(true)

  // small/big pawn moves aren't attacks
  expect(areNotAttacked(chess, ['e6', 'e5'], BLACK)).toBe(true)
})

test('isAttacked (knight)', () => {
  const chess = new Chess('4k3/4p3/8/8/4N3/8/8/4K3 w - - 0 1')

  const squares: Square[] = ['d2', 'f2', 'c3', 'g3', 'd6', 'f6', 'c5', 'g5']

  expect(areAttacked(chess, squares, WHITE)).toBe(true)
  expect(chess.isAttacked('e4', WHITE)).toBe(false) // same square
})

test('isAttacked (bishop)', () => {
  const chess = new Chess('4k3/4p3/8/8/4b3/8/8/4K3 w - - 0 1')

  const squares: Square[] = [
    'b1',
    'c2',
    'd3',
    'f5',
    'g6',
    'h7',
    'a8',
    'b7',
    'c6',
    'd5',
    'f3',
    'g2',
    'h1',
  ]
  expect(areAttacked(chess, squares, BLACK)).toBe(true)
  expect(chess.isAttacked('e4', BLACK)).toBe(false) // same square
})

test('isAttacked (rook)', () => {
  const chess = new Chess('4k3/4n3/8/8/8/4R3/8/4K3 w - - 0 1')

  const squares: Square[] = [
    'e1', // yes, we can attack our own color
    'e2',
    'e4',
    'e5',
    'e6',
    'e7',
    'a3',
    'b3',
    'c3',
    'd3',
    'f3',
    'g3',
    'h3',
  ]
  expect(areAttacked(chess, squares, WHITE)).toBe(true)
  expect(chess.isAttacked('e3', WHITE)).toBe(false) // same square
})

test('isAttacked (queen)', () => {
  const chess = new Chess('4k3/4n3/8/8/8/4q3/4P3/4K3 w - - 0 1')

  const squares: Square[] = [
    'e2',
    'e4',
    'e5',
    'e6',
    'e7', // yes, we can attack our own color
    'a3',
    'b3',
    'c3',
    'd3',
    'f3',
    'g3',
    'h3',
    'c1',
    'd2',
    'f4',
    'g5',
    'h6',
    'g1',
    'f2',
    'd4',
    'c5',
    'b6',
    'a7',
  ]
  expect(areAttacked(chess, squares, BLACK)).toBe(true)
  expect(chess.isAttacked('e3', BLACK)).toBe(false) // same square
})

test('isAttacked (king)', () => {
  const chess = new Chess('4k3/4n3/8/8/8/4q3/4P3/4K3 w - - 0 1')

  const squares: Square[] = [
    'e2', // yes, we can attack our own color
    'd1',
    'd2',
    'f1',
    'f2',
  ]
  expect(areAttacked(chess, squares, WHITE)).toBe(true)
  expect(chess.isAttacked('e1', WHITE)).toBe(false) // same square
})

test('isAttacked (pinned pieces still attacks)', () => {
  // pinned pawn, but still is an attacked square
  const chess = new Chess('4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1')
  expect(areAttacked(chess, ['d3', 'f3'], WHITE)).toBe(true)
})

test('isAttacked (no x-ray)', () => {
  const chess = new Chess('4k3/4n3/8/8/8/4q3/4P3/4K3 w - - 0 1')
  expect(areNotAttacked(chess, ['e1'], BLACK)).toBe(true)
})

test('isAttacked (doc tests)', () => {
  const chess = new Chess()
  expect(chess.isAttacked('f3', WHITE)).toBe(true)
  expect(chess.isAttacked('f6', BLACK)).toBe(true)
  chess.load(DEFAULT_POSITION)
  expect(chess.isAttacked('e2', WHITE)).toBe(true)
  chess.load('4k3/4n3/8/8/8/8/4R3/4K3 w - - 0 1')
  expect(chess.isAttacked('c6', BLACK)).toBe(true)
})

function get_by_attacker(chess: Chess) {
  return new Map(
    [
      ...Map.groupBy(
        chess.getAllAttacksAndPins(),
        (attack) => attack.attacker.square,
      ),
    ].map(
      ([attacker, attacks]): [string, Map<string | null, AttackWithPins[]>] => [
        attacker,
        Map.groupBy(attacks, (attack) => attack.victim?.square ?? null),
      ],
    ),
  )
}

describe('attacksAndPins (opening)', () => {
  const chess = new Chess()
  const by_attacker = get_by_attacker(chess)

  test('queen attacks', () => {
    expect(by_attacker.get('d1')?.get('d8')?.[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'q' }, square: 'd1' },
      victim: { piece: { color: 'b', type: 'q' }, square: 'd8' },
      between: [
        { piece: { color: 'w', type: 'p' }, square: 'd2' },
        { piece: { color: 'b', type: 'p' }, square: 'd7' },
      ],
    })
  })

  test('rook attacks', () => {
    expect(by_attacker.get('a8')?.get('a1')?.[0]).toEqual({
      attacker: { piece: { color: 'b', type: 'r' }, square: 'a8' },
      victim: { piece: { color: 'w', type: 'r' }, square: 'a1' },
      between: [
        { piece: { color: 'b', type: 'p' }, square: 'a7' },
        { piece: { color: 'w', type: 'p' }, square: 'a2' },
      ],
    })
  })

  test('king attacks', () => {
    expect(by_attacker.get('e1')?.get('d2')?.[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'k' }, square: 'e1' },
      victim: { piece: { color: 'w', type: 'p' }, square: 'd2' },
      between: [],
    })
  })

  test('pawn attacks', () => {
    expect(by_attacker.get('a2')?.values().next().value[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'p' }, square: 'a2' },
      victim: null,
      between: [],
    })
  })

  test('knight attacks', () => {
    expect(by_attacker.get('g1')?.get('e2')?.[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'n' }, square: 'g1' },
      victim: { piece: { color: 'w', type: 'p' }, square: 'e2' },
      between: [],
    })
  })

  test('bishop attacks', () => {
    expect(by_attacker.get('f1')?.get('e2')?.[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'b' }, square: 'f1' },
      victim: { piece: { color: 'w', type: 'p' }, square: 'e2' },
      between: [],
    })
  })
})

describe('attacksAndPins (position)', () => {
  const chess = new Chess(
    'rnbq1rk1/pp2bppp/5n2/3pp1B1/2B5/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 9',
  )
  const by_attacker = get_by_attacker(chess)

  test('queen attacks', () => {
    expect(by_attacker.get('d8')?.get('g5')?.[0]).toEqual({
      attacker: { piece: { color: 'b', type: 'q' }, square: 'd8' },
      victim: { piece: { color: 'w', type: 'b' }, square: 'g5' },
      between: [
        { piece: { color: 'b', type: 'b' }, square: 'e7' },
        { piece: { color: 'b', type: 'n' }, square: 'f6' },
      ],
    })
  })

  test('rook attacks', () => {
    expect(by_attacker.get('f1')?.get('f8')?.[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'r' }, square: 'f1' },
      victim: { piece: { color: 'b', type: 'r' }, square: 'f8' },
      between: [
        { piece: { color: 'w', type: 'p' }, square: 'f2' },
        { piece: { color: 'w', type: 'n' }, square: 'f3' },
        { piece: { color: 'b', type: 'n' }, square: 'f6' },
        { piece: { color: 'b', type: 'p' }, square: 'f7' },
      ],
    })
  })

  test('king attacks', () => {
    expect(by_attacker.get('g8')?.get('f8')?.[0]).toEqual({
      attacker: { piece: { color: 'b', type: 'k' }, square: 'g8' },
      victim: { piece: { color: 'b', type: 'r' }, square: 'f8' },
      between: [],
    })
  })

  test('pawn attacks', () => {
    expect(by_attacker.get('d5')?.get('c4')?.[0]).toEqual({
      attacker: { piece: { color: 'b', type: 'p' }, square: 'd5' },
      victim: { piece: { color: 'w', type: 'b' }, square: 'c4' },
      between: [],
    })
  })

  test('knight attacks', () => {
    expect(by_attacker.get('f3')?.get('e5')?.[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'n' }, square: 'f3' },
      victim: { piece: { color: 'b', type: 'p' }, square: 'e5' },
      between: [],
    })
  })

  test('bishop attacks', () => {
    expect(by_attacker.get('c4')?.get('g8')?.[0]).toEqual({
      attacker: { piece: { color: 'w', type: 'b' }, square: 'c4' },
      victim: { piece: { color: 'b', type: 'k' }, square: 'g8' },
      between: [
        { piece: { color: 'b', type: 'p' }, square: 'd5' },
        { piece: { color: 'b', type: 'p' }, square: 'f7' },
      ],
    })
  })
})
