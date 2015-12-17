const text =
`.i 4
.innames a b c d
.o 2
.outnames x y
.p11
0000 10
0001 10
0010 11
.e
`;

const x = null;

const json = {
  inputs: ['a','b','c','d'],
  outputs: ['x','y'],
  loops: [
    [0,0,1,0,1,0],
    [1,1,1,1,1,0],
    [x,x,x,1,1,1],
    [0,x,1,1,0,1],
    [0,1,0,0,0,1],
    [0,1,0,1,1,0],
  ],
};

export const example = json;
