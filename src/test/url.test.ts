import Url from '../url';

test('クエリ ストリングが1つのURLからvideoidを取り出す', () => {
  expect(new Url('https://www.youtube.com/watch?v=d0yGdNEWdn0').getParam('v')).toBe('d0yGdNEWdn0');
});

test('クエリ ストリングが複数のURLからvideoidを取り出す', () => {
  expect(new Url('https://www.youtube.com/watch?v=HayTt8clnKY&list=RDHayTt8clnKY&start_radio=1').getParam('v')).toBe('HayTt8clnKY');
});
