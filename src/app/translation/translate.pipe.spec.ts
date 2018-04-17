import { TranslatePipe } from './translation/translate.pipe';

describe('TranslatePipe', () => {
  it('create an instance', () => {
    const pipe = new TranslatePipe();
    expect(pipe).toBeTruthy();
  });
});
