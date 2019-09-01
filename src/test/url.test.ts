import Url from '../url';

test('Query string retrieves videoid from URL.', () => {
  expect(new Url('https://www.youtube.com/watch?v=d0yGdNEWdn0').getParam('v')).toBe('d0yGdNEWdn0');
});

test('Multi query string retrieves videoid from URL.', () => {
  expect(new Url('https://www.youtube.com/watch?v=HayTt8clnKY&list=RDHayTt8clnKY&start_radio=1').getParam('v')).toBe('HayTt8clnKY');
});
