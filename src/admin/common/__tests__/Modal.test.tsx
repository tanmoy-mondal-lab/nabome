import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from "@/admin/common/Modal";

describe('Modal', () => {
  it('should not render when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Test"><div>Content</div></Modal>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<Modal open={true} onClose={() => {}} title="Test"><div>Test Content</div></Modal>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(<Modal open={true} onClose={() => {}} title="Test"><div>Custom Content</div></Modal>);
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });
});
