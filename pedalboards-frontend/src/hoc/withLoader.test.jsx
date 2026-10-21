// Dependencies
import { render, screen } from '@testing-library/react';

// HOC
import withLoader from './withLoader';

const LOADER_TEXT = 'Je Fais ça En Deux Deux...';

const Greeting = ({ name = 'nobody', isLoading }) => (
  <p>{`Hello ${name}, loading: [${String(isLoading)}]`}</p>
);
const GreetingWithLoader = withLoader(Greeting);

describe('withLoader', () => {
  it('shows the loader in place of the component while it loads', () => {
    render(<GreetingWithLoader isLoading name="Ada" />);

    expect(screen.getByText(LOADER_TEXT)).toBeDefined();
    expect(screen.queryByText(/Hello/)).toBeNull();
  });

  it('shows the component with all its props once loaded', () => {
    render(<GreetingWithLoader isLoading={false} name="Ada" />);

    expect(screen.getByText('Hello Ada, loading: [false]')).toBeDefined();
    expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['zero', 0],
    ['empty', '']
  ])('shows the component when isLoading is %s', (description, isLoading) => {
    render(<GreetingWithLoader isLoading={isLoading} />);

    expect(screen.getByText(`Hello nobody, loading: [${String(isLoading)}]`)).toBeDefined();
  });

  it('shows the loader for a truthy isLoading that is not a boolean', () => {
    render(<GreetingWithLoader isLoading="yes" />);

    expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  });

  it('names the component after the one it wraps', () => {
    const Named = () => null;
    Named.displayName = 'Named';

    expect(GreetingWithLoader.displayName).toBe('withLoader(Greeting)');
    expect(withLoader(Named).displayName).toBe('withLoader(Named)');
    expect(withLoader(() => null).displayName).toBe('withLoader(Component)');
  });
});
