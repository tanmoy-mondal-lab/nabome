import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Skeleton,
  Spinner,
} from './index.ts';

describe('ui primitives', () => {
  it('renders a Button with displayName and type=button default', () => {
    expect(Button.displayName).toBe('Button');
    render(<Button>Buy now</Button>);
    expect(screen.getByRole('button', { name: 'Buy now' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('disables the Button while loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Save
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders an Input with aria-invalid support', () => {
    render(<Input aria-invalid aria-label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid');
  });

  it('associates Label with the input', () => {
    render(
      <>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" />
      </>,
    );
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
  });

  it('renders Badge variants and Card padding', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toHaveClass('bg-(--badge-success-bg)');
  });

  it('renders Card with elevated class', () => {
    const { container } = render(<Card elevated>Body</Card>);
    expect(container.firstChild).toHaveClass('shadow-(--shadow-card)');
  });

  it('renders Skeleton with aria-hidden', () => {
    const { container } = render(<Skeleton className="h-8" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders Spinner with a status role', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
